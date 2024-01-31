import { Flusher } from '../flusher/flusher.js';
import { createChat } from '../interface/overlay.js';

class Ip2 {

	static async init() {
		console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Initialize');

		const targetNode = await waitForCondition(() => document.getElementById('streamViewerContainer'));
		console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Container found');

		const callback = async function (mutationsList, observer) {
			for (const mutation of mutationsList) {
				if (mutation.type === 'childList') {
					if (mutation.addedNodes.length > 0) {
						for (const node of mutation.addedNodes) {
							if (targetNode.contains(node) && node.parentElement === targetNode) {
								if (node.id && !node.id.includes('-chat-') && node.id.includes('-video-')) {
									const hasFlusherAttribute = node.hasAttribute('flusher');
									if (hasFlusherAttribute) return;
									const iframe = await waitForCondition(() => node.querySelector('iframe'));
									console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m New video found');
									node.setAttribute('flusher', '');
									createChannel(iframe);
								}
							}
						}
					}
				}
			}
		};

		const observer = new MutationObserver(callback);
		const config = { childList: true, subtree: false };
		observer.observe(targetNode, config);

		function createChannel(iframe) {
			const src = iframe.getAttribute('src');
			if (src && src.includes('kick.com')) {
				const channelName = new URL(src).pathname.slice(1);
				console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Fetch Channel Data');
				const flusher = new Flusher(iframe, "IP2", channelName);
				createChat(flusher);
			}
		}

		function waitForCondition(conditionCallback) {
			return new Promise((resolve, reject) => {
				const checkCondition = () => {
					const result = conditionCallback();
					if (result) {
						resolve(result);
						return;
					}
					setTimeout(checkCondition, 500);
				};

				checkCondition();
			});
		}

		/* try { 
			const chatFrame = document.createElement('iframe');
			chatFrame.src = 'https://kick.com/USERNAME/chatroom';
			document.body.append(chatFrame);
			const elementText = chatFrame.$eval('body', (element) => {
				return element.textContent;
			});
			console.log('Element Text inside iframe:', elementText);
		} catch (error) {
			console.error('Error:', error);
		} */
	}
}

export default Ip2;