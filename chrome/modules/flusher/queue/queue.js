export function getMessageKey(key, value, chatroom_id, flusherSettings) {
	const keyValue = key + "-" + value;
	const dupe = flusherSettings.displayedMessages.has(keyValue);
	const ignore = ((flusherSettings.spamState === 2 && dupe) || (flusherSettings.spamState === 0 && dupe && flusherSettings.lastRow > 1)) ? true : false;
	if (!ignore) flusherSettings.displayedMessages.add(keyValue);
	return { key: keyValue, ignore: ignore };
}

export async function processMessageQueue(flusherSettings) {
	try {
		if (flusherSettings.isProcessingMessages) return;
		flusherSettings.isProcessingMessages = true;

		let queueItem = flusherSettings.messageQueue.shift();
		if (!queueItem) {
			flusherSettings.isProcessingMessages = false;
			return;
		}

		queueItem.chatroom_id = flusherSettings.external ? queueItem?.chatroom_id : 0;

		const lastRow = flusherSettings.lastRow;
		const maxRows = flusherSettings.maxRows;

		if ((lastRow === null || lastRow >= maxRows)) {
			flusherSettings.isProcessingMessages = false;
			return;
		}

		const eventType = queueItem.event ?? queueItem.eventName;

		if (eventType === "App\\Events\\ChatMessageEvent") {
			createMessage(queueItem,flusherSettings);
		} else if (queueItem.type === "message") {
			createMessage(queueItem,flusherSettings);
		} else if (eventType === "App\\Events\\UserBannedEvent") {
			createUserBanMessage(queueItem,flusherSettings);
		} else if (eventType === "App\\Events\\GiftedSubscriptionsEvent") {
			createGiftedMessage(queueItem,flusherSettings);
		} else if (eventType === "App\\Events\\FollowersUpdated") {
			createFollowersMessage(queueItem,flusherSettings);
		} else if (eventType === "App\\Events\\StreamHostEvent") {
			createHostMessage(queueItem,flusherSettings);
		} else if (eventType === "App\\Events\\SubscriptionEvent") {
			createSubMessage(queueItem,flusherSettings);
		} else {
			flusherSettings.isProcessingMessages = false;
			processMessageQueue();
		}
	}
	catch (error) {
		isProcessingMessages = false;
		processMessageQueue(flusherSettings);
		console.log(error);
	}
}

function processElementQueue() {
	try {
		if (isProcessingElements) return;
		isProcessingElements = true;

		const queueItem = elementQueue.shift();
		if (!queueItem) {
			isProcessingElements = false;
			return;
		}

		const flushState = flusherSettings.flushers[queueItem.chatroom_id].flushState;

		if (!flusherSettings.flushers[queueItem.chatroom_id].chatEnabled) {
			isProcessingElements = false;
			return;
		}

		flushState ? selectRow(queueItem) : appendVertical(queueItem);

		if (isVod || flushState) {
			const queueLength = elementQueue.length;
			let wait = Math.trunc(4000 / queueLength);
			if (queueLength < 4 && isVod && flushState) wait = 1000;
			setTimeout(function () {
				isProcessingElements = false;
				processElementQueue();
			}, wait);
		} else {
			isProcessingElements = false;
			processElementQueue();
		}
	} catch (error) {
		isProcessingElements = false;
		processElementQueue();
		console.log(error);
	}
}

function appendMessage(queueItem) {
	elementQueue.push(queueItem);
	processElementQueue();
	isProcessingMessages = false;
	processMessageQueue();
}

async function createMessage(message,flusherSettings) {
	const sender = message.sender;
	const username = sender.username;
	const content = message.content;

	const reduced = flusherSettings.flushers.spamState === 2 ? reduceRepeatedSentences(content) : content;

	const messageKeyData = getMessageKey(sender.id, reduced, message.chatroom_id);
	if (messageKeyData.ignore === true) {
		isProcessingMessages = false;
		processMessageQueue();
		return;
	}

	message.key = messageKeyData.key;

	const messageDiv = document.createElement("div");

	const badgeSpan = document.createElement("span");
	badgeSpan.classList.add("flusher-badges");

	const badgeElements = await getBadges(message);
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
		if (textBeforeEmote.trim() !== '') {
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
	if (textAfterLastEmote.trim() !== '') {
		const textAfterNode = document.createElement("span");
		textAfterNode.textContent = textAfterLastEmote;
		textAfterNode.classList.add("flusher-content-text");
		contentSpan.appendChild(textAfterNode);
	}
	else {
		const lastChild = contentSpan.lastChild;
		if (lastChild.tagName === 'IMG') {
			lastChild.className = 'last-flusher-emote';
		}
	}

	badgeSpan.firstChild ? messageDiv.append(badgeSpan) : null;
	messageDiv.append(usernameSpan, boldSpan, contentSpan);
	message.container = messageDiv;

	appendMessage(message);

	function reduceRepeatedSentences(input) {
		const regexSentence = /(\b.+?\b)\1+/g;
		const sentence = input.replace(regexSentence, '$1');
		const regexChar = /(.)(\1{10,})/g;
		return sentence.replace(regexChar, '$1$1$1$1$1$1$1$1$1$1');
	}

	function checkForBadges(data) {
		const id = data.chatroom_id;
		const badges = data.sender.identity.badges || [];
		const badgeElements = [];

		flusherSettings.isProcessingMessages = false;

		let firstChatIdentity = document.querySelector(`.chat-entry-username[data-chat-entry-user-id="${data.sender.id}"]`);
		if (firstChatIdentity !== null) {
			let identity = firstChatIdentity.closest('.chat-message-identity');
			identity.querySelectorAll('div.badge-tooltip').forEach(function (baseBadge, index) {
				let badge = badges[index];
				if (badge === undefined) return;
				let badgeText = badge.text;

				if (badge.count) {
					badgeText = `${badge.type}-${badge.count}`;
				}

				const cachedBadge = flusherSettings.badgeCache.find(badgeCache => badgeCache.type === badgeText);
				if (cachedBadge) {
					flusherSettings.badgeElements.push(cachedBadge.html);
					return;
				}

				const imgElement = baseBadge.querySelector(`img`);
				if (imgElement) {
					const imgUrl = imgElement.src;
					const newImg = document.createElement('img');
					newImg.src = imgUrl;
					newImg.classList.add('flusher-badge');
					flusherSettings.badgeCache.push({
						type: badgeText,
						html: newImg
					});

					badgeElements.push(newImg);
					return;
				}

				const svgElement = baseBadge.querySelector('svg');
				if (svgElement) {
					const svgCopy = svgElement.cloneNode(true);
					svgCopy.classList.add('flusher-badge');

					flusherSettings.badgeCache.push({
						type: badgeText,
						html: svgCopy
					});

					badgeElements.push(svgCopy);
					return;
				}

				console.warn('badge not found: ' + badgeText);
			});
		}

		return badgeElements;
	}

	async function getBadges(data) {
		const id = data.chatroom_id;
		const badges = data.sender.identity.badges || [];

		let badgeArray = [];
		let badgeCount = 0;

		if (badges.length === 0) return badgeArray;

		badges.forEach(badge => {
			let badgeText = badge.text;
			if (badge.count) {
				badgeText = `${badge.type}-${badge.count}`;
			}
			const cachedBadge = flusherSettings.badgeCache.find(badgeCache => badgeCache.type === badgeText);
			if (cachedBadge) {
				badgeArray.push(cachedBadge.html);
				badgeCount++;
				return;
			}
		});

		let attempts = 0;
		while (badgeCount !== badges.length && attempts < 10) {
			const newBadges = checkForBadges(data);
			badgeArray = newBadges;

			badgeCount = badgeArray.length;
			attempts++;

			await new Promise(resolve => setTimeout(resolve, 750));
		}

		return badgeArray;
	}
}

function createUserBanMessage(data, videoElement) {
	const now = new Date();
	const bannedUser = data.user.username;

	const messageKey = getMessageKey(`-ban${now.getMinutes()}-`, bannedUser);
	if (messageKey.ignore === true) {
		isProcessingMessages = false;
		processMessageQueue();
		return;
	}

	const banMessageContent = document.createElement("div");
	banMessageContent.classList.add("flusher-message", "flusher-red");

	const bannedUserSpan = document.createElement("span");
	bannedUserSpan.textContent = bannedUser;

	const bannedBySpan = document.createElement("span");
	bannedBySpan.textContent = data.banned_by.username;

	const emoji = document.createElement('span');
	emoji.textContent = ' ' + String.fromCodePoint(0x1F6AB) + ' ';

	const banText = document.createTextNode("banned by");

	const banMessageSpan = document.createElement("span");
	banMessageSpan.style.color = "#FF0000";
	banMessageSpan.append(bannedUserSpan, emoji, banText, emoji.cloneNode(true), bannedBySpan);

	banMessageContent.appendChild(banMessageSpan);
	appendMessage(messageKey, banMessageContent, null, videoElement);
}

function createSubMessage(data, videoElement) {
	const now = new Date();

	const username = data.username;
	const months = data.months;
	const messageKey = getMessageKey(`-sub${now.getMinutes()}-`, username + '-' + months);

	const subscriptionMessageContent = document.createElement("div");
	subscriptionMessageContent.classList.add("flusher-message", "flusher-green");

	const emojiSpan = document.createElement('span');
	emojiSpan.textContent = String.fromCodePoint(0x1F389) + ' ';

	const subscriptionMessageSpan = document.createElement("span");
	subscriptionMessageSpan.style.color = "#00FF00";
	subscriptionMessageSpan.textContent = `${months > 1 ? months + ' months' : '1 month'} subscription by ${username}`;

	const subSpan = document.createElement("span");
	subSpan.style.color = "#00FF00";

	subSpan.append(emojiSpan, subscriptionMessageSpan);

	subscriptionMessageContent.append(subSpan);
	appendMessage(messageKey, subscriptionMessageContent, null, videoElement);
}

function createHostMessage(data, videoElement) {
	const now = new Date();

	const hostUsername = data.host_username;
	const viewersCount = data.number_viewers;

	const messageKeyData = getMessageKey(`-host${now.getMinutes()}-`, hostUsername + ' ' + viewersCount);
	if (messageKeyData.ignore === true) {
		isProcessingMessages = false;
		processMessageQueue();
		return;
	}
	const messageKey = messageKeyData.key;

	const hostMessageContent = document.createElement("div");
	hostMessageContent.classList.add("flusher-message", "flusher-green");

	const emojiSpan = document.createElement('span');
	emojiSpan.textContent = String.fromCodePoint(0x1F389) + ' ';

	const viewersCountSpan = document.createElement("span");
	viewersCountSpan.textContent = `${viewersCount > 1 ? viewersCount + ' viewers' : '1 viewer'} hosted by ` + hostUsername;

	const hostMessageSpan = document.createElement("span");
	hostMessageSpan.style.color = "#00FF00";

	hostMessageSpan.append(emojiSpan, viewersCountSpan);

	hostMessageContent.appendChild(hostMessageSpan);
	appendMessage(messageKey, hostMessageContent, null, videoElement);
}

function createGiftedMessage(data, videoElement) {
	const now = new Date();

	const gifterUsername = data.gifter_username;
	const giftedUsernames = data.gifted_usernames;

	const messageKeyData = getMessageKey(`-gift${now.getMinutes()}-`, gifterUsername + '-' + giftedUsernames[0]);
	if (messageKeyData.ignore === true) {
		isProcessingMessages = false;
		processMessageQueue();
		return;
	}
	const messageKey = messageKeyData.key;

	const giftedContent = document.createElement("div");
	giftedContent.classList.add("flusher-message", "flusher-green");

	const emojiSpan = document.createElement('span');
	emojiSpan.textContent = String.fromCodePoint(0x1F389) + ' ';

	const gifterUsernameSpan = document.createElement("span");
	gifterUsernameSpan.textContent = `${giftedUsernames.length > 1 ? giftedUsernames.length + ' Subscriptions' : '1 Subscription'} gifted by ` + gifterUsername;
	const giftedSpan = document.createElement("span");
	giftedSpan.style.color = "#00FF00";

	giftedSpan.append(emojiSpan, gifterUsernameSpan);

	giftedContent.appendChild(giftedSpan);
	appendMessage(messageKey, giftedContent, null, videoElement);
}



function createFollowersMessage(data, videoElement) {
	const followersCount = data.followersCount;

	const messageKeyData = getMessageKey('-followers-', followersCount);
	if (messageKeyData.ignore === true) {
		isProcessingMessages = false;
		processMessageQueue();
		return;
	}
	const messageKey = messageKeyData.key;

	if (lastFollowersCount !== null) {
		const followersDiff = followersCount - lastFollowersCount;
		if (followersDiff === 0) {
			isProcessingMessages = false;
			processMessageQueue();
			return;
		}

		const messageContent = document.createElement("div");
		messageContent.classList.add("flusher-message");

		const emojiSpan = document.createElement('span');
		emojiSpan.textContent = String.fromCodePoint(0x1F389) + ' ';

		const followersMessageSpan = document.createElement("span");
		followersMessageSpan.textContent = `${followersDiff > 1 ? followersDiff + ' new followers' : '1 new follower'}`;

		const followersSpan = document.createElement("span");
		followersSpan.append(emojiSpan, followersMessageSpan)

		messageContent.append(followersSpan);
		appendMessage(messageKey, messageContent, null, videoElement);

		lastFollowersCount = followersCount;

	} else {
		lastFollowersCount = followersCount;
		isProcessingMessages = false;
		processMessageQueue();
	}
}