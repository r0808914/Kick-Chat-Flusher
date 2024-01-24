export function appendVertical(message) {
	const messageKey = message.key;
	const chatroomId = message.chatroom_id;
	let timestamp = message.created_at;
	timestamp = new Date(timestamp);
	message.container.classList.add('flusher-message');
	message.container.dataset.timestamp = timestamp;

	const lastItem = flusherSettings.flushers[chatroomId].flusher.firstChild;
	if (lastItem) {
		const lastTimestamp = new Date(lastItem.dataset.timestamp);

		if (timestamp < lastTimestamp) {
			flusherSettings.flushers[chatroomId].flusher.append(message.container);
		} else {
			let current = lastItem;
			while (current) {
				const currentTimestamp = new Date(current.dataset.timestamp);

				if (timestamp > currentTimestamp) {
					flusherSettings.flushers[chatroomId].flusher.insertBefore(message.container, current);
					break;
				}
				current = current.previousSibling;
			}

			if (!current) flusherSettings.flushers[chatroomId].flusher.insertBefore(message.container, flusherSettings.flushers[chatroomId].flusher.firstChild);
		}
	} else {
		flusherSettings.flushers[chatroomId].flusher.append(message.container);
	}

	while (flusherSettings.flushers[chatroomId].flusher.children.length > flusherSettings.flushers[chatroomId].maxRows) {
		flusherSettings.flushers[chatroomId].displayedMessages.delete(messageKey);
		flusherSettings.flushers[chatroomId].flusher.removeChild(flusherSettings.flushers[chatroomId].flusher.lastChild);
	}
}
