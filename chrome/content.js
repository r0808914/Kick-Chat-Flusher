window.onload = () => {
	const flushers = {};

	const messageQueue = [];
	const elementQueue = [];

	const timeoutIds = [];

	const toggledClass = 'toggled-on';
	const spamStates = ['Auto', 'ON', 'OFF'];
	const backgroundStates = ['SMALL', 'LARGE', 'OFF'];
	const positionStates = ['TOP LEFT', 'LEFT', 'BOTTOM LEFT', 'TOP RIGHT', 'RIGHT', 'BOTTOM RIGHT'];
	const sizeStates = ['SMALL', 'NORMAL', 'LARGE'];

	let clickOutsideHandlerFunction;

	let loading = false,
		external = false,
		isVod = false,
		scrolling = false,
		isFullscreen = false,
		intervalScroll = null,
		socket = null;

	let isProcessingElements = false,
		isProcessingMessages = false;

	const boundHandleChatMessageEvent = handleChatMessageEvent.bind(this);

	function getMessageKey(key, value, chatroom_id) {
		const keyValue = key + "-" + value;
		const dupe = flushers[chatroom_id].displayedMessages.has(keyValue);
		const ignore = ((flushers[chatroom_id].spamState === 2 && dupe) || (flushers[chatroom_id].spamState === 0 && dupe && flushers[chatroom_id].lastRow > 1)) ? true : false;
		if (!ignore) flushers[chatroom_id].displayedMessages.add(keyValue);
		return { key: keyValue, ignore: ignore };
	}

	async function processMessageQueue() {
		try {
			if (isProcessingMessages) return;
			isProcessingMessages = true;

			let queueItem = messageQueue.shift();
			if (!queueItem) {
				isProcessingMessages = false;
				return;
			}

			queueItem.chatroom_id = external ? queueItem?.chatroom_id : 0;

			const lastRow = flushers[queueItem.chatroom_id].lastRow;
			const maxRows = flushers[queueItem.chatroom_id].maxRows;

			if ((lastRow === null || lastRow >= maxRows)) {
				isProcessingMessages = false;
				return;
			}

			const eventType = queueItem.event ?? queueItem.eventName;

			if (eventType === "App\\Events\\ChatMessageEvent") {
				createMessage(queueItem)
			} else if (queueItem.type === "message") {
				createMessage(queueItem)
			} else if (eventType === "App\\Events\\UserBannedEvent") {
				createUserBanMessage(queueItem);
			} else if (eventType === "App\\Events\\GiftedSubscriptionsEvent") {
				createGiftedMessage(queueItem);
			} else if (eventType === "App\\Events\\FollowersUpdated") {
				createFollowersMessage(queueItem);
			} else if (eventType === "App\\Events\\StreamHostEvent") {
				createHostMessage(queueItem);
			} else if (eventType === "App\\Events\\SubscriptionEvent") {
				createSubMessage(queueItem);
			} else {
				isProcessingMessages = false;
				processMessageQueue();
			}
		}
		catch (error) {
			isProcessingMessages = false;
			processMessageQueue();
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

			const flushState = flushers[queueItem.chatroom_id].flushState;

			if (!flushers[queueItem.chatroom_id].chatEnabled) {
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

	function appendVertical(message) {
		const messageKey = message.key;
		const chatroomId = message.chatroom_id;
		let timestamp = message.created_at;
		timestamp = new Date(timestamp);
		message.container.classList.add('flusher-message');
		message.container.dataset.timestamp = timestamp;

		const lastItem = flushers[chatroomId].flusher.firstChild;
		if (lastItem) {
			const lastTimestamp = new Date(lastItem.dataset.timestamp);

			if (timestamp < lastTimestamp) {
				flushers[chatroomId].flusher.append(message.container);
			} else {
				let current = lastItem;
				while (current) {
					const currentTimestamp = new Date(current.dataset.timestamp);

					if (timestamp > currentTimestamp) {
						flushers[chatroomId].flusher.insertBefore(message.container, current);
						break;
					}
					current = current.previousSibling;
				}

				if (!current) flushers[chatroomId].flusher.insertBefore(message.container, flushers[chatroomId].flusher.firstChild);
			}
		} else {
			flushers[chatroomId].flusher.append(message.container);
		}

		while (flushers[chatroomId].flusher.children.length > flushers[chatroomId].maxRows) {
			flushers[chatroomId].displayedMessages.delete(messageKey);
			flushers[chatroomId].flusher.removeChild(flushers[chatroomId].flusher.lastChild);
		}
	}

	function checkResize(element, toggle, flusher) {
		const id = flusher.getAttribute('flusher-chatroom');
		flushers[id].resizeTimer = null;
		if (flushers[id].resizeObserver) flushers[id].resizeObserver.disconnect();
		flushers[id].resizeObserver = new ResizeObserver(entries => {
			if (flusher !== null)
				flusher.style.display = 'none';

			for (let entry of entries) {
				if (flushers[id].resizeTimer) clearTimeout(flushers[id].resizeTimer);
				flushers[id].resizeTimer = setTimeout(() => {
					for (let entry of entries) {

						const { width, height } = entry.contentRect;
						currentUrl = window.location.href;

						if ((width === null || width === 0) && flushers[id].parentWidth) {
							if (flusher !== null) {
								console.log('remove chat');
								flusher.remove();
								delete flushers[id];
								element.removeAttribute('flusher');
								if (!external);
								initializeChat();
								return;
							}
						}

						const oldWidth = flushers[id].parentWidth;
						flushers[id].parentWidth = Math.trunc(width) * 2;
						flushers[id].parentHeight = Math.trunc(height);

						flusher.style.setProperty('--flusher-width', `-${flushers[id].parentWidth}px`);
						toggle.setAttribute('domain', domain);

						const newFlushState = flushers[id].flushState !== undefined ? (flushers[id].flushState ? 'horizontal' : 'vertical') : (flushers[id].flushState ? 'horizontal' : 'vertical');

						flusher.setAttribute('layout', newFlushState);
						flusher.setAttribute('enabled', flushers[id].chatEnabled !== undefined ? flushers[id].chatEnabled : flushers[id].chatEnabled);
						flusher.setAttribute('position', flushers[id].position !== undefined ? flushers[id].position : positionStates[flushers[id].positionState].replace(/\s/g, ""));
						flusher.setAttribute('size', flushers[id].size !== undefined ? flushers[id].size : sizeStates[flushers[id].sizeState].replace(/\s/g, ""));
						flusher.setAttribute('background', flushers[id].background !== undefined ? flushers[id].background : backgroundStates[flushers[id].backgroundState]);

						toggleEnableMenu();

						const documentWidth = document.documentElement.clientWidth;
						if (documentWidth < ((flushers[id].parentWidth / 2) + 10)) {
							isFullscreen = true;
							scrolling = false;
							debouncedScroll();
							intervalScroll = setInterval(debouncedScroll, 10000);
						} else {
							isFullscreen = false;
							if (intervalScroll !== null) {
								clearInterval(intervalScroll);
								intervalScroll = null;
							}
						}

						flushers[id].elementHeight = null;
						flusher.style.display = 'flex';
						createIntroMessage(false, flusher);

						if (oldWidth == null || oldWidth == 0) {
							if (element === null) return;
							/* test(); */
							/* if (chatEnabled && flushState) createIntroMessage(true); */
							isVod = window.location.href.includes('/video/');
							let channelName = external ? element.parentNode.querySelector('.iframe-lbl-div.notranslate') : document.querySelector('.stream-username');
							flushers[id].channelName = channelName !== null ? channelName.textContent : '';
							loading = false;
							processMessageQueue();
							console.info(`Kick Chat Flusher (${flushers[id].channelName} ${domain} ${isVod ? 'VOD' : 'LIVE'}): Report bugs or collaborate at https://github.com/r0808914/Kick-Chat-Flusher`);
						} else {
							flushers[id].flushState ? clearChat(flusher) : resetPostion(flusher);
						}
					}
				}, 750);
			}
		});

		flushers[id].resizeObserver.observe(element);
	}

	function clearChat(flusher) {
		const id = flusher.getAttribute('flusher-chatroom');

		if (flusher !== null) {
			flusher.style.display = 'none';
			resetPostion(flusher);
		}

		const isEnabled = flushers[id].chatEnabled;
		flushers[id].chatEnabled = false;

		elementQueue.length = 0;
		messageQueue.length = 0;
		flushers[id].lastRow = 0;
		for (const id of timeoutIds) {
			clearTimeout(id);
		}

		scrolling = false;

		if (flusher !== null) {
			while (flusher.firstChild) {
				flusher.removeChild(flusher.firstChild);
			}
		}

		flushers[id].displayedMessages = new Set();

		if (flushers[id].lastPositionPerRow) {
			flushers[id].lastPositionPerRow.length = 0;
		} else {
			flushers[id].lastPositionPerRow = [];
		}

		if (flushers[id].rowQueue) {
			flushers[id].rowQueue.length = 0;
		} else {
			flushers[id].rowQueue = [];
		}

		timeoutIds.length = 0;

		if (flusher !== null) flusher.style.display = 'flex';

		flushers[id].chatEnabled = isEnabled;

		isProcessingElements = false;
		isProcessingMessages = false;
	}

	function startIp2() {
		/* check wss chatroom channels in kick */

		addPusher();

		const parentChannel = document.getElementById('channels');

		parentChannel.addEventListener('click', function (event) {
			const clickedChannel = event.target.closest('.channel');
			if (clickedChannel) {
				const mutationCallback = function (mutationsList, observer) {
					for (const mutation of mutationsList) {
						if (mutation.type === 'childList') {
							const itemBoxElements = document.querySelectorAll('.item-box');
							itemBoxElements.forEach((itemBoxElement) => {
								const iframes = itemBoxElement.querySelectorAll('iframe');
								iframes.forEach((iframe) => {
									if (iframe.hasAttribute('flusher')) return;
									if (!Object.keys(flushers).length) {
										setupPusher();
										visibilityChange();
									}
									observer.disconnect();
									createChannel(iframe);
								});
							});
						}
					}
				};

				const observer = new MutationObserver(mutationCallback);
				const targetNode = document.body;
				const config = { childList: true, subtree: true };
				observer.observe(targetNode, config);
			}
		});

		function createChannel(iframe) {
			const src = iframe.getAttribute('src');
			if (src && src.includes('kick.com')) {
				const channelName = new URL(src).pathname.slice(1);
				fetch(`https://kick.com/api/v1/channels/${channelName}`)
					.then(response => response.json())
					.then(data => {
						const chatroomId = data && data.chatroom && data.chatroom.id;
						createChat(iframe, chatroomId)
							.then(flusher => subscribeChannel(flusher, iframe))
							.catch(error => console.error('Error creating chat:', error));
					})
					.catch(error => console.error('Error fetching data:', error));
			}
		}

		function addPusher() {
			const pusherScript = document.createElement('script');
			pusherScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pusher/8.3.0/pusher.min.js';
			pusherScript.integrity = 'sha512-tXL5mrkSoP49uQf2jO0LbvzMyFgki//znmq0wYXGq94gVF6TU0QlrSbwGuPpKTeN1mIjReeqKZ4/NJPjHN1d2Q==';
			pusherScript.crossOrigin = 'anonymous';
			pusherScript.referrerPolicy = 'no-referrer';
			document.head.appendChild(pusherScript);

			const fontLink = document.createElement('link');
			fontLink.rel = 'stylesheet';
			fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap';
			document.head.appendChild(fontLink);
		}

		function setupPusher() {
			if (socket !== null) return;
			socket = new Pusher('eb1d5f283081a78b932c', {
				cluster: 'us2',
				protocol: 'wss',
				encrypted: true,
			});
		}
	}

	function subscribeChannel(flusher, iframe) {
		const id = flusher.getAttribute('flusher-chatroom');
		const channel = socket.subscribe(`chatrooms.${id}.v2`);
		channel.unbind_global();

		channel.bind_global(function (eventName, data) {
			document.body.contains(iframe) ? onMessage(id, data) : disposeChannel(id);
			function onMessage(id, data) {
				if (!flushers[id].chatEnabled || data === null || loading) return;
				messageQueue.push(data);
				processMessageQueue();
			}
		});
	}

	function disposeChannel(id) {
		if (external) return;
		socket.unsubscribe(`chatrooms.${id}.v2`);
		console.log(`dispose ${flushers[id].channelName}.${id}`);
	}

	function initializeChat() {
		console.log('initializeChat');
		if (loading) return;
		loading = true;

		if (window.location.hostname.includes('ip2.network')) {
			domain = "IP2";
			external = true;
			startIp2();
		} else {
			if (flushers[0]?.flusher) {
				loading = false;
				return;
			}
			domain = "KICK";
			resetConnection();

			if (document.querySelector("video") && document.querySelector(".video-js")) {
				createChat(document.querySelector('video'), 0);
				return;
			}

			const observer = new MutationObserver(function (mutations) {
				mutations.forEach(function (mutation) {
					if (mutation.addedNodes) {
						mutation.addedNodes.forEach(function (node) {
							if (document.querySelector(".video-js")) {
								observer.disconnect();
								createChat(document.querySelector('video'), 0);
								return;
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
				if (Object.keys(flushers).length) return;
				loading = false;
			}, 5000);
		}
	}

	function resetConnection() {

		bindRequests();
		if (!flushers[0]?.flusher) return;
		clearChat(flushers[0].flusher);
		if (flushers[0].flusher && flushers[0].resizeObserver) {
			flushers[0].resizeObserver.disconnect();
		}
		/* flushers = {}; */
		isVod = false;
	}

	function handleChatMessageEvent(data) {
		try {
			if (isVod || !flushers[0].chatEnabled || loading) return;
			if (flushers[0].flusher) {
				data.data.chatroom_id = 0;
				messageQueue.push(data.data);
				processMessageQueue();
				return;
			}
		} catch (error) {
			if (!flushers[0]) initializeChat();
		}
	}

	function createMenu(parsedDocument, element, flusher) {
		element = external ? element : element.closest('.video-js');
		const menuHtml = parsedDocument.querySelector('.flusher-menu').cloneNode(true);
		const toggleHtml = parsedDocument.querySelector('.vjs-control.vjs-button').cloneNode(true);
		const menu = element.querySelector('.flusher-menu');
		const id = flusher.getAttribute('flusher-chatroom');

		flushers[id] = {};
		flushers[id].maxRows = 99;
		flushers[id].lastRow = 0;
		flushers[id].badgeCache = [];
		flushers[id].flusher = flusher;
		flushers[id].flusherParent = element;
		flushers[id].displayedMessages = new Set();

		if (menu === null) {
			const settingsMenu = menuHtml.querySelector('.flusher-menu-settings');
			const layoutMenu = menuHtml.querySelector('.flusher-menu-layout');

			const closeBtn = menuHtml.querySelector('.flusher-menu-close');
			closeBtn.addEventListener('click', function (event) {
				hideMenu(element, id);
			});

			const homeBtn = menuHtml.querySelector('.flusher-home');
			homeBtn.addEventListener('click', function (event) {
				hideMenu(element, id);
				window.open('https://github.com/r0808914/Kick-Chat-Flusher/issues', '_blank');
			});

			const storeBtn = menuHtml.querySelector('.flusher-store');
			storeBtn.addEventListener('click', function (event) {
				hideMenu(element, id);
				const userAgent = navigator.userAgent.toLowerCase();
				userAgent.includes("firefox") ?
					window.open('https://addons.mozilla.org/en-US/firefox/addon/kickchatflusher/', '_blank') :
					window.open('https://chromewebstore.google.com/detail/kick-chat-flusher/cefplanllnmdnnhncpopljmcjnlafdke', '_blank');
			});

			const chatEnabledValue = localStorage.getItem('flusher-enable');
			flushers[id].chatEnabled = chatEnabledValue ? JSON.parse(chatEnabledValue) : true;

			const flushStateValue = localStorage.getItem('flusher-flush');
			flushers[id].flushState = flushStateValue ? JSON.parse(flushStateValue) : false;

			const spamStateValue = localStorage.getItem('flusher-spam');
			flushers[id].spamState = spamStateValue ? JSON.parse(spamStateValue) : 1;
			if (flushers[id].spamState === 0 && flushers[id].flushState) flushers[id].spamState = 2;

			const positionStateValue = localStorage.getItem('flusher-position');
			flushers[id].positionState = positionStateValue ? JSON.parse(positionStateValue) : 0;

			const sizeStateValue = localStorage.getItem('flusher-size');
			flushers[id].sizeState = sizeStateValue ? JSON.parse(sizeStateValue) : 1;

			const backgroundStateValue = localStorage.getItem('flusher-background');
			flushers[id].backgroundState = backgroundStateValue ? JSON.parse(backgroundStateValue) : 2;

			const spamBtn = menuHtml.querySelector('.flusher-spam');
			const spanInsideSpam = spamBtn.querySelector('span');
			spanInsideSpam.textContent = spamStates[flushers[id].spamState];

			spamBtn.addEventListener('click', function (event) {
				flushers[id].spamState = (flushers[id].spamState + 1) % spamStates.length;
				if (flushers[id].spamState === 0 && !flushers[id].flushState) flushers[id].spamState++;
				localStorage.setItem('flusher-spam', JSON.stringify(flushers[id].spamState));
				spanInsideSpam.textContent = spamStates[flushers[id].spamState];
				clearChat(flusher);
			});

			const positionBtn = layoutMenu.querySelector('.flusher-position');
			const spanInsidePosition = positionBtn.querySelector('span');
			spanInsidePosition.textContent = toTitleCase(positionStates[flushers[id].positionState]);

			positionBtn.addEventListener('click', function (event) {
				flushers[id].positionState = (flushers[id].positionState + 1) % positionStates.length;
				localStorage.setItem('flusher-position', JSON.stringify(flushers[id].positionState));
				spanInsidePosition.textContent = toTitleCase(positionStates[flushers[id].positionState]);
				flusher.setAttribute('position', positionStates[flushers[id].positionState].replace(/\s/g, ""));
				resetPostion(flusher);
			});

			const sizeBtn = layoutMenu.querySelector('.flusher-size');
			const sizeInsidePosition = sizeBtn.querySelector('span');
			sizeInsidePosition.textContent = toTitleCase(sizeStates[flushers[id].sizeState]);

			sizeBtn.addEventListener('click', function (event) {
				flushers[id].sizeState = (flushers[id].sizeState + 1) % sizeStates.length;
				localStorage.setItem('flusher-size', JSON.stringify(flushers[id].sizeState));
				sizeInsidePosition.textContent = toTitleCase(sizeStates[flushers[id].sizeState]);
				flusher.setAttribute('size', sizeStates[flushers[id].sizeState].replace(/\s/g, ""));
				resetPostion(flusher);
				setVerticalWidth(flusher);
			});

			const backgroundBtn = layoutMenu.querySelector('.flusher-background');
			const backgroundInsidePosition = backgroundBtn.querySelector('span');
			backgroundInsidePosition.textContent = toTitleCase(backgroundStates[flushers[id].backgroundState]);

			backgroundBtn.addEventListener('click', function (event) {
				flushers[id].backgroundState = (flushers[id].backgroundState + 1) % backgroundStates.length;
				localStorage.setItem('flusher-background', JSON.stringify(flushers[id].backgroundState));
				backgroundInsidePosition.textContent = toTitleCase(backgroundStates[flushers[id].backgroundState]);
				flusher.setAttribute('background', backgroundStates[flushers[id].backgroundState]);
			});

			const baseMenu = menuHtml.querySelector('.flusher-menu-base');

			const settingsBtn = menuHtml.querySelector('.flusher-settings');
			settingsBtn.addEventListener('click', function (event) {
				settingsMenu.style.display = 'block';
				baseMenu.style.display = 'none';
			});

			const settingsBackBtn = menuHtml.querySelector('.flusher-settings-back');
			settingsBackBtn.addEventListener('click', function (event) {
				settingsMenu.style.display = 'none';
				baseMenu.style.display = 'block';
			});

			const settingsCloseBtn = menuHtml.querySelector('.flusher-settings-close');
			settingsCloseBtn.addEventListener('click', function (event) {
				menuHtml.style.display = 'none';
				settingsMenu.style.display = 'none';
				baseMenu.style.display = 'none';
			});

			const layoutCloseBtn = menuHtml.querySelector('.flusher-layout-close');
			layoutCloseBtn.addEventListener('click', function (event) {
				menuHtml.style.display = 'none';
				layoutMenu.style.display = 'none';
				baseMenu.style.display = 'none';
			});

			const layoutMenuBtn = menuHtml.querySelector('.flusher-layoutMenu');
			layoutMenuBtn.addEventListener('click', function (event) {
				layoutMenu.style.display = 'block';
				baseMenu.style.display = 'none';
			});

			const layoutBackBtn = menuHtml.querySelector('.flusher-layout-back');
			layoutBackBtn.addEventListener('click', function (event) {
				layoutMenu.style.display = 'none';
				baseMenu.style.display = 'block';
			});

			flushers[id].flushState ? layoutMenuBtn.style.display = 'none' : layoutMenuBtn.style.display = 'flex';

			const flusherToggle = menuHtml.querySelector('.flusher-enable .flusher-toggle');
			flusherToggle.addEventListener('click', function (event) {
				const toggleElement = event.currentTarget;
				toggleElement.classList.toggle(toggledClass);

				const newChatEnabled = toggleElement.classList.contains(toggledClass);
				flushers[id].chatEnabled = newChatEnabled;

				newChatEnabled ? subscribeChannel(flusher, element) : disposeChannel(id);
				if (newChatEnabled && flusher.attributes['layout'].nodeValue === 'vertical') dragElement(flusher);

				clearChat(flusher);

				svgToggle(element, id);
				toggleEnableMenu();
				togglePointerEvents(flusher);

				flusher.setAttribute('enabled', newChatEnabled);
				localStorage.setItem('flusher-enable', JSON.stringify(newChatEnabled));
			});

			if (flushers[id].chatEnabled) flusherToggle.classList.toggle(toggledClass);

			const flushToggle = menuHtml.querySelector('.flusher-flush .flusher-toggle');
			flushToggle.addEventListener('click', function (event) {
				const toggleElement = event.currentTarget;
				toggleElement.classList.toggle(toggledClass);

				const newFlushState = toggleElement.classList.contains(toggledClass);
				newFlushState ? layoutMenuBtn.style.display = 'none' : layoutMenuBtn.style.display = 'flex';
				flushers[id].flushState = newFlushState;

				/* if (chatEnabled) subscribeChannel(flusher, element); */
				if (flushers[id].chatEnabled && flusher.attributes['layout'].nodeValue !== 'vertical') dragElement(flusher);

				togglePointerEvents(flusher);
				clearChat(flusher);
				flusher.setAttribute('layout', newFlushState ? 'horizontal' : 'vertical');

				localStorage.setItem('flusher-flush', JSON.stringify(newFlushState));
			});

			if (flushers[id].flushState) flushToggle.classList.toggle(toggledClass);

			const parent = external ? element : document.querySelector('.vjs-control-bar');
			external ? element.parentNode.append(menuHtml) : parent.append(menuHtml);

			togglePointerEvents(flusher);

			return createToggle(toggleHtml, element, flusher);

			function toTitleCase(str) {
				if (str === 'OFF' || str === 'ON') return str;
				return str.toLowerCase().replace(/\b\w/g, function (char) {
					return char.toUpperCase();
				});
			}
		}
	}

	function toggleEnableMenu() {
		var elementsToToggle = ['flusher-flush', 'flusher-settings', 'flusher-layoutMenu'];
		elementsToToggle.forEach(function (id) {
			var element = document.getElementById(id);
			if (element) {
				if (id === 'flusher-layoutMenu' && flushers[id].flushState === true && flushers[id].chatEnabled) return;
				flushers[id].chatEnabled ? element.style.display = 'flex' : element.style.display = 'none';
			}
		});
	}

	function togglePointerEvents(flusher) {
		const id = flusher.getAttribute('flusher-chatroom');
		const args = flushers[id];

		if (args.flushState || !args.chatEnabled) {
			flusher.classList.remove('flusher-grab');
			flusher.classList.add('flusher-no-grab');
			return;
		}
		lastRow = 2;
		if (flushers[id].spamState === 0 && !flushers[id].flushState) flushers[id].spamState = 2;
		dragElement(flusher);
		localStorage.setItem('flusher-spam', JSON.stringify(flushers[id].spamState));
		document.querySelector('.flusher-spam span').textContent = spamStates[flushers[id].spamState];
		flusher.classList.remove('flusher-no-grab');
		flusher.classList.add('flusher-grab');
	}

	function dragElement(elmnt) {
		var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
		var isResizing = false;

		elmnt.onmousedown = function (e) {
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

			elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
			elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
		}

		function resizeElement(e) {
			e = e || window.event;
			e.preventDefault();
			elmnt.style.width = (elmnt.offsetWidth - (pos3 - e.clientX)) + "px";
			elmnt.style.height = (elmnt.offsetHeight - (pos4 - e.clientY)) + "px";
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
			var rect = elmnt.getBoundingClientRect();
			var handleSize = 10;
			return (
				e.clientX >= rect.right - handleSize &&
				e.clientY >= rect.bottom - handleSize
			);
		}
	}

	function resetPostion(element) {
		element.style.height = '';
		element.style.width = '';
		element.style.top = '';
		element.style.left = '';
	}

	function test() {
		const data = {
			event: "App\\Events\\ChatMessageEvent",
			data: {
				content: "Test Message",
				sender: {
					username: "Test User",
					identity: {
						color: "#E9113C",
					}
				}
			}
		};

		if (flusher === null) return;

		setInterval(() => {
			messageQueue.push(data);
			processMessageQueue();
		}, 2500);
	}

	function createChat(element, chatroomId) {
		if (element.hasAttribute('flusher')) return;
		/* chatFlusherMessages = 0; existingFlushers = new Set(); */
		element.setAttribute('flusher', "")

		const chatFlusher = document.createElement("div");
		chatFlusher.classList.add("flusher");

		const flusher = document.createElement("div");
		flusher.classList.add("flusher-messages");
		flusher.setAttribute('flusher-chatroom', chatroomId);

		const shadowRoot = chatFlusher.attachShadow({ mode: 'open' });

		const metaTag = document.querySelector('meta[name="flusher-data"]');
		const dataFileURL = metaTag ? metaTag.content : '';

		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open('GET', dataFileURL, true);
			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						const parser = new DOMParser();
						const parsedDocument = parser.parseFromString(xhr.responseText, 'text/html');

						const overlayStyles = parsedDocument.getElementById('css-overlay');
						if (overlayStyles) {
							const overlayStyle = document.createElement('style');
							overlayStyle.textContent = overlayStyles.textContent;
							overlayStyle.id = 'flusher-css';
							shadowRoot.appendChild(overlayStyle);
						}

						const menuStyles = parsedDocument.getElementById('css-menu');
						const menuStylesDom = document.getElementById('flusher-css');
						if (menuStyles && !menuStylesDom) {
							const menuStyle = document.createElement('style');
							menuStyle.textContent = menuStyles.textContent;
							menuStyle.id = 'flusher-css';
							document.head.appendChild(menuStyle);
						}

						const toggle = createMenu(parsedDocument, element, flusher);
						element.parentNode.insertBefore(chatFlusher, element);
						shadowRoot.appendChild(flusher);
						checkResize(element, toggle, flusher);

						resolve(flusher);
					} else {
						reject(new Error(`Failed to load data. Status: ${xhr.status}`));
					}
				}
			};

			xhr.send();
		});
	}

	function visibilityChange() {
		document.addEventListener('visibilitychange', function handleVisibilityChange() {
			if (!Object.keys(flushers).length) return;
			for (const key in flushers) {
				if (!flushers[key].flushState) continue;

				if (document.hidden) {
					flushers[key].chatEnabledVisible = flushers[key].chatEnabled;
					flushers[key].chatEnabled = false;
					console.log(flushers[key].channelName + ' ' + document.hidden + ' ' + flushers[key].chatEnabledVisible);

					clearChat(flushers[key].flusher);
				} else {
					console.log(' off ' + flushers[key].channelName + ' ' + document.hidden + ' ' + flushers[key].chatEnabledVisible);

					flushers[key].chatEnabled = flushers[key].chatEnabledVisible;
				}
			}
		});
	}

	function bindRequests(element) {
		const chatFlusherStyles = document.getElementById("flusher-css");
		if (!chatFlusherStyles) {
			visibilityChange();
			interceptChatRequests();

			if (!socket && !external) {
				socket = window.Echo.connector.pusher;
				socket.connection.bind("message", boundHandleChatMessageEvent);
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
		}
	}

	function createToggle(toggleHtml, element, flusher) {
		const parent = external ? element.parentNode : element;
		const toggle = parent.querySelector('.flusher-toggle-btn');
		if (toggle !== null) return;

		const popupMenu = parent.querySelector(".flusher-menu");
		const baseMenu = parent.querySelector('.flusher-menu-base');
		const existingButton = external ? parent : document.querySelector('.vjs-fullscreen-control');
		const btnHtml = external ? toggleHtml.querySelector('svg') : toggleHtml;
		existingButton.parentNode.append(btnHtml);

		const id = flusher.getAttribute('flusher-chatroom');

		svgToggle(element, id);
		btnHtml.addEventListener('click', function (event) {
			event.stopPropagation(); // Stop the click event from propagating to document click handler
			console.log('ok');
			popupMenu.style.display === "block" ? hideMenu(parent, id) : showMenu();
		});

		function showMenu() {
			baseMenu.style.display = 'block';
			popupMenu.style.display = 'block';
			svgToggle(element, id);
			clickOutsideHandlerFunction = (event) => clickOutsideHandler(event, element, id);
			document.addEventListener('click', clickOutsideHandlerFunction);
		}
		return btnHtml;
	}

	function hideMenu(element, chatroom_id) {
		const parent = external ? element.parentNode : element;
		const popupMenu = parent.querySelector('.flusher-menu');
		const baseMenu = popupMenu.querySelector('.flusher-menu-base');
		const settingsMenu = popupMenu.querySelector('.flusher-menu-settings');
		const layoutMenu = popupMenu.querySelector('.flusher-menu-layout');
		popupMenu.style.display = 'none';
		settingsMenu.style.display = 'none';
		baseMenu.style.display = 'none';
		layoutMenu.style.display = 'none';
		svgToggle(element, chatroom_id);
		document.removeEventListener('click', clickOutsideHandlerFunction);
	}

	function clickOutsideHandler(event, element, chatroom_id) {
		const parent = external ? element.parentNode : element;
		const popupMenu = parent.querySelector('.flusher-menu');
		const toggle = parent.querySelector(external ? '.svg-toggle' : '.flusher-toggle');
		if (popupMenu !== null && !popupMenu.contains(event.target) && popupMenu.style.display === 'block') {
			if (toggle.contains(event.target) || event.target === toggle) return;
			hideMenu(element, chatroom_id);
		}
	}

	function svgToggle(flusherParent, chatroom_id) {
		const parent = external ? flusherParent.closest('.item-box') : flusherParent;
		const toggle = parent.querySelector('.toggle-icon');
		const menuHtml = parent.querySelector('.flusher-menu');
		const visible = menuHtml.style.display === "block" ? true : false;
		if (toggle === null) return;
		if (flushers[chatroom_id].chatEnabled || visible) {
			toggle.classList.add('svg-toggle');
		} else {
			toggle.classList.remove('svg-toggle');
		}
	}

	function parseRequest(response) {
		console.log(response);
		if (isVod) {
			if (!flushers[0]?.chatEnabled || loading) return;
			if (flushers[0]?.flusher) {
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
		} else {
			response.data.messages.forEach(function (message) {
				messageQueue.push(message);
			});
			initializeChat();
		}
	}

	function selectRow(message) {
		const chatroom_id = message.chatroom_id;

		let selectedRow = 0;
		const positions = flushers[chatroom_id]?.lastPositionPerRow?.length ?? 0;
		if (positions > 0) {
			for (let i = 0; i < positions; i++) {

				const item = flushers[chatroom_id].lastPositionPerRow[i];

				if (item === undefined || item.run === true) {
					selectedRow = i;
					flushers[chatroom_id].lastRow = selectedRow;
					break;
				}

				if (flushers[chatroom_id].rowQueue[i].length < 2) {
					message.row = i;
					message = prepareAnimation(message);
					if (message !== null) flushers[chatroom_id].rowQueue[i].push(message);
					return;
				}

				selectedRow = i + 1;
			}
		}

		message.row = selectedRow;
		if (!flushers[chatroom_id].rowQueue) flushers[chatroom_id].rowQueue = [];
		flushers[chatroom_id].rowQueue[selectedRow] = flushers[chatroom_id].rowQueue[selectedRow] ?? [];

		message = prepareAnimation(message);
		if (message !== null) startAnimation(message);
		flushers[chatroom_id].lastRow = selectedRow;
	}

	function debouncedScroll() {
		if (scrolling === true) return;
		scrolling = true;

		const chatBtn = document.querySelector('#chatroom .justify-center.absolute');
		const chatContainer = document.querySelector('#chatroom [data-chat-entry]');
		if (isFullscreen && !isVod) {
			if (chatBtn !== null) {
				chatBtn.click();
			} if (chatContainer !== null) {
				const chatContainerParent = chatContainer.closest('.overflow-y-scroll');
				if (chatContainerParent !== null) {
					chatContainerParent.scrollTop = chatContainerParent.scrollHeight;
				}
			}
		}

		const timeoutId = setTimeout(() => {
			scrolling = false;
		}, 5000);

		timeoutIds.push(timeoutId);
	}

	async function startAnimation(messageData) {
		const message = messageData.container;
		const id = messageData.chatroom_id;
		const space = 4;
		const rowIndex = messageData.row;

		const lastItem = flushers[id]?.lastPositionPerRow?.[rowIndex];
		!flushers[id].lastPositionPerRow ? flushers[messageData.chatroom_id].lastPositionPerRow = [] : null;
		flushers[id].lastPositionPerRow[rowIndex] = { container: message, run: false };

		let overlap = 0;
		let messageWidth;
		const lastContainer = lastItem !== undefined ? lastItem.container : undefined;

		/* existing row */
		if (lastContainer !== undefined) {

			requestAnimationFrame(() => {
				flushers[id].flusher.appendChild(message);
				messageWidth = message.offsetWidth;
				message.style.marginRight = `-${messageWidth}px`;

				const rect1 = message.getBoundingClientRect();
				const rect2 = lastContainer.getBoundingClientRect();

				overlap = rect2.right - rect1.left;

				/* queue running */
				if (lastItem.run === false) {
					const numString = Math.abs(overlap).toString();
					const firstDigit = parseInt(numString[0], 10);
					overlap = overlap / overlap >= 10 ? firstDigit : 0;
					message.style.marginRight = `-${(messageWidth + overlap + space)}px`;
					message.classList.add('flusher-animation');
					/* firstDigit > 2 ? debouncedScroll() : null; */
				}

				/* queue ended */
				else {
					if (overlap > -8) {	/* append last queue */
						message.style.marginRight = `-${(messageWidth + overlap + space)}px`;
						message.classList.add('flusher-animation');

					} else {	/* new queue */
						message.style.marginRight = `-${(messageWidth + space)}px`;
						/* message.style.backgroundColor = "red"; */
						message.classList.add('flusher-animation');
						overlap = 0;
					}
				}

				requestNext(messageWidth, overlap, messageData);
			});
		}

		/* new row */
		else {
			flushers[id].flusher.appendChild(message);
			messageWidth = message.offsetWidth;
			message.style.marginRight = `-${(messageWidth + space)}px`;
			message.classList.add('flusher-animation');

			overlap = 0;
			requestNext(messageWidth, overlap, messageData);
		}

		async function requestNext(messageWidth, overlap, messageData) {
			messageData.container.style.marginRight = `-${(messageWidth + overlap + space)}px`;
			let timeNeeded = Math.ceil((messageWidth + space + overlap) / flushers[id].parentWidth * 16000);

			const timeoutId = setTimeout(() => {
				checkQueue(messageData);
				const index = timeoutIds.indexOf(timeoutId);
				if (index !== -1) {
					timeoutIds.splice(index, 1);
				}
			}, timeNeeded);

			timeoutIds.push(timeoutId);
		}

		function checkQueue(messageData) {
			const id = messageData.chatroom_id;
			const index = messageData.row;
			const queueItem = flushers[id].rowQueue[index].shift();
			if (queueItem !== undefined) {
				checkRow(queueItem, index);
			} else {
				flushers[id].lastRow = flushers[id].lastRow - 1;
				flushers[id].lastPositionPerRow[index] = { container: messageData.container, run: true };
			}
		}

		function checkRow(messageData, rowIndex) {
			const id = messageData.chatroom_id;
			if ((rowIndex + 1) > flushers[id].lastRow) {
				for (let i = 0; i < rowIndex; i++) {
					if (flushers[id].lastPositionPerRow[i] === undefined || flushers[id].lastPositionPerRow[i].run === true) {
						if (messageData.message !== null) {
							flushers[id].lastPositionPerRow[rowIndex] = undefined;
							messageData.container.style.setProperty('--row', i);
							startAnimation(messageData);
						}
						return;
					}
					if (flushers[id].rowQueue[i].length < 1) {
						if (messageData.container !== null) {
							flushers[id].lastPositionPerRow[rowIndex] = undefined;
							messageData.container.style.setProperty('--row', i);
							flushers[id].rowQueue[i].push(messageData);
						}
						return;
					}
				}
			}

			startAnimation(messageData);
		}
	}

	function prepareAnimation(data) {
		data.container.style.setProperty('--row', data.row);
		data.container.classList.add('flusher-message');
		data.container.addEventListener("animationend", function () {
			try {
				flushers[data.chatroom_id].flusher.removeChild(this);
				flushers[data.chatroom_id].displayedMessages.delete(data.key);
			} catch { }
		});

		return data;
	}

	function appendMessage(queueItem) {
		elementQueue.push(queueItem);
		processElementQueue();
		isProcessingMessages = false;
		processMessageQueue();
	}

	async function createMessage(message) {
		const sender = message.sender;
		const username = sender.username;
		const content = message.content;

		const reduced = flushers[message.chatroom_id].spamState === 2 ? reduceRepeatedSentences(content) : content;

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

			isProcessingMessages = false;

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

					const cachedBadge = flushers[id].badgeCache.find(badgeCache => badgeCache.type === badgeText);
					if (cachedBadge) {
						badgeElements.push(cachedBadge.html);
						return;
					}

					const imgElement = baseBadge.querySelector(`img`);
					if (imgElement) {
						const imgUrl = imgElement.src;
						const newImg = document.createElement('img');
						newImg.src = imgUrl;
						newImg.classList.add('flusher-badge');
						flushers[id].badgeCache.push({
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

						flushers[id].badgeCache.push({
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
				const cachedBadge = flushers[id].badgeCache.find(badgeCache => badgeCache.type === badgeText);
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

	function createIntroMessage(show, flusher) {
		const id = flusher.getAttribute('flusher-chatroom');
		const now = new Date();
		const messageKeyData = getMessageKey(`-intro`, now.getTime(), id);
		const messageKey = messageKeyData.key;

		const introContent = document.createElement("div");
		introContent.classList.add("flusher-message");

		const emojiSpan = document.createElement('span');
		emojiSpan.textContent = String.fromCodePoint(0x1F389) + ' ';

		const introSpan = document.createElement("span");
		introSpan.textContent = `thanks for testing (version 0.8.3)`;
		const introMessageSpan = document.createElement("span");

		introMessageSpan.append(emojiSpan, introSpan);

		introContent.appendChild(introMessageSpan);
		introContent.style.setProperty('--row', 0);
		introContent.classList.add('flusher-message');

		show ? selectRow({
			message:
				introContent, messageKey
		}) : testDimensions();
		function testDimensions() {
			const parent = external ? flusher : document.body;
			parent.append(introContent);
			flushers[id].elementHeight = introContent.clientHeight;
			flushers[id].maxRows = Math.ceil(flushers[id].parentHeight / flushers[id].elementHeight);
			parent.removeChild(introContent);
			setVerticalWidth(flusher);
		}
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

	function setVerticalWidth(flusher) {
		const chatroomId = flusher.getAttribute('flusher-chatroom');
		const elementHeight = flushers[chatroomId].elementHeight;
		switch (sizeStates[flushers[chatroomId].sizeState]) {
			case 'LARGE':
				flusher.style.setProperty('--flusher-vertical-width', `${elementHeight * 14}px`);
				break;
			case 'NORMAL':
				flusher.style.setProperty('--flusher-vertical-width', `${elementHeight * 14}px`);
				break;
			case 'SMALL':
				flusher.style.setProperty('--flusher-vertical-width', `${elementHeight * 9}px`);
				break;
			default:
				break;
		}
	}

	initializeChat();
};