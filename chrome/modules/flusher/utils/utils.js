export function visibilityChange() {
	document.addEventListener('visibilitychange', function handleVisibilityChange() {
		if (!Object.keys(flushers).length) return;
		for (const key in flushers) {
			if (!flusherSettings.flushers[key].flushState) continue;

			if (document.hidden) {
				flusherSettings.flushers[key].chatEnabledVisible = flusherSettings.flushers[key].chatEnabled;
				flusherSettings.flushers[key].chatEnabled = false;
				console.log(flusherSettings.flushers[key].channelName + ' ' + document.hidden + ' ' + flusherSettings.flushers[key].chatEnabledVisible);

				clearChat(flusherSettings.flushers[key].flusher);
			} else {
				console.log(' off ' + flusherSettings.flushers[key].channelName + ' ' + document.hidden + ' ' + flusherSettings.flushers[key].chatEnabledVisible);

				flusherSettings.flushers[key].chatEnabled = flusherSettings.flushers[key].chatEnabledVisible;
			}
		}
	});
}