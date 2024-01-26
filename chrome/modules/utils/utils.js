export function visibilityChange() {
	document.addEventListener('visibilitychange', function handleVisibilityChange() {
		if (!Object.keys(flushers).length) return;
		for (const key in flushers) {
			if (!props.flushers[key].flushState) continue;

			if (document.hidden) {
				props.flushers[key].chatEnabledVisible = props.flushers[key].chatEnabled;
				props.flushers[key].chatEnabled = false;
				console.log(props.flushers[key].channelName + ' ' + document.hidden + ' ' + props.flushers[key].chatEnabledVisible);

				clearChat(props.flushers[key].flusher);
			} else {
				console.log(' off ' + props.flushers[key].channelName + ' ' + document.hidden + ' ' + props.flushers[key].chatEnabledVisible);

				props.flushers[key].chatEnabled = props.flushers[key].chatEnabledVisible;
			}
		}
	});
}