window.onload = () => {
	const messageQueue = [];
	const elementQueue = [];

	const timeoutIds = [];
	const rowQueue = [];

	const badgeCache = [];
	const lastPositionPerRow = [];

	let displayedMessages = {};

	let resizeObserver = null;

	let loading = false,
		isVod = false,
		chatEnabled = true,
		existingSocket = null,
		chatEnabledVisible = true,
		lastFollowersCount = null,
		chatFlusherMessages = null,
		currentUrl;

	let parentWidth = null,
		parentHeight = null;

	let isProcessingElements = false,
		isProcessingMessages = false;

	const boundHandleChatMessageEvent = handleChatMessageEvent.bind(this);

	function getMessageKey(key, value) {
		return key + "|" + value;
	}

	async function processMessageQueue() {
		if (!chatEnabled && isProcessingMessages) {
			return;
		}

		isProcessingMessages = true;

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

		isProcessingMessages = false;
		processMessageQueue();
	}

	async function processElementQueue() {
		if (isProcessingElements || !chatEnabled) {
			return;
		}

		isProcessingElements = true;
		const data = elementQueue.shift();
		if (data === undefined) {
			isProcessingElements = false;
			return;
		}

		selectRow(data.message, data.key);

		const queueLength = elementQueue.length;

		let wait = Math.trunc(2000 / queueLength);
		if (queueLength < 3) {
			wait = 1000;
		}

		setTimeout(function () {
			isProcessingElements = false;
			processElementQueue();
		}, wait);
	}

	async function checkResize(video) {
		let resizeTimer;

		resizeObserver = new ResizeObserver(entries => {
			if (chatFlusherMessages !== null)
				chatFlusherMessages.style.display = 'none';
			loading = false;

			for (let entry of entries) {
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(() => {
					for (let entry of entries) {
						const { width, height } = entry.contentRect;
						if (width === null || width === 0) {
							if (chatFlusherMessages !== null) {
								chatFlusherMessages = null;
								initializeChat();
							}
							return;
						}

						if (parentWidth == null || parentWidth == 0) {
							const data = {
								event: "App\\Events\\ChatMessageEvent",
								data: {
									content: "Thanks for trying this dev build!",
									sender: {
										username: "Kick Chat Flusher",
										identity: {
											color: "#E9113C",
										}
									}
								}
							};

							if (chatFlusherMessages === null) return;
							createMessage(data.data);
							console.info('Chat Overlay Created: ' + window.location.href);
						}

						parentWidth = Math.trunc(width) * 2;
						parentHeight = Math.trunc(height);

						clearChat();

						chatFlusherMessages.style.setProperty('--chat-flusher-width', `-${parentWidth}px`);
					}
				}, 750);
			}
		});

		resizeObserver.observe(video);
	}

	function clearChat() {
		if (chatFlusherMessages !== null)
			chatFlusherMessages.style.display = 'none';

		const isEnabled = chatEnabled;
		chatEnabled = false;

		if (currentUrl !== window.location.href) {
			currentUrl = window.location.href;
			messageQueue.length = 0;
		} else {
			// const lastMessage = messageQueue.pop();
			// messageQueue.length = 0;
			// messageQueue.push(lastMessage);
		}

		elementQueue.length = 0;

		for (const id of timeoutIds) {
			clearTimeout(id);
		}

		if (chatFlusherMessages !== null) {
			while (chatFlusherMessages.firstChild) {
				chatFlusherMessages.removeChild(chatFlusherMessages.firstChild);
			}
		}

		displayedMessages = {};
		lastPositionPerRow.length = 0;
		rowQueue.length = 0;
		timeoutIds.length = 0;

		if (chatFlusherMessages !== null)
			chatFlusherMessages.style.display = 'flex';

		chatEnabled = isEnabled;
	}

	function initializeChat() {
		if (chatFlusherMessages !== null || loading) return;

		loading = true;
		resetConnection();

		if (document.querySelector("video") !== null) {
			createChat();
			return;
		}

		const observer = new MutationObserver(function (mutations) {
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
			if (chatFlusherMessages !== null) return;
			loading = false;
			bindRequests();
		}, 5000);
	}

	function resetConnection() {
		if (resizeObserver !== null)
			resizeObserver.disconnect();

		parentWidth = null;

		clearChat();
		badgeCache.length = 0;
		lastFollowersCount = null;

		isVod = currentUrl.includes('/video/');
	}

	function handleChatMessageEvent(data) {
		if (isVod || !chatEnabled || loading) return;
		if (chatFlusherMessages !== null) {
			messageQueue.push(data);
			processMessageQueue();
			return;
		}
		
		/* check if needed */
		messageQueue.push(data);

		initializeChat();
	}

	function createChat() {
		if (chatFlusherMessages !== null) return;
		chatFlusherMessages = 0;

		const chatFlusher = document.createElement("div");
		chatFlusher.id = "chat-flusher";

		const chatFlusherMessagesContainer = document.createElement("div");
		chatFlusherMessagesContainer.id = "chat-flusher-messages";

		const videoPlayer = document.querySelector("video");
		const shadowRoot = chatFlusher.attachShadow({ mode: 'open' });

		const metaTag = document.querySelector('meta[name="chat-flusher-css"]');
		const cssFileURL = metaTag ? metaTag.content : '';

		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';

		link.href = cssFileURL;

		shadowRoot.appendChild(link);

		videoPlayer.parentNode.insertBefore(chatFlusher, videoPlayer);

		chatFlusherMessages = chatFlusherMessagesContainer;
		shadowRoot.appendChild(chatFlusherMessages);

		createToggle();

		const video = document.querySelector('video');
		chatFlusherMessages.style.setProperty('--chat-flusher-parent-width', `-${video.offsetWidth}px`);
		checkResize(video);

		bindRequests();
	}

	function bindRequests() {
		const chatFlusherStyles = document.getElementById("chat-flusher-styles");
		if (chatFlusherStyles === null) {
			document.addEventListener('visibilitychange', handleVisibilityChange);
			addCSS();
			interceptChatRequests();
		}

		if (existingSocket === null) {
			existingSocket = window.Echo.connector.pusher;
			existingSocket.connection.bind("message", boundHandleChatMessageEvent);
		}
	}

	function createToggle() {
		const toggle = document.getElementById('chat-flusher-toggle');
		if(toggle !== null) return;

		const toggleButton = document.createElement('button');
		toggleButton.className = 'vjs-control vjs-button';
		toggleButton.id = 'chat-flusher-toggle';

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
			if (url.includes("/api/v2/channels/") && url.includes("/messages")) {
				this.addEventListener("load", function () {
					let self = this;
					const response = JSON.parse(self.responseText);
					if (response.data && response.data.messages) {
						parseRequest(response);
					}
				}, false);
			}

			open.apply(this, arguments);
		};
	}

	function parseRequest(response) {
		if (!isVod || !chatEnabled || loading) return;
		if (chatFlusherMessages !== null) {
			response.data.messages.forEach(function (message) {
				messageQueue.push(message);
			});
			processMessageQueue();
		} else {
			setTimeout(function () {
				if (response.data.messages.length > 0) {
					/* check if needed */
					messageQueue.push(response.data.messages[0]);
				}
				initializeChat();
			}, 1000);
		}
	}

	async function selectRow(messageContainer, messageKey) {
		let selectedRow = 0;
		const positions = lastPositionPerRow.length;
		if (positions > 0) {
			for (let i = 0; i < positions; i++) {

				rowQueue[i] = rowQueue[i] ?? [];
				const item = lastPositionPerRow[i];

				if (item === undefined) {
					selectedRow = i;
					break;
				}

				if (rowQueue[i].length < 2) {
					rowQueue[i].push({ key: messageKey, index: i, message: messageContainer });
					return;
				}

				selectedRow = i + 1;
			}

		}

		rowQueue[selectedRow] = rowQueue[selectedRow] ?? [];
		startAnimation(selectedRow, messageContainer, messageKey);
	}

	async function startAnimation(rowIndex, messageContainer, messageKey) {
		chatFlusherMessages.appendChild(messageContainer);

		const topPosition = (rowIndex === 0) ? 2 : rowIndex * (messageContainer.clientHeight + 6) + 2;

		if (topPosition <= parentHeight) {
			lastPositionPerRow[rowIndex] = messageContainer;

			messageContainer.style.top = topPosition + 'px';
			messageContainer.style.marginRight = `-${messageContainer.offsetWidth}px`;

			messageContainer.addEventListener("animationend", async function () {
				chatFlusherMessages.removeChild(messageContainer);
				delete displayedMessages[messageKey];
			});

			let timeNeeded = Math.trunc((messageContainer.offsetWidth + 7) / parentWidth * 16000);
			messageContainer.classList.add("chat-flusher-animation");

			const timeoutId = setTimeout(() => {
				checkQueue(rowIndex);
				const index = timeoutIds.indexOf(timeoutId);
				if (index !== -1) {
					timeoutIds.splice(index, 1);
				}
			}, timeNeeded);

			timeoutIds.push(timeoutId);
		}
		else {
			try {
				chatFlusherMessages.removeChild(messageContainer);
				delete displayedMessages[messageKey];
			} finally {
				return;
			}
		}
	}

	async function checkQueue(rowIndex) {
		const queueItem = rowQueue[rowIndex].shift();

		if (queueItem !== undefined) {
			const queueContainer = queueItem.message;
			lastPositionPerRow[rowIndex] = queueContainer;
			startAnimation(rowIndex, queueContainer, queueItem.key);
			return;
		}

		lastPositionPerRow[rowIndex] = undefined;
	}

	async function appendMessage(messageKey, messageContent) {
		if (displayedMessages[messageKey] || chatFlusherMessages === null) {
			return;
		}

		displayedMessages[messageKey] = true;

		const messageContainer = document.createElement("div");
		messageContainer.classList.add("chat-message");
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
		badgeSpan.classList.add("chat-flusher-badge");

		const badgeElements = await getBadges(data);
		badgeElements.forEach(badgeElement => {
			badgeSpan.appendChild(badgeElement.cloneNode(true));
		});

		const usernameSpan = document.createElement("span");
		usernameSpan.style.color = color;
		usernameSpan.classList.add("chat-flusher-username");
		usernameSpan.textContent = username;

		const boldSpan = document.createElement("span");
		boldSpan.classList.add("font-bold", "text-white");
		boldSpan.textContent = ": ";

		const contentSpan = document.createElement("span");
		contentSpan.style.color = "#ffffff";
		contentSpan.classList.add("chat-flusher-content");

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
		if (textAfterLastEmote.trim() !== '') {
			contentSpan.appendChild(document.createTextNode(textAfterLastEmote));
		}
		else {
			const lastChild = contentSpan.lastChild;
			if (lastChild.tagName === 'IMG') {
				lastChild.classList.add('last-emote-image');
			}
		}

		messageContentContainer.append(badgeSpan, usernameSpan, boldSpan, contentSpan);
		appendMessage(messageKey, messageContentContainer);
	}

	async function createUserBanMessage(data) {
		const now = new Date();
		const bannedUser = data.user.username;

		const messageKey = getMessageKey(`-ban${now.getMinutes()}-`, bannedUser);

		const banMessageContent = document.createElement("div");
		banMessageContent.classList.add("chat-message-content");

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

		appendMessage(messageKey, banMessageContent);
	}

	async function createSubMessage(data) {
		const now = new Date();

		const username = data.username;
		const months = data.months;
		const messageKey = getMessageKey(`-sub${now.getMinutes()}-`, username + '-' + months);

		const subscriptionMessageContent = document.createElement("div");
		subscriptionMessageContent.classList.add("chat-message-content");

		const emojiSpan = document.createElement('span');
		emojiSpan.textContent = String.fromCodePoint(0x1F389) + ' ';

		const subscriptionMessageSpan = document.createElement("span");
		subscriptionMessageSpan.style.color = "#00FF00";
		subscriptionMessageSpan.textContent = `${months > 1 ? months + ' months' : '1 month'} subscription by ${username}`;

		const subSpan = document.createElement("span");
		subSpan.style.color = "#00FF00";

		subSpan.append(emojiSpan, subscriptionMessageSpan);

		subscriptionMessageContent.append(subSpan);

		appendMessage(messageKey, subscriptionMessageContent);
	}

	async function createHostMessage(data) {
		const now = new Date();

		const hostUsername = data.host_username;
		const viewersCount = data.number_viewers;
		const messageKey = getMessageKey(`-host${now.getMinutes()}-`, hostUsername + ' ' + viewersCount);

		const hostMessageContent = document.createElement("div");
		hostMessageContent.classList.add("chat-message-content");

		const emojiSpan = document.createElement('span');
		emojiSpan.textContent = String.fromCodePoint(0x1F389) + ' ';

		const viewersCountSpan = document.createElement("span");
		viewersCountSpan.textContent = `${viewersCount > 1 ? viewersCount + ' viewers' : '1 viewer'} hosted by ` + hostUsername;

		const hostMessageSpan = document.createElement("span");
		hostMessageSpan.style.color = "#00FF00";

		hostMessageSpan.append(emojiSpan, viewersCountSpan);

		hostMessageContent.appendChild(hostMessageSpan);

		appendMessage(messageKey, hostMessageContent);
	}

	async function createGiftedMessage(data) {
		const now = new Date();

		const gifterUsername = data.gifter_username;
		const giftedUsernames = data.gifted_usernames;
		const messageKey = getMessageKey(`-gift${now.getMinutes()}-`, gifterUsername + '-' + giftedUsernames[0]);

		const giftedContent = document.createElement("div");
		giftedContent.classList.add("chat-message-content");

		const emojiSpan = document.createElement('span');
		emojiSpan.textContent = String.fromCodePoint(0x1F389) + ' ';

		const gifterUsernameSpan = document.createElement("span");
		gifterUsernameSpan.textContent = `${giftedUsernames.length > 1 ? giftedUsernames.length + ' Subscriptions' : '1 Subscription'} gifted by ` + gifterUsername;
		const giftedSpan = document.createElement("span");
		giftedSpan.style.color = "#00FF00";

		giftedSpan.append(emojiSpan, gifterUsernameSpan);

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
			emojiSpan.textContent = String.fromCodePoint(0x1F389) + ' ';

			const followersMessageSpan = document.createElement("span");
			followersMessageSpan.textContent = `${followersDiff > 1 ? followersDiff + ' new followers' : '1 new follower'}`;

			const followersSpan = document.createElement("span");
			followersSpan.append(emojiSpan, followersMessageSpan)

			messageContent.append(followersSpan);

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

			identity.querySelectorAll('div.badge-tooltip').forEach(function (baseBadge, index) {
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

	async function getBadges(data) {
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

	function handleVisibilityChange() {
		if (document.hidden) {
			chatEnabledVisible = chatEnabled
			chatEnabled = false;
			clearChat();
		} else {
			chatEnabled = chatEnabledVisible;
		}
	}

	function addCSS() {
		const chatFlusherStyles = document.createElement("style");
		chatFlusherStyles.id = 'chat-flusher-styles';
		chatFlusherStyles.textContent = `
			#chat-flusher {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				pointer-events: none;
				overflow: hidden;
				z-index: 9999;
			}
			.svg-toggle {
				fill: rgb(83, 252, 24) !important;
			}		
		`;

		document.head.appendChild(chatFlusherStyles);
	}

	initializeChat();
};