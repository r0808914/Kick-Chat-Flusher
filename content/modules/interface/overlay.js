import { createMenu } from './menu/menu.js';
import { checkResize } from '../utils/resize.js';
import { getFont, logToConsole, toTitleCase } from '../utils/utils.js';

let flusherObject;

export async function createChat(flusher) {
   flusherObject = flusher;
   if (flusherObject.video.hasAttribute('flusher')) return;
   flusherObject.video.setAttribute('flusher', "");

   const chatflusherObject = document.createElement("div");
   chatflusherObject.classList.add("flusher");
   if (flusherObject.props.isAeroKick) chatflusherObject.style.cssText = 'position: absolute !important; z-index: 1010;';

   const flusherObjectDiv = document.createElement("div");
   flusherObjectDiv.classList.add("flusher-messages");

   const shadowRoot = flusherObject.props.external ? chatflusherObject.attachShadow({ mode: 'open' }) : null;
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
   if (!menuStylesDom || flusherObject.props.external) {
      const menuStyle = document.createElement('link');
      menuStyle.href = b.runtime.getURL('lib/flusher/overlay.css');
      menuStyle.rel = 'stylesheet';
      menuStyle.id = 'flusher-css';
      flusherObject.props.external ? shadowRoot.appendChild(menuStyle) : document.head.append(menuStyle);
   }

   flusherObject.container = flusherObjectDiv;

   function setExtensionStorageItem(key, value) {
      const data = { [key]: value };
      chrome.storage.local.set(data, () => {

      });
   }

   async function initializeDefaultSettings() {
      const currentVersion = '1.0.7';
      const storedVersion = await getExtensionStorageItem('flusher-version', null);

      if (storedVersion !== currentVersion) {
         logToConsole('New update detected. Resetting settings to default.');
         setExtensionStorageItem('flusher-background', flusherObject.states.backgroundState);
         setExtensionStorageItem('flusher-position', flusherObject.states.positionState);
         setExtensionStorageItem('flusher-size', flusherObject.states.sizeState);
         setExtensionStorageItem('flusher-enable', flusherObject.states.chatEnabled);
         setExtensionStorageItem('flusher-flush', flusherObject.states.flushState);
         setExtensionStorageItem('flusher-shadow', flusherObject.states.shadow);
         setExtensionStorageItem('flusher-slide', flusherObject.states.slide);
         setExtensionStorageItem('flusher-reply', flusherObject.states.reply);
         setExtensionStorageItem('flusher-spam', flusherObject.states.spamState);
         setExtensionStorageItem('flusher-font', flusherObject.states.fontState);
         setExtensionStorageItem('flusher-keybinds', flusherObject.states.keybinds);
         setExtensionStorageItem('flusher-event-bans', flusherObject.states.bans);
         setExtensionStorageItem('flusher-event-deleted', flusherObject.states.deleted);
         setExtensionStorageItem('flusher-version', currentVersion);

         chrome.storage.local.remove("positionsPerChannel", function () {
            console.log("customPositions have been removed from the db.");
         });

         await loadSetting();
      } else {
         await loadSetting();
      }

      async function loadSetting() {
         flusherObject.states.chatEnabled = await getExtensionStorageItem('flusher-enable', flusherObject.states.chatEnabled);
         flusherObject.states.flushState = await getExtensionStorageItem('flusher-flush', flusherObject.states.flushState);
         flusherObject.states.reply = await getExtensionStorageItem('flusher-reply', flusherObject.states.reply);
         flusherObject.states.spamState = await getExtensionStorageItem('flusher-spam', flusherObject.states.spamState);
         flusherObject.states.fontState = await getExtensionStorageItem('flusher-font', flusherObject.states.fontState);
         flusherObject.states.backgroundState = await getExtensionStorageItem('flusher-background', flusherObject.states.backgroundState);
         flusherObject.states.timeState = await getExtensionStorageItem('flusher-time', flusherObject.states.timeState);
         flusherObject.states.shadow = await getExtensionStorageItem('flusher-shadow', flusherObject.states.shadow);
         flusherObject.states.slide = await getExtensionStorageItem('flusher-slide', flusherObject.states.slide);
         flusherObject.states.keybinds = await getExtensionStorageItem('flusher-keybinds', flusherObject.states.keybinds);
         flusherObject.states.bans = await getExtensionStorageItem('flusher-event-bans', flusherObject.states.bans);
         flusherObject.states.deleted = await getExtensionStorageItem('flusher-event-deleted', flusherObject.states.deleted);
         flusherObject.props.intro = await getExtensionStorageItem('flusher-intro', false);
      }
   }

   initializeDefaultSettings();

   setCustomPosition(flusherObject);

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

         flusherObject.controls = node;

         /* temp fix */
         flusherObject.toggleNative = clone;

         flusherObject.toggle = createMenu(flusherObject);
      }

      checkResize(flusherObject);
   }

   function dupeBtn(node) {
      const btn = node.querySelector('button');
      if (btn) {
         addBtn(node);
      } else {
         flusherObject.props.controlsDupeObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
               mutation.addedNodes.forEach(function (node) {
                  if (node.classList.contains('z-controls')) {
                     flusherObject.props.controlsDupeObserver.disconnect();
                     addBtn(node);
                  }
               });
            });
         });
         flusherObject.props.controlsDupeObserver.observe(flusherObject.video.parentNode, {
            childList: true,
            subtree: true
         });
      }
   }

   let lastRun = 0;
   const throttleDelay = 1000;

   /* remove old first */
   /* flusherObject.video.parentNode.removeEventListener('mousemove', throttledMove); */

   flusherObject.video.parentNode.addEventListener('mousemove', (event) => {
      if (!window.isDragging) throttledMove();
   });

   function throttledMove() {
      const now = Date.now();

      if (now - lastRun >= throttleDelay) {
         let node = flusherObject.video.parentNode.querySelector('.z-controls');
         if (node) dupeBtn(node);
         lastRun = now;
      }
   }

   /* flusherObject.props.controlsObserver = new MutationObserver(function (mutations) {
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

   flusherObject.props.controlsObserver.observe(flusherObject.video.parentNode, {
      childList: true,
      subtree: true
   }); */

   /* temp fix */
   flusherObject.props.isAeroKick ? flusherObject.video.append(chatflusherObject) : flusherObject.video.parentNode.append(chatflusherObject);
   flusherObject.props.external ? shadowRoot.appendChild(flusherObjectDiv) : chatflusherObject.append(flusherObjectDiv);
   checkResize(flusherObject);
   /* - */

   if (flusherObject.props.isAeroKick) {
      const videoHolder = flusherObject.video.closest('#video-holder');
      const bkVideoPlayer = document.getElementById('bk-video-player');

      const videoHolderWidth = videoHolder?.offsetWidth ?? 0;
      const bkVideoPlayerWidth = bkVideoPlayer?.offsetWidth ?? 0;

      let largestElement;

      if (videoHolderWidth > bkVideoPlayerWidth) {
         largestElement = videoHolder;
      } else {
         largestElement = bkVideoPlayer;
      }
      flusherObject.video = largestElement;
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