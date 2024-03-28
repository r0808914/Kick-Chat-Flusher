export function appendVertical(message, flusher) {
	if (!message) return;
	const lastItem = flusher.container.firstChild;

	if (flusher.props.external) {
		if (flusher.states.slide) message.container.classList.add("flusher-animation-vertical");

		const timestamp = new Date(message.created_at);
		message.container.dataset.timestamp = timestamp;
		if (lastItem) {
			const lastTimestamp = new Date(lastItem.dataset.timestamp ?? 0);
			if (timestamp < lastTimestamp) {
				flusher.container.append(message.container);
			} else {
				let current = lastItem;
				while (current) {
					const currentTimestamp = new Date(current.dataset.timestamp);
					if (timestamp > currentTimestamp) {
						flusher.container.insertBefore(message.container, current);
						break;
					}
					current = current.previousSibling;
				}
				if (!current) flusher.container.insertBefore(message.container, lastItem);
			}
		} else {
			flusher.container.append(message.container);
		}
	} else {
		if (message.container) {
			if (flusher.states.slide) message.container.classList.add("flusher-animation-vertical");
			flusher.container['insertBefore'](message.container, lastItem);

		} else {
			if (flusher.states.slide) message.classList.add("flusher-animation-vertical");
			flusher.container['insertBefore'](message, lastItem);
		}
	}

	while (flusher.container.children.length > flusher.props.maxRows) {
		const oldest = flusher.container.lastChild;
		const entryId = flusher.props.isAeroKick ? oldest.querySelector('button')?.getAttribute('data-radial-id') : oldest.getAttribute('data-chat-entry');
		if (entryId) {
			const observer = flusher.props.messageObservers.get(entryId);
			if (observer) {
				observer.disconnect();
				flusher.props.messageObservers.delete(entryId);
			}
		}

		if (!flusher.states.spamState && entryId) {
			flusher.props.displayedMessages = flusher.props.displayedMessages.filter(message => message.id !== entryId);
		}

		oldest.remove();
	}
}



