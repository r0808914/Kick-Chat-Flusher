export function dragElement(elmnt) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	var isResizing = false;

	elmnt.onmousedown = function (e) {
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

		elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
		elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
	}

	function resizeElement(e) {
		e = e || window.event;
		e.preventDefault();
		elmnt.style.width = (elmnt.offsetWidth - (pos3 - e.clientX)) + "px";
		elmnt.style.height = (elmnt.offsetHeight - (pos4 - e.clientY)) + "px";
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
		var rect = elmnt.getBoundingClientRect();
		var handleSize = 10;
		return (
			e.clientX >= rect.right - handleSize &&
			e.clientY >= rect.bottom - handleSize
		);
	}
}