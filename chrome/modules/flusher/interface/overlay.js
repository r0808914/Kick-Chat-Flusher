import { createMenu } from './menu.js';
import { checkResize } from '../utils/resize.js';

/* export function createChat(element, chatroomId) {
   if (element.hasAttribute('flusher')) return;

   element.setAttribute('flusher', "")

   const chatFlusher = document.createElement("div");
   chatFlusher.classList.add("flusher");

   const flusher = document.createElement("div");
   flusher.classList.add("flusher-messages");
   flusher.setAttribute('flusher-chatroom', chatroomId);

   const shadowRoot = chatFlusher.attachShadow({ mode: 'open' });
   const b = typeof browser !== 'undefined' ? browser : chrome;

   const overlayStyle = document.createElement('style');
   overlayStyle.href = b.runtime.getURL('lib/flusher/overlay.css');
   overlayStyle.id = 'flusher-css-overlay';
   shadowRoot.appendChild(overlayStyle)

   const menuStyle = document.createElement('style');
   menuStyle.href = b.runtime.getURL('lib/flusher/main.css');
   menuStyle.id = 'flusher-css';
   document.head.appendChild(menuStyle);

   const toggle = createMenu(parsedDocument, element, flusher);
   element.parentNode.insertBefore(chatFlusher, element);
   this.flusherSettings.external ? shadowRoot.appendChild(flusher) : chatFlusher.append(flusher);
   checkResize(element, toggle, flusher, this.flusherSettings);
}

export function clearChat(flusher) {
   const id = flusher.getAttribute('flusher-chatroom');

   if (flusher !== null) {
      flusher.style.display = 'none';
      resetPostion(flusher);
   }

   const isEnabled = flushers[id].chatEnabled;
   flushers[id].chatEnabled = false;

   elementQueue.length = 0;
   messageQueue.length = 0;
   flushers[id].lastRow = 0;
   for (const id of timeoutIds) {
      clearTimeout(id);
   }

   scrolling = false;

   if (flusher !== null) {
      while (flusher.firstChild) {
         flusher.removeChild(flusher.firstChild);
      }
   }

   flushers[id].displayedMessages = new Set();

   if (flushers[id].lastPositionPerRow) {
      flushers[id].lastPositionPerRow.length = 0;
   } else {
      flushers[id].lastPositionPerRow = [];
   }

   if (flushers[id].rowQueue) {
      flushers[id].rowQueue.length = 0;
   } else {
      flushers[id].rowQueue = [];
   }

   timeoutIds.length = 0;

   if (flusher !== null) flusher.style.display = 'flex';

   flushers[id].chatEnabled = isEnabled;

   isProcessingElements = false;
   isProcessingMessages = false;
}

export function resetPostion(element) {
   element.style.height = '';
   element.style.width = '';
   element.style.top = '';
   element.style.left = '';
} */
