window.onload = () => {
	const flushers = [];

	const messageQueue = [];
	const elementQueue = [];

	const timeoutIds = [];
	const rowQueue = [];

	const badgeCache = [];
	const lastPositionPerRow = [];

	const toggledClass = 'toggled-on';
	const spamStates = ['Auto', 'ON', 'OFF'];
	const backgroundStates = ['SMALL', 'LARGE', 'OFF'];
	const positionStates = ['TOP LEFT', 'LEFT', 'BOTTOM LEFT', 'TOP RIGHT', 'RIGHT', 'BOTTOM RIGHT'];
	const sizeStates = ['SMALL', 'NORMAL', 'LARGE'];

	let displayedMessages = new Set();

	let resizeObserver = null;

	let flushState = null,
		spamState = null,
		backgroundState = null,
		positionState = null,
		sizeState = null

	let loading = false,
		external = false,
		isVod = false,
		scrolling = false,
		chatEnabled = true,
		isFullscreen = false,
		elementHeight = null,
		intervalScroll = null,
		maxRows = 99,
		lastRow = 0,
		existingSocket = null,
		chatEnabledVisible = true,
		lastFollowersCount = null,
		currentUrl;

	let parentWidth = null,
		parentHeight = null;

	let isProcessingElements = false,
		isProcessingMessages = false;

	const boundHandleChatMessageEvent = handleChatMessageEvent.bind(this);

	function getMessageKey(key, value) {
		const keyValue = key + "-" + value;
		const dupe = displayedMessages.has(keyValue);
		const ignore = ((spamState === 2 && dupe) || (spamState === 0 && dupe && lastRow > 1)) ? true : false;
		if (!ignore) displayedMessages.add(keyValue);
		return { key: keyValue, ignore: ignore };
	}

	async function processMessageQueue() {
		if (!chatEnabled || isProcessingMessages) return;
		isProcessingMessages = true;
		let queueItem = messageQueue.shift();

		if ((lastRow === null || lastRow >= maxRows) || (queueItem === undefined)) {
			isProcessingMessages = false;
			return;
		}
		const videoElement = queueItem[0];
		queueItem = queueItem[1];
		const eventType = queueItem.event ?? "";

		try {
			if (eventType === "App\\Events\\ChatMessageEvent") {
				/* flushState ? createMessage(data.data) : await createMessage(data.data); */
				createMessage(queueItem, videoElement)
			} else if (queueItem.type === "message") {
				createMessage(queueItem, videoElement)
			} else if (eventType === "App\\Events\\UserBannedEvent") {
				createUserBanMessage(queueItem, videoElement);
			} else if (eventType === "App\\Events\\GiftedSubscriptionsEvent") {
				createGiftedMessage(queueItem, videoElement);
			} else if (eventType === "App\\Events\\FollowersUpdated") {
				createFollowersMessage(queueItem, videoElement);
			} else if (eventType === "App\\Events\\StreamHostEvent") {
				createHostMessage(queueItem, videoElement);
			} else if (eventType === "App\\Events\\SubscriptionEvent") {
				createSubMessage(queueItem, videoElement);
			} else {
				isProcessingMessages = false;
				processMessageQueue();
			}

		} catch (error) {
			console.error("Error parsing message data: ", error);
			isProcessingMessages = false;
			processMessageQueue();
		}
	}

	function processElementQueue() {
		if (isProcessingElements || !chatEnabled) return;
		isProcessingElements = true;

		const data = elementQueue.shift();
		if (data === undefined) {
			isProcessingElements = false;
			return;
		}

		flushState ? selectRow(data) : appendVertical(data);

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
	}

	function appendVertical(data) {
		const messageContainer = data.message;
		const messageKey = data.key;
		let timestamp = data.timestamp;
		const chatFlusherMessages = data.element;

		messageContainer.classList.add('flusher-message');

		timestamp = new Date(timestamp);
		messageContainer.dataset.timestamp = timestamp;

		console.log(chatFlusherMessages);
		console.log(messageContainer);

		const lastItem = chatFlusherMessages.firstChild;

	
		if (lastItem) {
			const lastTimestamp = new Date(lastItem.dataset.timestamp);

			if (timestamp < lastTimestamp) {
				chatFlusherMessages.append(messageContainer);
			} else {
				let current = lastItem;
				while (current) {
					const currentTimestamp = new Date(current.dataset.timestamp);

					if (timestamp > currentTimestamp) {
						chatFlusherMessages.insertBefore(messageContainer, current);
						break;
					}
					current = current.previousSibling;
				}

				if (!current) {
					chatFlusherMessages.insertBefore(messageContainer, chatFlusherMessages.firstChild);
				}
			}
		} else {
			chatFlusherMessages.append(messageContainer);
		}

		while (chatFlusherMessages.children.length > maxRows) {
			displayedMessages.delete(messageKey);
			chatFlusherMessages.removeChild(chatFlusherMessages.lastChild);
		}
	}

	function checkResize(videoData) {
		let resizeTimer;
		resizeObserver = new ResizeObserver(entries => {
			if (videoData[1] !== null)
			videoData[1].style.display = 'none';
			loading = false;

			for (let entry of entries) {
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(() => {
					for (let entry of entries) {
						const { width, height } = entry.contentRect;
						if (width === null || width === 0) {
							if (videoData[1] !== null) {
								 /* const element = document.getElementById("flusher"); */
								/*  if (videoData[1]) {
									videoData[1].remove();
									videoData[0].removeAttribute('flusher');
								} 

								initializeChat(); */
							}
							return;
						}

						const oldWidth = parentWidth;
						parentWidth = Math.trunc(width) * 2;
						parentHeight = Math.trunc(height);

						videoData[1].style.setProperty('--flusher-width', `-${parentWidth}px`);
						videoData[1].setAttribute('layout', flushState ? 'horizontal' : 'vertical');
						videoData[1].setAttribute('enabled', chatEnabled);
						videoData[1].setAttribute('position', positionStates[positionState].replace(/\s/g, ""));
						videoData[1].setAttribute('size', sizeStates[sizeState].replace(/\s/g, ""));
						videoData[1].setAttribute('background', backgroundStates[backgroundState]);

						document.getElementById('toggle-icon').setAttribute('domain', domain);

						toggleEnableMenu();

						const documentWidth = document.documentElement.clientWidth;
						if (documentWidth < ((parentWidth / 2) + 10)) {
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

						clearChat(videoData[1]);

						elementHeight = null;
						createIntroMessage(false, videoData[1]);

						if (oldWidth == null || oldWidth == 0) {
							if (videoData[0] === null) return;
							/* test(); */
							/* if (chatEnabled && flushState) createIntroMessage(true); */
							isVod = currentUrl.includes('/video/');
							let username = external ? videoData[0].closest('.iframe-lbl-div .notranslate') : document.querySelector('.stream-username');
							username = username !== null ? username.textContent : '';
							console.info(`Kick Chat Flusher (${username} ${isVod ? 'VOD' : 'LIVE'}): Report bugs or collaborate at https://github.com/r0808914/Kick-Chat-Flusher`);
						}
					}
				}, 750);
			}
		});

		resizeObserver.observe(videoData[0]);
	}

	function clearChat(element) {
		if (element !== null) {
			element.style.display = 'none';
			resetPostion(element);
		}

		const isEnabled = chatEnabled;
		chatEnabled = false;

		if (currentUrl !== window.location.href) {
			currentUrl = window.location.href;
			messageQueue.length = 0;
		} else {
			/* const lastMessage = messageQueue.pop();
			messageQueue.length = 0;
			messageQueue.push(lastMessage); */
		}

		elementQueue.length = 0;
		lastRow = 0;
		for (const id of timeoutIds) {
			clearTimeout(id);
		}

		scrolling = false;

		if (element !== null) {
			while (element.firstChild) {
				element.removeChild(element.firstChild);
			}
		}

		displayedMessages = new Set();
		lastPositionPerRow.length = 0;
		rowQueue.length = 0;
		timeoutIds.length = 0;

		if (element !== null)
			element.style.display = 'flex';

		isProcessingElements = false;
		isProcessingMessages = false;

		chatEnabled = isEnabled;
	}

	function startIp2() {
		/* check wss chatroom channels in kick */

		addPusher();

		const mutationCallback = function (mutationsList, observer) {
			for (const mutation of mutationsList) {
				if (mutation.type === 'childList') {
					const itemBoxElements = document.querySelectorAll('.item-box');
					itemBoxElements.forEach((itemBoxElement) => {
						const newIframes = Array.from(itemBoxElement.querySelectorAll('iframe')).filter(
							(iframe) => !iframe.hasAttribute('flusher')
						);
						newIframes.forEach((iframe) => {
							const flusher = createChat(iframe);
							if (flushers.length === 1) setupPusher();
							const src = iframe.getAttribute('src');
							const urlObject = new URL(src);
							channelName = urlObject.pathname.slice(1);
							fetch(`https://kick.com/api/v1/channels/${channelName}`)
								.then(response => response.json())
								.then(data => {
									const chatroomId = data && data.chatroom && data.chatroom.id;
									if (chatroomId) subscribeChannel(chatroomId, flusher);
								})
								.catch(error => {
									console.error('Error fetching data:', error);
								});
						});
					});
				}
			}
		};

		const observer = new MutationObserver(mutationCallback);
		const targetNode = document.body;
		const config = { childList: true, subtree: true };
		observer.observe(targetNode, config);

		function addPusher() {
			const pusherScript = document.createElement('script');
			pusherScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pusher/8.3.0/pusher.min.js';
			pusherScript.integrity = 'sha512-tXL5mrkSoP49uQf2jO0LbvzMyFgki//znmq0wYXGq94gVF6TU0QlrSbwGuPpKTeN1mIjReeqKZ4/NJPjHN1d2Q==';
			pusherScript.crossOrigin = 'anonymous';
			pusherScript.referrerPolicy = 'no-referrer';
			document.head.appendChild(pusherScript);
		}

		function setupPusher() {
			if (existingSocket !== null) return;
			existingSocket = new Pusher('eb1d5f283081a78b932c', {
				cluster: 'us2',
				protocol: 'wss',
				encrypted: true,
			});
		}

		function subscribeChannel(channelId, flusher) {
			const channel = existingSocket.subscribe(`chatrooms.${channelId}.v2`);
			channel.bind_global(function (eventName, data) {
				if (!chatEnabled || flusher === null) return;
				messageQueue.push([flusher	, data]);
				console.log(flusher);
				processMessageQueue();
			});
		}
	}

	function initializeChat() {
		if (window.location.hostname.includes('ip2.network')) {
			domain = "IP2";
			external = true;
			startIp2();
			return;
		}

		if (chatFlusherMessages !== null || loading) return;

		domain = "KICK";
		loading = true;
		resetConnection();

		if (document.querySelector("video") !== null) {
			const videoPlayer = document.querySelector("video");
			createChat(videoPlayer);
			return;
		}

		const observer = new MutationObserver(function (mutations) {
			mutations.forEach(function (mutation) {
				if (mutation.addedNodes) {
					mutation.addedNodes.forEach(function (node) {
						if (node.nodeName.toLowerCase() === "video") {
							observer.disconnect();
							createChat(node);
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
		isVod = false;

		clearChat(document.querySelector('#flusher-messages'));
		badgeCache.length = 0;
		lastFollowersCount = null;
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

	function createMenu(parsedDocument, element) {
		const menuHtml = parsedDocument.getElementById('flusher-menu');
		const toggleHtml = parsedDocument.getElementById('flusher-toggle');
		const menu = document.getElementById('flusher-menu');
		if (menu === null) {
			const settingsMenu = menuHtml.querySelector('#flusher-menu-settings');
			const layoutMenu = menuHtml.querySelector('#flusher-menu-layout');

			const closeBtn = menuHtml.querySelector('#flusher-menu-close');
			closeBtn.addEventListener('click', function (event) {
				hideMenu();
			});

			const homeBtn = menuHtml.querySelector('#flusher-home');
			homeBtn.addEventListener('click', function (event) {
				hideMenu();
				window.open('https://github.com/r0808914/Kick-Chat-Flusher/issues', '_blank');
			});

			const storeBtn = menuHtml.querySelector('#flusher-store');
			storeBtn.addEventListener('click', function (event) {
				hideMenu();
				const userAgent = navigator.userAgent.toLowerCase();
				userAgent.includes("firefox") ?
					window.open('https://addons.mozilla.org/en-US/firefox/addon/kickchatflusher/', '_blank') :
					window.open('https://chromewebstore.google.com/detail/kick-chat-flusher/cefplanllnmdnnhncpopljmcjnlafdke', '_blank');
			});

			const chatEnabledValue = localStorage.getItem('flusher-enable');
			chatEnabled = chatEnabledValue ? JSON.parse(chatEnabledValue) : true;

			const spamStateValue = localStorage.getItem('flusher-spam');
			spamState = spamStateValue ? JSON.parse(spamStateValue) : 0;
			if (spamState === 0 && flushState) spamState = 2;

			const flushStateValue = localStorage.getItem('flusher-flush');
			flushState = flushStateValue ? JSON.parse(flushStateValue) : false;

			const positionStateValue = localStorage.getItem('flusher-position');
			positionState = positionStateValue ? JSON.parse(positionStateValue) : 0;

			const sizeStateValue = localStorage.getItem('flusher-size');
			sizeState = sizeStateValue ? JSON.parse(sizeStateValue) : 1;

			const backgroundStateValue = localStorage.getItem('flusher-background');
			backgroundState = backgroundStateValue ? JSON.parse(backgroundStateValue) : 2;

			const spamBtn = menuHtml.querySelector('#flusher-spam');
			const spanInsideSpam = spamBtn.querySelector('span');
			spanInsideSpam.textContent = spamStates[spamState];

			spamBtn.addEventListener('click', function (event) {
				spamState = (spamState + 1) % spamStates.length;
				if (spamState === 0 && !flushState) spamState++;
				localStorage.setItem('flusher-spam', JSON.stringify(spamState));
				spanInsideSpam.textContent = spamStates[spamState];
				clearChat();
			});

			const positionBtn = layoutMenu.querySelector('#flusher-position');
			const spanInsidePosition = positionBtn.querySelector('span');
			spanInsidePosition.textContent = toTitleCase(positionStates[positionState]);

			positionBtn.addEventListener('click', function (event) {
				positionState = (positionState + 1) % positionStates.length;
				localStorage.setItem('flusher-position', JSON.stringify(positionState));
				spanInsidePosition.textContent = toTitleCase(positionStates[positionState]);
				chatFlusherMessages.setAttribute('position', positionStates[positionState].replace(/\s/g, ""));
				resetPostion();
			});

			const sizeBtn = layoutMenu.querySelector('#flusher-size');
			const sizeInsidePosition = sizeBtn.querySelector('span');
			sizeInsidePosition.textContent = toTitleCase(sizeStates[sizeState]);

			sizeBtn.addEventListener('click', function (event) {
				sizeState = (sizeState + 1) % sizeStates.length;
				localStorage.setItem('flusher-size', JSON.stringify(sizeState));
				sizeInsidePosition.textContent = toTitleCase(sizeStates[sizeState]);
				chatFlusherMessages.setAttribute('size', sizeStates[sizeState].replace(/\s/g, ""));
				resetPostion();
				setVerticalWidth();
			});

			const backgroundBtn = layoutMenu.querySelector('#flusher-background');
			const backgroundInsidePosition = backgroundBtn.querySelector('span');
			backgroundInsidePosition.textContent = toTitleCase(backgroundStates[backgroundState]);

			backgroundBtn.addEventListener('click', function (event) {
				backgroundState = (backgroundState + 1) % backgroundStates.length;
				localStorage.setItem('flusher-background', JSON.stringify(backgroundState));
				backgroundInsidePosition.textContent = toTitleCase(backgroundStates[backgroundState]);
				chatFlusherMessages.setAttribute('background', backgroundStates[backgroundState]);
				clearChat();
			});

			const baseMenu = menuHtml.querySelector('#flusher-menu-base');

			const settingsBtn = menuHtml.querySelector('#flusher-settings');
			settingsBtn.addEventListener('click', function (event) {
				settingsMenu.style.display = 'block';
				baseMenu.style.display = 'none';
			});

			const settingsBackBtn = menuHtml.querySelector('#flusher-settings-back');
			settingsBackBtn.addEventListener('click', function (event) {
				settingsMenu.style.display = 'none';
				baseMenu.style.display = 'block';
			});

			const settingsCloseBtn = menuHtml.querySelector('#flusher-settings-close');
			settingsCloseBtn.addEventListener('click', function (event) {
				menuHtml.style.display = 'none';
				settingsMenu.style.display = 'none';
				baseMenu.style.display = 'none';
			});

			const layoutCloseBtn = menuHtml.querySelector('#flusher-layout-close');
			layoutCloseBtn.addEventListener('click', function (event) {
				menuHtml.style.display = 'none';
				layoutMenu.style.display = 'none';
				baseMenu.style.display = 'none';
			});

			const layoutMenuBtn = menuHtml.querySelector('#flusher-layoutMenu');
			layoutMenuBtn.addEventListener('click', function (event) {
				layoutMenu.style.display = 'block';
				baseMenu.style.display = 'none';
			});

			const layoutBackBtn = menuHtml.querySelector('#flusher-layout-back');
			layoutBackBtn.addEventListener('click', function (event) {
				layoutMenu.style.display = 'none';
				baseMenu.style.display = 'block';
			});

			flushState ? layoutMenuBtn.style.display = 'none' : layoutMenuBtn.style.display = 'flex';

			const flusherToggle = menuHtml.querySelector('#flusher-enable .flusher-toggle');
			flusherToggle.addEventListener('click', function (event) {
				const element = event.currentTarget;
				element.classList.toggle(toggledClass);

				chatEnabled = element.classList.contains(toggledClass);

				clearChat();
				svgToggle();
				toggleEnableMenu();
				togglePointerEvents(element);

				chatFlusherMessages.setAttribute('enabled', chatEnabled);
				localStorage.setItem('flusher-enable', JSON.stringify(chatEnabled));
			});

			if (chatEnabled) flusherToggle.classList.toggle(toggledClass);

			const flushToggle = menuHtml.querySelector('#flusher-flush .flusher-toggle');
			flushToggle.addEventListener('click', function (event) {
				const element = event.currentTarget;
				element.classList.toggle(toggledClass);

				flushState = element.classList.contains(toggledClass);
				flushState ? layoutMenuBtn.style.display = 'none' : layoutMenuBtn.style.display = 'flex';

				togglePointerEvents(element);
				clearChat();
				chatFlusherMessages.setAttribute('layout', flushState ? 'horizontal' : 'vertical');
				localStorage.setItem('flusher-flush', JSON.stringify(flushState));

			});

			if (flushState) flushToggle.classList.toggle(toggledClass);

			const parent = external ? element : document.querySelector('.vjs-control-bar');
			parent.append(menuHtml);

			togglePointerEvents(element);
			createToggle(toggleHtml, element);

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
				if (id === 'flusher-layoutMenu' && flushState === true && chatEnabled) return;
				chatEnabled ? element.style.display = 'flex' : element.style.display = 'none';
			}
		});
	}

	function togglePointerEvents(element) {
		if (flushState || !chatEnabled) {
			element.classList.remove('flusher-grab');
			element.classList.add('flusher-no-grab');
			return;
		}
		lastRow = 2;
		if (spamState === 0 && !flushState) spamState = 2;
		dragElement(element);
		localStorage.setItem('flusher-spam', JSON.stringify(spamState));
		document.querySelector('#flusher-spam span').textContent = spamStates[spamState];
		element.classList.remove('flusher-no-grab');
		element.classList.add('flusher-grab');
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

		if (chatFlusherMessages === null) return;

		setInterval(() => {
			messageQueue.push(data);
			processMessageQueue();
		}, 2500);
	}

	function createChat(element) {
		if (element.hasAttribute('flusher')) return;
		/* chatFlusherMessages = 0; existingFlushers = new Set(); */
		element.setAttribute('flusher', "")

		const chatFlusher = document.createElement("div");
		chatFlusher.id = "flusher";

		const chatFlusherMessagesContainer = document.createElement("div");
		chatFlusherMessagesContainer.id = "flusher-messages";

		const shadowRoot = chatFlusher.attachShadow({ mode: 'open' });

		const metaTag = document.querySelector('meta[name="flusher-data"]');
		const dataFileURL = metaTag ? metaTag.content : '';

		const xhr = new XMLHttpRequest();
		xhr.open('GET', dataFileURL, true);
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4 && xhr.status === 200) {
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

				createMenu(parsedDocument, element);
			}
		};
		xhr.send();

		element.parentNode.insertBefore(chatFlusher, element);

		flushers.push([element, chatFlusherMessagesContainer]);
		shadowRoot.appendChild(chatFlusherMessagesContainer);
		checkResize([element, chatFlusherMessagesContainer]);
		bindRequests();
		return chatFlusherMessagesContainer;
	}

	function bindRequests(element) {
		const chatFlusherStyles = document.getElementById("flusher-css");
		if (chatFlusherStyles === null) {
			document.addEventListener('visibilitychange', function handleVisibilityChange() {
				if (document.hidden && flushState) {
					chatEnabledVisible = chatEnabled;
					chatEnabled = false;
					flushers.forEach(flusher => clearChat(flusher[1]));
				} else {
					chatEnabled = chatEnabledVisible;
				}
			});

			interceptChatRequests();
		}

		if (existingSocket === null && !external) {
			existingSocket = window.Echo.connector.pusher;
			existingSocket.connection.bind("message", boundHandleChatMessageEvent);
		}
	}

	function createToggle(toggleHtml, element) {
		const toggle = document.getElementById('flusher-toggle');
		if (toggle !== null && !external) return;
		const popupMenu = document.getElementById("flusher-menu");
		const baseMenu = document.querySelector('#flusher-menu-base');
		const existingButton = external ? element : document.querySelector('.vjs-fullscreen-control');

		const btnHtml = external ? toggleHtml.querySelector('svg') : toggleHtml;
		existingButton.parentNode.insertBefore(btnHtml, existingButton);
		svgToggle();
		btnHtml.addEventListener('click', function () {
			popupMenu.style.display === "block" ? hideMenu() : showMenu();
			function showMenu() {
				baseMenu.style.display = 'block';
				popupMenu.style.display = 'block';
				svgToggle();
				document.addEventListener('click', clickOutsideHandler);
				document.clickOutsideHandlerAdded = true;
			}
		});
	}

	function hideMenu() {
		const popupMenu = document.querySelector('#flusher-menu');
		const baseMenu = popupMenu.querySelector('#flusher-menu-base');
		const settingsMenu = popupMenu.querySelector('#flusher-menu-settings');
		const layoutMenu = popupMenu.querySelector('#flusher-menu-layout');
		popupMenu.style.display = 'none';
		settingsMenu.style.display = 'none';
		baseMenu.style.display = 'none';
		layoutMenu.style.display = 'none';
		svgToggle();
		document.removeEventListener('click', clickOutsideHandler);
	}

	function clickOutsideHandler(event) {
		const popupMenu = document.querySelector('#flusher-menu');
		const toggle = document.getElementById(external ? 'toggle-icon' : 'flusher-toggle');
		if (popupMenu !== null && !popupMenu.contains(event.target) && popupMenu.style.display === 'block') {
			if (toggle.contains(event.target) || event.target === toggle) return;
			hideMenu();
		}
	}

	function svgToggle() {
		const toggle = document.getElementById('toggle-icon').firstElementChild;
		const menuHtml = document.getElementById('flusher-menu');
		const visible = menuHtml.style.display === "block" ? true : false;
		if (toggle === null) return;
		if (chatEnabled || visible) {
			toggle.classList.add('svg-toggle');
		} else {
			toggle.classList.remove('svg-toggle');
		}
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
		if (!chatEnabled || loading) return;
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

	function selectRow(data) {
		const messageContainer = data.message;
		const messageKey = data.key;

		let selectedRow = 0;
		const positions = lastPositionPerRow.length;
		if (positions > 0) {
			for (let i = 0; i < positions; i++) {

				rowQueue[i] = rowQueue[i] ?? [];
				const item = lastPositionPerRow[i];

				if (item === undefined || item.run === true) {
					selectedRow = i;
					lastRow = selectedRow;
					break;
				}

				if (rowQueue[i].length < 2) {
					messageContainer = prepareAnimation(messageContainer, selectedRow, messageKey);
					if (messageContainer !== null)
						rowQueue[i].push({ key: messageKey, index: i, message: messageContainer });
					return;
				}

				selectedRow = i + 1;
			}
		}

		rowQueue[selectedRow] = rowQueue[selectedRow] ?? [];

		messageContainer = prepareAnimation(messageContainer, selectedRow, messageKey);
		if (messageContainer !== null) startAnimation(selectedRow, messageContainer, messageKey);
		lastRow = selectedRow;
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

	async function startAnimation(rowIndex, messageContainer, messageKey) {
		const space = 4;

		const lastItem = lastPositionPerRow[rowIndex];
		lastPositionPerRow[rowIndex] = { container: messageContainer, run: false };

		let overlap = 0;
		let messageWidth;
		const lastContainer = lastItem !== undefined ? lastItem.container : undefined;

		/* existing row */
		if (lastContainer !== undefined) {

			requestAnimationFrame(() => {
				chatFlusherMessages.appendChild(messageContainer);
				messageWidth = messageContainer.offsetWidth;
				messageContainer.style.marginRight = `-${messageWidth}px`;

				const rect1 = messageContainer.getBoundingClientRect();
				const rect2 = lastContainer.getBoundingClientRect();

				overlap = rect2.right - rect1.left;

				/* queue running */
				if (lastItem.run === false) {
					const numString = Math.abs(overlap).toString();
					const firstDigit = parseInt(numString[0], 10);
					overlap = overlap / overlap >= 10 ? firstDigit : 0;
					messageContainer.style.marginRight = `-${(messageWidth + overlap + space)}px`;
					messageContainer.classList.add('flusher-animation');
					/* firstDigit > 2 ? debouncedScroll() : null; */
				}

				/* queue ended */
				else {
					if (overlap > -8) {	/* append last queue */
						messageContainer.style.marginRight = `-${(messageWidth + overlap + space)}px`;
						messageContainer.classList.add('flusher-animation');

					} else {	/* new queue */
						messageContainer.style.marginRight = `-${(messageWidth + space)}px`;
						/* messageContainer.style.backgroundColor = "red"; */
						messageContainer.classList.add('flusher-animation');
						overlap = 0;
					}
				}

				requestNext(messageWidth, overlap, rowIndex, messageContainer, messageKey)
			});
		}

		/* new row */
		else {
			chatFlusherMessages.appendChild(messageContainer);
			messageWidth = messageContainer.offsetWidth;
			messageContainer.style.marginRight = `-${(messageWidth + space)}px`;
			messageContainer.classList.add('flusher-animation');

			overlap = 0;
			requestNext(messageWidth, overlap, rowIndex, messageContainer, messageKey);
		}

		async function requestNext(messageWidth, overlap, rowIndex, messageContainer, messageKey) {
			messageContainer.style.marginRight = `-${(messageWidth + overlap + space)}px`;
			let timeNeeded = Math.ceil((messageWidth + space + overlap) / parentWidth * 16000);

			const timeoutId = setTimeout(() => {
				checkQueue(rowIndex, messageContainer, messageKey);
				const index = timeoutIds.indexOf(timeoutId);
				if (index !== -1) {
					timeoutIds.splice(index, 1);
				}
			}, timeNeeded);

			timeoutIds.push(timeoutId);
		}

		function checkQueue(rowIndex, messageContainer, messageKey) {
			if (rowQueue[rowIndex] === undefined) return;
			const queueItem = rowQueue[rowIndex].shift();
			if (queueItem !== undefined) {
				checkRow(queueItem.message, rowIndex, messageKey);
			} else {
				lastRow = lastRow - 1;
				lastPositionPerRow[rowIndex] = { container: messageContainer, run: true };
			}
		}

		function checkRow(messageContainer, rowIndex, messageKey) {
			if ((rowIndex + 1) > lastRow) {
				for (let i = 0; i < rowIndex; i++) {
					if (lastPositionPerRow[i] === undefined || lastPositionPerRow[i].run === true) {
						if (messageContainer !== null) {
							lastPositionPerRow[rowIndex] = undefined;
							messageContainer.style.setProperty('--row', i);
							startAnimation(i, messageContainer, messageKey);
						}
						return;
					}
					if (rowQueue[i].length < 1) {
						if (messageContainer !== null) {
							lastPositionPerRow[rowIndex] = undefined;
							messageContainer.style.setProperty('--row', i);
							rowQueue[i].push({ key: messageKey, index: i, message: messageContainer });
						}
						return;
					}
				}
			}

			startAnimation(rowIndex, messageContainer, messageKey);
		}
	}

	function prepareAnimation(messageContainer, rowIndex, messageKey) {
		messageContainer.style.setProperty('--row', rowIndex);
		messageContainer.classList.add('flusher-message');
		messageContainer.addEventListener("animationend", function () {
			try {
				chatFlusherMessages.removeChild(this);
				displayedMessages.delete(messageKey);
			} catch { }
		});

		return messageContainer;
	}

	function appendMessage(messageKey, messageContainer, timestamp, videoElement, element) {
		if (videoElement === null) {
			isProcessingMessages = false;
			return;
		}

		elementQueue.push({ key: messageKey, message: messageContainer, timestamp: timestamp, element: videoElement});
		processElementQueue();
		isProcessingMessages = false;
		processMessageQueue();
	}

	async function createMessage(data, videoElement) {
		console.log(videoElement);
		const sender = data.sender;
		const username = sender.username;
		const color = sender.identity.color;
		const content = data.content;

		const reduced = spamState === 2 ? reduceRepeatedSentences(content) : content;

		const messageKeyData = getMessageKey(sender.id, reduced);
		if (messageKeyData.ignore === true) {
			isProcessingMessages = false;
			processMessageQueue();
			return;
		}
		const messageKey = messageKeyData.key;

		const messageContainer = document.createElement("div");

		const badgeSpan = document.createElement("span");
		badgeSpan.classList.add("flusher-badges");

		const badgeElements = await getBadges(data);
		badgeElements.forEach(badgeElement => {
			badgeSpan.appendChild(badgeElement.cloneNode(true));
		});

		const usernameSpan = document.createElement("span");
		usernameSpan.style.color = color;
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

		badgeSpan.firstChild ? messageContainer.append(badgeSpan) : null;
		messageContainer.append(usernameSpan, boldSpan, contentSpan);
		appendMessage(messageKey, messageContainer, data.created_at, videoElement);

		function reduceRepeatedSentences(input) {
			const regexSentence = /(\b.+?\b)\1+/g;
			const sentence = input.replace(regexSentence, '$1');
			const regexChar = /(.)(\1{10,})/g;
			return sentence.replace(regexChar, '$1$1$1$1$1$1$1$1$1$1');
		}

		function checkForBadges(data) {
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
						newImg.classList.add('flusher-badge');
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
						svgCopy.classList.add('flusher-badge');

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

	function createIntroMessage(show, element) {
		const now = new Date();
		const messageKeyData = getMessageKey(`-intro`, now.getTime());
		const messageKey = messageKeyData.key;

		const giftedContent = document.createElement("div");
		giftedContent.classList.add("flusher-message");

		const emojiSpan = document.createElement('span');
		emojiSpan.textContent = String.fromCodePoint(0x1F389) + ' ';

		const introSpan = document.createElement("span");
		introSpan.textContent = `thanks for testing (version 0.8.3)`;
		const introMessageSpan = document.createElement("span");

		introMessageSpan.append(emojiSpan, introSpan);

		giftedContent.appendChild(introMessageSpan);
		const prepared = prepareAnimation(giftedContent, 0, messageKey);
		if (show) {
			selectRow(prepared, messageKey);
		} else {
			const parent = external ? document.querySelector('iframe').parentNode : document.body;
			external ? parent.insertBefore(prepared, document.querySelector('iframe')) : parent;
			elementHeight = prepared.clientHeight;
			maxRows = Math.ceil(parentHeight / elementHeight);
			parent.removeChild(prepared);
			setVerticalWidth(element);
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

	function setVerticalWidth(element) {
		switch (sizeStates[sizeState]) {
			case 'LARGE':
				element.style.setProperty('--flusher-vertical-width', `${elementHeight * 14}px`);
				break;
			case 'NORMAL':
				element.style.setProperty('--flusher-vertical-width', `${elementHeight * 14}px`);
				break;
			case 'SMALL':
				element.style.setProperty('--flusher-vertical-width', `${elementHeight * 9}px`);
				break;
			default:
				break;
		}
	}

	initializeChat();
};