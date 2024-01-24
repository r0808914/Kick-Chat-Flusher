import { menu } from './element.js';
import { createToggle } from '../toggle/toggle.js';
import { dragElement} from '../../utils/drag.js';

export function createMenu(flusherSettings, element, flusher) {
   console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Create Menu');

   element = flusherSettings.external ? element : element.closest('.video-js');
   const domMenu = element.querySelector('.flusher-menu');
   if (domMenu === null) {
      const id = flusher.getAttribute('flusher-chatroom');

      /* flushers[id] = {}; */
      flusherSettings.maxRows = 99;
      flusherSettings.lastRow = 0;
      flusherSettings.badgeCache = [];
      flusherSettings.flusher = flusher;
      flusherSettings.flusherParent = element;
      flusherSettings.displayedMessages = new Set();

      let parent = flusherSettings.external ? element.parentNode : document.querySelector('.vjs-control-bar');

      const shadowBox = document.createElement('div');
      shadowBox.id = 'shadowbox';
      const shadowRoot = shadowBox.attachShadow({ mode: 'open' });
      const b = typeof browser !== 'undefined' ? browser : chrome;

      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = b.runtime.getURL('lib/kick/app.b67a4f06.css');
      shadowRoot.appendChild(linkElement);
      shadowRoot.appendChild(getFont());

      const menuStylesDom = document.getElementById('flusher-css');
      shadowRoot.appendChild(menuStylesDom.cloneNode(true));

      shadowRoot.appendChild(menu);
      parent.append(shadowBox);
      parent = parent.querySelector('#shadowbox').shadowRoot;

      const chatEnabledValue = localStorage.getItem('flusher-enable');
      flusherSettings.chatEnabled = chatEnabledValue ? JSON.parse(chatEnabledValue) : true;

      const flushStateValue = localStorage.getItem('flusher-flush');
      flusherSettings.flushState = flushStateValue ? JSON.parse(flushStateValue) : false;

      const spamStateValue = localStorage.getItem('flusher-spam');
      flusherSettings.spamState = spamStateValue ? JSON.parse(spamStateValue) : 1;
      if (flusherSettings.spamState === 0 && flusherSettings.flushState) flusherSettings.spamState = 2;

      const positionStateValue = localStorage.getItem('flusher-position');
      flusherSettings.positionState = positionStateValue ? JSON.parse(positionStateValue) : 0;

      const sizeStateValue = localStorage.getItem('flusher-size');
      flusherSettings.sizeState = sizeStateValue ? JSON.parse(sizeStateValue) : 1;

      const backgroundStateValue = localStorage.getItem('flusher-background');
      flusherSettings.backgroundState = backgroundStateValue ? JSON.parse(backgroundStateValue) : 2;

      /* const spamBtn = parent.querySelector('.flusher-spam');
      const divInsideSpam = spamBtn.querySelector('div:empty');
      divInsideSpam.textContent = spamStates[flusherSettings.spamState]; */

      /* spamBtn.addEventListener('mousedown', function (event) {
         flusherSettings.spamState = (flusherSettings.spamState + 1) % spamStates.length;
         if (flusherSettings.spamState === 0 && !flusherSettings.flushState) flusherSettings.spamState++;
         localStorage.setItem('flusher-spam', JSON.stringify(flusherSettings.spamState));
         divInsideSpam.textContent = spamStates[flusherSettings.spamState];
         clearChat(flusher);
      }); */

      let settingsMenu = parent.querySelector('.flusher-menu-settings');
      let layoutMenu = parent.querySelector('.flusher-menu-layout');

      const closeBtn = parent.querySelector('.flusher-menu-close');
      closeBtn.addEventListener('mousedown', function (event) {
         console.log('ok');
         hideMenu(element, id);
      });

      const homeBtn = parent.querySelector('.flusher-home');
      homeBtn.addEventListener('mousedown', function (event) {
         hideMenu(element, id);
         window.open('https://github.com/r0808914/Kick-Chat-Flusher/issues', '_blank');
      });

      const storeBtn = parent.querySelector('.flusher-store');
      storeBtn.addEventListener('mousedown', function (event) {
         hideMenu(element, id);
         const userAgent = navigator.userAgent.toLowerCase();
         userAgent.includes("firefox") ?
            window.open('https://addons.mozilla.org/en-US/firefox/addon/kickchatflusher/', '_blank') :
            window.open('https://chromewebstore.google.com/detail/kick-chat-flusher/cefplanllnmdnnhncpopljmcjnlafdke', '_blank');
      });

      const positionBtn = layoutMenu.querySelector('.flusher-position');
      const divInsidePosition = positionBtn.querySelector('div:empty');
      divInsidePosition.textContent = toTitleCase(flusherSettings.positionStates[flusherSettings.positionState]);

      positionBtn.addEventListener('mousedown', function (event) {
         flusherSettings.positionState = (flusherSettings.positionState + 1) % flusherSettings.positionStates.length;
         localStorage.setItem('flusher-position', JSON.stringify(flusherSettings.positionState));
         divInsidePosition.textContent = toTitleCase(flusherSettings.positionStates[flusherSettings.positionState]);
         flusher.setAttribute('position', flusherSettings.positionStates[flusherSettings.positionState].replace(/\s/g, ""));
         resetPostion(flusher);
      });

      const sizeBtn = layoutMenu.querySelector('.flusher-size');
      const divInsideSize = sizeBtn.querySelector('div:empty');
      divInsideSize.textContent = toTitleCase(flusherSettings.sizeStates[flusherSettings.sizeState]);

      sizeBtn.addEventListener('mousedown', function (event) {
         flusherSettings.sizeState = (flusherSettings.sizeState + 1) % flusherSettings.sizeStates.length;
         localStorage.setItem('flusher-size', JSON.stringify(flusherSettings.sizeState));
         divInsideSize.textContent = toTitleCase(flusherSettings.sizeStates[flusherSettings.sizeState]);
         flusher.setAttribute('size', flusherSettings.sizeStates[flusherSettings.sizeState].replace(/\s/g, ""));
         resetPostion(flusher);
         setVerticalWidth(flusher);
      });

      const backgroundBtn = layoutMenu.querySelector('.flusher-background');
      const divInsideBackground = backgroundBtn.querySelector('div:empty');
      divInsideBackground.textContent = toTitleCase(flusherSettings.backgroundStates[flusherSettings.backgroundState]);

      backgroundBtn.addEventListener('mousedown', function (event) {
         flusherSettings.backgroundState = (flusherSettings.backgroundState + 1) % flusherSettings.backgroundstates.length;
         localStorage.setItem('flusher-background', JSON.stringify(flusherSettings.backgroundState));
         divInsideBackground.textContent = toTitleCase(flusherSettings.backgroundStates[flusherSettings.backgroundState]);
         flusher.setAttribute('background', flusherSettings.backgroundstates[flusherSettings.backgroundState]);
      });

      const baseMenu = parent.querySelector('.flusher-menu-base');

      const settingsBtn = parent.querySelector('.flusher-settings');
      settingsBtn.addEventListener('mousedown', function (event) {
         settingsMenu.style.display = 'block';
         baseMenu.style.display = 'none';
      });

      const settingsBackBtn = parent.querySelector('.flusher-settings-back');
      settingsBackBtn.addEventListener('mousedown', function (event) {
         settingsMenu.style.display = 'none';
         baseMenu.style.display = 'block';
      });

      const settingsCloseBtn = parent.querySelector('.flusher-settings-close');
      settingsCloseBtn.addEventListener('mousedown', function (event) {
         hideMenu(element, id);
      });

      const layoutCloseBtn = parent.querySelector('.flusher-layout-close');
      layoutCloseBtn.addEventListener('mousedown', function (event) {
         hideMenu(element, id);
      });

      const layoutMenuBtn = parent.querySelector('.flusher-layoutMenu');
      layoutMenuBtn.addEventListener('mousedown', function (event) {
         layoutMenu.style.display = 'block';
         baseMenu.style.display = 'none';
      });

      const layoutBackBtn = parent.querySelector('.flusher-layout-back');
      layoutBackBtn.addEventListener('mousedown', function (event) {
         layoutMenu.style.display = 'none';
         baseMenu.style.display = 'block';
      });

      flusherSettings.flushState ? layoutMenuBtn.style.display = 'none' : layoutMenuBtn.style.display = 'flex';

      const flusherToggle = parent.querySelector('.flusher-enable .flusher-toggle');
      flusherToggle.addEventListener('mousedown', function (event) {
         const toggleElement = event.currentTarget;
         toggleElement.classList.toggle(flusherSettings.toggledClass);

         const newChatEnabled = toggleElement.classList.contains(flusherSettings.toggledClass);
         flusherSettings.chatEnabled = newChatEnabled;

         if (flusherSettings.external) newChatEnabled ? subscribeChannel(flusher, element) : disposeChannel(id);
         if (newChatEnabled && flusher.attributes['layout'].nodeValue === 'vertical') dragElement(flusher);

         clearChat(flusher);

         svgToggle(element, id);
         toggleEnableMenu();
         togglePointerEvents(flusher, flusherSettings);

         flusher.setAttribute('enabled', newChatEnabled);
         localStorage.setItem('flusher-enable', JSON.stringify(newChatEnabled));
      });

      if (flusherSettings.chatEnabled) flusherToggle.classList.toggle(flusherSettings.toggledClass);

      const flushToggle = parent.querySelector('.flusher-flush .flusher-toggle');
      flushToggle.addEventListener('mousedown', function (event) {
         const toggleElement = event.currentTarget;
         toggleElement.classList.toggle(flusherSettings.toggledClass);

         const newFlushState = toggleElement.classList.contains(flusherSettings.toggledClass);
         newFlushState ? layoutMenuBtn.style.display = 'none' : layoutMenuBtn.style.display = 'flex';
         flusherSettings.flushState = newFlushState;

         if (flusherSettings.flushState) {
            if (nativeChatObserver) nativeChatObserver.disconnect();
         } else {
            if (!flusherSettings.external) bindRequests();
         }
         /* if (chatEnabled) subscribeChannel(flusher, element); */
         if (flusherSettings.chatEnabled && flusher.attributes['layout'].nodeValue !== 'vertical') dragElement(flusher);

         togglePointerEvents(flusher, flusherSettings);
         clearChat(flusher);
         flusher.setAttribute('layout', newFlushState ? 'horizontal' : 'vertical');

         localStorage.setItem('flusher-flush', JSON.stringify(newFlushState));
      });

      if (flusherSettings.flushState) flushToggle.classList.toggle(flusherSettings.toggledClass);

      togglePointerEvents(flusher, flusherSettings);

      return createToggle(flusherSettings, element, flusher);

      function toTitleCase(str) {
         if (str === 'OFF' || str === 'ON') return str;
         return str.toLowerCase().replace(/\b\w/g, function (char) {
            return char.toUpperCase();
         });
      }
   }
}

export function toggleEnableMenu() {
   var elementsToToggle = ['flusher-flush', 'flusher-settings', 'flusher-layoutMenu'];
   elementsToToggle.forEach(function (id) {
      var element = document.getElementById(id);
      if (element) {
         if (id === 'flusher-layoutMenu' && flusherSettings.flusherSettings.flushState === true && flusherSettings.flusherSettings.chatEnabled) return;
         flusherSettings.flusherSettings.chatEnabled ? element.style.display = 'flex' : element.style.display = 'none';
      }
   });
}

export function hideMenu(element, chatroom_id, flusherSettings) {
   const parent = flusherSettings.flusherSettings.external ? element.parentNode : element;
   const popupMenu = parent.querySelector('#shadowbox').shadowRoot.querySelector('.flusher-menu');
   const baseMenu = popupMenu.querySelector('.flusher-menu-base');
   const settingsMenu = popupMenu.querySelector('.flusher-menu-settings');
   const layoutMenu = popupMenu.querySelector('.flusher-menu-layout');
   popupMenu.style.display = 'none';
   settingsMenu.style.display = 'none';
   baseMenu.style.display = 'none';
   layoutMenu.style.display = 'none';
   svgToggle(element, chatroom_id);
   document.removeEventListener('mousedown', clickOutsideHandlerFunction);
}

export function clickOutsideHandler(event, element, chatroom_id,flusherSettings) {
   const elementParent = flusherSettings.flusherSettings.external ? element.closest('.item-box') : element;
   const popupMenuParent = flusherSettings.flusherSettings.external ? elementParent.querySelector('#shadowbox').shadowRoot : elementParent;
   const popupMenu = popupMenuParent.querySelector('.flusher-menu');
   const toggle = elementParent.querySelector(flusherSettings.flusherSettings.external ? '.svg-toggle' : '.flusher-toggle');
   if (popupMenu !== null && !popupMenu.contains(event.target)
      && popupMenu.style.display === 'block'
      && !isClickInsideShadowBox(event.target)) {
      if (toggle.contains(event.target) || event.target === toggle) return;
      hideMenu(element, chatroom_id);
   }
   function isClickInsideShadowBox(target) {
      const path = event.composedPath();
      return path.some((node) => node.id === 'shadowbox');
   }
}

function getFont() {
   const fontLink = document.createElement('link');
   fontLink.rel = 'stylesheet';
   fontLink.id = 'inter-font';
   fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap';
   return fontLink;
}

function togglePointerEvents(flusher, flusherSettings) {
   if (flusherSettings.flushState || !flusherSettings.chatEnabled) {
      flusher.classList.remove('flusher-grab');
      flusher.classList.add('flusher-no-grab');
      return;
   }
   flusherSettings.lastRow = 2;
   if (flusherSettings.spamState === 0 && !flusherSettings.flushState) flusherSettings.spamState = 2;
   dragElement(flusher);
   /* localStorage.setItem('flusher-spam', JSON.stringify(flusherSettings.flushers[id].spamState)); */
   /*  document.querySelector('.flusher-spam span').textContent = spamStates[flusherSettings.flushers[id].spamState]; */
   flusher.classList.remove('flusher-no-grab');
   flusher.classList.add('flusher-grab');
}
