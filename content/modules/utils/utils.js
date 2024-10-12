export function visibilityChange(flusher) {
	document.addEventListener('visibilitychange', function handleVisibilityChange() {
		if (!flusher) return;
		if (document.hidden) {
			if (flusher.container !== null) flusher.container.style.display = "none";

			flusher.clear();

			if (flusher.states.flushState) {
				flusher.props.chatEnabledVisible = flusher.states.chatEnabled;
				flusher.states.chatEnabled = false;
			} else {
				flusher.provider.unbindRequests(flusher);
			}
		} else {
			if (flusher.container !== null) flusher.container.style.display = "flex";

			if (flusher.states.flushState) {
				flusher.states.chatEnabled = flusher.props.chatEnabledVisible;
			} else {
				flusher.provider.bindRequests(flusher);
			}
		}
	});
}

export function getFont() {
	const fontLink = document.createElement('link');
	fontLink.rel = 'stylesheet';
	fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap';
	return fontLink;
}

export function logToConsole(message) {
	const isChrome = navigator.userAgent.toLowerCase().includes('chrome');
	isChrome ? console.log(`%c Kick Chat Flusher %c ${message}`, 'background: #228B22; color: #FFFFFF; padding: 2px 0;', '') : console.log('Kick Chat Flusher - ', message);
}

export function toTitleCase(str) {
	if (!str) return 'undefined';
	if (str === 'OFF' || str === 'ON') return str;
	return str.toLowerCase().replace(/\b\w/g, function (char) {
		return char.toUpperCase();
	});
}