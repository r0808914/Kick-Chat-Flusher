export function selectRow(message, flusher) {
	let selectedRow = 0;
	const positions = flusher.props.lastPositionPerRow.length ?? 0;
	if (positions > 0) {
		for (let i = 0; i < positions; i++) {

			const item = flusher.props.lastPositionPerRow[i];

			if (item === undefined || item.run === true) {
				selectedRow = i;
				flusher.props.lastRow = selectedRow;
				break;
			}

			if (flusher.props.rowQueue[i].length < 2) {
				message.row = i;
				message = prepareAnimation(message, flusher);
				if (message !== null) flusher.props.rowQueue[i].push(message);
				return;
			}

			selectedRow = i + 1;
		}
	}

	message.row = selectedRow;

	flusher.props.rowQueue[selectedRow] = flusher.props.rowQueue[selectedRow] ?? [];

	message = prepareAnimation(message, flusher);
	if (message !== null) startAnimation(message, flusher);
	flusher.props.lastRow = selectedRow;
}

async function startAnimation(messageData, flusher) {
	const message = messageData.container;
	const space = 4;
	const rowIndex = messageData.row;

	const lastItem = flusher.props.lastPositionPerRow?.[rowIndex];
	!flusher.props.lastPositionPerRow ? flusher.props.lastPositionPerRow = [] : null;
	flusher.props.lastPositionPerRow[rowIndex] = { container: message, run: false };

	let overlap = 0;
	let messageWidth;
	const lastContainer = lastItem !== undefined ? lastItem.container : undefined;

	/* existing row */
	if (lastContainer !== undefined) {

		requestAnimationFrame(() => {
			flusher.container.appendChild(message);
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

			requestNext(messageWidth, overlap, messageData, flusher);
		});
	}

	/* new row */
	else {
		flusher.container.appendChild(message);
		messageWidth = message.offsetWidth;
		message.style.marginRight = `-${(messageWidth + space)}px`;
		message.classList.add('flusher-animation');

		overlap = 0;
		requestNext(messageWidth, overlap, messageData, flusher);
	}

	async function requestNext(messageWidth, overlap, messageData, flusher) {
		let timeNeeded = Math.ceil((messageWidth + space + overlap) / flusher.props.parentWidth * 16000);

		const timeoutId = setTimeout(() => {
			checkQueue(messageData, flusher);
			const index = flusher.props.timeoutIds.indexOf(timeoutId);
			if (index !== -1) {
				flusher.props.timeoutIds.splice(index, 1);
			}
		}, timeNeeded);

		flusher.props.timeoutIds.push(timeoutId);
	}

	function checkQueue(messageData, flusher) {
		const index = messageData.row;
		const queueItem = flusher.props.rowQueue[index].shift();
		if (queueItem !== undefined) {
			checkRow(queueItem, index, flusher);
		} else {
			flusher.props.lastRow = flusher.props.lastRow - 1;
			flusher.props.lastPositionPerRow[index] = { container: messageData.container, run: true };
		}
	}

	function checkRow(messageData, rowIndex, flusher) {
		if ((rowIndex + 1) > flusher.props.lastRow) {
			for (let i = 0; i < rowIndex; i++) {
				if (flusher.props.lastPositionPerRow[i] === undefined || flusher.props.lastPositionPerRow[i].run === true) {
					if (messageData.message !== null) {
						flusher.props.lastPositionPerRow[rowIndex] = undefined;
						messageData.container.style.setProperty('--row', i);
						messageData.container.classList.add('flusher-green');

						startAnimation(messageData, flusher);
					}
					return;
				}
				if (flusher.props.rowQueue[i].length < 1) {
					if (messageData.container !== null) {
						flusher.props.lastPositionPerRow[i] = undefined;
						messageData.container.style.setProperty('--row', i);
						flusher.props.rowQueue[i].push(messageData);
					}
					return;
				}
			}
		}

		startAnimation(messageData, flusher);
	}
}

function prepareAnimation(data, flusher) {
	if (!data.container) {
		const newDiv = document.createElement('div');
		data.container = data;
	}

	flusher.props.external ? data.container.classList.add('flusher-message') : data.container.classList.add('flusher-kick');

	data.container.style.setProperty('--row', data.row);
	data.container.addEventListener("animationend", function () {
		try {
			const oldest = flusher.container.firstChild;
			if (flusher.states.spamState !== 1) {
				const entryId = oldest?.getAttribute('data-chat-entry');
				if(entryId)
				flusher.props.displayedMessages = flusher.props.displayedMessages.filter(message => message.id !== entryId);
			}
			oldest.remove();
		} catch { }
	});

	return data;
}