import { toggleEnableMenu } from "../interface/menu/menu.js";
import { getMessageKey, processMessageQueue } from "../queue/queue.js"
import { FlusherMessageProvider } from '../flusher/messages.js';
import Kick from '../site/kick.js';

export function checkResize(flusher) {
	console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Check Resize');

	flusher.resizeTimer = null;
	if (flusher.resizeObserver) flusher.resizeObserver.disconnect();
	flusher.resizeObserver = new ResizeObserver(entries => {
		if (flusher.container !== null)
			flusher.container.style.display = 'none';

		for (let entry of entries) {
			if (flusher.resizeTimer) clearTimeout(flusher.resizeTimer);
			flusher.resizeTimer = setTimeout(() => {
				for (let entry of entries) {

					const { width, height } = entry.contentRect;
					window.currentUrl = window.location.href;

					if ((width === null || width === 0) && flusher.props.parentWidth) {
						if (!flusher.props.isVod && !flusher.props.external) FlusherMessageProvider.unbindRequests();
						if (flusher !== null) {
							console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Remove Chat');
							if (!flusher.props.external) Kick.init();
							flusher = null;
							return;
						}
					}

					if(!width || width === 0 || !height || height === 0) return;

					const oldWidth = flusher.props.parentWidth;
					flusher.props.parentWidth = Math.trunc(width) * 2;
					flusher.props.parentHeight = Math.trunc(height);

					flusher.container.style.setProperty('--flusher-width', `-${flusher.props.parentWidth}px`);
					flusher.toggle.setAttribute('flusher.props.domain', flusher.props.domain);

					const newFlushState = flusher.props.flushState !== undefined ? (flusher.props.flushState ? 'horizontal' : 'vertical') : (flusher.props.flushState ? 'horizontal' : 'vertical');

					flusher.container.setAttribute('layout', newFlushState);
					flusher.container.setAttribute('enabled', flusher.props.chatEnabled !== undefined ? flusher.props.chatEnabled : flusher.props.chatEnabled);
					flusher.container.setAttribute('position', flusher.props.position !== undefined ? flusher.props.position : flusher.states.positionStates[flusher.states.positionState].replace(/\s/g, ""));
					flusher.container.setAttribute('size', flusher.props.size !== undefined ? flusher.props.size : flusher.states.sizeStates[flusher.states.sizeState].replace(/\s/g, ""));
					flusher.container.setAttribute('background', flusher.props.background !== undefined ? flusher.props.background : flusher.states.backgroundStates[flusher.states.backgroundState]);

					toggleEnableMenu();

					const documentWidth = document.documentElement.clientWidth;
					if (documentWidth < ((flusher.props.parentWidth / 2) + 10)) {
						flusher.props.isFullscreen = true;
						flusher.props.scrolling = false;
						debouncedScroll(flusher);
						flusher.props.intervalScroll = setInterval(debouncedScroll, 10000);
					} else {
						flusher.props.isFullscreen = false;
						if (flusher.props.intervalScroll !== null) {
							clearInterval(flusher.props.intervalScroll);
							flusher.props.intervalScroll = null;
						}
					}

					flusher.props.elementHeight = null;
					flusher.container.style.display = 'flex';
					createIntroMessage(false, flusher);

					if (oldWidth == null || oldWidth == 0) {
						if (flusher.container === null) return;
						/* test(); */
						/* if (chatEnabled && flushState) createIntroMessage(true); */
						flusher.props.isVod = window.location.href.includes('/video/');
						let channelName = flusher.props.external ? flusher.container.parentNode.querySelector('.iframe-lbl-div.notranslate') : document.querySelector('.stream-username');
						flusher.props.channelName = channelName !== null ? channelName.textContent : '';

						if (!flusher.props.external) FlusherMessageProvider.bindRequests(flusher);

						flusher.props.loading = false;
						processMessageQueue(flusher);

						console.info(`\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m (${flusher.props.channelName} ${flusher.props.domain} ${flusher.props.isVod ? 'VOD' : 'LIVE'}): Report bugs or collaborate at https://github.com/r0808914/Kick-Chat-Flusher`);
					} else {
						flusher.props.flushState ? flusher.clear() : flusher.resetPosition();
					}
				}
			}, 750);
		}
	});

	flusher.resizeObserver.observe(flusher.video);

	function createIntroMessage(show, flusher) {
		const now = new Date();
		const messageKeyData = getMessageKey(`-intro`, now.getTime(), flusher);
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
			const parent = flusher.props.external ? flusher : document.body;
			parent.append(introContent);
			flusher.props.elementHeight = introContent.clientHeight;
			flusher.props.maxRows = Math.ceil(flusher.props.parentHeight / flusher.props.elementHeight);
			parent.removeChild(introContent);
			flusher.setVerticalWidth();
		}
	}
}

/* do every 10 sec scroll if fullscreen to do */
export function debouncedScroll(flusher) {
	if (flusher.props?.scrolling === true) return;
	flusher.props.scrolling = true;

	const chatBtn = document.querySelector('#chatroom .justify-center.absolute');
	const chatContainer = document.querySelector('#chatroom [data-chat-entry]');
	if (flusher.props.isFullscreen && !flusher.props.isVod) {
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
		flusher.props.scrolling = false;
	}, 5000);

	flusher.props.timeoutIds.push(timeoutId);
}