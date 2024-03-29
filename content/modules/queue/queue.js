import { selectRow } from "../layout/horizontal.js";
import { appendVertical } from "../layout/vertical.js";
import { logToConsole } from "../utils/utils.js";

export function getMessageKey(key, value, messageId, flusher) {
  const keyValue = key + "-" + value;
  const dupe = flusher.props.displayedMessages.find((obj) => {
    return obj.key === keyValue;
  });
  const ignore =
    !flusher.states.spamState && dupe && flusher.lastRow > 1 ? true : false;
  if (!ignore)
    flusher.props.displayedMessages.push({ id: messageId, key: keyValue });
  return { key: keyValue, ignore: ignore };
}

export async function processMessageQueue(flusher) {
  try {
    if (flusher.props.isProcessingMessages) return;
    flusher.props.isProcessingMessages = true;

    let queueItem = flusher.props.messageQueue.shift();
    if (!queueItem) {
      flusher.props.isProcessingMessages = false;
      return;
    }

    queueItem.chatroom_id = flusher.external ? queueItem?.chatroom_id : 0;

    const lastRow = flusher.props.lastRow;
    const maxRows = flusher.props.maxRows;

    if (lastRow === null || lastRow >= maxRows) {
      flusher.props.isProcessingMessages = false;
      return;
    }

    const eventType = queueItem.event ?? queueItem.eventName;

    if (
      eventType === "App\\Events\\ChatMessageEvent" &&
      flusher.props.external
    ) {
      createMessage(JSON.parse(queueItem.data), flusher);
    } else if (queueItem.type === "message" && flusher.props.external) {
      createMessage(queueItem, flusher);
    } else if (eventType === "App\\Events\\UserBannedEvent") {
      createUserBanMessage(JSON.parse(queueItem.data), flusher);
    } else if (eventType === "App\\Events\\GiftedSubscriptionsEvent") {
      createGiftedMessage(JSON.parse(queueItem.data), flusher);
    } else if (eventType === "App\\Events\\FollowersUpdated") {
      createFollowersMessage(JSON.parse(queueItem.data), flusher);
    } else if (eventType === "App\\Events\\StreamHostEvent") {
      createHostMessage(JSON.parse(queueItem.data), flusher);
    } else if (eventType === "App\\Events\\SubscriptionEvent") {
      createSubMessage(JSON.parse(queueItem.data), flusher);
    } else {
      flusher.props.isProcessingMessages = false;
      processMessageQueue(flusher);
    }
  } catch (error) {
    flusher.props.isProcessingMessages = false;
    processMessageQueue(flusher);
    console.error(error);
  }
}

export function processElementQueue(flusher) {
  try {
    if (flusher.props.isProcessingElements) return;
    flusher.props.isProcessingElements = true;

    const queueItem = flusher.props.elementQueue.shift();
    if (!queueItem) {
      flusher.props.isProcessingElements = false;
      return;
    }

    const flushState = flusher.states.flushState;

    if (!flusher.states.chatEnabled) {
      flusher.props.isProcessingElements = false;
      return;
    }

    flushState
      ? selectRow(queueItem, flusher)
      : appendVertical(queueItem, flusher);

    if (flusher.props.isVod) {
      const queueLength = flusher.props.elementQueue.length;
      let wait = Math.trunc(3500 / queueLength);
      if (queueLength < 3 && flusher.props.isVod && flusher.props.flushState)
        wait = 500;
      setTimeout(function () {
        flusher.props.isProcessingElements = false;
        processElementQueue(flusher);
      }, wait);
    } else {
      flusher.props.isProcessingElements = false;
      processElementQueue(flusher);
    }
  } catch (error) {
    flusher.props.isProcessingElements = false;
    processElementQueue(flusher);
    console.error(error);
  }
}

function appendMessage(queueItem, flusher) {
  flusher.props.elementQueue.push(queueItem);
  processElementQueue(flusher);
  flusher.props.isProcessingMessages = false;
  processMessageQueue(flusher);
}

async function createMessage(message, flusher) {
  const sender = message.sender;
  const username = sender.username;
  const content = message.content;

  const reduced = !flusher.props.spamState
    ? reduceRepeatedSentences(content)
    : content;

  if (!flusher.states.spamState) {
    const messageKeyData = getMessageKey(
      sender.id,
      reduced,
      message.id,
      flusher
    );
    if (messageKeyData.ignore === true) {
      flusher.props.isProcessingMessages = false;
      processMessageQueue(flusher);
      return;
    }

    message.key = messageKeyData.key;
  }

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("flusher-message");

  const badgeSpan = document.createElement("span");
  badgeSpan.classList.add("flusher-badges");

  const badgeElements = await getBadges(message, flusher);
  badgeElements.forEach((badgeElement) => {
    badgeSpan.appendChild(badgeElement.cloneNode(true));
  });

  const usernameSpan = document.createElement("span");
  usernameSpan.style.color = sender.identity.color;
  usernameSpan.classList.add("flusher-username");
  usernameSpan.textContent = username;

  const boldSpan = document.createElement("span");
  boldSpan.classList.add("font-bold", "text-white");
  boldSpan.textContent = ": ";

  const contentSpan = document.createElement("span");
  contentSpan.classList.add("flusher-content");

  const emoteRegex = /\[emote:(\d+):([\w-]+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = emoteRegex.exec(reduced)) !== null) {
    const textBeforeEmote = reduced.slice(lastIndex, match.index);
    if (textBeforeEmote.trim() !== "") {
      const textBeforeNode = document.createElement("span");
      textBeforeNode.textContent = textBeforeEmote;
      textBeforeNode.classList.add("flusher-content-text");
      contentSpan.appendChild(textBeforeNode);
    }

    const img = document.createElement("img");
    const [, id, name] = match;
    img.src = `https://files.kick.com/emotes/${id}/fullsize`;
    img.alt = name;
    img.classList.add("flusher-emote");
    contentSpan.appendChild(img);

    lastIndex = emoteRegex.lastIndex;
  }

  const textAfterLastEmote = reduced.slice(lastIndex);
  if (textAfterLastEmote.trim() !== "") {
    const textAfterNode = document.createElement("span");
    textAfterNode.textContent = textAfterLastEmote;
    textAfterNode.classList.add("flusher-content-text");
    contentSpan.appendChild(textAfterNode);
  } else {
    const lastChild = contentSpan.lastChild;
    if (lastChild.tagName === "IMG") {
      lastChild.className = "last-flusher-emote";
    }
  }

  badgeSpan.firstChild ? messageDiv.append(badgeSpan) : null;
  messageDiv.append(usernameSpan, boldSpan, contentSpan);
  messageDiv.setAttribute("data-chat-entry", message.id);
  message.container = messageDiv;

  appendMessage(message, flusher);

  function reduceRepeatedSentences(input) {
    const regexSentence = /(\b.+?\b)\1+/g;
    const sentence = input.replace(regexSentence, "$1");
    const regexChar = /(.)(\1{10,})/g;
    return sentence.replace(regexChar, "$1$1$1$1$1$1$1$1$1$1");
  }
}

async function getBadges(data, flusher) {
  const badges = data.sender.identity.badges || [];
  let badgeArray = [];

  if (badges.length === 0) return badgeArray;

  for (const badge of badges) {
    const cachedBadge = getBadgeImage(badge, flusher);
    if (!cachedBadge) continue;
    if (cachedBadge?.src) {
      const badgeElement = document.createElement("img");
      badgeElement.src = cachedBadge.src;
      badgeElement.alt = badge.type;
      badgeElement.classList.add("flusher-badge");
      badgeArray.push(badgeElement);
    } else {
      cachedBadge.classList.add("flusher-badge");
      badgeArray.push(cachedBadge);
    }
  }

  function getBadgeImage(badge, flusher) {
    let badgeImage;
    if (badge.type === "subscriber") {
      const months = badge.count;
      const correspondingBadge = findClosestBadge(months);
      badgeImage = correspondingBadge
        ? correspondingBadge
        : flusher.badges["subscriber"]?.cloneNode(true);
    } else {
      badgeImage = flusher.badges[badge.type]?.cloneNode(true) || null;
    }

    return badgeImage;
  }

  function findClosestBadge(months) {
    return (
      flusher.props.badgeCache.reduce((closest, currentBadge) => {
        if (
          currentBadge.months <= months &&
          (!closest || currentBadge.months > closest.months)
        ) {
          return currentBadge;
        }
        return closest || flusher.badges["subscriber"]?.cloneNode(true);
      }, null)?.badge_image ||
      flusher.props.badgeCache[flusher.props.badgeCache.length - 1]
        ?.badge_image ||
      flusher.badges["subscriber"]?.cloneNode(true)
    );
  }

  /* Enable when iframe chatroom available */

  /* badges.forEach(badge => {
    let badgeText = badge.text;
    if (badge.count) {
      badgeText = `${badge.type}-${badge.count}`;
    }
    const cachedBadge = flusher.props.badgeCache.find(badgeCache => badgeCache.type === badgeText);
    if (cachedBadge) {
      badgeArray.push(cachedBadge.html);
      badgeCount++;
      return;
    }
  }); */

  /* let attempts = 0;
  while (badgeCount !== badges.length && attempts < 10) {
    const newBadges = checkForBadges(data, flusher);
    badgeArray = newBadges;

    badgeCount = badgeArray.length;
    attempts++;

    await new Promise(resolve => setTimeout(resolve, 750));
  } */

  return badgeArray;

  function checkForBadges(data, flusher) {
    const badges = data.sender.identity.badges || [];
    const badgeElements = [];

    flusher.props.isProcessingMessages = false;

    let firstChatIdentity = document.querySelector(
      `.chat-entry-username[data-chat-entry-user-id="${data.sender.id}"]`
    );
    if (firstChatIdentity !== null) {
      let identity = firstChatIdentity.closest(".chat-message-identity");
      identity
        .querySelectorAll("div.badge-tooltip")
        .forEach(function (baseBadge, index) {
          let badge = badges[index];
          if (badge === undefined) return;
          let badgeText = badge.text;

          if (badge.count) {
            badgeText = `${badge.type}-${badge.count}`;
          }

          const cachedBadge = flusher.props.badgeCache.find(
            (badgeCache) => badgeCache.type === badgeText
          );
          if (cachedBadge) {
            props.badgeElements.push(cachedBadge.html);
            return;
          }

          const imgElement = baseBadge.querySelector(`img`);
          if (imgElement) {
            const imgUrl = imgElement.src;
            const newImg = document.createElement("img");
            newImg.src = imgUrl;
            newImg.classList.add("flusher-badge");
            flusher.props.badgeCache.push({
              type: badgeText,
              html: newImg,
            });

            badgeElements.push(newImg);
            return;
          }

          const svgElement = baseBadge.querySelector("svg");
          if (svgElement) {
            const svgCopy = svgElement.cloneNode(true);
            svgCopy.classList.add("flusher-badge");

            flusher.props.badgeCache.push({
              type: badgeText,
              html: svgCopy,
            });

            badgeElements.push(svgCopy);
            return;
          }

          console.warn("badge not found: " + badgeText);
        });
    }

    return badgeElements;
  }
}

export function createUserBanMessage(data, flusher) {
  /* logToConsole("createUserBanMessage") */;

  const bannedUser = data.user.username;
  const bannedByUser = data.banned_by.username;

  const banMessageContent = document.createElement("div");
  banMessageContent.classList.add("flusher-message", "flusher-red");

  const banMessageSpan = document.createElement("span");

  let logText;

  if (data.expires_at) {
    const expiresAt = new Date(data.expires_at);
    const timeDifference = expiresAt - new Date();

    let timeDiffText;
    if (timeDifference > 0) {
      timeDiffText = humanizeDuration(timeDifference + 5000);
      const userId = data.user.id;
      addBannedUser(bannedUser, bannedByUser, userId, expiresAt);

      logText = `${bannedUser} banned for ${timeDiffText} by ${bannedByUser}`;
      const expiresText = document.createTextNode(logText);
      banMessageSpan.appendChild(expiresText);
    } else {
      logText = `${bannedUser} permanently banned by ${bannedByUser}`;
      const expiresText = document.createTextNode(logText);
      banMessageSpan.appendChild(expiresText);
    }

  } else {
    logText = `${bannedUser} permanently banned by ${bannedByUser}`;
    const expiresText = document.createTextNode(logText);
    banMessageSpan.appendChild(expiresText);
  }

  banMessageContent.appendChild(banMessageSpan);

  data.created_at = Date.now();
  data.container = banMessageContent;

  logToConsole(logText);

  appendMessage(data, flusher);

  function addBannedUser(bannedUser, bannedByUser, userId, expiresAt) {
    const existingUserIndex = flusher.props.bannedUsers.findIndex(user => user.username === bannedUser);
    if (existingUserIndex !== -1) {
      flusher.props.bannedUsers[existingUserIndex] = {
        id: userId,
        username: bannedUser,
        bannedBy: bannedByUser,
        expiresAt: expiresAt
      };
    } else {
      flusher.props.bannedUsers.push({
        id: userId,
        username: bannedUser,
        bannedBy: bannedByUser,
        expiresAt: expiresAt
      });
      const now = new Date().getTime();
      const expirationTime = new Date(expiresAt).getTime();
      const timeUntilExpiration = expirationTime - now;
      flusher.props.timeoutIds.push(setTimeout(() => removeBannedUser(bannedUser), timeUntilExpiration));
    }
  }

  function removeBannedUser(username) {
    const index = flusher.props.bannedUsers.findIndex(user => user.username === username);
    if (index !== -1) {
      const currentUser = flusher.props.bannedUsers[index];
      const currentTime = new Date().getTime();

      if ((currentTime + 5000) >= new Date(currentUser.expiresAt).getTime()) {
        flusher.props.bannedUsers.splice(index, 1);

        const unbanMessageContent = document.createElement("div");
        unbanMessageContent.classList.add("flusher-message", "flusher-green");

        const unbanMessageSpan = document.createElement("span");

        let logText;

        logText = `${username}'s ban expired`;
        const unbanText = document.createTextNode(logText);
        unbanMessageSpan.appendChild(unbanText);

        unbanMessageContent.appendChild(unbanMessageSpan);

        data.created_at = Date.now();
        data.container = unbanMessageContent;

        logToConsole(logText);

        appendMessage(data, flusher);
      }
    }
  }

  function humanizeDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
      return years === 1 ? "1 year" : `${years} years`;
    } else if (months > 0) {
      return months === 1 ? "1 month" : `${months} months`;
    } else if (weeks > 0) {
      return weeks === 1 ? "1 week" : `${weeks} weeks`;
    } else if (days > 0) {
      return days === 1 ? "1 day" : `${days} days`;
    } else if (hours > 0) {
      return hours === 1 ? "1 hour" : `${hours} hours`;
    } else if (minutes > 0) {
      return minutes === 1 ? "1 minute" : `${minutes} minutes`;
    } else {
      return seconds === 1 ? "1 second" : `${seconds} seconds`;
    }
  }
}

function createSubMessage(data, flusher) {
  /* logToConsole(`createSubMessage`); */

  if (!flusher.states.flushState && !flusher.props.external) return;

  const username = data.username;
  const months = data.months;

  const subscriptionMessageContent = document.createElement("div");
  subscriptionMessageContent.classList.add("flusher-message", "flusher-green");

  const emojiSpan = document.createElement("span");
  emojiSpan.textContent = String.fromCodePoint(0x1f389) + " ";

  const subscriptionMessageSpan = document.createElement("span");
  subscriptionMessageSpan.style.color = "#00FF00";
  subscriptionMessageSpan.textContent = `${months > 1 ? months + " months" : "1 month"} subscription by ${username}`;

  const subSpan = document.createElement("span");
  subSpan.style.color = "#00FF00";

  subSpan.append(emojiSpan, subscriptionMessageSpan);

  subscriptionMessageContent.append(subSpan);

  data.created_at = Date.now();
  data.container = subscriptionMessageContent;

  appendMessage(data, flusher);
}

function createHostMessage(data, flusher) {
  /* logToConsole(`createHostMessage`); */

  const hostUsername = data.host_username;
  const viewersCount = data.number_viewers;

  const hostMessageContent = document.createElement("div");
  hostMessageContent.classList.add("flusher-message", "flusher-green");

  const emojiSpan = document.createElement("span");
  emojiSpan.textContent = String.fromCodePoint(0x1f389) + " ";

  const viewersCountSpan = document.createElement("span");
  viewersCountSpan.textContent =
    `${viewersCount > 1 ? viewersCount + " viewers" : "1 viewer"} hosted by ` +
    hostUsername;

  const hostMessageSpan = document.createElement("span");
  hostMessageSpan.style.color = "#00FF00";

  hostMessageSpan.append(emojiSpan, viewersCountSpan);

  hostMessageContent.appendChild(hostMessageSpan);

  data.created_at = Date.now();
  data.container = hostMessageContent;

  appendMessage(data, flusher);
}

function createGiftedMessage(data, flusher) {
  if (!flusher.states.flushState && !flusher.props.external) {
    flusher.props.isProcessingMessages = false;
    processMessageQueue(flusher);
    return;
  }

  /* logToConsole(`createGiftedMessage`); */

  const gifterUsername = data.gifter_username;
  const giftedUsernames = data.gifted_usernames;

  const giftedContent = document.createElement("div");
  giftedContent.classList.add("flusher-message", "flusher-green");

  const emojiSpan = document.createElement("span");
  emojiSpan.textContent = String.fromCodePoint(0x1f389) + " ";

  const gifterUsernameSpan = document.createElement("span");
  gifterUsernameSpan.textContent =
    `${giftedUsernames.length > 1
      ? giftedUsernames.length + " Subscriptions"
      : "1 Subscription"
    } gifted by ` + gifterUsername;
  const giftedSpan = document.createElement("span");
  giftedSpan.style.color = "#00FF00";

  giftedSpan.append(emojiSpan, gifterUsernameSpan);

  giftedContent.appendChild(giftedSpan);

  data.created_at = Date.now();
  data.container = giftedContent;

  appendMessage(data, flusher);
}

function createFollowersMessage(data, flusher) {
  /* logToConsole(`createFollowersMessage`); */

  const followersCount = data.followersCount;

  const followersDiff = followersCount - (flusher.props.lastFollowersCount ?? followersCount);
  if (followersDiff === 0) {
    flusher.props.lastFollowersCount = followersCount ?? null;
    flusher.props.isProcessingMessages = false;
    processMessageQueue(flusher);
    return;
  }

  const messageContent = document.createElement("div");
  messageContent.classList.add("flusher-message");

  const followersMessageSpan = document.createElement("span");
  followersMessageSpan.textContent = `${followersDiff > 1 ? followersDiff + " new followers" : "1 new follower"}`;

  messageContent.append(followersMessageSpan);

  data.created_at = Date.now();
  data.container = messageContent;

  appendMessage(data, flusher);

  flusher.props.lastFollowersCount = followersCount;
}