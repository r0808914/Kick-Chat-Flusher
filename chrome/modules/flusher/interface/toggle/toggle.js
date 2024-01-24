import { toggle } from './element.js';

export let clickOutsideHandlerFunction = null;

export function createToggle(flusherSettings, element, flusher) {
   console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Create Toggle');
	const parent = flusherSettings.external ? element.parentNode : element;
	const domToggle = parent.querySelector('.flusher-toggle-btn');
	if (domToggle !== null) return;

	const popupMenu = parent.querySelector('#shadowbox').shadowRoot.querySelector('.flusher-menu');
	const baseMenu = popupMenu.querySelector('.flusher-menu-base');
	const existingButton = flusherSettings.external ? parent : document.querySelector('.vjs-fullscreen-control');

	const toggleBtn = flusherSettings.external ? toggle.querySelector('svg') : toggle;
	existingButton.parentNode.append(toggleBtn);

	const id = flusher.getAttribute('flusher-chatroom');

	svgToggle(element, id, flusherSettings);

	toggleBtn.addEventListener('mousedown', function (event) {
		event.stopPropagation();
		popupMenu.style.display === "block" ? hideMenu(parent, id) : showMenu();
	});

	function showMenu() {
		baseMenu.style.display = 'block';
		popupMenu.style.display = 'block';
		svgToggle(element, id, flusherSettings);
		clickOutsideHandlerFunction = (event) => clickOutsideHandler(event, element, id);
		document.addEventListener('mousedown', clickOutsideHandlerFunction);
	}
	return toggleBtn;
}

export function svgToggle(flusherParent, chatroom_id, flusherSettings) {
	const parent = flusherSettings.external ? flusherParent.closest('.item-box') : document;
	const toggle = parent.querySelector('.toggle-icon');
	if (toggle === null) return;
	const menu = parent.querySelector('#shadowbox').shadowRoot.querySelector('.flusher-menu');
	const visible = menu.style.display === "block" ? true : false;
	if (flusherSettings.chatEnabled || visible) {
		toggle.classList.add('svg-toggle');
	} else {
		toggle.classList.remove('svg-toggle');
	}
}