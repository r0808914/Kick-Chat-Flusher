import { toggle } from './element.js';
import { hideMenu, clickOutsideHandler } from '../menu/menu.js';

export let clickOutsideHandlerFunction = null;

export function createToggle(flusher) {
	const parent = (!flusher.props.isAeroKick && !flusher.props.external) ? flusher.video.closest('#video-holder') : flusher.video.parentNode;
	const domToggle = parent.querySelector('.flusher-toggle-btn');
	if (domToggle !== null) return;

	const popupMenu = parent.querySelector('#shadowbox').shadowRoot.querySelector('.flusher-menu');
	const baseMenu = popupMenu.querySelector('.flusher-menu-base');
	const existingButton = flusher.props.external ? parent : flusher.props.isAeroKick ? flusher.video.parentElement.querySelector('button.bk-relative.bk-mr-4') : document.querySelector('.vjs-fullscreen-control');

	const toggleBtn = (flusher.props.external || flusher.props.isAeroKick) ? toggle.querySelector('svg').cloneNode(true) : toggle.cloneNode(true);
	if (flusher.props.isAeroKick) toggleBtn.style.marginRight = "1rem";

	flusher.props.external ? existingButton.parentNode.append(toggleBtn) : existingButton.parentElement.insertBefore(toggleBtn, flusher.props.isAeroKick ? existingButton : existingButton.nextSibling);

	svgToggle(flusher);

	toggleBtn.addEventListener('mousedown', function (event) {
		event.stopPropagation();
		popupMenu.style.display === "block" ? hideMenu(flusher) : showMenu();
	});

	function showMenu() {
		baseMenu.style.display = 'block';
		popupMenu.style.display = 'block';
		svgToggle(flusher);
		flusher.clickOutsideHandlerFunction = (event) => clickOutsideHandler(event, flusher);
		document.addEventListener('mousedown', flusher.clickOutsideHandlerFunction);
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