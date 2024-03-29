import { createMenu } from './menu/menu.js';
import { checkResize } from '../utils/resize.js';
import { getFont, logToConsole, toTitleCase } from '../utils/utils.js';

export async function createChat(flusher) {
   if (flusher.video.hasAttribute('flusher')) return;
   flusher.video.setAttribute('flusher', "");

   /* logToConsole(`Create Chat`); */

   const chatFlusher = document.createElement("div");
   chatFlusher.classList.add("flusher");
   if (flusher.props.isAeroKick) chatFlusher.style.zIndex = 1000;

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

   flusher.states.chatEnabled = await getExtensionStorageItem('flusher-enable', flusher.states.chatEnabled);
   flusher.states.flushState = await getExtensionStorageItem('flusher-flush', flusher.states.flushState);
   flusher.states.reply = await getExtensionStorageItem('flusher-reply', flusher.states.reply);
   flusher.states.spamState = await getExtensionStorageItem('flusher-spam', flusher.states.spamState);
   flusher.states.fontState = await getExtensionStorageItem('flusher-font', flusher.states.fontState);
   flusher.states.backgroundState = await getExtensionStorageItem('flusher-background', flusher.states.backgroundState);
   flusher.states.timeState = await getExtensionStorageItem('flusher-time', flusher.states.timeState);
   flusher.states.shadow = await getExtensionStorageItem('flusher-shadow', flusher.states.shadow);
   flusher.states.slide = await getExtensionStorageItem('flusher-slide', flusher.states.slide);

   setCustomPosition(flusher);

   flusher.toggle = createMenu(flusher);

   flusher.video.parentNode.append(chatFlusher);
   flusher.props.external ? shadowRoot.appendChild(flusherDiv) : chatFlusher.append(flusherDiv);
   checkResize(flusher);

   function getExtensionStorageItem(key, defaultValue) {
      return new Promise((resolve) => {
         chrome.storage.local.get([key], (result) => {
            const storedValue = result[key];
            resolve(storedValue !== undefined ? storedValue : defaultValue);
         });
      });
   }
}

export function setCustomPosition(flusher) {
   chrome.storage.local.get("positionsPerChannel", function (result) {
      var positionsPerChannel = result.positionsPerChannel || {};
      var positionsArray = positionsPerChannel[flusher.props.channelName] || [];

      var existingPositionIndex = positionsArray.findIndex(function (item) {
         return item.videoSize === flusher.props.videoSize;
      });

      if (existingPositionIndex !== -1) {
         const location = positionsArray[existingPositionIndex].position?.location;
         const size = positionsArray[existingPositionIndex].position?.size;
         flusher.states.positionState = location ?? 4;
         flusher.states.sizeState = size ?? 1;
      } else {
         flusher.states.positionState = 4;
         flusher.states.sizeState = 1;
      }

      if (flusher.menu) {
         const sizeBtn = flusher.menu.querySelector('.flusher-size');
         if (sizeBtn) {
            const divInsideSize = sizeBtn.querySelector('div.pr-0');
            divInsideSize.textContent = toTitleCase(flusher.states.sizeStates[flusher.states.sizeState]);
         }

         const positionBtn = flusher.menu.querySelector('.flusher-position');
         if (positionBtn) {
            const divInsidePosition = positionBtn.querySelector('div.pr-0');
            divInsidePosition.textContent = toTitleCase(flusher.states.positionStates[flusher.states.positionState]);
         }
      }
   });
}