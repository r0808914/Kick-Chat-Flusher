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
		document.onmouseup = null;
		document.onmousemove = null;
	}

	function closeResize() {
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