import { createMenu } from './menu/menu.js';
import { checkResize } from '../utils/resize.js';
import { getFont } from '../utils/utils.js';

export function createChat(flusher) {
   if (flusher.video.hasAttribute('flusher')) return;
   flusher.video.setAttribute('flusher', "")
   console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Create Chat');

   const chatFlusher = document.createElement("div");
   chatFlusher.classList.add("flusher");

   const flusherDiv = document.createElement("div");
   flusherDiv.classList.add("flusher-messages");

   const shadowRoot = flusher.props.external ? chatFlusher.attachShadow({ mode: 'open' }) : null;
   const b = typeof browser !== 'undefined' ? browser : chrome;

   const mainStylesDom = document.getElementById('flusher-css-overlay');
   if (!mainStylesDom) {
      const overlayStyle = document.createElement('link');
      overlayStyle.href = b.runtime.getURL('lib/flusher/main.css');
      overlayStyle.id = 'flusher-css-overlay';
      overlayStyle.rel = 'stylesheet';
      document.head.appendChild(overlayStyle);

      const font = getFont();
      document.head.appendChild(font);
   }

   const menuStylesDom = document.getElementById('flusher-css');
   if (!menuStylesDom || flusher.props.external) {
      const menuStyle = document.createElement('link');
      menuStyle.href = b.runtime.getURL('lib/flusher/overlay.css');
      menuStyle.rel = 'stylesheet';
      menuStyle.id = 'flusher-css';
      flusher.props.external ? shadowRoot.appendChild(menuStyle) : document.head.append(menuStyle);
   }

   flusher.container = flusherDiv;
   flusher.toggle = createMenu(flusher);

   flusher.props.external ? flusher.video.parentNode.append(chatFlusher) : flusher.video.append(chatFlusher);
   flusher.props.external ? shadowRoot.appendChild(flusherDiv) : chatFlusher.append(flusherDiv);
   checkResize(flusher);
}
