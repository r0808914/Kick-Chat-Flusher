import { toggle } from './element.js';
import { hideMenu, clickOutsideHandler } from '../menu/menu.js';

export let clickOutsideHandlerFunction = null;

export function createToggle(flusher) {
	/* const parent = (!flusher.props.isAeroKick && !flusher.props.external) ? flusher.video.closest('#video-holder') : flusher.video.parentNode; */
	const parent = flusher.video.parentNode;

	const popupMenu = parent.querySelector('#shadowbox').shadowRoot.querySelector('.flusher-menu');
	const baseMenu = popupMenu.querySelector('.flusher-menu-base');

	let toggleBtn;

	if (!flusher.toggleNative) {
		const domToggle = parent?.querySelector('.flusher-toggle-btn');
		if (domToggle !== null) return;

		toggleBtn = (flusher.props.external || flusher.props.isAeroKick) ? toggle.querySelector('svg').cloneNode(true) : toggle.cloneNode(true);

		if (flusher.props.external && !document.querySelector('.vjs-control-bar .flusher-toggle')) {
			toggleBtn.style.marginLeft = "1rem";
			toggleBtn.style.marginRight = "1rem";
		}

		const existingButton = flusher.props.external ? parent : flusher.props.isAeroKick ? flusher.video.parentElement.querySelector('button.bk-relative.bk-mr-4') : document.querySelector('.vjs-fullscreen-control');
		flusher.props.external ? existingButton.parentNode.append(toggleBtn) : existingButton.parentElement.insertBefore(toggleBtn, flusher.props.isAeroKick ? existingButton : existingButton.nextSibling);
	} else { toggleBtn = flusher.toggleNative; }

	svgToggle(flusher);

	toggleBtn.addEventListener('mousedown', function (event) {
		event.stopPropagation();
		popupMenu.style.display === "block" ? hideMenu(flusher) : showMenu();
	});

	function showMenu() {
		flusher.clickOutsideHandlerFunction = (event) => clickOutsideHandler(event, flusher);

		const parentElement = flusher.video.parentElement;
		const config = { childList: true, subtree: true };
		const callback = (mutationsList) => {
			for (let mutation of mutationsList) {
				if (mutation.type === 'childList') {
					const shadowbox = parentElement.querySelector('#shadowbox');
					if (!shadowbox) {
						observer.disconnect();
						hideMenu(flusher);
					}
				}
			}
		};

		const observer = new MutationObserver(callback);
		observer.observe(parentElement, config);

		baseMenu.style.display = 'block';
		popupMenu.style.display = 'block';


		function alignPopupMenu() {
			document.querySelector('#shadowbox').style.left = `${50}px`;

			const popupMenuRect = popupMenu.getBoundingClientRect();
			const toggleRect = flusher.toggle.getBoundingClientRect();
			const videoRect = flusher.video.parentElement.getBoundingClientRect();

			const toggleCenterX = toggleRect.left + (toggleRect.width / 2);
			const popupCenterX = popupMenuRect.left + (popupMenuRect.width / 2);

			let newLeftPosition = toggleCenterX - popupCenterX;

			const minLeft = videoRect.left;
			const maxLeft = videoRect.left + videoRect.width - popupMenuRect.width + 40;
			console.log(maxLeft);
			newLeftPosition = Math.max(minLeft, Math.min(newLeftPosition, maxLeft));

			document.querySelector('#shadowbox').style.left = `${newLeftPosition}px`;
		}

		alignPopupMenu();

		svgToggle(flusher);
		document.addEventListener('mousedown', flusher.clickOutsideHandlerFunction);
		flusher.container.classList.add('flusher-hover');

		if (flusher.props.popupContainer) {
			flusher.props.popupContainer.style.display = "block";
			window.addEventListener("click", closePopupOutside);

			const closeBtn = flusher.props.popupContainer.querySelector("#closeBtn");

			function closePopup() {
				flusher.props.popupContainer.style.display = "none";

				window.removeEventListener("click", closePopupOutside);

				const data = { ['flusher-intro']: true };
				chrome.storage.local.set(data, () => {
					/* logToConsole(`Value for key ${key} has been set to ${value} in extension storage.`); */
				});

				flusher.props.popupContainer = null;
			}

			function closePopupOutside(event) {
				if (!flusher.props.popupContainer.contains(event.target) && !flusher.toggle.contains(event.target)) {
					closePopup();
				}
			}

			closeBtn.onclick = closePopup;
		}
	}
	return toggleBtn;
}

export function svgToggle(flusher) {
	const parent = flusher.props.external ? flusher.video.closest('.item-box') : document;
	const toggle = parent.querySelector('.toggle-icon');
	if (toggle === null) return;
	const menu = parent.querySelector('#shadowbox').shadowRoot.querySelector('.flusher-menu');
	const visible = menu.style.display === "block" ? true : false;
	if (flusher.states.chatEnabled || visible) {
		toggle.classList.add('svg-toggle');
	} else {
		toggle.classList.remove('svg-toggle');
	}
}