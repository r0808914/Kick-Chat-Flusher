export function dragElement(flusher) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

	flusher.container.onmousedown = function (e) {
		e = e || window.event;
		e.preventDefault();

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
		document.onmouseup = null;
		document.onmousemove = null;
		setPosition(flusher, false);
	}

	function closeResize() {
		document.onmouseup = null;
		document.onmousemove = null;
		setPosition(flusher, false);
	}

	async function setPosition(flusher, event) {
		var scaleFactor = window.innerWidth / window.outerWidth;
		var rect = flusher.container.getBoundingClientRect();

		var newPosition = {
			top: Math.round(rect.top / scaleFactor),
			left: Math.round(rect.left / scaleFactor),
			width: Math.round(flusher.container.offsetWidth / scaleFactor),
			height: Math.round(flusher.container.offsetHeight / scaleFactor)
		};

		if (event) {
			flusher.container.style.top = Math.round(newPosition.top * scaleFactor) + "px";
			flusher.container.style.left = Math.round(newPosition.left * scaleFactor) + "px";
			flusher.container.removeAttribute("position");

			flusher.container.style.width = Math.round(newPosition.width * scaleFactor) + "px";
			flusher.container.style.height = Math.round(newPosition.height * scaleFactor) + "px";
			flusher.container.removeAttribute("size");
		}

		chrome.storage.local.get("positionsPerChannel", function (result) {
			var positionsPerChannel = result.positionsPerChannel || {};
			var positionsArray = positionsPerChannel[flusher.props.channelName] || [];

			var existingPositionIndex = positionsArray.findIndex(function (item) {
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
					position: {
						top: newPosition.top,
						left: newPosition.left,
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

	}

	function isInResizeHandle(e) {
		var rect = flusher.container.getBoundingClientRect();
		var handleSize = 25;
		return (
			e.clientX >= rect.right - handleSize &&
			e.clientY >= rect.bottom - handleSize
		);
	}
}