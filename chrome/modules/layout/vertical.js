export function appendVertical(message, flusher) {
	if (!message) return;
	const lastItem = flusher.container.firstChild;

	if (flusher.props.external) {
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
				if (!current) flusher.container.insertBefore(message.container, flusher.container.firstChild);
			}
		} else {
			flusher.container.append(message.container);
		}
	} else {
		if (lastItem) {
			flusher.container.insertBefore(message, flusher.container.firstChild);
		} else {
			flusher.container.append(message);
		}
	}

	while (flusher.container.children.length > flusher.props.maxRows) {
		const oldest = flusher.container.lastChild;
		if (flusher.states.spamState !== 1) {
			const entryId = oldest?.getAttribute('data-chat-entry');
			if(entryId)
			flusher.props.displayedMessages = flusher.props.displayedMessages.filter(message => message.id !== entryId);
		}

		oldest.remove();
	}
}