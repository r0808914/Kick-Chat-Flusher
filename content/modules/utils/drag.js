export function dragElement(flusher) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	var isResizing = false;

	flusher.container.onmousedown = function (e) {
		e = e || window.event;
		e.preventDefault();

		if (isInResizeHandle(e)) {
			isResizing = true;
			pos3 = e.clientX;
			pos4 = e.clientY;
			document.onmouseup = closeResize;
			document.onmousemove = resizeElement;
		} else {
			pos3 = e.clientX;
			pos4 = e.clientY;
			document.onmouseup = closeDragElement;
			document.onmousemove = dragElement;
		}
	};

	function dragElement(e) {
		e = e || window.event;
		e.preventDefault();
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;

		flusher.container.style.top = (flusher.container.offsetTop - pos2) + "px";
		flusher.container.style.left = (flusher.container.offsetLeft - pos1) + "px";
	}

	function resizeElement(e) {
		e = e || window.event;
		e.preventDefault();
		flusher.container.style.width = (flusher.container.offsetWidth - (pos3 - e.clientX)) + "px";
		flusher.container.style.height = (flusher.container.offsetHeight - (pos4 - e.clientY)) + "px";
		pos3 = e.clientX;
		pos4 = e.clientY;
	}

	function closeDragElement() {
		var scaleFactor = window.innerWidth / window.outerWidth;

		var newPosition = {
			top: flusher.container.offsetTop / scaleFactor,
			left: flusher.container.offsetLeft / scaleFactor,
		};

		chrome.storage.local.get("positionsPerChannel", function (result) {
			var positionsPerChannel = result.positionsPerChannel || {};

			var positionsArray = positionsPerChannel[flusher.props.channelName] || [];

			var existingPositionIndex = positionsArray.findIndex(function (item) {
				return item.videoSize === flusher.props.videoSize;
			});

			if (existingPositionIndex !== -1) {
				positionsArray[existingPositionIndex].position.top = newPosition.top;
				positionsArray[existingPositionIndex].position.left = newPosition.left;
			} else {
				positionsArray.push({
					videoSize: flusher.props.videoSize,
					position: {
						top: newPosition.top,
						left: newPosition.left
					}
				});
			}

			positionsPerChannel[flusher.props.channelName] = positionsArray;

			chrome.storage.local.set({ "positionsPerChannel": positionsPerChannel }, function () {
				/* console.log("positionsPerChannel:", positionsPerChannel); */
			});
		});

		document.onmouseup = null;
		document.onmousemove = null;
	}

	function closeResize() {
		var scaleFactor = window.innerWidth / window.outerWidth;

		var newPosition = {
			width: flusher.container.offsetWidth / scaleFactor,
			height: flusher.container.offsetHeight / scaleFactor
		};

		chrome.storage.local.get("positionsPerChannel", function (result) {
			var positionsPerChannel = result.positionsPerChannel || {};
			var positionsArray = positionsPerChannel[flusher.props.channelName] || [];

			var existingPositionIndex = positionsArray.findIndex(function (item) {
				return item.videoSize === flusher.props.videoSize;
			});

			if (existingPositionIndex !== -1) {
				positionsArray[existingPositionIndex].position.width = newPosition.width;
				positionsArray[existingPositionIndex].position.height = newPosition.height;
			} else {
				positionsArray.push({
					videoSize: flusher.props.videoSize,
					position: {
						width: newPosition.width,
						height: newPosition.height
					}
				});
			}

			positionsPerChannel[flusher.props.channelName] = positionsArray;

			chrome.storage.local.set({ "positionsPerChannel": positionsPerChannel }, function () {
				/* console.log("positionsPerChannel:", positionsPerChannel); */
			});
		});

		isResizing = false;
		document.onmouseup = null;
		document.onmousemove = null;
	}

	function isInResizeHandle(e) {
		var rect = flusher.container.getBoundingClientRect();
		var handleSize = 10;
		return (
			e.clientX >= rect.right - handleSize &&
			e.clientY >= rect.bottom - handleSize
		);
	}
}