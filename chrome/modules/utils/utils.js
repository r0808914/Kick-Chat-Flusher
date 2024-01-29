export function visibilityChange(flusher) {
	console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Add visibilityChange');
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