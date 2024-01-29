import { FlusherStates } from './states.js';
import { FlusherProps } from './props.js';
import { FlusherMessages } from './messages.js';
import { visibilityChange } from "../utils/utils.js";

import Badges from '../utils/badges.js';

export class Flusher {
	constructor(video, domain, chatroomId) {
		this.video = video;
		this.states = new FlusherStates();
		this.props = new FlusherProps();
		this.provider = new FlusherMessages();
		this.badges = new Badges().badgeTypeToSVG;
		this.props.domain = domain;
		this.props.chatroomId = chatroomId;
		this.props.external = domain === 'KICK' ? false : true;
		visibilityChange(this);
	}

	resetConnection() {
		console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Reset Connection');

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

		const isEnabled = this.props.chatEnabled;
		this.props.chatEnabled = false;

		this.props.elementQueue.length = 0;
		this.props.messageQueue.length = 0;
		this.props.lastRow = 0;
		for (const id of this.props.timeoutIds) {
			clearTimeout(id);
		}

		this.props.scrolling = false;

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

		this.props.chatEnabled = isEnabled;

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