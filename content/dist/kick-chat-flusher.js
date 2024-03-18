/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./modules/flusher/states.js
class FlusherStates {
  constructor() {
    this.backgroundStates = ['SMALL', 'LARGE', 'OFF'];
    this.positionStates = ['TOP LEFT', 'LEFT', 'BOTTOM LEFT', 'TOP RIGHT', 'RIGHT', 'BOTTOM RIGHT'];
    this.sizeStates = ['SMALL', 'NORMAL', 'LARGE'];
    this.backgroundState = 2;
    this.positionState = 4;
    this.sizeState = 1;
    this.fontState = 1;
    this.reply = false;
    this.slide = true;
    this.flushState = false;
    this.chatEnabled = true;
    this.shadow = true;
    this.spamState = false;
    this.timeState = false;
  }
}
;// CONCATENATED MODULE: ./modules/flusher/props.js
class FlusherProps {
  constructor() {
    this.chatroomId = null;
    this.clickOutsideHandlerFunction = null;
    this.domain = null;
    this.displayedMessages = [];
    this.elementQueue = [];
    this.external = false;
    this.isFullscreen = false;
    this.isProcessingElements = false;
    this.isProcessingMessages = false;
    this.isVod = false;
    this.loading = false;
    this.messageQueue = [];
    this.badgeCache = [];
    this.lastPositionPerRow = [];
    this.rowQueue = [];
    this.timeoutIds = [];
    this.video = null;
    this.lastRow = 0;
    this.maxRows = 99;
  }
}
;// CONCATENATED MODULE: ./modules/layout/horizontal.js
function selectRow(message, flusher) {
  let selectedRow = 0;
  const positions = flusher.props.lastPositionPerRow.length ?? 0;
  if (positions > 0) {
    for (let i = 0; i < positions; i++) {
      const item = flusher.props.lastPositionPerRow[i];
      if (item === undefined || item.run === true) {
        selectedRow = i;
        break;
      }
      if (flusher.props.rowQueue[i].length < 2) {
        message.row = i;
        message = prepareAnimation(message, flusher);
        if (message !== null) flusher.props.rowQueue[i].push(message);
        return;
      }
      selectedRow = i + 1;
    }
  }
  message.row = selectedRow;
  flusher.props.rowQueue[selectedRow] = flusher.props.rowQueue[selectedRow] ?? [];
  message = prepareAnimation(message, flusher);
  if (message !== null) startAnimation(message, flusher);
}
function startAnimation(messageData, flusher) {
  const message = messageData.container;
  const space = 4;
  const rowIndex = messageData.row;
  const lastItem = flusher.props.lastPositionPerRow?.[rowIndex];
  !flusher.props.lastPositionPerRow ? flusher.props.lastPositionPerRow = [] : null;
  flusher.props.lastPositionPerRow[rowIndex] = {
    container: message,
    run: false
  };
  let overlap = 0;
  let messageWidth;
  const lastContainer = lastItem !== undefined ? lastItem.container : undefined;
  if (lastContainer !== undefined) {
    requestAnimationFrame(() => {
      flusher.container.appendChild(message);
      messageWidth = message.offsetWidth;
      message.style.marginRight = `-${messageWidth}px`;
      const rect1 = message.getBoundingClientRect();
      const rect2 = lastContainer.getBoundingClientRect();
      overlap = rect2.right - rect1.left;

      /* queue running */
      if (lastItem.run === false) {
        message.style.marginRight = `-${messageWidth + overlap + space}px`;
        message.classList.add('flusher-animation');
      }

      /* queue ended */else {
        if (overlap > -8) {
          /* append last queue */
          message.style.marginRight = `-${messageWidth + overlap + space}px`;
          message.classList.add('flusher-animation');
        } else {
          /* new queue */
          message.style.marginRight = `-${messageWidth + space}px`;
          message.classList.add('flusher-animation');
          overlap = 0;
        }
      }
      requestNext(messageWidth, overlap, messageData, flusher);
    });
  }

  /* new row */else {
    flusher.container.appendChild(message);
    messageWidth = message.offsetWidth;
    message.style.marginRight = `-${messageWidth + space}px`;
    message.classList.add('flusher-animation');
    overlap = 0;
    requestNext(messageWidth, overlap, messageData, flusher);
  }
  async function requestNext(messageWidth, overlap, messageData, flusher) {
    let timeNeeded = Math.ceil((messageWidth + space + overlap) / flusher.props.parentWidth * 16000);
    const timeoutId = setTimeout(() => {
      checkQueue(messageData, flusher);
      const index = flusher.props.timeoutIds.indexOf(timeoutId);
      if (index !== -1) {
        flusher.props.timeoutIds.splice(index, 1);
      }
    }, timeNeeded);
    flusher.props.timeoutIds.push(timeoutId);
  }
  function checkQueue(messageData, flusher) {
    const index = messageData.row;
    if (!flusher?.props?.rowQueue[index]) return;
    const queueItem = flusher.props.rowQueue[index].shift();
    if (queueItem) {
      checkRow(queueItem, index, flusher);
    } else {
      flusher.props.lastRow = flusher.props.lastRow - 1;
      flusher.props.lastPositionPerRow[index] = {
        container: messageData.container,
        run: true
      };
    }
  }
  function checkRow(messageData, rowIndex, flusher) {
    /* To be Fixed */

    /* if ((rowIndex + 1) > flusher.props.lastRow) {
    	for (let i = 0; i < rowIndex; i++) {
    		if (flusher.props.lastPositionPerRow[i] === undefined || flusher.props.lastPositionPerRow[i].run === true) {
    			if (messageData.message !== null) {
    				flusher.props.lastPositionPerRow[rowIndex] = undefined;
    				messageData.container.style.setProperty('--row', i);
    				messageData.container.classList.add('flusher-green');
    					startAnimation(messageData, flusher);
    			}
    			return;
    		}
    		if (flusher.props.rowQueue[i].length < 1) {
    			if (messageData.container !== null) {
    				flusher.props.lastPositionPerRow[i] = undefined;
    				messageData.container.style.setProperty('--row', i);
    				flusher.props.rowQueue[i].push(messageData);
    			}
    			return;
    		}
    	}
    } */

    startAnimation(messageData, flusher);
  }
}
function prepareAnimation(data, flusher) {
  if (!data.container) data.container = data;
  flusher.props.external ? data.container.classList.add('flusher-message') : data.container.classList.add('flusher-kick');
  data.container.style.setProperty('--row', data.row);
  data.container.addEventListener("animationend", function () {
    try {
      const oldest = flusher.container.firstChild;
      if (!flusher.states.spamState) {
        const entryId = flusher.props.isAeroKick ? oldest.querySelector('button')?.getAttribute('data-radial-id') : oldest.getAttribute('data-chat-entry');
        if (entryId) flusher.props.displayedMessages = flusher.props.displayedMessages.filter(message => message.id !== entryId);
      }
      oldest.remove();
    } catch {}
  });
  return data;
}
;// CONCATENATED MODULE: ./modules/layout/vertical.js
function appendVertical(message, flusher) {
  if (!message) return;
  const lastItem = flusher.container.firstChild;
  if (flusher.props.external) {
    if (flusher.states.slide) message.container.classList.add("flusher-animation-vertical");
    const timestamp = new Date(message.created_at);
    message.container.dataset.timestamp = timestamp;
    if (lastItem) {
      const lastTimestamp = new Date(lastItem.dataset.timestamp ?? 0);
      if (timestamp < lastTimestamp) {
        flusher.container.append(message.container);
      } else {
        let current = lastItem;
        while (current) {
          const currentTimestamp = new Date(current.dataset.timestamp);
          if (timestamp > currentTimestamp) {
            flusher.container.insertBefore(message.container, current);
            break;
          }
          current = current.previousSibling;
        }
        if (!current) flusher.container.insertBefore(message.container, lastItem);
      }
    } else {
      flusher.container.append(message.container);
    }
  } else {
    if (message.container) {
      if (flusher.states.slide) message.container.classList.add("flusher-animation-vertical");
      flusher.container['insertBefore'](message.container, lastItem);
    } else {
      if (flusher.states.slide) message.classList.add("flusher-animation-vertical");
      flusher.container['insertBefore'](message, lastItem);
    }
  }
  while (flusher.container.children.length > flusher.props.maxRows) {
    const oldest = flusher.container.lastChild;
    if (!flusher.states.spamState) {
      const entryId = flusher.props.isAeroKick ? oldest.querySelector('button')?.getAttribute('data-radial-id') : oldest.getAttribute('data-chat-entry');
      if (entryId) flusher.props.displayedMessages = flusher.props.displayedMessages.filter(message => message.id !== entryId);
    }
    oldest.remove();
  }
}
;// CONCATENATED MODULE: ./modules/utils/utils.js
function visibilityChange(flusher) {
  logToConsole(`Add visibilityChange`);
  document.addEventListener('visibilitychange', function handleVisibilityChange() {
    if (!flusher || !flusher.states.flushState) return;
    if (document.hidden) {
      flusher.props.chatEnabledVisible = flusher.states.chatEnabled;
      flusher.states.chatEnabled = false;
      flusher.clear();
    } else {
      flusher.states.chatEnabled = flusher.props.chatEnabledVisible;
    }
  });
}
function getFont() {
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap';
  return fontLink;
}
function logToConsole(message) {
  const isChrome = navigator.userAgent.toLowerCase().includes('chrome');
  isChrome ? console.log(`%c Kick Chat Flusher %c ${message}`, 'background: #228B22; color: #FFFFFF; padding: 2px 0;', '') : console.log('Kick Chat Flusher - ', message);
}
;// CONCATENATED MODULE: ./modules/queue/queue.js



function getMessageKey(key, value, messageId, flusher) {
  const keyValue = key + "-" + value;
  const dupe = flusher.props.displayedMessages.find(obj => {
    return obj.key === keyValue;
  });
  const ignore = !flusher.states.spamState && dupe && flusher.lastRow > 1 ? true : false;
  if (!ignore) flusher.props.displayedMessages.push({
    id: messageId,
    key: keyValue
  });
  return {
    key: keyValue,
    ignore: ignore
  };
}
async function processMessageQueue(flusher) {
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
    if (eventType === "App\\Events\\ChatMessageEvent" && flusher.props.external) {
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
function processElementQueue(flusher) {
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
    flushState ? selectRow(queueItem, flusher) : appendVertical(queueItem, flusher);
    if (flusher.props.isVod) {
      const queueLength = flusher.props.elementQueue.length;
      let wait = Math.trunc(3500 / queueLength);
      if (queueLength < 3 && flusher.props.isVod && flusher.props.flushState) wait = 500;
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
  const reduced = !flusher.props.spamState ? reduceRepeatedSentences(content) : content;
  if (!flusher.states.spamState) {
    const messageKeyData = getMessageKey(sender.id, reduced, message.id, flusher);
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
  badgeElements.forEach(badgeElement => {
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
      badgeImage = correspondingBadge ? correspondingBadge : flusher.badges["subscriber"]?.cloneNode(true);
    } else {
      badgeImage = flusher.badges[badge.type]?.cloneNode(true) || null;
    }
    return badgeImage;
  }
  function findClosestBadge(months) {
    return flusher.props.badgeCache.reduce((closest, currentBadge) => {
      if (currentBadge.months <= months && (!closest || currentBadge.months > closest.months)) {
        return currentBadge;
      }
      return closest || flusher.badges["subscriber"]?.cloneNode(true);
    }, null)?.badge_image || flusher.props.badgeCache[flusher.props.badgeCache.length - 1]?.badge_image || flusher.badges["subscriber"]?.cloneNode(true);
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
    let firstChatIdentity = document.querySelector(`.chat-entry-username[data-chat-entry-user-id="${data.sender.id}"]`);
    if (firstChatIdentity !== null) {
      let identity = firstChatIdentity.closest(".chat-message-identity");
      identity.querySelectorAll("div.badge-tooltip").forEach(function (baseBadge, index) {
        let badge = badges[index];
        if (badge === undefined) return;
        let badgeText = badge.text;
        if (badge.count) {
          badgeText = `${badge.type}-${badge.count}`;
        }
        const cachedBadge = flusher.props.badgeCache.find(badgeCache => badgeCache.type === badgeText);
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
            html: newImg
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
            html: svgCopy
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
function createUserBanMessage(data, flusher) {
  logToConsole("createUserBanMessage");
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
    } else {
      timeDiffText = "indefinitely";
    }
    logText = `${bannedUser} banned for ${timeDiffText} by ${bannedByUser}`;
    const expiresText = document.createTextNode(logText);
    banMessageSpan.appendChild(expiresText);
  } else {
    logText = `${bannedUser} banned indefinitely by ${bannedByUser}`;
    const expiresText = document.createTextNode(logText);
    banMessageSpan.appendChild(expiresText);
  }
  banMessageContent.appendChild(banMessageSpan);
  data.created_at = Date.now();
  data.container = banMessageContent;
  logToConsole(logText);
  appendMessage(data, flusher);
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
  logToConsole(`createSubMessage`);
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
  logToConsole(`createHostMessage`);
  const hostUsername = data.host_username;
  const viewersCount = data.number_viewers;
  const hostMessageContent = document.createElement("div");
  hostMessageContent.classList.add("flusher-message", "flusher-green");
  const emojiSpan = document.createElement("span");
  emojiSpan.textContent = String.fromCodePoint(0x1f389) + " ";
  const viewersCountSpan = document.createElement("span");
  viewersCountSpan.textContent = `${viewersCount > 1 ? viewersCount + " viewers" : "1 viewer"} hosted by ` + hostUsername;
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
  logToConsole(`createGiftedMessage`);
  const gifterUsername = data.gifter_username;
  const giftedUsernames = data.gifted_usernames;
  const giftedContent = document.createElement("div");
  giftedContent.classList.add("flusher-message", "flusher-green");
  const emojiSpan = document.createElement("span");
  emojiSpan.textContent = String.fromCodePoint(0x1f389) + " ";
  const gifterUsernameSpan = document.createElement("span");
  gifterUsernameSpan.textContent = `${giftedUsernames.length > 1 ? giftedUsernames.length + " Subscriptions" : "1 Subscription"} gifted by ` + gifterUsername;
  const giftedSpan = document.createElement("span");
  giftedSpan.style.color = "#00FF00";
  giftedSpan.append(emojiSpan, gifterUsernameSpan);
  giftedContent.appendChild(giftedSpan);
  data.created_at = Date.now();
  data.container = giftedContent;
  appendMessage(data, flusher);
}
function createFollowersMessage(data, flusher) {
  logToConsole(`createFollowersMessage`);
  const followersCount = data.followersCount;
  if (flusher.props.lastFollowersCount !== null) {
    const followersDiff = followersCount - flusher.props.lastFollowersCount;
    if (followersDiff === 0) {
      flusher.props.isProcessingMessages = false;
      processMessageQueue(flusher);
      return;
    }
    const messageContent = document.createElement("div");
    messageContent.classList.add("flusher-message");
    const emojiSpan = document.createElement("span");
    emojiSpan.textContent = String.fromCodePoint(0x1f389) + " ";
    const followersMessageSpan = document.createElement("span");
    followersMessageSpan.textContent = `${followersDiff > 1 ? followersDiff + " new followers" : "1 new follower"}`;
    const followersSpan = document.createElement("span");
    followersSpan.append(emojiSpan, followersMessageSpan);
    messageContent.append(followersSpan);
    data.created_at = Date.now();
    data.container = messageContent;
    appendMessage(data, flusher);
    flusher.props.lastFollowersCount = followersCount;
  } else {
    flusher.props.lastFollowersCount = followersCount;
    flusher.props.isProcessingMessages = false;
    processMessageQueue(flusher);
  }
}
;// CONCATENATED MODULE: ./modules/flusher/messages.js


class FlusherMessages {
  constructor() {
    logToConsole("Create MessageProvider");
    this.socket = null;
    this.nativeChatObserver = null;
    this.channels = new Set();
  }
  subscribeChannel(flusher) {
    const id = flusher.props.chatroomId;
    if (!id) return;
    if (this.channels.has(id)) {
      logToConsole(`Channel ${id} is already subscribed.`);
      return;
    }
    const subscriptionMessage = {
      event: "pusher:subscribe",
      data: {
        auth: "",
        channel: `chatrooms.${id}.v2`
      }
    };
    if (!this.socket) {
      this.setupWebSocket(flusher, subscriptionMessage, id);
      return;
    }
    logToConsole(`Subscribe Channel:  ${id}`);
    this.socket.send(JSON.stringify(subscriptionMessage));
    this.channels.add(id);
    if (flusher.props.external) this.getHistory(flusher);
  }
  async getHistory(flusher) {
    const apiUrl = `https://kick.com/api/v2/channels/${flusher.props.hostId}/messages`;
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch messages. Status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.data && data.data.messages) {
        logToConsole(`History has ${data.data.messages.length} messages`);
        data.data.messages.forEach(message => {
          flusher.props.messageQueue.push(message);
        });
        processMessageQueue(flusher);
      } else {
        logToConsole("No messages found in the response.");
      }
    } catch (error) {
      console.error("Error fetching messages:", error.message);
    }
  }
  setupWebSocket(flusher) {
    logToConsole("Setup WebSocket");
    if (this.socket) return;
    const webSocketUrl = "wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.6.0&flash=false";
    this.socket = new WebSocket(webSocketUrl);
    this.socket.onmessage = event => {
      const data = JSON.parse(event.data);
      document.body.contains(flusher.video) ? this.onMessage(data, flusher) : this.disposeChannel();
    };
    this.socket.addEventListener("open", event => {
      logToConsole(`WebSocket connection opened ${flusher.props.channelName}`);
      this.subscribeChannel(flusher);
    });
    this.socket.addEventListener("close", event => {
      logToConsole(`WebSocket connection closed ${flusher.props.channelName}`);
      this.channels.clear();
    });
    this.socket.addEventListener("error", event => {
      console.error("WebSocket error:", event);
    });
  }
  onMessage(data, flusher) {
    if (!flusher.states.chatEnabled || data === null || flusher.props.loading) return;
    flusher.props.messageQueue.push(data);
    processMessageQueue(flusher);
  }
  disposeChannel() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      return;
    }
  }
  async interceptNative(flusher) {
    logToConsole(`Intercept Native Chat`);
    const AeroKick = document.body.classList.contains("aerokick-customization");
    if (AeroKick) logToConsole(`detected: AeroKick for Chat`);
    const nativeChat = await waitForChat(flusher.props.isVod ? document.querySelector("#chatroom-replay") : document.querySelector(AeroKick ? ".chat-container .bk-overflow-y-auto" : ".overflow-y-scroll.py-3"), AeroKick);
    const b = typeof browser !== "undefined" ? browser : chrome;
    const defaultAvatar = b.runtime.getURL("lib/kick/user-profile-pic.png");
    if (!flusher.states.flushState) setTimeout(() => {
      logToConsole(`Parse existing`);
      nativeChat.childNodes.forEach(addedNode => {
        checkDupe(addedNode, AeroKick);
      });
    }, 500);
    this.nativeChatObserver = new MutationObserver(mutations => {
      const nodesList = flusher.props.isVod ? mutations.reverse() : mutations;
      nodesList.forEach(mutation => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach(addedNode => {
            checkDupe(addedNode, AeroKick);
          });
        }
      });
    });
    const observerConfig = {
      childList: true,
      subtree: false
    };
    this.nativeChatObserver.observe(nativeChat, observerConfig);
    function checkDupe(addedNode, AeroKick) {
      if (!addedNode || addedNode.nodeName !== "DIV") return;
      if (AeroKick && !flusher.props.isVod) {
        const button = addedNode.querySelector("button");
        if (!button) {
          console.log("Kick Chat Flusher - Button does not exist in the added node:", addedNode);
          return;
        }
      }
      const id = AeroKick && flusher.props.isAeroKick ? addedNode.querySelector("button").getAttribute("data-radial-id") : addedNode.getAttribute("data-chat-entry");
      if (id === "history_breaker" || flusher.states.flushState && (!id || id === "")) return;
      if (id || id === "") {
        if (!flusher.states.spamState || flusher.states.flushState) {
          let uniqueString = "";
          const userId = AeroKick && flusher.props.isAeroKick ? addedNode.querySelector("button").getAttribute("data-radial-username") : addedNode.querySelector("[data-chat-entry-user-id]")?.getAttribute("data-chat-entry-user-id");
          uniqueString += userId + "-";
          const divTextContent = AeroKick && flusher.props.isAeroKick ? addedNode.querySelector("span.bk-inline").textContent : addedNode.querySelector(".chat-entry-content")?.textContent;
          uniqueString += divTextContent + "-";
          if (AeroKick && flusher.props.isAeroKick) {
            const emoteElements = addedNode.querySelectorAll("img");
            emoteElements.forEach(emoteElement => {
              const emoteValue = emoteElement.getAttribute("alt");
              uniqueString += emoteValue;
            });
          } else {
            const emoteElements = addedNode.querySelectorAll("[data-emote-name]");
            emoteElements.forEach(emoteElement => {
              const emoteValue = emoteElement.getAttribute("data-emote-name");
              uniqueString += emoteValue;
            });
          }
          const exist = flusher.props.displayedMessages.find(obj => {
            return obj.key === uniqueString;
          });
          if (exist) return;
          flusher.props.displayedMessages.push({
            id: id,
            key: uniqueString
          });
        }
      }
      setTimeout(() => addMessage(addedNode, id, defaultAvatar, AeroKick), 150);
    }
    function addMessage(node, id, defaultAvatar, AeroKick) {
      const clonedNode = node.cloneNode(true);
      if (AeroKick) {
        clonedNode.style.fontSize = null;
        clonedNode.style.marginTop = null;
        clonedNode.classList.remove("relative", "bk-pl-1.5");
        if (flusher.states.flushState) {
          var elements = clonedNode.querySelectorAll("[class*=bk-top-]");
          elements.forEach(element => {
            var classes = element.classList;
            var classesToRemove = Array.from(classes).filter(className => className.includes("bk-top-"));
            classesToRemove.forEach(className => {
              element.classList.remove(className);
            });
          });
        }
        const avatar = clonedNode.querySelector('img[alt="avatar"]');
        if (avatar) {
          avatar.closest("button").classList.remove("bk-ease-in-out", "bk-duration-100", "bk-transition-colors", "bk-translate-y-px");
          avatar.style.animation = "none";
          const username = clonedNode.querySelector(".bk-text-transparent");
          if (username) username.style.color = username.style.backgroundColor ?? "white";
          avatar.onerror = function () {
            this.style.display = "none";
            this.onerror = null;
            this.src = defaultAvatar;
            this.style.display = "block";
          };
        }
      }

      /* function getRandomColor() {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
               color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
         }
          const randomColor = getRandomColor();
         node.style.border = `2px solid ${randomColor}`;
         clonedNode.style.border = `2px solid ${randomColor}`; */

      if (id || id === "") {
        if ((!flusher.states.spamState || flusher.states.flushState) && !flusher.props.isVod) {
          clonedNode.querySelectorAll("span:nth-child(3) span").forEach(function (element) {
            if (element.textContent.trim().length > 0) {
              const regexSentence = /(\b.+?\b)\1+/g;
              const sentence = element.textContent.replace(regexSentence, "$1");
              const regexChar = /(.)(\1{10,})/g;
              element.textContent = sentence.replace(regexChar, "$1$1$1$1$1$1$1$1$1$1");
            }
          });
        }
        if (!flusher.states.reply || flusher.states.flushState) {
          if (AeroKick) {
            const chatEntry = clonedNode.querySelector(".bk-text-sm");
            if (chatEntry) chatEntry.style.display = "none";
          } else {
            const chatEntry = clonedNode.querySelector(".chat-entry");
            if (chatEntry && chatEntry.childElementCount > 1) {
              chatEntry.firstElementChild.style.display = "none";
            }
          }
        }
        if (flusher.props.isVod && (flusher.states.flushState || !flusher.states.timeState)) {
          const chatEntryDiv = clonedNode.querySelector(".chat-entry div");
          if (chatEntryDiv && chatEntryDiv.firstElementChild) {
            chatEntryDiv.firstElementChild.style.display = "none";
          }
        }
      }
      clonedNode.classList.remove("mt-0.5");
      flusher.props.elementQueue.push(clonedNode);
      processElementQueue(flusher);
    }
    function waitForChat(parent) {
      logToConsole(`Looking for Native Chat`);
      if (!parent) parent = document.body;
      const chatEntry = parent.querySelector(".rounded-md.bk-block") || parent.querySelector("[data-chat-entry]");
      if (chatEntry) {
        logToConsole(`Native Chat found`);
        return chatEntry.parentElement;
      }
      return new Promise(resolve => {
        const config = {
          attributes: true,
          childList: true,
          subtree: true
        };
        let found = false;
        const mutationCallback = function (mutationsList, observer) {
          for (const mutation of mutationsList) {
            if (mutation.type === "childList") {
              mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && (node.classList.contains("bk-block.rounded-md") || node.hasAttribute("data-chat-entry"))) {
                  if (found) return;
                  observer.disconnect();
                  resolve(node.parentNode);
                  found = true;
                  logToConsole(`Native Chat found`);
                }
              });
            }
          }
        };
        const observer = new MutationObserver(mutationCallback);
        observer.observe(parent, config);
      });
    }
  }
  async bindRequests(flusher) {
    logToConsole(`Bind Requests`);
    if (!flusher) return;
    if (!flusher.props.external && !this.nativeChatObserver) this.interceptNative(flusher);
    setTimeout(async () => {
      if (!flusher) return;
      if (!flusher.props.chatroomId && !flusher.props.isVod) {
        try {
          const response = await fetch(`https://kick.com/api/v1/channels/${flusher.props.channelName}`);
          const data = await response.json();
          flusher.props.chatroomId = data && data.chatroom && data.chatroom.id;
          logToConsole(`chatroomId: ${flusher.props.chatroomId} ${flusher.props.channelName}`);
          flusher.props.hostId = data.id;
          if (flusher.props.external) {
            logToConsole(`${data.subscriber_badges.length} Badges`);
            flusher.props.badgeCache.push(...data.subscriber_badges);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
      if (!this.socket && !flusher.props.isVod) this.subscribeChannel(flusher);
    }, flusher.props.external ? 0 : 5000);
  }
  unbindRequests(flusher) {
    logToConsole(`Unbind Requests`);
    this.disposeChannel(flusher);
    if (!flusher?.props?.external) {
      logToConsole(`Dispose Native Chat`);
      if (this.nativeChatObserver) this.nativeChatObserver.disconnect();
      this.nativeChatObserver = null;
    }
  }
}
;// CONCATENATED MODULE: ./modules/interface/menu/element.js
const menuHtml = `<div class="flusher-menu" style="display: none;">
  <div class="flusher-menu-base" style="display: block;">
    <div class="flex items-center justify-between px-2.5 pt-1 text-base font-bold">
      <div class="flex h-8 items-center space-x-2.5">
        <div class="flusher-menu-title">Chat Flusher</div>
      </div><button class="flusher-menu-close variant-text size-xs flusher-icon-button">
        <div style="width: 12px; height: 12px;" class="flusher-icon icon"><svg width="12" height="12"
          viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 1.99602L10.504 0.5L6 4.99867L1.49602 0.5L0 1.99602L4.49867 6.5L0 11.004L1.49602 12.5L6 8.00133L10.504 12.5L12 11.004L7.50133 6.5L12 1.99602Z"
            fill="currentColor"></path>
        </svg></div>
      </button>
    </div>
    <div class="chat-actions-content">
      <div class="chat-actions-menu-list">
        <div class="flusher-enable flusher-actions-item">
          <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Overlay</div>
          <div class="flex h-10 w-fit items-center justify-end">
            <div class="flusher-toggle-size-sm">
              <div class="flusher-toggle">
                <div class="flusher-toggle-indicator"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="flusher-flush flusher-actions-item" style="display: flex;">
          <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Flush</div>
          <div class="flex h-10 w-fit items-center justify-end">
            <div class="flusher-toggle-size-sm">
              <div class="flusher-toggle">
                <div class="flusher-toggle-indicator"></div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="flusher-layoutMenu flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60"
          style="display: flex;">
          <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Layout</div>
          <div class="flex h-10 w-fit items-center justify-end">
            <div style="width: 16px; height: 16px;" class="flusher-icon"><svg version="1.2"
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m4.5 12.9l4.9-4.9-4.9-4.9 1.1-1.1 6 6-6 6z"></path>
            </svg></div>
          </div>
        </div>
        <div
          class="flusher-settings flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60"
          style="display: flex;">
          <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Settings</div>
          <div class="flex h-10 w-fit items-center justify-end">
            <div style="width: 16px; height: 16px;" class="flusher-icon"><svg version="1.2"
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m4.5 12.9l4.9-4.9-4.9-4.9 1.1-1.1 6 6-6 6z"></path>
            </svg></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="flusher-menu-settings" style="display: none;">
    <div class="flex items-center justify-between px-2.5 pt-1 text-base font-bold">
      <div class="flex h-8 items-center space-x-2.5">
        <button class="flusher-settings-back -ml-2 variant-text size-sm flusher-icon-button">
          <div style="width: 16px; height: 16px;" class="base-icon icon"><svg version="1.2"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path id="Layer" class="s0" d="m11.1 3.1l-4.9 4.9 4.9 4.9-1.1 1.1-6-6 6-6z"></path>
          </svg></div>
        </button>
        <div class="pr-3">Settings</div>
      </div>
      <button class="flusher-settings-close variant-text size-xs flusher-icon-button">
        <div style="width: 12px; height: 12px;" class="base-icon icon"><svg width="12" height="12" viewBox="0 0 12 13"
          fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 1.99602L10.504 0.5L6 4.99867L1.49602 0.5L0 1.99602L4.49867 6.5L0 11.004L1.49602 12.5L6 8.00133L10.504 12.5L12 11.004L7.50133 6.5L12 1.99602Z"
            fill="currentColor"></path>
        </svg></div>
      </button>
    </div>
    <div class="chat-actions-content">
      <div class="flusher-spam flusher-actions-item">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Spam</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="flusher-font flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Font Size</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="select-none overflow-hidden truncate pr-0 text-sm font-medium"></div>
        </div>
      </div>
      <div class="flusher-spaced flusher-actions-item" style="display: none;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Spaced</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="flusher-background flusher-actions-item" style="display: none;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Background
        </div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="flusher-store flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-0 text-sm font-medium">Web Store
        </div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div style="width: 16px; height: 16px;" class="flusher-icon"><svg width="16" height="16" viewBox="0 0 16 16"
            fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.5 12.5V2H2V14H14V12.5H3.5Z" fill="currentColor"></path>
            <path
              d="M5.52869 11.5287L10.9999 6.06125V9.5H12.4999V3.5H6.49994V5H9.93869L4.47119 10.4712L5.52869 11.5287Z"
              fill="currentColor"></path>
          </svg></div>
        </div>
      </div>
      <div
        class="flusher-home flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-0 text-sm font-medium">Report Bugs
        </div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div style="width: 16px; height: 16px;" class="flusher-icon"><svg width="16" height="16" viewBox="0 0 16 16"
            fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.5 12.5V2H2V14H14V12.5H3.5Z" fill="currentColor"></path>
            <path
              d="M5.52869 11.5287L10.9999 6.06125V9.5H12.4999V3.5H6.49994V5H9.93869L4.47119 10.4712L5.52869 11.5287Z"
              fill="currentColor"></path>
          </svg></div>
        </div>
      </div>
    </div>
  </div>
  <div class="flusher-menu-layout" style="display: none;">
    <div class="flex items-center justify-between px-2.5 pt-1 text-base font-bold">
      <div class="flex h-8 items-center space-x-2.5">
        <button class="flusher-layout-back -ml-2 variant-text size-sm flusher-icon-button">
          <div style="width: 16px; height: 16px;" class="base-icon icon"><svg version="1.2"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path id="Layer" class="s0" d="m11.1 3.1l-4.9 4.9 4.9 4.9-1.1 1.1-6-6 6-6z"></path>
          </svg></div>
        </button>
        <div class="pr-3">Layout</div>
      </div>
      <button class="flusher-layout-close variant-text size-xs flusher-icon-button">
        <div style="width: 12px; height: 12px;" class="base-icon icon"><svg width="12" height="12" viewBox="0 0 12 13"
          fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 1.99602L10.504 0.5L6 4.99867L1.49602 0.5L0 1.99602L4.49867 6.5L0 11.004L1.49602 12.5L6 8.00133L10.504 12.5L12 11.004L7.50133 6.5L12 1.99602Z"
            fill="currentColor"></path>
        </svg></div>
      </button>
    </div>
    <div class="chat-actions-content">
      <div
        class="flusher-messageMenu flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60"
        style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Message</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div style="width: 16px; height: 16px;" class="flusher-icon"><svg version="1.2"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path id="Layer" class="s0" d="m4.5 12.9l4.9-4.9-4.9-4.9 1.1-1.1 6 6-6 6z"></path>
          </svg></div>
        </div>
      </div>
      <div
        class="flusher-overlayMenu flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60"
        style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Overlay</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div style="width: 16px; height: 16px;" class="flusher-icon"><svg version="1.2"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path id="Layer" class="s0" d="m4.5 12.9l4.9-4.9-4.9-4.9 1.1-1.1 6 6-6 6z"></path>
          </svg></div>
        </div>
      </div>

    </div>
  </div>
  <div class="flusher-menu-message" style="display: none;">
    <div class="flex items-center justify-between px-2.5 pt-1 text-base font-bold">
      <div class="flex h-8 items-center space-x-2.5">
        <button class="flusher-message-back -ml-2 variant-text size-sm flusher-icon-button">
          <div style="width: 16px; height: 16px;" class="base-icon icon"><svg version="1.2"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path id="Layer" class="s0" d="m11.1 3.1l-4.9 4.9 4.9 4.9-1.1 1.1-6-6 6-6z"></path>
          </svg></div>
        </button>
        <div class="pr-3">Message</div>
      </div>
      <button class="flusher-message-close variant-text size-xs flusher-icon-button">
        <div style="width: 12px; height: 12px;" class="base-icon icon"><svg width="12" height="12" viewBox="0 0 12 13"
          fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 1.99602L10.504 0.5L6 4.99867L1.49602 0.5L0 1.99602L4.49867 6.5L0 11.004L1.49602 12.5L6 8.00133L10.504 12.5L12 11.004L7.50133 6.5L12 1.99602Z"
            fill="currentColor"></path>
        </svg></div>
      </button>
    </div>
    <div class="chat-actions-content">
      <div class="flusher-reply flusher-actions-item" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Show Reply</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="flusher-slide flusher-actions-item" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Slide</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="flusher-shadow flusher-actions-item" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Text Shadow</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="flusher-time flusher-actions-item" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Show Time</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="flusher-background flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Background</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="select-none overflow-hidden truncate pr-0 text-sm font-medium"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="flusher-menu-overlay" style="display: none;">
    <div class="flex items-center justify-between px-2.5 pt-1 text-base font-bold">
      <div class="flex h-8 items-center space-x-2.5">
        <button class="flusher-overlay-back -ml-2 variant-text size-sm flusher-icon-button">
          <div style="width: 16px; height: 16px;" class="base-icon icon"><svg version="1.2"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path id="Layer" class="s0" d="m11.1 3.1l-4.9 4.9 4.9 4.9-1.1 1.1-6-6 6-6z"></path>
          </svg></div>
        </button>
        <div class="pr-3">Overlay</div>
      </div>
      <button class="flusher-overlay-close variant-text size-xs flusher-icon-button">
        <div style="width: 12px; height: 12px;" class="base-icon icon"><svg width="12" height="12" viewBox="0 0 12 13"
          fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 1.99602L10.504 0.5L6 4.99867L1.49602 0.5L0 1.99602L4.49867 6.5L0 11.004L1.49602 12.5L6 8.00133L10.504 12.5L12 11.004L7.50133 6.5L12 1.99602Z"
            fill="currentColor"></path>
        </svg></div>
      </button>
    </div>
    <div class="chat-actions-content">
      <div
        class="flusher-position flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Position</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="select-none overflow-hidden truncate pr-0 text-sm font-medium"></div>
        </div>
      </div>
      <div
        class="flusher-size flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Size</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="select-none overflow-hidden truncate pr-0 text-sm font-medium"></div>
        </div>
      </div>
    </div>
  </div>
</div>`;
const parser = new DOMParser();
const doc = parser.parseFromString(menuHtml, 'text/html');
const menu = doc.body.firstChild;
;// CONCATENATED MODULE: ./modules/interface/toggle/element.js
const toggleHtml = `<button class="flusher-toggle vjs-control vjs-button"><span class="vjs-icon-placeholder" aria-hidden="true"></span><svg
viewBox="0 0 16 16" color="white" class="mx-auto toggle-icon" style="width: 25px;">
<path
  d="M12.8191 7.99813C12.8191 7.64949 12.7816 7.30834 12.7104 6.97844L13.8913 6.29616L12.3918 3.69822L11.2071 4.38051C10.7048 3.9269 10.105 3.57076 9.44517 3.35708V2H6.44611V3.36082C5.78632 3.57451 5.19025 3.9269 4.68416 4.38426L3.49953 3.70197L2 6.29616L3.18088 6.97844C3.10965 7.30834 3.07217 7.64949 3.07217 7.99813C3.07217 8.34677 3.10965 8.68791 3.18088 9.01781L2 9.70009L3.49953 12.298L4.68416 11.6157C5.1865 12.0694 5.78632 12.4255 6.44611 12.6392V14H9.44517V12.6392C10.105 12.4255 10.701 12.0731 11.2071 11.6157L12.3918 12.298L13.8913 9.70009L12.7104 9.01781C12.7816 8.68791 12.8191 8.34677 12.8191 7.99813ZM9.82006 9.87254H6.07123V6.12371H9.82006V9.87254Z"
  fill="currentColor"></path>
</svg><span class="vjs-control-text" aria-live="polite">Chat Flusher</span>
</button>`;
const element_parser = new DOMParser();
const element_doc = element_parser.parseFromString(toggleHtml, 'text/html');
const toggle = element_doc.body.firstChild;
;// CONCATENATED MODULE: ./modules/interface/toggle/toggle.js


let clickOutsideHandlerFunction = null;
function createToggle(flusher) {
  const parent = !flusher.props.isAeroKick && !flusher.props.external ? flusher.video.closest('#video-holder') : flusher.video.parentNode;
  const domToggle = parent.querySelector('.flusher-toggle-btn');
  if (domToggle !== null) return;
  const popupMenu = parent.querySelector('#shadowbox').shadowRoot.querySelector('.flusher-menu');
  const baseMenu = popupMenu.querySelector('.flusher-menu-base');
  const existingButton = flusher.props.external ? parent : flusher.props.isAeroKick ? flusher.video.parentElement.querySelector('button.bk-relative.bk-mr-4') : document.querySelector('.vjs-fullscreen-control');
  const toggleBtn = flusher.props.external || flusher.props.isAeroKick ? toggle.querySelector('svg').cloneNode(true) : toggle.cloneNode(true);
  if (flusher.props.isAeroKick) toggleBtn.style.marginRight = "1rem";
  flusher.props.external ? existingButton.parentNode.append(toggleBtn) : existingButton.parentElement.insertBefore(toggleBtn, flusher.props.isAeroKick ? existingButton : existingButton.nextSibling);
  svgToggle(flusher);
  toggleBtn.addEventListener('mousedown', function (event) {
    event.stopPropagation();
    popupMenu.style.display === "block" ? hideMenu(flusher) : showMenu();
  });
  function showMenu() {
    baseMenu.style.display = 'block';
    popupMenu.style.display = 'block';
    svgToggle(flusher);
    flusher.clickOutsideHandlerFunction = event => clickOutsideHandler(event, flusher);
    document.addEventListener('mousedown', flusher.clickOutsideHandlerFunction);
  }
  return toggleBtn;
}
function svgToggle(flusher) {
  const parent = flusher.props.external ? flusher.video.closest('.item-box') : document;
  const toggle = parent.querySelector('.toggle-icon');
  if (toggle === null) return;
  const menu = parent.querySelector('#shadowbox').shadowRoot.querySelector('.flusher-menu');
  const visible = menu.style.display === "block" ? true : false;
  if (flusher.states.chatEnabled || visible) {
    toggle.classList.add('svg-toggle');
  } else {
    toggle.classList.remove('svg-toggle');
  }
}
;// CONCATENATED MODULE: ./modules/utils/drag.js
function dragElement(flusher) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  var isResizing = false;
  flusher.container.onmousedown = function (e) {
    e = e || window.event;
    e.preventDefault();
    if (isInResizeHandle(e)) {
      isResizing = true;
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeResize;
      document.onmousemove = resizeElement;
    } else {
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = dragElement;
    }
  };
  function dragElement(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    flusher.container.style.top = flusher.container.offsetTop - pos2 + "px";
    flusher.container.style.left = flusher.container.offsetLeft - pos1 + "px";
  }
  function resizeElement(e) {
    e = e || window.event;
    e.preventDefault();
    flusher.container.style.width = flusher.container.offsetWidth - (pos3 - e.clientX) + "px";
    flusher.container.style.height = flusher.container.offsetHeight - (pos4 - e.clientY) + "px";
    pos3 = e.clientX;
    pos4 = e.clientY;
  }
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
  function closeResize() {
    isResizing = false;
    document.onmouseup = null;
    document.onmousemove = null;
  }
  function isInResizeHandle(e) {
    var rect = flusher.container.getBoundingClientRect();
    var handleSize = 10;
    return e.clientX >= rect.right - handleSize && e.clientY >= rect.bottom - handleSize;
  }
}
;// CONCATENATED MODULE: ./modules/interface/menu/menu.js




function createMenu(flusher) {
  const toggledClass = 'toggled-on';

  /* flusher.video = flusher.props.external ? flusher.video : flusher.video.closest('.video-js'); */
  const domMenu = flusher.video.querySelector('.flusher-menu');
  if (domMenu === null) {
    const b = typeof browser !== 'undefined' ? browser : chrome;
    let parent = flusher.props.external ? flusher.video.parentNode : flusher.props.isAeroKick ? flusher.video.closest('#bk-video-player') : document.querySelector('.vjs-control-bar');
    const shadowBox = document.createElement('div');
    shadowBox.id = 'shadowbox';
    if (flusher.props.isAeroKick) shadowBox.style.zIndex = 1001;
    const shadowRoot = shadowBox.attachShadow({
      mode: 'open'
    });
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = b.runtime.getURL('lib/kick/app.b67a4f06.css');
    shadowRoot.appendChild(linkElement);
    const menuLink = document.createElement('link');
    menuLink.rel = 'stylesheet';
    menuLink.href = b.runtime.getURL('lib/flusher/menu.css');
    shadowRoot.appendChild(menuLink);
    flusher.menu = menu.cloneNode(true);
    flusher.menu.setAttribute('domain', flusher.props.domain);
    shadowRoot.appendChild(flusher.menu);
    parent.append(shadowBox);
    parent = parent.querySelector('#shadowbox').shadowRoot;
    let settingsMenu = parent.querySelector('.flusher-menu-settings');
    let layoutMenu = parent.querySelector('.flusher-menu-layout');
    let messageMenu = parent.querySelector('.flusher-menu-message');
    let overlayMenu = parent.querySelector('.flusher-menu-overlay');
    const closeBtn = parent.querySelector('.flusher-menu-close');
    closeBtn.addEventListener('mousedown', function (event) {
      hideMenu(flusher);
    });
    const homeBtn = parent.querySelector('.flusher-home');
    homeBtn.addEventListener('mousedown', function (event) {
      hideMenu(flusher);
      window.open('https://github.com/r0808914/Kick-Chat-Flusher/issues', '_blank');
    });
    const storeBtn = parent.querySelector('.flusher-store');
    storeBtn.addEventListener('mousedown', function (event) {
      hideMenu(flusher);
      const userAgent = navigator.userAgent.toLowerCase();
      userAgent.includes("firefox") ? window.open('https://addons.mozilla.org/en-US/firefox/addon/kickchatflusher/', '_blank') : window.open('https://chromewebstore.google.com/detail/kick-chat-flusher/cefplanllnmdnnhncpopljmcjnlafdke', '_blank');
    });
    const positionBtn = overlayMenu.querySelector('.flusher-position');
    const divInsidePosition = positionBtn.querySelector('div:empty');
    divInsidePosition.textContent = toTitleCase(flusher.states.positionStates[flusher.states.positionState]);
    positionBtn.addEventListener('mousedown', function (event) {
      flusher.states.positionState = (flusher.states.positionState + 1) % flusher.states.positionStates.length;
      setExtensionStorageItem('flusher-position', flusher.states.positionState);
      divInsidePosition.textContent = toTitleCase(flusher.states.positionStates[flusher.states.positionState]);
      flusher.container.setAttribute('position', flusher.states.positionStates[flusher.states.positionState].replace(/\s/g, ""));
      flusher.resetPosition();
    });
    const sizeBtn = overlayMenu.querySelector('.flusher-size');
    const divInsideSize = sizeBtn.querySelector('div:empty');
    divInsideSize.textContent = toTitleCase(flusher.states.sizeStates[flusher.states.sizeState]);
    sizeBtn.addEventListener('mousedown', function (event) {
      flusher.states.sizeState = (flusher.states.sizeState + 1) % flusher.states.sizeStates.length;
      setExtensionStorageItem('flusher-size', flusher.states.sizeState);
      divInsideSize.textContent = toTitleCase(flusher.states.sizeStates[flusher.states.sizeState]);
      flusher.container.setAttribute('size', flusher.states.sizeStates[flusher.states.sizeState].replace(/\s/g, ""));
      flusher.setVerticalWidth();
    });
    const backgroundBtn = messageMenu.querySelector('.flusher-background');
    const divInsideBackground = backgroundBtn.querySelector('div:empty');
    divInsideBackground.textContent = toTitleCase(flusher.states.backgroundStates[flusher.states.backgroundState]);
    backgroundBtn.addEventListener('mousedown', function (event) {
      flusher.states.backgroundState = (flusher.states.backgroundState + 1) % flusher.states.backgroundStates.length;
      setExtensionStorageItem('flusher-background', flusher.states.backgroundState);
      divInsideBackground.textContent = toTitleCase(flusher.states.backgroundStates[flusher.states.backgroundState]);
      flusher.container.setAttribute('background', flusher.states.backgroundStates[flusher.states.backgroundState]);
    });
    const baseMenu = parent.querySelector('.flusher-menu-base');
    const settingsBtn = parent.querySelector('.flusher-settings');
    settingsBtn.addEventListener('mousedown', function (event) {
      settingsMenu.style.display = 'block';
      baseMenu.style.display = 'none';
    });
    const settingsBackBtn = parent.querySelector('.flusher-settings-back');
    settingsBackBtn.addEventListener('mousedown', function (event) {
      settingsMenu.style.display = 'none';
      baseMenu.style.display = 'block';
    });
    const settingsCloseBtn = parent.querySelector('.flusher-settings-close');
    settingsCloseBtn.addEventListener('mousedown', function (event) {
      hideMenu(flusher);
    });
    const layoutCloseBtn = parent.querySelector('.flusher-layout-close');
    layoutCloseBtn.addEventListener('mousedown', function (event) {
      hideMenu(flusher);
    });
    const layoutMenuBtn = parent.querySelector('.flusher-layoutMenu');
    layoutMenuBtn.addEventListener('mousedown', function (event) {
      layoutMenu.style.display = 'block';
      baseMenu.style.display = 'none';
    });
    const layoutBackBtn = parent.querySelector('.flusher-layout-back');
    layoutBackBtn.addEventListener('mousedown', function (event) {
      layoutMenu.style.display = 'none';
      baseMenu.style.display = 'block';
    });
    const messageCloseBtn = parent.querySelector('.flusher-message-close');
    messageCloseBtn.addEventListener('mousedown', function (event) {
      hideMenu(flusher);
    });
    const messageMenuBtn = parent.querySelector('.flusher-messageMenu');
    messageMenuBtn.addEventListener('mousedown', function (event) {
      messageMenu.style.display = 'block';
      layoutMenu.style.display = 'none';
    });
    const messageBackBtn = parent.querySelector('.flusher-message-back');
    messageBackBtn.addEventListener('mousedown', function (event) {
      messageMenu.style.display = 'none';
      layoutMenu.style.display = 'block';
    });
    const overlayCloseBtn = parent.querySelector('.flusher-overlay-close');
    overlayCloseBtn.addEventListener('mousedown', function (event) {
      hideMenu(flusher);
    });
    const overlayMenuBtn = parent.querySelector('.flusher-overlayMenu');
    overlayMenuBtn.addEventListener('mousedown', function (event) {
      overlayMenu.style.display = 'block';
      layoutMenu.style.display = 'none';
    });
    const overlayBackBtn = parent.querySelector('.flusher-overlay-back');
    overlayBackBtn.addEventListener('mousedown', function (event) {
      overlayMenu.style.display = 'none';
      layoutMenu.style.display = 'block';
    });
    flusher.states.flushState || !flusher.states.chatEnabled ? layoutMenuBtn.style.display = 'none' : layoutMenuBtn.style.display = 'flex';
    const spamBtnContainer = parent.querySelector('.flusher-spam');
    const spamBtn = spamBtnContainer.querySelector('.flusher-toggle');
    spamBtn.addEventListener('mousedown', function (event) {
      const toggleElement = event.currentTarget;
      toggleElement.classList.toggle(toggledClass);
      const newSpamEnabled = toggleElement.classList.contains(toggledClass);
      flusher.states.spamState = newSpamEnabled;
      setExtensionStorageItem('flusher-spam', newSpamEnabled);
      flusher.props.displayedMessages = [];
    });
    flusher.states.flushState || !flusher.states.chatEnabled ? spamBtnContainer.style.display = 'none' : spamBtnContainer.style.display = 'flex';
    if (flusher.states.spamState) spamBtn.classList.toggle(toggledClass);
    const fontBtn = settingsMenu.querySelector('.flusher-font');
    const divInsideFont = fontBtn.querySelector('div:empty');
    divInsideFont.textContent = toTitleCase(flusher.states.sizeStates[flusher.states.fontState]);
    fontBtn.addEventListener('mousedown', function (event) {
      flusher.states.fontState = (flusher.states.fontState + 1) % flusher.states.sizeStates.length;
      setExtensionStorageItem('flusher-font', flusher.states.fontState);
      divInsideFont.textContent = toTitleCase(flusher.states.sizeStates[flusher.states.fontState]);
      flusher.container.setAttribute('font', flusher.states.sizeStates[flusher.states.fontState].replace(/\s/g, ""));
      if (flusher.states.flushState) flusher.clear();
    });
    !flusher.states.chatEnabled ? fontBtn.style.display = 'none' : fontBtn.style.display = 'flex';
    const replyToggleContainer = parent.querySelector('.flusher-reply');
    const replyToggle = replyToggleContainer.querySelector('.flusher-toggle');
    replyToggle.addEventListener('mousedown', function (event) {
      const toggleElement = event.currentTarget;
      toggleElement.classList.toggle(toggledClass);
      const newReplyEnabled = toggleElement.classList.contains(toggledClass);
      flusher.states.reply = newReplyEnabled;
      flusher.container.childNodes.forEach(childNode => {
        const chatEntry = childNode.querySelector('.chat-entry');
        if (chatEntry && chatEntry.childElementCount > 1) {
          chatEntry.firstElementChild.style.display = flusher.states.reply ? 'flex' : 'none';
        }
      });
      setExtensionStorageItem('flusher-reply', newReplyEnabled);
    });
    flusher.props.external || flusher.props.isVod ? replyToggleContainer.style.display = 'none' : replyToggleContainer.style.display = 'flex';
    if (flusher.states.reply) replyToggle.classList.toggle(toggledClass);
    const slideToggleContainer = parent.querySelector('.flusher-slide');
    const slideToggle = slideToggleContainer.querySelector('.flusher-toggle');
    slideToggle.addEventListener('mousedown', function (event) {
      const toggleElement = event.currentTarget;
      toggleElement.classList.toggle(toggledClass);
      const newSlideEnabled = toggleElement.classList.contains(toggledClass);
      flusher.states.slide = newSlideEnabled;
      setExtensionStorageItem('flusher-slide', newSlideEnabled);
    });
    if (flusher.states.slide) slideToggle.classList.toggle(toggledClass);
    const shadowToggleContainer = parent.querySelector('.flusher-shadow');
    const shadowToggle = shadowToggleContainer.querySelector('.flusher-toggle');
    shadowToggle.addEventListener('mousedown', function (event) {
      const toggleElement = event.currentTarget;
      toggleElement.classList.toggle(toggledClass);
      const newShadowEnabled = toggleElement.classList.contains(toggledClass);
      flusher.states.shadow = newShadowEnabled;
      flusher.container.setAttribute('shadow', newShadowEnabled);
      setExtensionStorageItem('flusher-shadow', newShadowEnabled);
    });
    if (flusher.states.shadow) shadowToggle.classList.toggle(toggledClass);
    const timeToggleContainer = messageMenu.querySelector('.flusher-time');
    const timeToggle = timeToggleContainer.querySelector('.flusher-toggle');
    timeToggle.addEventListener('mousedown', function (event) {
      const toggleElement = event.currentTarget;
      toggleElement.classList.toggle(toggledClass);
      const newTimeEnabled = toggleElement.classList.contains(toggledClass);
      flusher.states.timeState = newTimeEnabled;
      flusher.container.childNodes.forEach(childNode => {
        const chatEntry = childNode.querySelector('.chat-entry div');
        chatEntry.firstElementChild.style.display = flusher.states.timeState ? 'initial' : 'none';
      });
      flusher.container.setAttribute('time', newTimeEnabled);
      setExtensionStorageItem('flusher-time', newTimeEnabled);
    });
    if (flusher.states.timeState) timeToggle.classList.toggle(toggledClass);
    !flusher.props.isVod || flusher.states.flushState ? timeToggleContainer.style.display = 'none' : timeToggleContainer.style.display = 'flex';
    const flusherToggleContainer = parent.querySelector('.flusher-flush');
    const flushToggle = flusherToggleContainer.querySelector('.flusher-toggle');
    flushToggle.addEventListener('mousedown', function (event) {
      const toggleElement = event.currentTarget;
      toggleElement.classList.toggle(toggledClass);
      const newFlushState = toggleElement.classList.contains(toggledClass);
      newFlushState ? layoutMenuBtn.style.display = 'none' : layoutMenuBtn.style.display = 'flex';
      flusher.states.flushState = newFlushState;
      flusher.states.flushState || !flusher.states.chatEnabled ? spamBtnContainer.style.display = 'none' : spamBtnContainer.style.display = 'flex';
      if (flusher.states.flushState) {} else {}
      if (flusher.states.chatEnabled && !flusher.states.flushState) dragElement(flusher);
      togglePointerEvents(flusher);
      flusher.clear();
      flusher.container.setAttribute('layout', newFlushState ? 'horizontal' : 'vertical');
      setExtensionStorageItem('flusher-flush', newFlushState);
    });
    !flusher.states.chatEnabled ? flusherToggleContainer.style.display = 'none' : flusherToggleContainer.style.display = 'flex';
    if (flusher.states.flushState) flushToggle.classList.toggle(toggledClass);
    const flusherToggle = parent.querySelector('.flusher-enable .flusher-toggle');
    flusherToggle.addEventListener('mousedown', function (event) {
      const toggleElement = event.currentTarget;
      toggleElement.classList.toggle(toggledClass);
      const newChatEnabled = toggleElement.classList.contains(toggledClass);
      flusher.states.chatEnabled = newChatEnabled;
      newChatEnabled ? flusher.provider.bindRequests(flusher) : flusher.provider.unbindRequests(flusher);
      if (newChatEnabled && flusher.container.attributes['layout']?.nodeValue === 'vertical') dragElement(flusher);
      flusher.clear();
      svgToggle(flusher);
      toggleEnableMenu();
      togglePointerEvents(flusher);
      flusher.states.flushState || !flusher.states.chatEnabled ? spamBtnContainer.style.display = 'none' : spamBtnContainer.style.display = 'flex';
      flusher.states.flushState || !flusher.states.chatEnabled ? layoutMenuBtn.style.display = 'none' : layoutMenuBtn.style.display = 'flex';
      !flusher.states.chatEnabled ? flusherToggleContainer.style.display = 'none' : flusherToggleContainer.style.display = 'flex';
      !flusher.states.chatEnabled ? fontBtn.style.display = 'none' : fontBtn.style.display = 'flex';
      flusher.container.setAttribute('enabled', newChatEnabled);
      setExtensionStorageItem('flusher-enable', newChatEnabled);
    });
    if (flusher.states.chatEnabled) flusherToggle.classList.toggle(toggledClass);
    return createToggle(flusher);
  }
  function toTitleCase(str) {
    if (!str) return 'undefined';
    if (str === 'OFF' || str === 'ON') return str;
    return str.toLowerCase().replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });
  }
  function setExtensionStorageItem(key, value) {
    const data = {
      [key]: value
    };
    chrome.storage.local.set(data, () => {
      logToConsole(`Value for key ${key} has been set to ${value} in extension storage.`);
    });
  }
}
function toggleEnableMenu() {
  var elementsToToggle = ['flusher-flush', 'flusher-settings', 'flusher-layoutMenu'];
  elementsToToggle.forEach(function (id) {
    var element = document.getElementById(id);
    if (element) {
      if (id === 'flusher-layoutMenu' && flusher.states.flushState === true && flusher.states.chatEnabled) return;
      flusher.states.chatEnabled ? flusher.video.style.display = 'flex' : flusher.video.style.display = 'none';
    }
  });
}
function hideMenu(flusher) {
  const baseMenu = flusher.menu.querySelector('.flusher-menu-base');
  const settingsMenu = flusher.menu.querySelector('.flusher-menu-settings');
  const layoutMenu = flusher.menu.querySelector('.flusher-menu-layout');
  const overlayMenu = flusher.menu.querySelector('.flusher-menu-overlay');
  const messageMenu = flusher.menu.querySelector('.flusher-menu-message');
  flusher.menu.style.display = 'none';
  settingsMenu.style.display = 'none';
  baseMenu.style.display = 'none';
  layoutMenu.style.display = 'none';
  overlayMenu.style.display = 'none';
  messageMenu.style.display = 'none';
  svgToggle(flusher);
  document.removeEventListener('mousedown', flusher.clickOutsideHandlerFunction);
}
function clickOutsideHandler(event, flusher) {
  if (flusher.menu !== null && !flusher.menu.contains(event.target) && flusher.menu.style.display === 'block' && !isClickInsideShadowBox(event.target)) {
    if (flusher.toggle.contains(event.target) || event.target === flusher.toggle) return;
    hideMenu(flusher);
  }
  function isClickInsideShadowBox(target) {
    const path = event.composedPath();
    return path.some(node => node.id === 'shadowbox');
  }
}
function togglePointerEvents(flusher) {
  if (flusher.states.flushState || !flusher.states.chatEnabled) {
    flusher.container.classList.remove('flusher-grab');
    flusher.container.classList.add('flusher-no-grab');
  } else {
    flusher.container.classList.remove('flusher-no-grab');
    flusher.container.classList.add('flusher-grab');
    flusher.props.lastRow = 2;
    dragElement(flusher);
  }
}
;// CONCATENATED MODULE: ./modules/utils/resize.js




function checkResize(flusher) {
  logToConsole("Check Resize");
  const target = flusher.props.external ? flusher.video : flusher.video.querySelector("video") ?? flusher.video;
  flusher.resizeTimer = null;
  if (flusher.resizeObserver) flusher.resizeObserver.disconnect();
  flusher.resizeObserver = new ResizeObserver(entries => {
    if (flusher.container !== null) flusher.container.style.display = "none";
    for (let entry of entries) {
      if (flusher.resizeTimer) clearTimeout(flusher.resizeTimer);
      flusher.resizeTimer = setTimeout(() => {
        for (let entry of entries) {
          const rect = target.getBoundingClientRect();
          let width = rect.width;
          let height = rect.height;
          window.currentUrl = window.location.href;
          if ((width === null || width === 0) && (!height || height === 0)) {
            if (flusher !== null) {
              logToConsole("Remove Chat");
              const init = !flusher.props.external;
              flusher.resizeObserver.disconnect();
              flusher.resizeObserver = null;
              flusher.provider.unbindRequests();
              flusher = null;
              if (init) kick.init();
            }
            return;
          }
          logToConsole(`Width ${Math.round(width)} height ${Math.round(height)}`);
          const oldWidth = flusher.props.parentWidth;
          flusher.props.parentWidth = Math.trunc(width) * 2;
          flusher.props.parentHeight = Math.trunc(height);
          flusher.container.style.setProperty("--flusher-width", `-${flusher.props.parentWidth}px`);
          flusher.toggle.setAttribute("domain", flusher.props.domain);
          const newFlushState = flusher.states.flushState !== undefined ? flusher.states.flushState ? "horizontal" : "vertical" : flusher.states.flushState ? "horizontal" : "vertical";
          flusher.container.setAttribute("layout", newFlushState);
          flusher.container.setAttribute("enabled", flusher.states.chatEnabled);
          flusher.container.setAttribute("shadow", flusher.states.shadow);
          setAttribute(flusher.container, "position", flusher.states.positionStates, flusher.states.positionState);
          setAttribute(flusher.container, "size", flusher.states.sizeStates, flusher.states.sizeState);
          flusher.container.setAttribute("background", flusher.states.backgroundStates[flusher.states.backgroundState]);
          setAttribute(flusher.container, "font", flusher.states.sizeStates, flusher.states.fontState);
          flusher.container.setAttribute("time", flusher.states.timeState);
          if (flusher.props.isAeroKick) {
            flusher.container.setAttribute("aerokick", "");
          }
          toggleEnableMenu();
          const documentWidth = document.documentElement.clientWidth;
          if (documentWidth < flusher.props.parentWidth / 2 + 10) {
            flusher.props.isFullscreen = true;
            startScrollingInterval(flusher);
          } else {
            flusher.props.isFullscreen = false;
            stopScrollingInterval(flusher);
          }
          flusher.props.elementHeight = null;
          flusher.container.style.display = "flex";
          createIntroMessage(flusher);
          if (oldWidth == null || oldWidth == 0) {
            if (flusher.container === null) return;
            if (flusher.states.chatEnabled) flusher.provider.bindRequests(flusher);
            flusher.props.loading = false;
            processMessageQueue(flusher);
            togglePointerEvents(flusher);
            logToConsole(`(${flusher.props.channelName} ${flusher.props.domain} ${flusher.props.isVod ? "VOD" : "LIVE"}): Report bugs or collaborate at https://github.com/r0808914/Kick-Chat-Flusher`);
          } else {
            flusher.states.flushState ? flusher.clear() : flusher.resetPosition();
          }
        }
      }, 750);
    }
  });
  flusher.resizeObserver.observe(flusher.video);
  function createIntroMessage(flusher) {
    const introContent = document.createElement("div");
    introContent.classList.add("flusher-message");
    const emojiSpan = document.createElement("span");
    emojiSpan.textContent = String.fromCodePoint(0x1f389) + " ";
    const introSpan = document.createElement("span");
    introSpan.textContent = `thanks for testing (version..)`;
    const introMessageSpan = document.createElement("span");
    introMessageSpan.append(emojiSpan, introSpan);
    introContent.appendChild(introMessageSpan);
    introContent.style.setProperty("--row", 0);
    introContent.classList.add("flusher-message");
    const parent = flusher.props.external ? flusher.container : document.body;
    parent.append(introContent);
    flusher.props.elementHeight = introContent.clientHeight;
    flusher.props.maxRows = Math.ceil(flusher.props.parentHeight / flusher.props.elementHeight);
    parent.removeChild(introContent);
    flusher.setVerticalWidth();
  }
}
function startScrollingInterval(flusher) {
  if (flusher.props.scrollIntervalId) return;
  scrollChat(flusher);
  flusher.props.scrollIntervalId = setInterval(function () {
    scrollChat(flusher);
  }, 10000);
}
function setAttribute(element, attribute, states, stateKey) {
  const state = states[stateKey];
  const value = state.replace(/\s/g, "");
  element.setAttribute(attribute, value);
}
function stopScrollingInterval(flusher) {
  if (!flusher.props.scrollIntervalId) return;
  clearInterval(flusher.props.scrollIntervalId);
  flusher.props.scrollIntervalId = null;
}
function scrollChat(flusher) {
  const chatBtn = document.querySelector("#chatroom .justify-center.absolute");
  const chatContainer = document.querySelector("#chatroom [data-chat-entry]");
  if (flusher.props.isFullscreen && !flusher.props.isVod) {
    if (chatBtn !== null) {
      chatBtn.click();
    }
    if (chatContainer !== null) {
      const chatContainerParent = chatContainer.closest(".overflow-y-scroll");
      if (chatContainerParent !== null) {
        chatContainerParent.scrollTop = chatContainerParent.scrollHeight;
      }
    }
  }
}
;// CONCATENATED MODULE: ./modules/utils/badges.js
class Badges {
  broadcasterSVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" space="preserve" width="16" height="16">
   <g id="Badge_Chat_host"><linearGradient id="badge-host-gradient-1" gradientUnits="userSpaceOnUse" x1="4" y1="180.5864" x2="4" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><rect x="3.2" y="9.6" style="fill:url(#badge-host-gradient-1);" width="1.6" height="1.6"></rect><linearGradient id="badge-host-gradient-2" gradientUnits="userSpaceOnUse" x1="8" y1="180.5864" x2="8" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><polygon style="fill:url(#badge-host-gradient-2);" points="6.4,9.6 9.6,9.6 9.6,8 11.2,8 
		11.2,1.6 9.6,1.6 9.6,0 6.4,0 6.4,1.6 4.8,1.6 4.8,8 6.4,8 	"></polygon><linearGradient id="badge-host-gradient-3" gradientUnits="userSpaceOnUse" x1="2.4" y1="180.5864" x2="2.4" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><rect x="1.6" y="6.4" style="fill:url(#badge-host-gradient-3);" width="1.6" height="3.2"></rect><linearGradient id="badge-host-gradient-4" gradientUnits="userSpaceOnUse" x1="12" y1="180.5864" x2="12" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><rect x="11.2" y="9.6" style="fill:url(#badge-host-gradient-4);" width="1.6" height="1.6"></rect><linearGradient id="badge-host-gradient-5" gradientUnits="userSpaceOnUse" x1="8" y1="180.5864" x2="8" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><polygon style="fill:url(#badge-host-gradient-5);" points="4.8,12.8 6.4,12.8 6.4,14.4 
		4.8,14.4 4.8,16 11.2,16 11.2,14.4 9.6,14.4 9.6,12.8 11.2,12.8 11.2,11.2 4.8,11.2 	"></polygon><linearGradient id="badge-host-gradient-6" gradientUnits="userSpaceOnUse" x1="13.6" y1="180.5864" x2="13.6" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><rect x="12.8" y="6.4" style="fill:url(#badge-host-gradient-6);" width="1.6" height="3.2"></rect></g>
</svg>`;
  founderSVG = `<svg version="1.1" x="0px" y="0px" viewBox="0 0 16 16" space="preserve" width="16" height="16"><linearGradient id="badge-founder-gradient" gradientUnits="userSpaceOnUse" x1="7.874" y1="20.2333" x2="8.1274" y2="-0.3467" gradientTransform="matrix(1 0 0 -1 0 18)"><stop offset="0" style="stop-color: rgb(255, 201, 0);"></stop><stop offset="0.99" style="stop-color: rgb(255, 149, 0);"></stop></linearGradient><path d="
M14.6,4V2.7h-1.3V1.4H12V0H4v1.4H2.7v1.3H1.3V4H0v8h1.3v1.3h1.4v1.3H4V16h8v-1.4h1.3v-1.3h1.3V12H16V4H14.6z M9.9,12.9H6.7V6.4H4.5
V5.2h1V4.1h1v-1h3.4V12.9z" style="fill-rule: evenodd; clip-rule: evenodd; fill: url(&quot;#badge-founder-gradient&quot;);"></path></svg>`;
  moderatorSVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" space="preserve" width="16" height="16">
   <path d="M11.7,1.3v1.5h-1.5v1.5 H8.7v1.5H7.3v1.5H5.8V5.8h-3v3h1.5v1.5H2.8v1.5H1.3v3h3v-1.5h1.5v-1.5h1.5v1.5h3v-3H8.7V8.7h1.5V7.3h1.5V5.8h1.5V4.3h1.5v-3 C14.7,1.3,11.7,1.3,11.7,1.3z" style="fill: #00C7FF"></path>
</svg>`;
  ogSVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" space="preserve" width="16" height="16">
   <g>
      <linearGradient id="badge-og-gradient-1" gradientUnits="userSpaceOnUse" x1="12.2" y1="-180" x2="12.2" y2="-165.2556" gradientTransform="matrix(1 0 0 -1 0 -164)">
         <stop offset="0" style="stop-color:#00FFF2;"></stop><stop offset="0.99" style="stop-color:#006399;"></stop>
      </linearGradient>
      <path style="fill:url(#badge-og-gradient-1);" d="M16,16H9.2v-0.8H8.4v-8h0.8V6.4H16v3.2h-4.5v4.8H13v-1.6h-0.8v-1.6H16V16z"></path>
      <linearGradient id="badge-og-gradient-2" gradientUnits="userSpaceOnUse" x1="3.7636" y1="-164.265" x2="4.0623" y2="-179.9352" gradientTransform="matrix(1 0 0 -1 0 -164)">
         <stop offset="0" style="stop-color:#00FFF2;"></stop>
         <stop offset="0.99" style="stop-color:#006399;"></stop>
      </linearGradient>
      <path style="fill:url(#badge-og-gradient-2);" d="M6.8,8.8v0.8h-6V8.8H0v-8h0.8V0h6.1v0.8 h0.8v8H6.8z M4.5,6.4V1.6H3v4.8H4.5z"></path>
      <path style="fill:#00FFF2;" d="M6.8,15.2V16h-6v-0.8H0V8.8h0.8V8h6.1v0.8h0.8v6.4C7.7,15.2,6.8,15.2,6.8,15.2z M4.5,14.4V9.6H3v4.8 C3,14.4,4.5,14.4,4.5,14.4z"></path>
      <path style="fill:#00FFF2;" d="M16,8H9.2V7.2H8.4V0.8h0.8V0H16v1.6h-4.5v4.8H13V4.8h-0.8V3.2H16V8z"></path>
   </g>
</svg>`;
  staffSVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="16" height="16" viewBox="0 0 16 16" fill="none">
   <path fill-rule="evenodd" clip-rule="evenodd" d="M2.07324 1.33331H6.51991V4.29331H7.99991V2.81331H9.47991V1.33331H13.9266V5.77998H12.4466V7.25998H10.9599V8.73998H12.4466V10.22H13.9266V14.6666H9.47991V13.1866H7.99991V11.7066H6.51991V14.6666H2.07324V1.33331Z" fill="url(#badge-verified-gradient)"></path>
   <defs>
      <linearGradient id="badge-verified-gradient" x1="33.791%" y1="97.416%" x2="65.541%" y2="4.5%" gradientUnits="objectBoundingBox">
         <stop stop-color="#1EFF00"></stop>
         <stop offset="0.99" stop-color="#00FF8C"></stop>
      </linearGradient>
   </defs>
</svg>`;
  subGifter1SVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="16" height="16" viewBox="0 0 16 16" fill="none">
   <g clip-path="url(#clip0_301_17810)">
      <path d="M7.99999 9.14999V6.62499L0.484985 3.35999V6.34499L1.15499 6.63499V12.73L7.99999 15.995V9.14999Z" fill="#0269D4"></path>
      <path d="M8.00003 10.735V9.61501L1.15503 6.63501V7.70501L8.00003 10.735Z" fill="#0269D4"></path>
      <path d="M15.515 3.355V6.345L14.85 6.64V12.73L12.705 13.755L11.185 14.48L8.00499 15.995V6.715L4.81999 5.295H4.81499L3.29499 4.61L0.484985 3.355L3.66999 1.935L3.67999 1.93L5.09499 1.3L8.00499 0L10.905 1.3L12.32 1.925L12.33 1.935L15.515 3.355Z" fill="#04D0FF"></path>
      <path d="M14.845 6.63501V7.70501L8 10.735V9.61501L14.845 6.63501Z" fill="#0269D4"></path>
   </g>
   <defs>
      <clipPath id="clip0_301_17810">
         <rect width="16" height="16" fill="white"></rect>
      </clipPath>
   </defs>
</svg>`;
  subGufter2SVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="16" height="16" viewBox="0 0 16 16" fill="none">
   <g clip-path="url(#clip0_301_17825)"><path d="M7.99999 9.14999V6.62499L0.484985 3.35999V6.34499L1.14999 6.63999V12.73L7.99999 16V9.14999Z" fill="#FF5008"></path>
      <path d="M8.00002 10.74V9.61501L1.15002 6.64001V7.71001L8.00002 10.74Z" fill="#FF5008"></path>
      <path d="M15.515 3.355V6.345L14.85 6.64V12.73L12.705 13.755L11.185 14.48L8.00499 15.995V6.715L4.81999 5.295H4.81499L3.29499 4.61L0.484985 3.355L3.66999 1.935L3.67999 1.93L5.09499 1.3L8.00499 0L10.905 1.3L12.32 1.925L12.33 1.935L15.515 3.355Z" fill="#FFC800"></path>
      <path d="M14.85 6.64001V7.71001L8 10.74V9.61501L14.85 6.64001Z" fill="#FF5008"></path>
   </g>
   <defs>
      <clipPath id="clip0_301_17825">
         <rect width="16" height="16" fill="white"></rect>
      </clipPath>
   </defs>
</svg>`;
  subscriberSVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="16" height="16" viewBox="0 0 16 16" fill="none">
   <g>
      <linearGradient id="badge-subscriber-gradient-1" gradientUnits="userSpaceOnUse" x1="-2.386" y1="-151.2764" x2="42.2073" y2="-240.4697" gradientTransform="matrix(1 0 0 -1 0 -164)">
         <stop offset="0" style="stop-color:#E1FF00;"></stop>
         <stop offset="0.99" style="stop-color:#2AA300;"></stop>
      </linearGradient>
      <path style="fill:url(#badge-subscriber-gradient-1);" d="M14.8,7.3V6.1h-2.4V4.9H11V3.7H9.9V1.2H8.7V0H7.3v1.2H6.1v2.5H5v1.2H3.7v1.3H1.2v1.2H0v1.4 h1.2V10h2.4v1.3H5v1.2h1.2V15h1.2v1h1.3v-1.2h1.2v-2.5H11v-1.2h1.3V9.9h2.4V8.7H16V7.3H14.8z"></path>
      <linearGradient id="badge-subscriber-gradient-2" gradientUnits="userSpaceOnUse" x1="-5.3836" y1="-158.3055" x2="14.9276" y2="-189.0962" gradientTransform="matrix(1 0 0 -1 0 -164)">
         <stop offset="0" style="stop-color:#E1FF00;"></stop>
         <stop offset="0.99" style="stop-color:#2AA300;"></stop>
      </linearGradient>
      <path style="fill:url(#badge-subscriber-gradient-2);" d="M7.3,7.3v7.5H6.1v-2.5H5v-1.2H3.7V9.9H1.2 V8.7H0V7.3H7.3z"></path>
      <linearGradient id="badge-subscriber-gradient-3" gradientUnits="userSpaceOnUse" x1="3.65" y1="-160.7004" x2="3.65" y2="-184.1244" gradientTransform="matrix(1 0 0 -1 0 -164)">
         <stop offset="0" style="stop-color:#E1FF00;"></stop>
         <stop offset="0.99" style="stop-color:#2AA300;"></stop>
      </linearGradient>
      <path style="fill:url(#badge-subscriber-gradient-3);" d="M7.3,7.3v7.5H6.1v-2.5H5v-1.2H3.7V9.9H1.2 V8.7H0V7.3H7.3z"></path>
      <linearGradient id="badge-subscriber-gradient-4" gradientUnits="userSpaceOnUse" x1="22.9659" y1="-167.65" x2="-5.3142" y2="-167.65" gradientTransform="matrix(1 0 0 -1 0 -164)">
         <stop offset="0" style="stop-color:#E1FF00;"></stop>
         <stop offset="0.99" style="stop-color:#2AA300;"></stop>
      </linearGradient>
      <path style="fill:url(#badge-subscriber-gradient-4);" d="M8.7,0v7.3H1.2V6.1h2.4V4.9H5V3.7h1.2V1.2 h1.2V0H8.7z"></path>
      <linearGradient id="badge-subscriber-gradient-5" gradientUnits="userSpaceOnUse" x1="12.35" y1="-187.6089" x2="12.35" y2="-161.5965" gradientTransform="matrix(1 0 0 -1 0 -164)">
         <stop offset="0" style="stop-color:#E1FF00;"></stop>
         <stop offset="0.99" style="stop-color:#2AA300;"></stop>
      </linearGradient>
      <path style="fill:url(#badge-subscriber-gradient-5);" d="M8.7,8.7V1.2h1.2v2.5H11v1.2h1.3v1.3h2.4 v1.2H16v1.4L8.7,8.7L8.7,8.7z"></path>
      <linearGradient id="badge-subscriber-gradient-6" gradientUnits="userSpaceOnUse" x1="-6.5494" y1="-176.35" x2="21.3285" y2="-176.35" gradientTransform="matrix(1 0 0 -1 0 -164)">
         <stop offset="0" style="stop-color:#E1FF00;"></stop>
         <stop offset="0.99" style="stop-color:#2AA300;"></stop>
      </linearGradient>
      <path style="fill:url(#badge-subscriber-gradient-6);" d="M7.3,16V8.7h7.4v1.2h-2.4v1.3H11v1.2H9.9 v2.5H8.7V16H7.3z"></path>
      <linearGradient id="badge-subscriber-gradient-7" gradientUnits="userSpaceOnUse" x1="6.72" y1="-169.44" x2="12.2267" y2="-180.4533" gradientTransform="matrix(1 0 0 -1 0 -164)">
         <stop offset="0" style="stop-color:#E1FF00;"></stop>
         <stop offset="0.99" style="stop-color:#2AA300;"></stop>
      </linearGradient>
      <path style="fill:url(#badge-subscriber-gradient-7);" d="M8.7,7.3H7.3v1.4h1.3L8.7,7.3L8.7,7.3z"></path>
   </g>
</svg>`;
  verifiedSVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="16" height="16" viewBox="0 0 16 16" fill="none">
   <path d="M14.72 7.00003V6.01336H15.64V4.12003H14.6733V3.16003H9.97332V1.2667H8.96665V0.280029H7.03332V1.2667H6.03332V3.16003H1.32665V4.12003H0.359985V6.01336H1.28665V7.00003H2.23332V9.0067H1.28665V9.99336H0.359985V11.8867H1.32665V12.8467H6.03332V14.74H7.03332V15.7267H8.96665V14.74H9.97332V12.8467H14.6733V11.8867H15.64V9.99336H14.72V9.0067H13.7733V7.00003H14.72ZM12.5 6.59336H11.44V7.66003H10.3733V8.72003H9.31332V9.7867H8.24665V10.8467L7.09332 10.9V11.8H6.02665V10.8467H5.05999V9.7867H3.99332V7.66003H6.11999V8.72003H7.18665V7.66003H8.24665V6.59336H9.31332V5.53336H10.3733V4.4667H12.5V6.59336Z" fill="url(#badge-verified-gradient)"></path>
   <defs>
      <linearGradient id="badge-verified-gradient" x1="25.333%" y1="99.375%" x2="73.541%" y2="2.917%" gradientUnits="objectBoundingBox">
         <stop stop-color="#1EFF00"></stop>
         <stop offset="0.99" stop-color="#00FF8C"></stop>
      </linearGradient>
   </defs>
</svg>`;
  vipSVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" space="preserve" width="16" height="16">
   <linearGradient id="badge-vip-gradient" gradientUnits="userSpaceOnUse" x1="8" y1="-163.4867" x2="8" y2="-181.56" gradientTransform="matrix(1 0 0 -1 0 -164)">
      <stop offset="0" style="stop-color: rgb(255, 201, 0);"></stop>
      <stop offset="0.99" style="stop-color: rgb(255, 149, 0);"></stop>
   </linearGradient>
   <path d="M13.9,2.4v1.1h-1.2v2.3 h-1.1v1.1h-1.1V4.6H9.3V1.3H6.7v3.3H5.6v2.3H4.4V5.8H3.3V3.5H2.1V2.4H0v12.3h16V2.4H13.9z" style="fill: url(&quot;#badge-vip-gradient&quot;);"></path>
</svg>`;
  parseSVGStringToElement(svgString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(svgString, "image/svg+xml");
    return xmlDoc.documentElement;
  }
  badgeTypeToSVG = {
    subscriber: this.parseSVGStringToElement(this.subscriberSVG),
    founder: this.parseSVGStringToElement(this.founderSVG),
    broadcaster: this.parseSVGStringToElement(this.broadcasterSVG),
    moderator: this.parseSVGStringToElement(this.moderatorSVG),
    og: this.parseSVGStringToElement(this.ogSVG),
    staff: this.parseSVGStringToElement(this.staffSVG),
    sub_gifter: this.parseSVGStringToElement(this.subGifter1SVG),
    sub_gifter_1: this.parseSVGStringToElement(this.subGifter2SVG),
    verified: this.parseSVGStringToElement(this.verifiedSVG),
    vip: this.parseSVGStringToElement(this.vipSVG)
  };
}
/* harmony default export */ const badges = (Badges);
;// CONCATENATED MODULE: ./modules/flusher/flusher.js






class Flusher {
  constructor(video, domain, channelName, aeroKick) {
    this.video = video;
    this.states = new FlusherStates();
    this.props = new FlusherProps();
    this.badges = new badges().badgeTypeToSVG;
    this.props.domain = domain;
    this.props.external = domain === 'KICK' ? false : true;
    this.props.isVod = window.location.href.includes('/video/');
    this.props.isAeroKick = aeroKick ?? false;
    this.props.channelName = channelName;
    this.provider = new FlusherMessages();
    visibilityChange(this);
  }
  resetConnection() {
    logToConsole('Reset Connection');
    if (!this.props.flusher) return;
    clearChat(this.props.flusher);
    isVod = false;
    if (this.props.flusher && this.props.resizeObserver) {
      this.props.resizeObserver.disconnect();
    }
  }
  clear() {
    if (this.container) {
      this.container.style.display = 'none';
      this.resetPosition();
    }
    const isEnabled = this.states.chatEnabled;
    this.states.chatEnabled = false;
    this.props.elementQueue.length = 0;
    this.props.messageQueue.length = 0;
    this.props.lastRow = 0;
    for (const id of this.props.timeoutIds) {
      clearTimeout(id);
    }
    stopScrollingInterval(this);
    if (this.container !== null) {
      while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild);
      }
    }
    this.props.displayedMessages = [];
    if (this.props.lastPositionPerRow) {
      this.props.lastPositionPerRow.length = 0;
    } else {
      this.props.lastPositionPerRow = [];
    }
    if (this.props.rowQueue) {
      this.props.rowQueue.length = 0;
    } else {
      this.props.rowQueue = [];
    }
    this.props.timeoutIds.length = 0;
    if (this.container !== null) this.container.style.display = 'flex';
    this.states.chatEnabled = isEnabled;
    this.props.isProcessingElements = false;
    this.props.isProcessingMessages = false;
  }
  resetPosition() {
    this.container.style.height = '';
    this.container.style.width = '';
    this.container.style.top = '';
    this.container.style.left = '';
  }
  setVerticalWidth() {
    const elementHeight = this.props.elementHeight;
    switch (this.states.sizeStates[this.states.sizeState]) {
      case 'LARGE':
        this.container.style.setProperty('--flusher-vertical-width', `${elementHeight * 14}px`);
        break;
      case 'NORMAL':
        this.container.style.setProperty('--flusher-vertical-width', `${elementHeight * 14}px`);
        break;
      case 'SMALL':
        this.container.style.setProperty('--flusher-vertical-width', `${elementHeight * 9}px`);
        break;
      default:
        break;
    }
  }
}
;// CONCATENATED MODULE: ./modules/interface/overlay.js



async function createChat(flusher) {
  if (flusher.video.hasAttribute('flusher')) return;
  flusher.video.setAttribute('flusher', "");
  logToConsole(`Create Chat`);
  const chatFlusher = document.createElement("div");
  chatFlusher.classList.add("flusher");
  if (flusher.props.isAeroKick) chatFlusher.style.zIndex = 1000;
  const flusherDiv = document.createElement("div");
  flusherDiv.classList.add("flusher-messages");
  const shadowRoot = flusher.props.external ? chatFlusher.attachShadow({
    mode: 'open'
  }) : null;
  const b = typeof browser !== 'undefined' ? browser : chrome;
  const mainStylesDom = document.getElementById('flusher-css-overlay');
  if (!mainStylesDom) {
    const overlayStyle = document.createElement('link');
    overlayStyle.href = b.runtime.getURL('lib/flusher/main.css');
    overlayStyle.id = 'flusher-css-overlay';
    overlayStyle.rel = 'stylesheet';
    document.head.appendChild(overlayStyle);
    const font = getFont();
    document.head.appendChild(font);
  }
  const menuStylesDom = document.getElementById('flusher-css');
  if (!menuStylesDom || flusher.props.external) {
    const menuStyle = document.createElement('link');
    menuStyle.href = b.runtime.getURL('lib/flusher/overlay.css');
    menuStyle.rel = 'stylesheet';
    menuStyle.id = 'flusher-css';
    flusher.props.external ? shadowRoot.appendChild(menuStyle) : document.head.append(menuStyle);
  }
  flusher.container = flusherDiv;
  flusher.states.chatEnabled = await getExtensionStorageItem('flusher-enable', flusher.states.chatEnabled);
  flusher.states.flushState = await getExtensionStorageItem('flusher-flush', flusher.states.flushState);
  flusher.states.reply = await getExtensionStorageItem('flusher-reply', flusher.states.reply);
  flusher.states.spamState = await getExtensionStorageItem('flusher-spam', flusher.states.spamState);
  flusher.states.positionState = await getExtensionStorageItem('flusher-position', flusher.states.positionState);
  flusher.states.fontState = await getExtensionStorageItem('flusher-font', flusher.states.fontState);
  flusher.states.sizeState = await getExtensionStorageItem('flusher-size', flusher.states.sizeState);
  flusher.states.backgroundState = await getExtensionStorageItem('flusher-background', flusher.states.backgroundState);
  flusher.states.timeState = await getExtensionStorageItem('flusher-time', flusher.states.timeState);
  flusher.states.shadow = await getExtensionStorageItem('flusher-shadow', flusher.states.shadow);
  flusher.states.slide = await getExtensionStorageItem('flusher-slide', flusher.states.slide);
  flusher.toggle = createMenu(flusher);
  flusher.video.parentNode.append(chatFlusher);
  flusher.props.external ? shadowRoot.appendChild(flusherDiv) : chatFlusher.append(flusherDiv);
  checkResize(flusher);
  function getExtensionStorageItem(key, defaultValue) {
    return new Promise(resolve => {
      chrome.storage.local.get([key], result => {
        const storedValue = result[key];
        resolve(storedValue !== undefined ? storedValue : defaultValue);
      });
    });
  }
}
;// CONCATENATED MODULE: ./modules/site/kick.js



class Kick {
  static init() {
    logToConsole(`Initialize`);
    let stopObserver = false;
    const observeVideo = () => {
      const videoObserver = new MutationObserver(() => {
        let video = document.getElementsByTagName('video');
        video = video[video.length - 1];
        if (video) {
          logToConsole(`KICK video found`);
          videoObserver.disconnect();
          setTimeout(() => {
            let video = document.getElementsByTagName('video');
            video = video[video.length - 1];
            let channelName = document.querySelector(".stream-username");
            if (channelName && video) {
              channelName = channelName.innerText.trim();
              const AeroKick = video.classList.contains('bk-aspect-video');
              if (AeroKick) logToConsole(`detected: AeroKick`);
              const flusher = new Flusher(video, "KICK", channelName, AeroKick);
              try {
                createChat(flusher);
                return;
              } catch (error) {
                logToConsole(`Failed to create chat`);
              }
            }
            logToConsole(`KICK start video observer`);
            const observer = new MutationObserver(mutations => {
              mutations.forEach(mutation => {
                if (!stopObserver && mutation.addedNodes) {
                  if (document.querySelector(".stream-username")) {
                    let video = document.getElementsByTagName('video');
                    video = video[video.length - 1];
                    if (video) {
                      logToConsole(`KICK stop video observer`);
                      stopObserver = true;
                      const channelName = document.querySelector(".stream-username").innerText.trim();
                      const AeroKick = video.classList.contains('bk-aspect-video');
                      if (AeroKick) logToConsole(`detected: AeroKick`);
                      const flusher = new Flusher(video, "KICK", channelName, AeroKick);
                      try {
                        createChat(flusher);
                      } catch (error) {
                        stopObserver = false;
                        logToConsole(`Failed to create chat`);
                      }
                      if (stopObserver) observer.disconnect();
                    }
                  }
                }
              });
            });
            observer.observe(document.body, {
              childList: true,
              subtree: true
            });
          }, 1000);
        }
      });
      videoObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    };
    observeVideo();
  }
}
/* harmony default export */ const kick = (Kick);
;// CONCATENATED MODULE: ./modules/site/ip2.js



class Ip2 {
  static async init() {
    logToConsole(`Initialize`);
    const targetNode = await waitForCondition(() => document.getElementById('streamViewerContainer'));
    logToConsole(`Container found`);
    const callback = async function (mutationsList, observer) {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          if (mutation.addedNodes.length > 0) {
            for (const node of mutation.addedNodes) {
              if (targetNode.contains(node) && node.parentElement === targetNode) {
                if (node.id && !node.id.includes('-chat-') && node.id.includes('-video-')) {
                  const hasFlusherAttribute = node.hasAttribute('flusher');
                  if (hasFlusherAttribute) return;
                  const iframe = await waitForCondition(() => node.querySelector('iframe'));
                  logToConsole(`New video found`);
                  node.setAttribute('flusher', '');
                  createChannel(iframe);
                }
              }
            }
          }
        }
      }
    };
    const observer = new MutationObserver(callback);
    const config = {
      childList: true,
      subtree: false
    };
    observer.observe(targetNode, config);
    function createChannel(iframe) {
      const src = iframe.getAttribute('src');
      if (src && src.includes('kick.com')) {
        const channelName = new URL(src).pathname.slice(1);
        logToConsole(`Fetch Channel Data`);
        const flusher = new Flusher(iframe, "IP2", channelName);
        createChat(flusher);
      }
    }
    function waitForCondition(conditionCallback) {
      return new Promise((resolve, reject) => {
        const checkCondition = () => {
          const result = conditionCallback();
          if (result) {
            resolve(result);
            return;
          }
          setTimeout(checkCondition, 500);
        };
        checkCondition();
      });
    }

    /* try { 
    	const chatFrame = document.createElement('iframe');
    	chatFrame.src = 'https://kick.com/USERNAME/chatroom';
    	document.body.append(chatFrame);
    	const elementText = chatFrame.$eval('body', (element) => {
    		return element.textContent;
    	});
    	logToConsole('Element Text inside iframe:', elementText);
    } catch (error) {
    	console.error('Error:', error);
    } */
  }
}
/* harmony default export */ const ip2 = (Ip2);
;// CONCATENATED MODULE: ./modules/content.js


window.location.hostname.includes('kick.com') ? setTimeout(kick.init(), 2000) : ip2.init();
/******/ })()
;