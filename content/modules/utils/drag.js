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
	let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	let offsetX = 0, offsetY = 0;
	let lastValidX = 0, lastValidY = 0;

	flusher.container.onmousedown = function (e) {
		e = e || window.event;
		e.preventDefault();

		const videoRect = flusher.video.getBoundingClientRect();
		const containerRect = flusher.container.getBoundingClientRect();

		offsetX = e.clientX - containerRect.left;
		offsetY = e.clientY - containerRect.top;

		pos3 = e.clientX;
		pos4 = e.clientY;

		if (isInResizeHandle(e)) {
			setInitialDimensions(flusher);
			flusher.container.removeAttribute("size");
			document.onmouseup = closeResize;
			document.onmousemove = resizeElement;
		} else {
			setInitialPosition(flusher, videoRect, containerRect);
			flusher.container.removeAttribute("position");
			document.onmouseup = closeDragElement;
			document.onmousemove = throttle(dragElement, videoRect, 16);
		}

		function setInitialPosition(flusher, videoRect, containerRect) {
			const offsetTop = containerRect.top - videoRect.top;
			const offsetLeft = containerRect.left - videoRect.left;

			flusher.container.style.top = offsetTop + "px";
			flusher.container.style.left = offsetLeft + "px";
		}

		function setInitialDimensions(flusher) {
			flusher.container.style.width = flusher.container.offsetWidth + "px";
			flusher.container.style.height = flusher.container.offsetHeight + "px";
		}
	};

	function closeResize() {
		document.onmouseup = null;
		document.onmousemove = null;
		setPosition(flusher, false);
	}

	function dragElement(e, videoRect) {
		e = e || window.event;
		e.preventDefault();

		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;

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

		requestAnimationFrame(() => {
			flusher.container.style.top = lastValidY + "px";
			flusher.container.style.left = lastValidX + "px";
		});

		setPosition(flusher, false);
	}

	function resizeElement(e) {
		e = e || window.event;
		e.preventDefault();
		flusher.container.style.width = (flusher.container.offsetWidth - (pos3 - e.clientX)) + "px";
		flusher.container.style.height = (flusher.container.offsetHeight - (pos4 - e.clientY)) + "px";
		pos3 = e.clientX;
		pos4 = e.clientY;
	}

	function isInResizeHandle(e) {
		var rect = flusher.container.getBoundingClientRect();
		var handleSize = 25;
		return (
			e.clientX >= rect.right - handleSize &&
			e.clientY >= rect.bottom - handleSize
		);
	}

	async function setPosition(flusher, event) {
		const scaleFactor = window.innerWidth / window.outerWidth;
		const rect = flusher.container.getBoundingClientRect();
		const rectVideo = flusher.video.getBoundingClientRect();

		const newPosition = {
			top: Math.round(rect.top - rectVideo.top) / scaleFactor,
			left: Math.round(rect.left - rectVideo.left) / scaleFactor,
			width: Math.round(rect.width) / scaleFactor,
			height: Math.round(rect.height) / scaleFactor
		};

		chrome.storage.local.get("positionsPerChannel", function (result) {
			const positionsPerChannel = result.positionsPerChannel || {};
			const positionsArray = positionsPerChannel[flusher.props.channelName] || [];

			const existingPositionIndex = positionsArray.findIndex(function (item) {
				return item.videoSize === flusher.props.videoSize;
			});

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

			positionsPerChannel[flusher.props.channelName] = positionsArray;
			chrome.storage.local.set({ "positionsPerChannel": positionsPerChannel });
		});
	}
}