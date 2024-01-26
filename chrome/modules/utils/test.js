export function test() {
	const data = {
		event: "App\\Events\\ChatMessageEvent",
		data: {
			content: "Test Message",
			sender: {
				username: "Test User",
				identity: {
					color: "#E9113C",
				}
			}
		}
	};

	if (flusher === null) return;

	setInterval(() => {
		messageQueue.push(data);
		processMessageQueue();
	}, 2500);
}