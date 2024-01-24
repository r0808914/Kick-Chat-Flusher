import { createMenu } from './interface/menu/menu.js';
import { checkResize } from './utils/resize.js';

import { FlusherSettings } from './utils/settings.js';

export class Flusher {
	constructor(video, domain, chatroomId) {
		this.video = video;
		this.domain = domain;
		this.chatroomId = chatroomId;
		this.flusherSettings = new FlusherSettings();
		this.create();
	 }

	create() {
      console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Create Chat');

		if (this.video.hasAttribute('flusher')) return;
		this.video.setAttribute('flusher', "")

		this.flusherSettings.external = this.domain === "KICK" ? false : true;
		if (this.flusherSettings.external) this.resetConnection();

		const chatFlusher = document.createElement("div");
		chatFlusher.classList.add("flusher");

		const flusher = document.createElement("div");
		flusher.classList.add("flusher-messages");
		flusher.setAttribute('flusher-chatroom', this.chatroomId);

		const shadowRoot = chatFlusher.attachShadow({ mode: 'open' });
		const b = typeof browser !== 'undefined' ? browser : chrome;

		const overlayStyle = document.createElement('style');
		overlayStyle.href = b.runtime.getURL('lib/flusher/main.css');
		overlayStyle.id = 'flusher-css-overlay';
		shadowRoot.appendChild(overlayStyle)

		const menuStylesDom = document.getElementById('flusher-css');
		if (!menuStylesDom) {
			const menuStyle = document.createElement('style');
			menuStyle.href = b.runtime.getURL('lib/flusher/overlay.css');
			menuStyle.id = 'flusher-css';
			document.head.appendChild(menuStyle);
		}

		const toggle = createMenu(this.flusherSettings, this.video, flusher);
		this.video.parentNode.insertBefore(chatFlusher, this.video);
		this.flusherSettings.external ? shadowRoot.appendChild(flusher) : chatFlusher.append(flusher);
		checkResize(this.video, toggle, flusher, this.flusherSettings);
	}

	static clearChat(flusher) {
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

	resetConnection() {
		if (!this.flusherSettings.flusher) return;
		clearChat(this.flusherSettings.flusher);
		isVod = false;
		if (this.flusherSettings.flusher && this.flusherSettings.resizeObserver) {
			this.flusherSettings.resizeObserver.disconnect();
		}
	}
}