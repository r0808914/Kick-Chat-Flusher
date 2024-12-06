import { createMenu } from './menu/menu.js';
import { checkResize } from '../utils/resize.js';
import { getFont, logToConsole, toTitleCase } from '../utils/utils.js';
import { svgToggle } from '../interface/toggle/toggle.js';

let flusherObject;

export async function createChat(flusher) {
   flusherObject = flusher;
   if (flusherObject.video.hasAttribute('flusher')) return;
   flusherObject.video.setAttribute('flusher', "");

   const chatflusherObject = document.createElement("div");
   chatflusherObject.classList.add("flusher");
   if (flusherObject.props.isAeroKick) chatflusherObject.style.cssText = 'position: absolute !important; z-index: 1010;';

   const flusherObjectContainer = document.createElement("div");
   flusherObjectContainer.classList.add("flusher-container");

   const flusherObjectPinned = document.createElement("div");
   flusherObjectPinned.classList.add("flusher-pinned");

   const flusherObjectChat = document.createElement("div");
   flusherObjectChat.classList.add("flusher-chat");

   const flusherObjectDiv = document.createElement("div");
   flusherObjectDiv.classList.add("flusher-messages");

   flusherObjectContainer.append(flusherObjectPinned);
   flusherObjectContainer.append(flusherObjectDiv);
   flusherObjectContainer.append(flusherObjectChat);

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

   flusherObject.container = flusherObjectContainer;
   flusherObject.messages = flusherObjectDiv;
   flusherObject.chat = flusherObjectChat;

   function setExtensionStorageItem(key, value) {
      const data = { [key]: value };
      chrome.storage.local.set(data, () => {

      });
   }

   async function initializeDefaultSettings() {
      const currentVersion = '1.0.8';
      const storedVersion = await getExtensionStorageItem('flusher-version', null);

      if (storedVersion !== currentVersion) {
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
         setExtensionStorageItem('flusher-event-bans-alert', flusherObject.states.banAlert);
         setExtensionStorageItem('flusher-event-pinned', flusherObject.states.pinned);
         setExtensionStorageItem('flusher-event-pinned-alert', flusherObject.states.pinnedAlert);
         /* setExtensionStorageItem('flusher-event-deleted-alert', flusherObject.states.deletedAlert); */
         setExtensionStorageItem('flusher-version', currentVersion);

         chrome.storage.local.remove("positionsPerChannel", function () {
            logToConsole('New update detected. Resetting settings to default.');
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
         flusherObject.states.banAlert = await getExtensionStorageItem('flusher-event-bans-alert', flusherObject.states.banAlert);
         flusherObject.states.pinned = await getExtensionStorageItem('flusher-event-pinned', flusherObject.states.pinned);
         flusherObject.states.pinnedAlert = await getExtensionStorageItem('flusher-event-pinned-alert', flusherObject.states.pinnedAlert);
         /* flusherObject.states.deletedAlert = await getExtensionStorageItem('flusher-event-deleted-alert', flusherObject.states.deletedAlert); */
         flusherObject.props.intro = await getExtensionStorageItem('flusher-intro', false);
      }
   }

   initializeDefaultSettings();

   setCustomPosition(flusherObject);

   async function addBtn(node) {
      const buttons = node.querySelectorAll('button');

      const existingButton = Array.from(buttons).find(button => button.hasAttribute('data-flusher'));

      if (!existingButton && buttons.length > 0) {
         const lastButton = buttons[buttons.length - 1];
         const clone = lastButton.cloneNode(true);

         clone.setAttribute('data-flusher', 'true');

         const svgString = `
         <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="margin-top: 1.5px;">
           <rect x="4" y="4" width="24" height="24" rx="5" fill="none" stroke="white" stroke-width="4" />
         </svg>`;

         const parser = new DOMParser();
         const doc = parser.parseFromString(svgString, 'image/svg+xml');

         const newSVG = doc.documentElement;

         clone.replaceChildren(newSVG);
         lastButton.parentNode.insertBefore(clone, lastButton.nextSibling);

         flusherObject.controls = node;

         /* temp fix */
         flusherObject.toggleNative = clone;

         flusherObject.toggle = await createMenu(flusherObject);

         svgToggle(flusherObject);
      }

      /* checkResize(flusherObject); */
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
   window.isDragging = false;

   flusherObject.video.parentNode.removeEventListener('mousemove', throttledMove);

   flusherObject.props.mouseMoveHandler = (event) => {
      if (!window.isDragging) throttledMove();
   };

   flusherObject.video.addEventListener('mousemove', flusherObject.props.mouseMoveHandler);

   flusherObject.video.addEventListener('mouseleave', () => {
      lastRun = 1000;
   });

   flusherObject.container.addEventListener('mouseenter', () => {
      window.isDragging = true;
      flusherObject.video.removeEventListener('mousemove', flusherObject.props.mouseMoveHandler);

      lastRun = 1000;
      throttledMove();

      const chatElement = document.getElementById('channel-chatroom')?.querySelector('.z-common.flex.w-full.border-x')?.parentElement;
      if (chatElement) syncChat(chatElement);
   });

   let chat = null;

   function syncChat(chatElement) {
      chat = chatElement.parentElement;

      if (flusherObject.chat) {
         const clonedChat = chatElement.cloneNode(true);
         clonedChat.classList.add('flusher-temp');

         const inputField = chatElement.querySelector('[contenteditable="true"]');
         if (inputField) inputField.focus();

         const originalButton = chatElement.querySelector('#chat-input-wrapper button');

         let closed = chatElement.querySelector('.z-common.flex.w-full.border-x').classList.contains('border-transparent');
         if (!closed && originalButton) originalButton.click();

         let sendBtn = chatElement.querySelector('#flusher-chat-send');
         const sendButton = chatElement.querySelector('#send-message-button');

         if (!sendBtn && originalButton) {
            const clonedButton = originalButton.cloneNode(true);
            clonedButton.id = 'flusher-chat-send';

            const svg = clonedButton.querySelector('svg');
            if (svg) {
               svg.setAttribute('viewBox', '0 0 20 20');
               const svgPath = svg.querySelector('path');
               if (svgPath) {
                  svgPath.setAttribute('d', "M11.5003 12H5.41872M5.24634 12.7972L4.24158 15.7986C3.69128 17.4424 3.41613 18.2643 3.61359 18.7704C3.78506 19.21 4.15335 19.5432 4.6078 19.6701C5.13111 19.8161 5.92151 19.4604 7.50231 18.7491L17.6367 14.1886C19.1797 13.4942 19.9512 13.1471 20.1896 12.6648C20.3968 12.2458 20.3968 11.7541 20.1896 11.3351C19.9512 10.8529 19.1797 10.5057 17.6367 9.81135L7.48483 5.24303C5.90879 4.53382 5.12078 4.17921 4.59799 4.32468C4.14397 4.45101 3.77572 4.78336 3.60365 5.22209C3.40551 5.72728 3.67772 6.54741 4.22215 8.18767L5.24829 11.2793C5.34179 11.561 5.38855 11.7019 5.407 11.8459C5.42338 11.9738 5.42321 12.1032 5.40651 12.231C5.38768 12.375 5.34057 12.5157 5.24634 12.7972Z");
                  svgPath.setAttribute('stroke', '#000000');
                  svgPath.setAttribute('stroke-width', '2');
                  svgPath.setAttribute('stroke-linecap', 'round');
                  svgPath.setAttribute('stroke-linejoin', 'round');
               }
            }

            if (sendButton) {
               clonedButton.addEventListener('click', (event) => {
                  sendButton.click();
               });
               originalButton.insertAdjacentElement('afterend', clonedButton);
            }
         } else {
            if (sendBtn) {

               if (sendButton) {
                  sendBtn.addEventListener('click', (event) => {
                     sendButton.click();
                  });
                  sendBtn.style.display = 'flex';
               }
            }
         }

         flusherObject.chat.appendChild(chatElement);
         if (chat && clonedChat) chat.appendChild(clonedChat);
      }
   }

   flusherObject.container.addEventListener('mouseleave', () => {
      window.isDragging = false;
      flusherObject.video.addEventListener('mousemove', flusherObject.props.mouseMoveHandler);
      lastRun = 1000;

      let tempChat = chat.querySelector('.flusher-temp');
      if (tempChat) tempChat.remove();

      let closed = flusherObject.chat.querySelector('.z-common.flex.w-full.border-x')?.classList.contains('border-transparent');
      if (!closed) {
         let emojiBtn = flusherObject.chat.querySelector('#chat-input-wrapper button');
         if (emojiBtn) emojiBtn.click();
      }

      /* const editableParagraph = flusherObject.chat.querySelector('.editor-paragraph');
      if (editableParagraph) {
         while (editableParagraph.firstChild) {
            editableParagraph.removeChild(editableParagraph.firstChild);
         }
         const br = document.createElement('br');
         editableParagraph.appendChild(br);
      } */

      let sendBtn = flusherObject.chat.querySelector('#flusher-chat-send');
      if (sendBtn) sendBtn.style.display = 'none';

      if (chat && flusherObject.chat.firstChild) chat.appendChild(flusherObject.chat.firstChild);

      /* document.body.click(); */

      chat = null;
   });


   function throttledMove() {
      const now = Date.now();
      if (now - lastRun >= throttleDelay) {
         let node = flusherObject.video.parentNode.querySelector('.z-controls');

         if (node) { dupeBtn(node); }
         else {
            function attemptToDupeButton(maxAttempts = 5, initialWaitTime = 50) {
               let attempts = 0;
               let currentWaitTime = initialWaitTime;

               const tryDuplication = () => {
                  attempts++;

                  let node = flusherObject.video.parentNode.querySelector('.z-controls');
                  if (node) {
                     dupeBtn(node);
                  } else if (attempts < maxAttempts) {
                     setTimeout(tryDuplication, currentWaitTime);
                     currentWaitTime += initialWaitTime;
                  }
               };

               setTimeout(tryDuplication, currentWaitTime);
            }

            attemptToDupeButton();

         }
         lastRun = now;
      }
   }

   /* temp fix */
   flusherObject.props.isAeroKick ? flusherObject.video.append(chatflusherObject) : flusherObject.video.parentNode.append(chatflusherObject);
   flusherObject.props.external ? shadowRoot.appendChild(flusherObjectDiv) : chatflusherObject.append(flusherObjectContainer);
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