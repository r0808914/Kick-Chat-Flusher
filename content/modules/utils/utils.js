export function visibilityChange(flusher) {
	/* logToConsole(`Add visibilityChange`); */

	document.addEventListener('visibilitychange', function handleVisibilityChange() {
		if (!flusher || !flusher.states.flushState) return;
		if (document.hidden) {
			flusher.props.chatEnabledVisible = flusher.states.chatEnabled;
			flusher.states.chatEnabled = false;
			flusher.clear();
		} else {
			flusher.states.chatEnabled = flusher.props.chatEnabledVisible;
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