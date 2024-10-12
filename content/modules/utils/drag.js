function throttle(fn, videoRect, wait) {
	let lastTime = 0;
	return function (...args) {
		const now = new Date().getTime();
		if (now - lastTime >= wait) {
			lastTime = now;
			fn(...args, videoRect);
		}
	};
}

export function dragElement(flusher) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	var offsetX = 0, offsetY = 0;
	var lastValidX = 0, lastValidY = 0;

	// Event listener for starting the drag or resize process
	flusher.container.onmousedown = function (e) {
		e = e || window.event;
		e.preventDefault();

		const videoRect = flusher.video.getBoundingClientRect();

		// Calculate initial offset between click position and container's position
		offsetX = e.clientX - flusher.container.getBoundingClientRect().left;
		offsetY = e.clientY - flusher.container.getBoundingClientRect().top;

		setPosition(flusher, true);

		if (isInResizeHandle(e)) {
			pos3 = e.clientX;
			pos4 = e.clientY;
			document.onmouseup = closeResize;
			document.onmousemove = resizeElement;
		} else {
			pos3 = e.clientX;
			pos4 = e.clientY;
			document.onmouseup = closeDragElement;
			document.onmousemove = throttle(dragElement, videoRect, 16);
		}
	};

	function closeResize() {
		document.onmouseup = null;
		document.onmousemove = null;
		setPosition(flusher, false);
	}

	// Function to handle dragging of the container
	function dragElement(e, videoRect) {
		e = e || window.event;
		e.preventDefault();

		// Calculate new mouse position deltas
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;

		// Update the position based on the offset and videoRect
		lastValidX = pos3 - offsetX - videoRect.left;
		lastValidY = pos4 - offsetY - videoRect.top;

		requestAnimationFrame(() => {
			flusher.container.style.top = lastValidY + "px";
			flusher.container.style.left = lastValidX + "px";
		});
	}

	function closeDragElement() {
		document.onmouseup = null;
		document.onmousemove = null;

		// Make sure the element is set to the last valid position
		requestAnimationFrame(() => {
			flusher.container.style.top = lastValidY + "px";
			flusher.container.style.left = lastValidX + "px";
		});

		setPosition(flusher, false);
	}

	function resizeElement(e) {
		e = e || window.event;
		e.preventDefault();
		// Update the width and height of the container based on mouse movement
		flusher.container.style.width = (flusher.container.offsetWidth - (pos3 - e.clientX)) + "px";
		flusher.container.style.height = (flusher.container.offsetHeight - (pos4 - e.clientY)) + "px";
		pos3 = e.clientX;
		pos4 = e.clientY;
	}

	function isInResizeHandle(e) {
		var rect = flusher.container.getBoundingClientRect();
		var handleSize = 25;
		// Check if the click is within the bottom-right corner of the container
		return (
			e.clientX >= rect.right - handleSize &&
			e.clientY >= rect.bottom - handleSize
		);
	}

	async function setPosition(flusher, event) {
		const scaleFactor = window.innerWidth / window.outerWidth;
		const rect = flusher.container.getBoundingClientRect();
		const rectVideo = flusher.video.getBoundingClientRect();

		// Calculate new position values relative to the video element
		const newPosition = {
			top: Math.round(rect.top - rectVideo.top) / scaleFactor,
			left: Math.round(rect.left - rectVideo.left) / scaleFactor,
			width: Math.round(rect.width) / scaleFactor,
			height: Math.round(rect.height) / scaleFactor
		};

		chrome.storage.local.get("positionsPerChannel", function (result) {
			const positionsPerChannel = result.positionsPerChannel || {};
			const positionsArray = positionsPerChannel[flusher.props.channelName] || [];

			// Check if a position for the current video size already exists
			const existingPositionIndex = positionsArray.findIndex(function (item) {
				return item.videoSize === flusher.props.videoSize;
			});

			// Update or add the new position data
			if (existingPositionIndex !== -1) {
				positionsArray[existingPositionIndex].position.top = newPosition.top;
				positionsArray[existingPositionIndex].position.left = newPosition.left;
				positionsArray[existingPositionIndex].position.width = newPosition.width;
				positionsArray[existingPositionIndex].position.height = newPosition.height;
			} else {
				positionsArray.push({
					videoSize: flusher.props.videoSize,
					position: newPosition
				});
			}

			// Save the updated positions back to local storage
			positionsPerChannel[flusher.props.channelName] = positionsArray;
			chrome.storage.local.set({ "positionsPerChannel": positionsPerChannel });
		});
	}
}