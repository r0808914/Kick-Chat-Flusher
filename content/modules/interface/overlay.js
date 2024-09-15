import { createMenu } from './menu/menu.js';
import { checkResize } from '../utils/resize.js';
import { getFont, logToConsole, toTitleCase } from '../utils/utils.js';

export async function createChat(flusher) {
   if (flusher.video.hasAttribute('flusher')) return;
   flusher.video.setAttribute('flusher', "");

   const chatFlusher = document.createElement("div");
   chatFlusher.classList.add("flusher");
   if (flusher.props.isAeroKick) chatFlusher.style.cssText = 'position: absolute !important; z-index: 1010;';

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
   flusher.states.keybinds = await getExtensionStorageItem('flusher-keybinds', flusher.states.keybinds);
   flusher.states.bans = await getExtensionStorageItem('flusher-event-bans', flusher.states.bans);
   flusher.states.deleted = await getExtensionStorageItem('flusher-event-deleted', flusher.states.deleted);
   flusher.props.intro = await getExtensionStorageItem('flusher-intro', false);

   setCustomPosition(flusher);

   /* important */
   /* doing this fix cause z-controls is dynamic */

   function addBtn(node) {
      const buttons = node.querySelectorAll('button');

      const existingButton = Array.from(buttons).find(button => button.hasAttribute('data-flusher'));

      if (!existingButton && buttons.length > 0) {
         const lastButton = buttons[buttons.length - 1];
         const clone = lastButton.cloneNode(true);

         clone.setAttribute('data-flusher', 'true');

         const svgString = `
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="margin-top: 1px;">
            <rect x="4" y="4" width="24" height="24" rx="5" fill="none" stroke="rgba(83,252,24,1)" stroke-width="4" />
          </svg>`;

         const parser = new DOMParser();
         const doc = parser.parseFromString(svgString, 'image/svg+xml');

         const newSVG = doc.documentElement;

         clone.replaceChildren(newSVG);
         lastButton.parentNode.insertBefore(clone, lastButton.nextSibling);

         flusher.controls = node;

         /* temp fix */
         flusher.toggleNative = clone;

         flusher.toggle = createMenu(flusher);
      }

      checkResize(flusher);
   }


   function dupeBtn(node) {
      const btn = node.querySelector('button');
      if (btn) {
         addBtn(node);
      } else {
         flusher.props.controlsDupeObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
               mutation.addedNodes.forEach(function (node) {
                  if (node.classList.contains('z-controls')) {
                     flusher.props.controlsDupeObserver.disconnect();
                     addBtn(node);
                  }
               });
            });
         });

         flusher.props.controlsDupeObserver.observe(flusher.video.parentNode, {
            childList: true,
            subtree: true
         });
      }
   }

   flusher.props.controlsObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
         if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(function (node) {
               if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('z-controls')) {
                  dupeBtn(node);
               }
            });
         }
      });
   });

   flusher.props.controlsObserver.observe(flusher.video.parentNode, {
      childList: true,
      subtree: true
   });

   /* temp fix */
   flusher.props.isAeroKick ? flusher.video.append(chatFlusher) : flusher.video.parentNode.append(chatFlusher);
   flusher.props.external ? shadowRoot.appendChild(flusherDiv) : chatFlusher.append(flusherDiv);
   checkResize(flusher);
   /* - */

   if (flusher.props.isAeroKick) {
      const videoHolder = flusher.video.closest('#video-holder');
      const bkVideoPlayer = document.getElementById('bk-video-player');

      const videoHolderWidth = videoHolder?.offsetWidth ?? 0;
      const bkVideoPlayerWidth = bkVideoPlayer?.offsetWidth ?? 0;

      let largestElement;

      if (videoHolderWidth > bkVideoPlayerWidth) {
         largestElement = videoHolder;
      } else {
         largestElement = bkVideoPlayer;
      }
      flusher.video = largestElement;
   }

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