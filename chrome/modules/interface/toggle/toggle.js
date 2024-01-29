import { toggle } from './element.js';
import { hideMenu, clickOutsideHandler } from '../../interface/menu/menu.js';

export let clickOutsideHandlerFunction = null;

export function createToggle(flusher) {
	const parent = flusher.props.external ? flusher.video.parentNode : flusher.video;
	const domToggle = parent.querySelector('.flusher-toggle-btn');
	if (domToggle !== null) return;

	const popupMenu = parent.querySelector('#shadowbox').shadowRoot.querySelector('.flusher-menu');
	const baseMenu = popupMenu.querySelector('.flusher-menu-base');
	const existingButton = flusher.props.external ? parent : document.querySelector('.vjs-fullscreen-control');

	const toggleBtn = flusher.props.external ? toggle.querySelector('svg').cloneNode(true) : toggle.cloneNode(true);
	existingButton.parentNode.append(toggleBtn);

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