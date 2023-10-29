window.onload = function () {
	const messageQueue = [];
	const elementQueue = [];

	const timeoutIds = [];
	const rowQueue = [];

	const badgeCache = [];
	const lastPositionPerRow = [];

	let displayedMessages = {};

	let observer, existingSocket, chatMessages;

	let loading = true,
		isVod = true,
		isProcessing = false,
		chatEnabled = true,
		chatEnabledVisible = true,
		parentWidth = null,
		parentHeight = null,
		lastFollowersCount = null;

	const boundHandleChatMessageEvent = handleChatMessageEvent.bind(this);

	function getMessageKey(key, value) {
		return key + "|" + value;
	}

	async function processMessageQueue() {
		if (!chatEnabled) {
			return;
		}

		const data = messageQueue.shift();
		if (data === undefined) return;

		const eventType = data.event ?? "";

		try {
			if (eventType === "App\\Events\\ChatMessageEvent") {
				createMessage(data.data);
			} else if (data.type === "message") {
				createMessage(data);
			} else if (eventType === "App\\Events\\UserBannedEvent") {
				createUserBanMessage(data.data);
			} else if (eventType === "App\\Events\\GiftedSubscriptionsEvent") {
				createGiftedMessage(data.data);
			} else if (eventType === "App\\Events\\FollowersUpdated") {
				createFollowersMessage(data.data);
			} else if (eventType === "App\\Events\\StreamHostEvent") {
				createHostMessage(data.data);
			} else if (eventType === "App\\Events\\SubscriptionEvent") {
				createSubMessage(data.data);
			}

		} catch (error) {
			console.error("Error parsing message data: ", error);
		}

		let wait = 2000 / messageQueue.length;

		setTimeout(function () {
			processMessageQueue();
		}, wait);
	}

	async function processElementQueue() {

		if (isProcessing || !chatEnabled || elementQueue.length === 0) {
			return;
		}

		isProcessing = true;

		const data = elementQueue.shift();
		selectRow(data.message, data.key);

		const queueLength = elementQueue.length;

		let wait = isVod ? (100 * (40 / queueLength)) : 2000 / queueLength;
		if (queueLength < 3) {
			wait = 1000;
		}

		setTimeout(function () {
			isProcessing = false;
			processElementQueue();
		}, wait);
	}

	async function checkResize() {
		let resizeTimer;

		const targetElement = document.getElementById('chat-messages');

		const resizeObserver = new ResizeObserver(entries => {
			for (let entry of entries) {
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(() => {
					for (let entry of entries) {
						const { width, height } = entry.contentRect;
						if (width === 0) return;
						parentWidth = width;
						parentHeight = height;
						clearChat();
					}
				}, 100);
			}
		});

		resizeObserver.observe(targetElement);
	}

	function clearChat() {
		const isEnabled = chatEnabled;
		chatEnabled = false;

		messageQueue.length = 0;
		elementQueue.length = 0;

		for (const id of timeoutIds) {
			clearTimeout(id);
		}

		if (chatMessages !== null) {
			while (chatMessages.firstChild) {
				chatMessages.removeChild(chatMessages.firstChild);
			}
		}

		displayedMessages = {};
		lastPositionPerRow.length = 0;
		rowQueue.length = 0;
		timeoutIds.length = 0;

		chatEnabled = isEnabled;
	}

	function initializeChat(self) {
		const chatMessagesElement = document.getElementById("chat-messages");
		if (chatMessagesElement !== null && (loading || !self)) return;
		chatMessages = chatMessagesElement;

		loading = true;
		resetConnection();

		if (document.querySelector("video") !== null) {
			createChat();
			existingSocket.connection.bind("message", boundHandleChatMessageEvent);
			return;
		}

		observer = new MutationObserver(function (mutations) {
			mutations.forEach(function (mutation) {
				if (mutation.addedNodes) {
					mutation.addedNodes.forEach(function (node) {
						if (node.nodeName.toLowerCase() === "video") {
							observer.disconnect();
							createChat();
						}
					});
				}
			});
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});

		setTimeout(function () {
			observer.disconnect();
			existingSocket.connection.bind("message", boundHandleChatMessageEvent);
			interceptChatRequests();
		}, 2000);
	}

	function resetConnection() {
		existingSocket = window.Echo.connector.pusher;
		existingSocket.connection.unbind("message", boundHandleChatMessageEvent);

		clearChat();
		badgeCache.length = 0;
		lastFollowersCount = null;

		isVod = window.location.href.includes('/video/');
	}

	async function handleChatMessageEvent(data) {
		if (isVod) return;
		if (chatMessages !== null && chatEnabled) {
			messageQueue.push(data);
			processMessageQueue();
			return;
		}

		initializeChat(false);
	}

	function createChat() {
		const chatMessagesElement = document.getElementById("chat-messages");
		if (chatMessagesElement !== null) return;

		chatMessages = chatMessagesElement;

		const chatOverlay = document.createElement("div");
		chatOverlay.id = "chat-overlay";

		const chatMessagesContainer = document.createElement("div");
		chatMessagesContainer.id = "chat-messages";

		chatOverlay.appendChild(chatMessagesContainer);

		const videoPlayer = document.querySelector("video");
		videoPlayer.parentNode.insertBefore(chatOverlay, videoPlayer);

		const chatOverlayStyles = document.createElement("style");
		chatOverlayStyles.textContent = `
			#chat-overlay {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				pointer-events: none;
				overflow: hidden;
				z-index: 9999;
			}

			#chat-messages {
				display: flex;
				flex-direction: column-reverse;
				align-items: flex-end;
				height: 100%;
				overflow-y: auto;
			}

			.chat-overlay-username {
				font-weight: 700;
			}

			.chat-message .font-bold {
				margin-left: -1px; /* Adjust the value as needed */
			}

			.chat-overlay-username,
			.chat-overlay-content {
				vertical-align: middle;
			}

			.chat-message {
				position: absolute;
				background-color: rgba(34, 34, 34, 0.6);
				border-radius: 10px;
				white-space: nowrap;
				max-width: calc(100% - 20px);
				overflow: hidden;
				text-overflow: ellipsis;
				max-height: 1rem;
				display: flex;
				align-items: center;
				will-change: transform;
			}

			.chat-overlay-badge {
				display: inline !important;
			}

			.badge-overlay {
				display: inline !important;
				max-width: 0.9rem;
				max-height: 0.9rem;
				margin-right: 4px;
			}

			.svg-toggle {
				fill: rgb(83, 252, 24) !important;
			}

			.emote-image {
				display: inline !important;
				margin-right: 3px;
				max-width: 1.5rem;
				max-height: 1.5rem;
			} 

			@keyframes slide-in {
				0% {
					right: 0;
				}
				100% {
					right: 200%;
				}
			}
				
		`;

		document.head.appendChild(chatOverlayStyles);

		createToggle();
		checkResize();

		loading = false;
		console.info('Chat Overlay Created: ' + window.location.href);
	}

	function createToggle() {
		chatMessages = document.getElementById("chat-messages");

		const toggleButton = document.createElement('button');
		toggleButton.className = 'vjs-control vjs-button';

		const spanIconPlaceholder = document.createElement('span');
		spanIconPlaceholder.className = 'vjs-icon-placeholder';
		spanIconPlaceholder.setAttribute('aria-hidden', 'true');

		const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svgElement.setAttribute('width', '65%');
		svgElement.setAttribute('viewBox', '0 0 16 16');
		svgElement.setAttribute('fill', 'none');
		svgElement.classList.add('mx-auto');
		svgElement.id = 'toggle-icon';

		const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		pathElement.setAttribute('d', 'M12.8191 7.99813C12.8191 7.64949 12.7816 7.30834 12.7104 6.97844L13.8913 6.29616L12.3918 3.69822L11.2071 4.38051C10.7048 3.9269 10.105 3.57076 9.44517 3.35708V2H6.44611V3.36082C5.78632 3.57451 5.19025 3.9269 4.68416 4.38426L3.49953 3.70197L2 6.29616L3.18088 6.97844C3.10965 7.30834 3.07217 7.64949 3.07217 7.99813C3.07217 8.34677 3.10965 8.68791 3.18088 9.01781L2 9.70009L3.49953 12.298L4.68416 11.6157C5.1865 12.0694 5.78632 12.4255 6.44611 12.6392V14H9.44517V12.6392C10.105 12.4255 10.701 12.0731 11.2071 11.6157L12.3918 12.298L13.8913 9.70009L12.7104 9.01781C12.7816 8.68791 12.8191 8.34677 12.8191 7.99813ZM9.82006 9.87254H6.07123V6.12371H9.82006V9.87254Z');
		pathElement.setAttribute('fill', 'currentColor');
		pathElement.classList.add('svg-toggle');

		const spanControlText = document.createElement('span');
		spanControlText.className = 'vjs-control-text';
		spanControlText.setAttribute('aria-live', 'polite');
		spanControlText.textContent = 'Toggle Chat';

		svgElement.append(pathElement);
		toggleButton.append(spanIconPlaceholder, svgElement, spanControlText);

		const existingButton = document.querySelector('.vjs-fullscreen-control');
		existingButton.parentNode.insertBefore(toggleButton, existingButton.nextSibling);

		chatEnabled = true;

		toggleButton.addEventListener('click', function () {
			chatEnabled = !chatEnabled;
			if (chatEnabled) {
				pathElement.classList.add('svg-toggle');
			} else {
				clearChat();
				pathElement.classList.remove('svg-toggle');
			}
		});
	}

	function interceptChatRequests() {
		let open = window.XMLHttpRequest.prototype.open;
		window.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
			open.apply(this, arguments);
			if (url.includes("/api/v2/channels/") && url.includes("/messages")) {
				this.addEventListener("load", function () {
					let self = this;
					const response = JSON.parse(self.responseText);
					parseRequest(response);
				}, false);
			}
		};
	}

	function parseRequest(response) {
		if (isVod && response.data && response.data.messages && document.getElementById("chat-messages") !== null && chatEnabled) {
			response.data.messages.forEach(function (message) {
				messageQueue.push(message);
			});
			processMessageQueue();
		} else {
			setTimeout(function () {
				initializeChat(false);
			}, 1000);
		}
	}

	async function selectRow(messageContainer, messageKey) {
		let selectedRow = 0;
		const positions = lastPositionPerRow.length;
		if (positions > 0) {
			for (let i = 0; i < positions; i++) {
				const item = lastPositionPerRow[i];
				if (item === undefined) {
					selectedRow = i;
					break;
				}

				const queueItem = rowQueue[i];
				if (queueItem === undefined) {
					rowQueue[i] = { key: messageKey, index: i, message: messageContainer };
					return;
				}

				selectedRow = i + 1;
			}

		}

		startAnimation(selectedRow, messageContainer, messageKey);
	}

	async function startAnimation(rowIndex, messageContainer, messageKey) {
		chatMessages.appendChild(messageContainer);

		const topPosition = (rowIndex === 0) ? 2 : rowIndex * (messageContainer.clientHeight + 5) + 2;

		if (topPosition <= parentHeight) {
			lastPositionPerRow[rowIndex] = messageContainer;

			let timeNeeded = Math.ceil((messageContainer.clientWidth + 10) / (parentWidth * 2) * 20000);

			messageContainer.style.top = topPosition + 'px';
			messageContainer.style.animation = "slide-in 20s linear";
			messageContainer.style.marginRight = `-${messageContainer.clientWidth}px`;

			messageContainer.addEventListener("animationend", function () {
				chatMessages.removeChild(messageContainer);
				delete displayedMessages[messageKey];
			});

			const timeoutId = setTimeout(() => {
				checkQueue(rowIndex, topPosition);
				const index = timeoutIds.indexOf(timeoutId);
				if (index !== -1) {
					timeoutIds.splice(index, 1);
				}
			}, timeNeeded);
			timeoutIds.push(timeoutId);
		}
		else {
			try {
				chatMessages.removeChild(messageContainer);
				delete displayedMessages[messageKey];
			} finally {
				return;
			}
		}
	}

	async function checkQueue(rowIndex, topPosition) {
		const queueItem = rowQueue[rowIndex];

		if (queueItem !== undefined) {
			const queueContainer = queueItem.message;
			lastPositionPerRow[rowIndex] = queueContainer;
			rowQueue[rowIndex] = undefined;

			chatMessages.appendChild(queueContainer);

			queueContainer.style.top = topPosition + 'px';
			queueContainer.style.animation = "slide-in 20s linear";
			queueContainer.style.marginRight = `-${queueContainer.clientWidth}px`;

			queueContainer.addEventListener("animationend", function () {
				chatMessages.removeChild(queueContainer);
				delete displayedMessages[queueItem.key];
			});

			timeNeeded = Math.ceil((queueContainer.clientWidth + 10) / (parentWidth * 2) * 20000);
			const timeoutId = setTimeout(() => {
				checkQueue(rowIndex, topPosition);
				const index = timeoutIds.indexOf(timeoutId);
				if (index !== -1) {
					timeoutIds.splice(index, 1);
				}
			}, timeNeeded);
			timeoutIds.push(timeoutId);
			return;
		}

		lastPositionPerRow[rowIndex] = undefined;
	}

	async function appendMessage(messageKey, messageContent) {
		if (displayedMessages[messageKey]) {
			return;
		}

		displayedMessages[messageKey] = true;

		const messageContainer = document.createElement("div");
		messageContainer.classList.add("chat-message", "chat-entry");

		messageContainer.appendChild(messageContent);

		elementQueue.push({ key: messageKey, message: messageContainer });
		processElementQueue();
	}

	async function createMessage(data) {
		const sender = data.sender;
		const username = sender.username;
		const color = sender.identity.color;
		const content = data.content;

		const reduced = reduceRepeatedSentences(content);
		const messageKey = getMessageKey(sender.id, reduced);

		const messageContentContainer = document.createElement("div");
		messageContentContainer.classList.add("chat-message-content");

		const badgeSpan = document.createElement("span");
		badgeSpan.classList.add("chat-overlay-badge");

		const badgeElements = getBadges(data);
		badgeElements.forEach(badgeElement => {
			badgeSpan.appendChild(badgeElement.cloneNode(true));
		});

		const usernameSpan = document.createElement("span");
		usernameSpan.style.color = color;
		usernameSpan.classList.add("chat-overlay-username");
		usernameSpan.style.verticalAlign = "middle";
		usernameSpan.textContent = username;

		const boldSpan = document.createElement("span");
		boldSpan.classList.add("font-bold", "text-white");
		boldSpan.style.verticalAlign = "middle";
		boldSpan.textContent = ": ";

		const contentSpan = document.createElement("span");
		contentSpan.style.color = "#ffffff";
		contentSpan.style.verticalAlign = "middle";
		contentSpan.classList.add("chat-overlay-content");

		const emoteRegex = /\[emote:(\d+):(\w+)\]/g;
		let lastIndex = 0;
		let match;

		while ((match = emoteRegex.exec(reduced)) !== null) {
			const textBeforeEmote = reduced.slice(lastIndex, match.index);
			contentSpan.appendChild(document.createTextNode(textBeforeEmote));

			const img = document.createElement("img");
			const [, id, name] = match;
			img.src = `https://files.kick.com/emotes/${id}/fullsize`;
			img.alt = name;
			img.classList.add("emote-image", "my-auto");
			contentSpan.appendChild(img);

			lastIndex = emoteRegex.lastIndex;
		}

		const textAfterLastEmote = reduced.slice(lastIndex);
		contentSpan.appendChild(document.createTextNode(textAfterLastEmote));

		messageContentContainer.append(badgeSpan, usernameSpan, boldSpan, contentSpan);
		appendMessage(messageKey, messageContentContainer);
	}

	async function createUserBanMessage(data) {
		const bannedUser = data.user.username;
		const messageKey = getMessageKey('-ban-', bannedUser);

		const banMessageContent = document.createElement("div");
		banMessageContent.classList.add("chat-message-content");

		const bannedUserSpan = document.createElement("span");
		bannedUserSpan.textContent = bannedUser;

		const bannedBySpan = document.createElement("span");
		bannedBySpan.textContent = data.banned_by.username;

		const emoji = document.createElement('span');
		emoji.textContent = ' ' + String.fromCodePoint(0x1F6AB) + ' ';

		const banMessageSpan = document.createElement("span");
		banMessageSpan.style.color = "#FF0000";
		banMessageSpan.append(bannedUserSpan, emoji, document.createTextNode(" banned by "), emoji.cloneNode(true), bannedBySpan);

		banMessageContent.appendChild(banMessageSpan);

		appendMessage(messageKey, banMessageContent);
	}

	async function createSubMessage(data) {
		const username = data.username;
		const months = data.months;
		const messageKey = getMessageKey('-sub-', username);

		const subscriptionMessageContent = document.createElement("div");
		subscriptionMessageContent.classList.add("chat-message-content");

		const emojiSpan = document.createElement('span');
		emojiSpan.textContent = String.fromCodePoint(0x1F389);

		const subscriptionMessageSpan = document.createElement("span");
		subscriptionMessageSpan.style.color = "#00FF00";
		subscriptionMessageSpan.textContent = ` ${username} subscribed for ${months} month(s)`;

		subscriptionMessageContent.append(emojiSpan, subscriptionMessageSpan);

		appendMessage(messageKey, subscriptionMessageContent);
	}


	async function createHostMessage(data) {
		const hostUsername = data.host_username;
		const viewersCount = data.number_viewers;
		const messageKey = getMessageKey('-host-', hostUsername);

		const hostMessageContent = document.createElement("div");
		hostMessageContent.classList.add("chat-message-content");

		const emojiSpan = document.createElement('span');
		emojiSpan.textContent = String.fromCodePoint(0x1F389);

		const hostUsernameSpan = document.createElement("span");
		hostUsernameSpan.textContent = hostUsername;

		const viewersCountSpan = document.createElement("span");
		viewersCountSpan.textContent = ` with ${viewersCount} viewers`;

		const hostMessageSpan = document.createElement("span");
		hostMessageSpan.style.color = "#00FF00";
		hostMessageSpan.appendChild(emojiSpan);
		hostMessageSpan.appendChild(hostUsernameSpan);
		hostMessageSpan.appendChild(document.createTextNode(" hosted"));
		hostMessageSpan.appendChild(viewersCountSpan);

		hostMessageContent.appendChild(hostMessageSpan);

		appendMessage(messageKey, hostMessageContent);
	}


	async function createGiftedMessage(data) {
		const gifterUsername = data.gifter_username;
		const giftedUsernames = data.gifted_usernames;
		const messageKey = getMessageKey('-gift-', gifterUsername + giftedUsernames[0]);

		const giftedContent = document.createElement("div");
		giftedContent.classList.add("chat-message-content");

		const emojiSpan = document.createElement('span');
		emojiSpan.textContent = String.fromCodePoint(0x1F389);

		const gifterUsernameSpan = document.createElement("span");
		gifterUsernameSpan.textContent = gifterUsername;

		const giftedSpan = document.createElement("span");
		giftedSpan.style.color = "#00FF00";
		giftedSpan.appendChild(emojiSpan);
		giftedSpan.appendChild(document.createTextNode(` ${giftedUsernames.length} Subscriptions Gifted by `));
		giftedSpan.appendChild(gifterUsernameSpan);

		giftedContent.appendChild(giftedSpan);

		appendMessage(messageKey, giftedContent);
	}


	async function createFollowersMessage(data) {
		const followersCount = data.followersCount;
		const messageKey = getMessageKey('-followers-', followersCount);

		if (lastFollowersCount !== null) {
			const followersDiff = followersCount - lastFollowersCount;
			if (followersDiff === 0) {
				return;
			}

			const messageContent = document.createElement("div");
			messageContent.classList.add("chat-message-content");

			const emojiSpan = document.createElement('span');
			emojiSpan.textContent = String.fromCodePoint(0x1F389);

			const followersMessageSpan = document.createElement("span");
			followersMessageSpan.textContent = ` ${followersDiff} new follower(s)`;

			messageContent.appendChild(emojiSpan);
			messageContent.appendChild(followersMessageSpan);

			appendMessage(messageKey, messageContent);
		}

		lastFollowersCount = followersCount;
	}


	function reduceRepeatedSentences(input) {
		const regexSentence = /(\b.+?\b)\1+/g;
		const sentence = input.replace(regexSentence, '$1');
		const regexChar = /(.)(\1{10,})/g;
		return sentence.replace(regexChar, '$1$1$1$1$1$1$1$1$1$1');
	}

	function checkForBadges(data) {
		const badges = data.sender.identity.badges || [];
		const badgeElements = [];

		let firstChatIdentity = document.querySelector(`.chat-entry-username[data-chat-entry-user-id="${data.sender.id}"]`);

		if (firstChatIdentity !== null) {
			let identity = firstChatIdentity.closest('.chat-message-identity');
			identity.querySelectorAll('.badge-tooltip').forEach(function (baseBadge, index) {
				let badge = badges[index];
				if (badge === undefined) return;
				let badgeText = badge.text;

				if (badge.count) {
					badgeText = `${badge.type}-${badge.count}`;
				}
				const cachedBadge = badgeCache.find(badgeCache => badgeCache.type === badgeText);
				if (cachedBadge) {
					badgeElements.push(cachedBadge.html);
					return;
				}

				const imgElement = baseBadge.querySelector(`img`);
				if (imgElement) {
					const imgUrl = imgElement.src;
					const newImg = document.createElement('img');
					newImg.src = imgUrl;
					newImg.classList.add('badge-overlay');
					badgeCache.push({
						type: badgeText,
						html: newImg
					});
					badgeElements.push(newImg);
					return;
				}

				const svgElement = baseBadge.querySelector('svg');

				if (svgElement) {
					const svgCopy = svgElement.cloneNode(true);
					svgCopy.classList.add('badge-overlay');

					badgeCache.push({
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

	function getBadges(data) {
		const badges = data.sender.identity.badges || [];

		let badgeArray = [];
		let badgeCount = 0;

		if (badges.length === 0) return badgeArray;

		badges.forEach(badge => {
			let badgeText = badge.text;
			if (badge.count) {
				badgeText = `${badge.type}-${badge.count}`;
			}
			const cachedBadge = badgeCache.find(badgeCache => badgeCache.type === badgeText);
			if (cachedBadge) {
				badgeArray.push(cachedBadge.html);
				badgeCount++;
				return;
			}
		});

		if (badgeCount !== badges.length) {
			return checkForBadges(data);
		}

		return badgeArray;
	}

	function handleVisibilityChange() {
		if (document.hidden) {
			chatEnabledVisible = chatEnabled
			chatEnabled = false;
			clearChat();
		} else {
			chatEnabled = chatEnabledVisible;
		}
	}

	document.addEventListener('visibilitychange', handleVisibilityChange);

	initializeChat(false);
};
