import { reset } from "../utils/resize.js";

export async function appendVertical(message, flusher) {
	if (!message) return;
	const lastItem = flusher.messages?.firstChild;

	if (flusher.props.external) {
		if (flusher.states.slide) message.container.classList.add("flusher-animation-vertical");

		const timestamp = new Date(message.created_at);
		message.container.dataset.timestamp = timestamp;
		if (lastItem) {
			const lastTimestamp = new Date(lastItem.dataset.timestamp ?? 0);
			if (timestamp < lastTimestamp) {
				flusher.messages.append(message.container);
			} else {
				let current = lastItem;
				while (current) {
					const currentTimestamp = new Date(current.dataset.timestamp);
					if (timestamp > currentTimestamp) {
						flusher.messages.insertBefore(message.container, current);
						break;
					}
					current = current.previousSibling;
				}
				if (!current) flusher.messages.insertBefore(message.container, lastItem);
			}
		} else {
			flusher.messages.append(message.container);
		}
	} else {
		if (message.container) {
			if (flusher.states.slide) message.container.classList.add("flusher-animation-vertical");
			flusher.messages['insertBefore'](message.container, lastItem);
		} else {
			if (flusher.states.slide) message.classList.add("flusher-animation-vertical");
			try {
				flusher.messages['insertBefore'](message, lastItem);
			} catch (error) {
				if (!flusher.messages) {
					reset(flusher);
				}
			}
		}
	}

	try {
		while (flusher.messages.children.length > flusher.props.maxRows) {
			const oldest = flusher.messages.lastElementChild;
			const entryId = flusher.props.isAeroKick ? oldest.querySelector('button')?.getAttribute('data-radial-id') : parseInt(oldest.getAttribute('flusher-id'), 10);
			if (entryId) {
				const observer = flusher.props.messageObservers.get(entryId);
				if (observer) {
					observer.disconnect();
					flusher.props.messageObservers.delete(entryId);
				}
			}

			if (flusher.states.spamState && entryId) {
				flusher.props.displayedMessages = flusher.props.displayedMessages.filter(message => message.id !== entryId);
			}

			oldest.remove();
		}
	} catch (error) {

	}
}