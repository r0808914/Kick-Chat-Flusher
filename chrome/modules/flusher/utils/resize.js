import { toggleEnableMenu } from "../interface/menu/menu.js";
import { getMessageKey, processMessageQueue } from "../queue/queue.js"
import { FlusherMessageProvider} from '../utils/messages.js';

export function checkResize(element, toggle, flusher,flusherSettings) {
   console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Check Resize');

	const id = flusher.getAttribute('flusher-chatroom');
	flusherSettings.resizeTimer = null;
	if (flusherSettings.resizeObserver) flusherSettings.resizeObserver.disconnect();
	flusherSettings.resizeObserver = new ResizeObserver(entries => {
		if (flusher !== null)
			flusher.style.display = 'none';

		for (let entry of entries) {
			if (flusherSettings.resizeTimer) clearTimeout(flusherSettings.resizeTimer);
			flusherSettings.resizeTimer = setTimeout(() => {
				for (let entry of entries) {

					const { width, height } = entry.contentRect;
					window.currentUrl = window.location.href;

					if ((width === null || width === 0) && flusherSettings.parentWidth) {
						if (!isVod && !flusherSettings.external) nativeChatObserver.disconnect();
						if (flusher !== null) {
							console.log('remove chat');
							flusher.remove();
							element.removeAttribute('flusher');
							if (!flusherSettings.external);
							initializeChat();
							return;
						}
					}

					const oldWidth = flusherSettings.parentWidth;
					flusherSettings.parentWidth = Math.trunc(width) * 2;
					flusherSettings.parentHeight = Math.trunc(height);

					flusher.style.setProperty('--flusher-width', `-${flusherSettings.parentWidth}px`);
					toggle.setAttribute('flusherSettings.domain', flusherSettings.domain);

					const newFlushState = flusherSettings.flushState !== undefined ? (flusherSettings.flushState ? 'horizontal' : 'vertical') : (flusherSettings.flushState ? 'horizontal' : 'vertical');

					flusher.setAttribute('layout', newFlushState);
					flusher.setAttribute('enabled', flusherSettings.chatEnabled !== undefined ? flusherSettings.chatEnabled : flusherSettings.chatEnabled);
					flusher.setAttribute('position', flusherSettings.position !== undefined ? flusherSettings.position : flusherSettings.positionStates[flusherSettings.positionState].replace(/\s/g, ""));
					flusher.setAttribute('size', flusherSettings.size !== undefined ? flusherSettings.size : flusherSettings.sizeStates[flusherSettings.sizeState].replace(/\s/g, ""));
					flusher.setAttribute('background', flusherSettings.background !== undefined ? flusherSettings.background : flusherSettings.backgroundStates[flusherSettings.backgroundState]);

					toggleEnableMenu();

					const documentWidth = document.documentElement.clientWidth;
					if (documentWidth < ((flusherSettings.parentWidth / 2) + 10)) {
						flusherSettings.isFullscreen = true;
						flusherSettings.scrolling = false;
						debouncedScroll();
						flusherSettings.intervalScroll = setInterval(debouncedScroll, 10000);
					} else {
						flusherSettings.isFullscreen = false;
						if (flusherSettings.intervalScroll !== null) {
							clearInterval(flusherSettings.intervalScroll);
							flusherSettings.intervalScroll = null;
						}
					}

					flusherSettings.elementHeight = null;
					flusher.style.display = 'flex';
					createIntroMessage(false, flusher, flusherSettings);

					if (oldWidth == null || oldWidth == 0) {
						if (element === null) return;
						/* test(); */
						/* if (chatEnabled && flushState) createIntroMessage(true); */
						flusherSettings.isVod = window.location.href.includes('/video/');
						let channelName = flusherSettings.external ? element.parentNode.querySelector('.iframe-lbl-div.notranslate') : document.querySelector('.stream-username');
						flusherSettings.channelName = channelName !== null ? channelName.textContent : '';

						if (!flusherSettings.external) FlusherMessageProvider.bindRequests(flusherSettings, flusher);

						flusherSettings.loading = false;
						processMessageQueue();

						/* setTimeout(function () {
							const iframe = document.querySelector(`iframe`);
							const shadowRoot = iframe.shadowRoot;
							const button = shadowRoot.querySelector('button[aria-label="Mute/Unmute"]');
							const clonedButton = button.cloneNode(true);
							button.parentNode.insertBefore(clonedButton, button.nextSibling);								
						}, 5000); */

						console.info(`Kick Chat Flusher (${flusherSettings.channelName} ${flusherSettings.domain} ${isVod ? 'VOD' : 'LIVE'}): Report bugs or collaborate at https://github.com/r0808914/Kick-Chat-Flusher`);
					} else {
						flusherSettings.flushState ? clearChat(flusher) : resetPostion(flusher);
					}
				}
			}, 750);
		}
	});

	flusherSettings.resizeObserver.observe(element);

	function createIntroMessage(show, flusher, flusherSettings) {
		const id = flusher.getAttribute('flusher-chatroom');
		const now = new Date();
		const messageKeyData = getMessageKey(`-intro`, now.getTime(), id, flusherSettings);
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
			const parent = flusherSettings.external ? flusher : document.body;
			parent.append(introContent);
			flusherSettings.elementHeight = introContent.clientHeight;
			flusherSettings.maxRows = Math.ceil(flusherSettings.parentHeight / flusherSettings.elementHeight);
			parent.removeChild(introContent);
			setVerticalWidth(flusher, flusherSettings);
		}

		function setVerticalWidth(flusher, flusherSettings) {
			const elementHeight = flusherSettings.elementHeight;
			switch (flusherSettings.sizeStates[flusherSettings.sizeState]) {
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
	}
}


/* do every 10 sec scroll if fullscreen to do */
export function debouncedScroll() {
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