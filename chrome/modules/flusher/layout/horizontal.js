export function selectRow(message) {
	const chatroom_id = message.chatroom_id;

	let selectedRow = 0;
	const positions = flusherSettings.flushers[chatroom_id]?.lastPositionPerRow?.length ?? 0;
	if (positions > 0) {
		for (let i = 0; i < positions; i++) {

			const item = flusherSettings.flushers[chatroom_id].lastPositionPerRow[i];

			if (item === undefined || item.run === true) {
				selectedRow = i;
				flusherSettings.flushers[chatroom_id].lastRow = selectedRow;
				break;
			}

			if (flusherSettings.flushers[chatroom_id].rowQueue[i].length < 2) {
				message.row = i;
				message = prepareAnimation(message);
				if (message !== null) flusherSettings.flushers[chatroom_id].rowQueue[i].push(message);
				return;
			}

			selectedRow = i + 1;
		}
	}

	message.row = selectedRow;
	if (!flusherSettings.flushers[chatroom_id].rowQueue) flusherSettings.flushers[chatroom_id].rowQueue = [];
	flusherSettings.flushers[chatroom_id].rowQueue[selectedRow] = flusherSettings.flushers[chatroom_id].rowQueue[selectedRow] ?? [];

	message = prepareAnimation(message);
	if (message !== null) startAnimation(message);
	flusherSettings.flushers[chatroom_id].lastRow = selectedRow;
}

export async function startAnimation(messageData) {
	const message = messageData.container;
	const id = messageData.chatroom_id;
	const space = 4;
	const rowIndex = messageData.row;

	const lastItem = flusherSettings.flushers[id]?.lastPositionPerRow?.[rowIndex];
	!flusherSettings.flushers[id].lastPositionPerRow ? flusherSettings.flushers[messageData.chatroom_id].lastPositionPerRow = [] : null;
	flusherSettings.flushers[id].lastPositionPerRow[rowIndex] = { container: message, run: false };

	let overlap = 0;
	let messageWidth;
	const lastContainer = lastItem !== undefined ? lastItem.container : undefined;

	/* existing row */
	if (lastContainer !== undefined) {

		requestAnimationFrame(() => {
			flusherSettings.flushers[id].flusher.appendChild(message);
			messageWidth = message.offsetWidth;
			message.style.marginRight = `-${messageWidth}px`;

			const rect1 = message.getBoundingClientRect();
			const rect2 = lastContainer.getBoundingClientRect();

			overlap = rect2.right - rect1.left;

			/* queue running */
			if (lastItem.run === false) {
				const numString = Math.abs(overlap).toString();
				const firstDigit = parseInt(numString[0], 10);
				overlap = overlap / overlap >= 10 ? firstDigit : 0;
				message.style.marginRight = `-${(messageWidth + overlap + space)}px`;
				message.classList.add('flusher-animation');
				/* firstDigit > 2 ? debouncedScroll() : null; */
			}

			/* queue ended */
			else {
				if (overlap > -8) {	/* append last queue */
					message.style.marginRight = `-${(messageWidth + overlap + space)}px`;
					message.classList.add('flusher-animation');

				} else {	/* new queue */
					message.style.marginRight = `-${(messageWidth + space)}px`;
					/* message.style.backgroundColor = "red"; */
					message.classList.add('flusher-animation');
					overlap = 0;
				}
			}

			requestNext(messageWidth, overlap, messageData);
		});
	}

	/* new row */
	else {
		flusherSettings.flushers[id].flusher.appendChild(message);
		messageWidth = message.offsetWidth;
		message.style.marginRight = `-${(messageWidth + space)}px`;
		message.classList.add('flusher-animation');

		overlap = 0;
		requestNext(messageWidth, overlap, messageData);
	}

	async function requestNext(messageWidth, overlap, messageData) {
		messageData.container.style.marginRight = `-${(messageWidth + overlap + space)}px`;
		let timeNeeded = Math.ceil((messageWidth + space + overlap) / flusherSettings.flushers[id].parentWidth * 16000);

		const timeoutId = setTimeout(() => {
			checkQueue(messageData);
			const index = timeoutIds.indexOf(timeoutId);
			if (index !== -1) {
				timeoutIds.splice(index, 1);
			}
		}, timeNeeded);

		timeoutIds.push(timeoutId);
	}

	function checkQueue(messageData) {
		const id = messageData.chatroom_id;
		const index = messageData.row;
		const queueItem = flusherSettings.flushers[id].rowQueue[index].shift();
		if (queueItem !== undefined) {
			checkRow(queueItem, index);
		} else {
			flusherSettings.flushers[id].lastRow = flusherSettings.flushers[id].lastRow - 1;
			flusherSettings.flushers[id].lastPositionPerRow[index] = { container: messageData.container, run: true };
		}
	}

	function checkRow(messageData, rowIndex) {
		const id = messageData.chatroom_id;
		if ((rowIndex + 1) > flusherSettings.flushers[id].lastRow) {
			for (let i = 0; i < rowIndex; i++) {
				if (flusherSettings.flushers[id].lastPositionPerRow[i] === undefined || flusherSettings.flushers[id].lastPositionPerRow[i].run === true) {
					if (messageData.message !== null) {
						flusherSettings.flushers[id].lastPositionPerRow[rowIndex] = undefined;
						messageData.container.style.setProperty('--row', i);
						startAnimation(messageData);
					}
					return;
				}
				if (flusherSettings.flushers[id].rowQueue[i].length < 1) {
					if (messageData.container !== null) {
						flusherSettings.flushers[id].lastPositionPerRow[rowIndex] = undefined;
						messageData.container.style.setProperty('--row', i);
						flusherSettings.flushers[id].rowQueue[i].push(messageData);
					}
					return;
				}
			}
		}

		startAnimation(messageData);
	}
}

export function prepareAnimation(data) {
	data.container.style.setProperty('--row', data.row);
	data.container.classList.add('flusher-message');
	data.container.addEventListener("animationend", function () {
		try {
			flusherSettings.flushers[data.chatroom_id].flusher.removeChild(this);
			flusherSettings.flushers[data.chatroom_id].displayedMessages.delete(data.key);
		} catch { }
	});

	return data;
}