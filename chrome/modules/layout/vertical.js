export function appendVertical(message, flusher) {
	if(!message) return;
	const lastItem = flusher.container.firstChild;

	if (flusher.props.external) {
		const timestamp = message.created_at;
		timestamp = new Date(timestamp);
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
						flusher.container.insertBefore(flusher.container, current);
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
		flusher.container.removeChild(flusher.container.lastChild);
	}
}
