// ==UserScript==
// @name         Kick.com Fullscreen Chat Overlay
// @namespace    Violentmonkey Scripts
// @match        *://*.kick.com/*
// @grant        none
// @version      0.1.7
// @author       spaghetto.be
// @description  Enhances the Kick.com viewing experience by providing a fullscreen chat overlay. Messages will flow from right to left, allowing for a seamless chat experience while watching content.
// @icon         https://s2.googleusercontent.com/s2/favicons?domain=kick.com&sz=32
// @license      MIT
// ==/UserScript==

window.onload = function() {
	const displayedMessages = {}; // Keeps track of displayed messages to avoid duplicates
	const lastPositionPerRow = []; // Keeps track of the last position of messages in each row
	const messageQueue = [];

	let observer, existingSocket;

	let loading = true,
		isVod = true,
		isProcessing = false,
		lastFollowersCount = null;

	const chatMessagesElement = document.getElementById("chat-messages");

	// Bind handleChatMessageEvent to the current context
	const boundHandleChatMessageEvent = handleChatMessageEvent.bind(this);

	/**
	 * Generates a unique key based on sender ID and content.
	 * @param {string} key - The base key.
	 * @param {string} value - The value to append to the key.
	 * @returns {string} The generated message key.
	 */
	function getMessageKey(key, value) {
		return key + "|" + value;
	}

	/**
	 * Processes the message queue.
	 */
	function processMessageQueue() {

		if (isProcessing || messageQueue.length === 0) {
			return;
		}

		isProcessing = true;

		const data = messageQueue.shift();
		const eventType = data.event ?? "";

		try {
			if (eventType === "App\\Events\\ChatMessageEvent") {
				createMessage(data.data);
			} else if (data.type === "message") {
				createMessage(data);
			} else if (data.type === "reply") {
				// if (!isVod) console.log('reply'); Should be added
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
			} else if (eventType.includes("pusher_internal")) {
				// Do nothing for internal events
			} else {
				// console.warn(`Unknown event type: ${eventType}`);
				// console.log(data); Other events like MessagePinned
			}

		} catch (error) {
			console.error("Error parsing message data: ", error);
		}

		// Dynamic
		let wait = isVod ? (100 * (40 / messageQueue.length)) : (100 * (40 / messageQueue.length));
		if (messageQueue.length < 3) {
			wait = 2000;
		}

		setTimeout(function() {
			isProcessing = false;
			processMessageQueue();
		}, wait);
	}

	/**
	 * Selects the appropriate row for a new message.
	 * @param {Element} messageContainer - The message container element.
	 * @param {number} messageWidth - The width of the message.
	 * @returns {number} The selected row index.
	 */
	function selectRow(messageContainer, messageWidth) {
		let selectedRow = 0;
		const parent = document.getElementById("chat-messages");
		if (lastPositionPerRow.length > 0) {
			for (let i = 0; i < lastPositionPerRow.length; i++) {
				const lastMessage = lastPositionPerRow[i];
				if ((parent.offsetWidth * 2) - (lastMessage.offsetLeft + lastMessage.clientWidth + 10) >= messageWidth) {
					selectedRow = i;
					break;
				}
				selectedRow = i + 1;
			}
		}

		lastPositionPerRow[selectedRow] = messageContainer;
		return selectedRow;

	}

	/**
	 * Appends a message to the chat overlay.
	 * @param {string} messageKey - The unique message key.
	 * @param {string} messageContent - The content of the message.
	 */
	function appendMessage(messageKey, messageContent) {
		if (displayedMessages[messageKey]) {
			return; // Ignore duplicate message
		}

		displayedMessages[messageKey] = true;

		const messageContainer = document.createElement("div");
		messageContainer.classList.add("chat-message", "chat-entry");

		messageContainer.innerHTML = messageContent;
		chatMessages.appendChild(messageContainer);

		const messageWidth = messageContainer.clientWidth;
		const messageHeight = messageContainer.clientHeight;

		const parent = document.getElementById("chat-messages");
		if (parent === null) return;

		let selectedRow = selectRow(messageContainer, messageWidth);
		const topPosition = selectedRow * (messageHeight + 5);


		if (topPosition <= parent.offsetHeight) {
			messageContainer.style.top = topPosition + 'px';
			messageContainer.style.animation = "slide 20s linear";

			messageContainer.addEventListener("animationend", function() {
				chatMessages.removeChild(messageContainer);
				delete displayedMessages[messageKey];
			});
		} else {
			// Handle case where message doesn't fit in the available height
			// You may add custom logic or display an error message here
			chatMessages.removeChild(messageContainer);
			delete displayedMessages[messageKey];
		}
	}

	/**
	 * Appends a ban message to the chat overlay.
	 * @param {object} data - Data containing information about the ban.
	 */
	function createUserBanMessage(data) {
		const bannedUser = data.user.username;
		const messageKey = getMessageKey('-ban-', bannedUser);

		const banMessageContent = `
                <div class="chat-message-content">
                    <span style="color:#FF0000">${bannedUser} 🚫 banned by 🚫 ${data.banned_by.username}</span>
                </div>
            `;

		appendMessage(messageKey, banMessageContent);
	}

	/**
	 * Appends a subscription message to the chat overlay.
	 * @param {object} data - Data containing information about the subscription.
	 */
	function createSubMessage(data) {
		const username = data.username;
		const months = data.months;
		const messageKey = getMessageKey('-sub-', username);

		const subscriptionMessageContent = `
                <div class="chat-message-content">
                    <span style="color:#00FF00">🎉 ${username} subscribed for ${months} month(s)</span>
                </div>
            `;

		appendMessage(messageKey, subscriptionMessageContent);
	}

	/**
	 * Appends a host message to the chat overlay.
	 * @param {object} data - Data containing information about the host.
	 */
	function createHostMessage(data) {
		const hostUsername = data.host_username;
		const viewersCount = data.number_viewers;
		const messageKey = getMessageKey('-host-', hostUsername);

		const hostMessageContent = `
                <div class="chat-message-content">
                    <span style="color:#00FF00">🎉 ${hostUsername} hosted with ${viewersCount} viewers</span>
                </div>
            `;

		appendMessage(messageKey, hostMessageContent);
	}

	/**
	 * Appends a gifted message to the chat overlay.
	 * @param {object} data - Data containing information about the gifted subscription.
	 */
	function createGiftedMessage(data) {
		const gifterUsername = data.gifter_username;
		const giftedUsernames = data.gifted_usernames;
		const messageKey = getMessageKey('-gift-', gifterUsername + giftedUsernames[0]);

		const giftedContent = `
                <div class="chat-message-content">
                    <span style="color:#00FF00">🎉 ${giftedUsernames.length} Subscriptions Gifted by ${gifterUsername}</span>
                </div>
            `;

		appendMessage(messageKey, giftedContent);
	}

	/**
	 * Appends a followers message to the chat overlay.
	 * @param {object} data - Data containing information about the followers count.
	 */
	function createFollowersMessage(data) {
		const followersCount = data.followersCount;
		const messageKey = getMessageKey('-followers-', followersCount);

		if (lastFollowersCount !== null) {
			const followersDiff = followersCount - lastFollowersCount;
			if (followersDiff === 0) {
				return;
			}
			const messageKey = getMessageKey('-followers-', followersCount);
			const messageContent = `
                    <div class="chat-message-content">
                        🎉 Followers gained: ${followersDiff}
                    </div>
                `;
			appendMessage(messageKey, messageContent);
		}

		lastFollowersCount = followersCount;
	}

	/**
	 * Reduces repeated sentences in a message.
	 * @param {string} input - The input message content.
	 * @returns {string} The message content with repeated sentences reduced.
	 */
	function reduceRepeatedSentences(input) {
		const regexSentence = /(\b.+?\b)\1+/g; // Regex for repeated sentences
		const sentence = input.replace(regexSentence, '$1');
		const regexChar = /(.)(\1{10,})/g; // Regex for repeated characters
		return sentence.replace(regexChar, '$1$1$1$1$1$1$1$1$1$1');
	}

	const badgeCache = [];

	function checkForBadges(data) {
		const sender = data.sender;
		const badges = sender.identity.badges || [];

		let firstChatIdentity = document.querySelector(`.chat-entry-username[data-chat-entry-user="${sender.username.toLowerCase()}"]`);
		if (firstChatIdentity === null) {
     			firstChatIdentity = document.querySelector(`.chat-entry-username[data-chat-entry-user="${sender.username.toLowerCase().replace(/_/g, '-')}"]`);
      		if (firstChatIdentity === null) {
      		setTimeout(function() {
				    console.info('checkForBadges: ' + sender.username);
				    messageQueue.push(data);
				    processMessageQueue();
			}, 2000);
			return;
		  }
    }
		const identity = firstChatIdentity.closest('.chat-message-identity');

		// Check for badges
		identity.querySelectorAll('.badge-tooltip').forEach(function(baseBadge, index) {
			let badge = badges[index];
			if (badge === undefined) return;
			let badgeText = badge.text;

			if (badge.count) {
				badgeText = `${badge.type}-${badge.count}`;
			}
			const cachedBadge = badgeCache.find(badgeCache => badgeCache.type === badgeText);
			if (cachedBadge) {
				return; // Badge found in cache, return HTML
			}

			const imgElement = baseBadge.querySelector(`img`);
			if (imgElement) {
				const imgUrl = imgElement.src;
				const newImg = document.createElement('img');
				newImg.src = imgUrl;
				newImg.classList.add('badge-overlay'); // Add your specific class here
				badgeCache.push({
					type: badgeText,
					html: newImg.outerHTML
				});
				messageQueue.push(data);
				return;
			}

			const svgElement = baseBadge.querySelector(`svg`);
			if (svgElement) {
				// Add the badge-overlay class to the parent div
				const divElement = document.createElement('div');
				divElement.classList.add('chat-overlay-badge');
				svgElement.classList.add('badge-overlay');

				divElement.appendChild(svgElement);

				badgeCache.push({
					type: badgeText,
					html: divElement.outerHTML
				});
				messageQueue.push(data);

				return;
			}

			console.warn('badge not found: ' + badgeText);
		});
	}

	/**
	 * Check if the provided HTML contains an image with alt like badge.
	 * If found, extract img tag and add it before username with other badges.
	 * Also, update the badgeArray with the badge text and content.
	 * @param {string} badgeText - The text associated with the badge.
	 * @param {Array} badgeArray - Array to store badges and content.
	 * @returns {string} The badge element in HTML.
	 */
	function getBadges(data) {
		const sender = data.sender;
		const badges = sender.identity.badges || [];

		let badgeString = '';
		let badgeCount = 0;

		// Check for badges
		badges.forEach(badge => {
			let badgeText = badge.text;
			if (badge.count) {
				badgeText = `${badge.type}-${badge.count}`;
			}
			const cachedBadge = badgeCache.find(badgeCache => badgeCache.type === badgeText);
			if (cachedBadge) {
				badgeString += ` ${cachedBadge.html}`;
				badgeCount++;
				return; // Badge found in cache, return HTML
			}
		});

		if (badgeCount !== badges.length) {
			setTimeout(checkForBadges(data), 1000);
			return;
		}

		return badgeString; // Badge not found, return text in HTML
	}

	/**
	 * Creates a message and handles emotes.
	 * @param {object} data - Data containing information about the message.
	 */
	function createMessage(data) {
		const sender = data.sender;
		const username = sender.username;
		const color = sender.identity.color;
		const content = data.content;
		const reduced = reduceRepeatedSentences(content);
		const messageKey = getMessageKey(data.sender.id, reduced);

		const replacedContent = reduced.replace(
			/\[emote:(\d+):(\w+)\]/g,
			(match, id, name) => {
				return `<img src="https://files.kick.com/emotes/${id}/fullsize" alt="${name}" class="emote-image my-auto" />`;
			}
		);

		const badges = getBadges(data);

		const messageContent = `
  <div class="chat-message-content">
    <span class="chat-overlay-badge">${badges ? badges + ' ' : ''}</span>
    <span style="color:${color}; vertical-align: middle;" class="chat-overlay-username">${username}</span>
    <span class="font-bold text-white" style="vertical-align: middle;">: </span>
    <span style="color:#ffffff; vertical-align: middle;" class="chat-overlay-content">${replacedContent}</span>
  </div>
`;

		appendMessage(messageKey, messageContent);
	}

	/**
	 * Initializes the chat overlay.
	 * @param {boolean} self - Indicates if the chat overlay is being initialized on page load.
	 */
	function initializeChat(self) {
		if (chatMessagesElement !== null && (loading || !self)) return;

		loading = true;
		resetConnection();

		if (document.querySelector("video") !== null) {
			createChat();
			existingSocket.connection.bind("message", boundHandleChatMessageEvent);
			return;
		}

		observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.addedNodes) {
					mutation.addedNodes.forEach(function(node) {
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

		setTimeout(function() {
			observer.disconnect();
			existingSocket.connection.bind("message", boundHandleChatMessageEvent);
			interceptChatRequests();
		}, 2000);
	}

	/**
	 * Resets the chat connection and clears message data.
	 */
	function resetConnection() {
		existingSocket = window.Echo.connector.pusher;
		existingSocket.connection.unbind("message", boundHandleChatMessageEvent);

		for (const key in displayedMessages) {
			if (displayedMessages.hasOwnProperty(key)) {
				delete displayedMessages[key];
			}
		}

		lastPositionPerRow.length = 0;
		messageQueue.length = 0;

		isVod = window.location.href.includes('/video/');
	}

	/**
	 * Handles incoming chat messages over pusher handler.
	 * @param {object} data - Data containing information about the incoming message.
	 */
	function handleChatMessageEvent(data) {
		if (isVod) return;
		if (document.getElementById("chat-messages") !== null) {
			messageQueue.push(data);
			processMessageQueue();
			return;
		}
		initializeChat(false);
	}

	/**
	 * Creates the chat overlay and appends it to the page.
	 */
	function createChat() {
		if (chatMessagesElement !== null) return;

		const chatOverlay = document.createElement("div");
		chatOverlay.id = "chat-overlay";
		chatOverlay.innerHTML = `
                <div id="chat-messages"></div>
            `;

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
                    margin-left: -4px; /* Adjust the value as needed */
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
                }

                .chat-overlay-badge {
                    display: inline !important;
                }

                .badge-overlay {
                    display: inline !important;
                    max-width: 1rem;
                    max-height: 1rem;
                }

                .emote-image {
                    display: inline !important;
                    margin-right: 3px;
                    max-width: 1.5rem;
                    max-height: 1.5rem;
                }

                @keyframes slide {
                    0% {
                        right: -100%;
                    }

                    100% {
                        right: 100%;
                    }
                }
            `;

		document.head.appendChild(chatOverlayStyles);
		chatMessages = document.getElementById("chat-messages");

		loading = false;
		console.info('Chat Overlay Created: ' + window.location.href);
	}


	/**
	 * Intercepts chat requests to process incoming messages.
	 */
	function interceptChatRequests() {
		let open = window.XMLHttpRequest.prototype.open;
		window.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
			open.apply(this, arguments); // Open the XMLHttpRequest immediately

			if (url.includes("/api/v2/channels/") && url.includes("/messages")) {
				this.addEventListener("load", function() {
					let self = this; // Store a reference to this

					setTimeout(function() {
						const response = JSON.parse(self.responseText);
						if (isVod && response.data && response.data.messages && document.getElementById("chat-messages") !== null) {
							response.data.messages.forEach(function(message) {
								messageQueue.push(message);
								processMessageQueue();
							});
						} else {
							setTimeout(function() {
								initializeChat(false);
							}, 1000);
						}
					}, 0);
				}, false);
			}
		};
	}

	// Call initializeChat to initialize chat on page load
	initializeChat(false);
};
