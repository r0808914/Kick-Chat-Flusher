function initIp2() {
	/* check wss chatroom channels in kick */

	addPusher();

	const parentChannel = document.getElementById('channels');

	parentChannel.addEventListener('click', function (event) {
		const clickedChannel = event.target.closest('.channel');
		if (clickedChannel) {
			const mutationCallback = function (mutationsList, observer) {
				for (const mutation of mutationsList) {
					if (mutation.type === 'childList') {
						const itemBoxElements = document.querySelectorAll('.item-box');
						itemBoxElements.forEach((itemBoxElement) => {
							const iframes = itemBoxElement.querySelectorAll('iframe');
							iframes.forEach((iframe) => {
								if (iframe.hasAttribute('flusher')) return;
								if (!Object.keys(flushers).length) {
									setupPusher();
									visibilityChange();
								}
								observer.disconnect();
								createChannel(iframe);
							});
						});
					}
				}
			};

			const observer = new MutationObserver(mutationCallback);
			const targetNode = document.body;
			const config = { childList: true, subtree: true };
			observer.observe(targetNode, config);
		}
	});

	function createChannel(iframe) {
		const src = iframe.getAttribute('src');
		if (src && src.includes('kick.com')) {
			const channelName = new URL(src).pathname.slice(1);
			fetch(`https://kick.com/api/v1/channels/${channelName}`)
				.then(response => response.json())
				.then(data => {
					const chatroomId = data && data.chatroom && data.chatroom.id;
					createChat(iframe, chatroomId)
						.then(flusher => subscribeChannel(flusher, iframe))
						.catch(error => console.error('Error creating chat:', error));
				})
				.catch(error => console.error('Error fetching data:', error));
		}
	}

	function addPusher() {
		const pusherScript = document.createElement('script');
		pusherScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pusher/8.3.0/pusher.min.js';
		pusherScript.integrity = 'sha512-tXL5mrkSoP49uQf2jO0LbvzMyFgki//znmq0wYXGq94gVF6TU0QlrSbwGuPpKTeN1mIjReeqKZ4/NJPjHN1d2Q==';
		pusherScript.crossOrigin = 'anonymous';
		pusherScript.referrerPolicy = 'no-referrer';
		document.head.appendChild(pusherScript);

		document.head.appendChild(getFont());
	}

	function setupPusher() {
		if (socket !== null) return;
		socket = new Pusher('eb1d5f283081a78b932c', {
			cluster: 'us2',
			protocol: 'wss',
			encrypted: true,
		});
	}
}
