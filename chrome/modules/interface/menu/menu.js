import { menu } from './element.js';
import { createToggle, svgToggle } from '../toggle/toggle.js';
import { dragElement } from '../../utils/drag.js';

export function createMenu(flusher) {
   const toggledClass = 'toggled-on';

   flusher.video = flusher.props.external ? flusher.video : flusher.video.closest('.video-js');
   const domMenu = flusher.video.querySelector('.flusher-menu');
   if (domMenu === null) {
      let parent = flusher.props.external ? flusher.video.parentNode : document.querySelector('.vjs-control-bar');

      const shadowBox = document.createElement('div');
      shadowBox.id = 'shadowbox';
      const shadowRoot = shadowBox.attachShadow({ mode: 'open' });
      const b = typeof browser !== 'undefined' ? browser : chrome;

      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = b.runtime.getURL('lib/kick/app.b67a4f06.css');
      shadowRoot.appendChild(linkElement);

      const menuLink = document.createElement('link');
      menuLink.rel = 'stylesheet';
      menuLink.href = b.runtime.getURL('lib/flusher/menu.css');
      shadowRoot.appendChild(menuLink);

      flusher.menu = menu.cloneNode(true);
      flusher.menu.setAttribute('domain', flusher.props.domain);

      shadowRoot.appendChild(flusher.menu);
      parent.append(shadowBox);
      parent = parent.querySelector('#shadowbox').shadowRoot;

      let settingsMenu = parent.querySelector('.flusher-menu-settings');
      let layoutMenu = parent.querySelector('.flusher-menu-layout');
      let messageMenu = parent.querySelector('.flusher-menu-message');
      let overlayMenu = parent.querySelector('.flusher-menu-overlay');

      const closeBtn = parent.querySelector('.flusher-menu-close');
      closeBtn.addEventListener('mousedown', function (event) {
         hideMenu(flusher);
      });

      const homeBtn = parent.querySelector('.flusher-home');
      homeBtn.addEventListener('mousedown', function (event) {
         hideMenu(flusher);
         window.open('https://github.com/r0808914/Kick-Chat-Flusher/issues', '_blank');
      });

      const storeBtn = parent.querySelector('.flusher-store');
      storeBtn.addEventListener('mousedown', function (event) {
         hideMenu(flusher);
         const userAgent = navigator.userAgent.toLowerCase();
         userAgent.includes("firefox") ?
            window.open('https://addons.mozilla.org/en-US/firefox/addon/kickchatflusher/', '_blank') :
            window.open('https://chromewebstore.google.com/detail/kick-chat-flusher/cefplanllnmdnnhncpopljmcjnlafdke', '_blank');
      });

      const positionBtn = overlayMenu.querySelector('.flusher-position');
      const divInsidePosition = positionBtn.querySelector('div:empty');
      divInsidePosition.textContent = toTitleCase(flusher.states.positionStates[flusher.states.positionState]);

      positionBtn.addEventListener('mousedown', function (event) {
         flusher.states.positionState = (flusher.states.positionState + 1) % flusher.states.positionStates.length;
         setExtensionStorageItem('flusher-position', flusher.states.positionState);
         divInsidePosition.textContent = toTitleCase(flusher.states.positionStates[flusher.states.positionState]);
         flusher.container.setAttribute('position', flusher.states.positionStates[flusher.states.positionState].replace(/\s/g, ""));
         flusher.resetPosition();
      });

      const sizeBtn = overlayMenu.querySelector('.flusher-size');
      const divInsideSize = sizeBtn.querySelector('div:empty');
      divInsideSize.textContent = toTitleCase(flusher.states.sizeStates[flusher.states.sizeState]);

      sizeBtn.addEventListener('mousedown', function (event) {
         flusher.states.sizeState = (flusher.states.sizeState + 1) % flusher.states.sizeStates.length;
         setExtensionStorageItem('flusher-size', flusher.states.sizeState);
         divInsideSize.textContent = toTitleCase(flusher.states.sizeStates[flusher.states.sizeState]);
         flusher.container.setAttribute('size', flusher.states.sizeStates[flusher.states.sizeState].replace(/\s/g, ""));
         flusher.setVerticalWidth();
      });

      const backgroundBtn = messageMenu.querySelector('.flusher-background');
      const divInsideBackground = backgroundBtn.querySelector('div:empty');
      divInsideBackground.textContent = toTitleCase(flusher.states.backgroundStates[flusher.states.backgroundState]);

      backgroundBtn.addEventListener('mousedown', function (event) {
         flusher.states.backgroundState = (flusher.states.backgroundState + 1) % flusher.states.backgroundStates.length;
         setExtensionStorageItem('flusher-background', flusher.states.backgroundState);
         divInsideBackground.textContent = toTitleCase(flusher.states.backgroundStates[flusher.states.backgroundState]);
         flusher.container.setAttribute('background', flusher.states.backgroundStates[flusher.states.backgroundState]);
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
         hideMenu(flusher);
      });

      const layoutCloseBtn = parent.querySelector('.flusher-layout-close');
      layoutCloseBtn.addEventListener('mousedown', function (event) {
         hideMenu(flusher);
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

      const messageCloseBtn = parent.querySelector('.flusher-message-close');
      messageCloseBtn.addEventListener('mousedown', function (event) {
         hideMenu(flusher);
      });

      const messageMenuBtn = parent.querySelector('.flusher-messageMenu');
      messageMenuBtn.addEventListener('mousedown', function (event) {
         messageMenu.style.display = 'block';
         layoutMenu.style.display = 'none';
      });

      const messageBackBtn = parent.querySelector('.flusher-message-back');
      messageBackBtn.addEventListener('mousedown', function (event) {
         messageMenu.style.display = 'none';
         layoutMenu.style.display = 'block';
      });

      const overlayCloseBtn = parent.querySelector('.flusher-overlay-close');
      overlayCloseBtn.addEventListener('mousedown', function (event) {
         hideMenu(flusher);
      });

      const overlayMenuBtn = parent.querySelector('.flusher-overlayMenu');
      overlayMenuBtn.addEventListener('mousedown', function (event) {
         overlayMenu.style.display = 'block';
         layoutMenu.style.display = 'none';
      });

      const overlayBackBtn = parent.querySelector('.flusher-overlay-back');
      overlayBackBtn.addEventListener('mousedown', function (event) {
         overlayMenu.style.display = 'none';
         layoutMenu.style.display = 'block';
      });

      (flusher.states.flushState || !flusher.states.chatEnabled) ? layoutMenuBtn.style.display = 'none' : layoutMenuBtn.style.display = 'flex';

      const spamBtnContainer = parent.querySelector('.flusher-spam');
      const spamBtn = spamBtnContainer.querySelector('.flusher-toggle');
      spamBtn.addEventListener('mousedown', function (event) {
         const toggleElement = event.currentTarget;
         toggleElement.classList.toggle(toggledClass);
         const newSpamEnabled = toggleElement.classList.contains(toggledClass);
         flusher.states.spamState = newSpamEnabled;
         setExtensionStorageItem('flusher-spam', newSpamEnabled);
         flusher.props.displayedMessages = [];
      });

      (flusher.states.flushState || !flusher.states.chatEnabled) ? spamBtnContainer.style.display = 'none' : spamBtnContainer.style.display = 'flex';
      if (flusher.states.spamState) spamBtn.classList.toggle(toggledClass);

      const fontBtn = settingsMenu.querySelector('.flusher-font');
      const divInsideFont = fontBtn.querySelector('div:empty');
      divInsideFont.textContent = toTitleCase(flusher.states.sizeStates[flusher.states.fontState]);

      fontBtn.addEventListener('mousedown', function (event) {
         flusher.states.fontState = (flusher.states.fontState + 1) % flusher.states.sizeStates.length;
         setExtensionStorageItem('flusher-font', flusher.states.fontState);
         divInsideFont.textContent = toTitleCase(flusher.states.sizeStates[flusher.states.fontState]);
         flusher.container.setAttribute('font', flusher.states.sizeStates[flusher.states.fontState].replace(/\s/g, ""));
         if (flusher.states.flushState) flusher.clear();
      });

      (!flusher.states.chatEnabled) ? fontBtn.style.display = 'none' : fontBtn.style.display = 'flex';

      const replyToggleContainer = parent.querySelector('.flusher-reply');
      const replyToggle = replyToggleContainer.querySelector('.flusher-toggle');
      replyToggle.addEventListener('mousedown', function (event) {
         const toggleElement = event.currentTarget;
         toggleElement.classList.toggle(toggledClass);

         const newReplyEnabled = toggleElement.classList.contains(toggledClass);
         flusher.states.reply = newReplyEnabled;

         flusher.container.childNodes.forEach(childNode => {
            const chatEntry = childNode.querySelector('.chat-entry');
            if (chatEntry && chatEntry.childElementCount > 1) {
               chatEntry.firstElementChild.style.display = flusher.states.reply ? 'flex' : 'none';
            }
         });

         setExtensionStorageItem('flusher-reply', newReplyEnabled);
      });

      (flusher.props.external || flusher.props.isVod) ? replyToggleContainer.style.display = 'none' : replyToggleContainer.style.display = 'flex';
      if (flusher.states.reply) replyToggle.classList.toggle(toggledClass);

      const timeToggleContainer = messageMenu.querySelector('.flusher-time');
      const timeToggle = timeToggleContainer.querySelector('.flusher-toggle');
      timeToggle.addEventListener('mousedown', function (event) {
         const toggleElement = event.currentTarget;
         toggleElement.classList.toggle(toggledClass);

         const newTimeEnabled = toggleElement.classList.contains(toggledClass);
         flusher.states.timeState = newTimeEnabled;

         flusher.container.childNodes.forEach(childNode => {
            const chatEntry = childNode.querySelector('.chat-entry div');
            chatEntry.firstElementChild.style.display = flusher.states.timeState ? 'initial' : 'none';
         });

         flusher.container.setAttribute('time', newTimeEnabled);
         setExtensionStorageItem('flusher-time', newTimeEnabled);
      });

      if (flusher.states.timeState) timeToggle.classList.toggle(toggledClass);
      (!flusher.props.isVod || flusher.states.flushState) ? timeToggleContainer.style.display = 'none' : timeToggleContainer.style.display = 'flex';

      const flusherToggleContainer = parent.querySelector('.flusher-flush');
      const flushToggle = flusherToggleContainer.querySelector('.flusher-toggle');
      flushToggle.addEventListener('mousedown', function (event) {
         const toggleElement = event.currentTarget;
         toggleElement.classList.toggle(toggledClass);

         const newFlushState = toggleElement.classList.contains(toggledClass);
         newFlushState ? layoutMenuBtn.style.display = 'none' : layoutMenuBtn.style.display = 'flex';
         flusher.states.flushState = newFlushState;

         (flusher.states.flushState || !flusher.states.chatEnabled) ? spamBtnContainer.style.display = 'none' : spamBtnContainer.style.display = 'flex';

         if (flusher.states.flushState) {

         } else {

         }

         if (flusher.states.chatEnabled && !flusher.states.flushState) dragElement(flusher);

         togglePointerEvents(flusher);
         flusher.clear();
         flusher.container.setAttribute('layout', newFlushState ? 'horizontal' : 'vertical');

         setExtensionStorageItem('flusher-flush', newFlushState);
      });

      (!flusher.states.chatEnabled) ? flusherToggleContainer.style.display = 'none' : flusherToggleContainer.style.display = 'flex';
      if (flusher.states.flushState) flushToggle.classList.toggle(toggledClass);

      const flusherToggle = parent.querySelector('.flusher-enable .flusher-toggle');
      flusherToggle.addEventListener('mousedown', function (event) {
         const toggleElement = event.currentTarget;
         toggleElement.classList.toggle(toggledClass);

         const newChatEnabled = toggleElement.classList.contains(toggledClass);
         flusher.states.chatEnabled = newChatEnabled;

         newChatEnabled ? flusher.provider.bindRequests(flusher) : flusher.provider.unbindRequests(flusher)

         if (newChatEnabled && flusher.container.attributes['layout'].nodeValue === 'vertical') dragElement(flusher);

         flusher.clear();

         svgToggle(flusher);
         toggleEnableMenu();
         togglePointerEvents(flusher);

         (flusher.states.flushState || !flusher.states.chatEnabled) ? spamBtnContainer.style.display = 'none' : spamBtnContainer.style.display = 'flex';
         (flusher.states.flushState || !flusher.states.chatEnabled) ? layoutMenuBtn.style.display = 'none' : layoutMenuBtn.style.display = 'flex';
         (!flusher.states.chatEnabled) ? flusherToggleContainer.style.display = 'none' : flusherToggleContainer.style.display = 'flex';
         (!flusher.states.chatEnabled) ? fontBtn.style.display = 'none' : fontBtn.style.display = 'flex';

         flusher.container.setAttribute('enabled', newChatEnabled);

         setExtensionStorageItem('flusher-enable', newChatEnabled);
      });

      if (flusher.states.chatEnabled) flusherToggle.classList.toggle(toggledClass);

      togglePointerEvents(flusher);

      return createToggle(flusher);
   }

   function toTitleCase(str) {
      if (!str) return 'undefined';
      if (str === 'OFF' || str === 'ON') return str;
      return str.toLowerCase().replace(/\b\w/g, function (char) {
         return char.toUpperCase();
      });
   }

   function setExtensionStorageItem(key, value) {
      const data = { [key]: value };
      chrome.storage.local.set(data, () => {
         console.log(`Value for key ${key} has been set to ${value} in extension storage.`);
      });
   }
}

export function toggleEnableMenu() {
   var elementsToToggle = ['flusher-flush', 'flusher-settings', 'flusher-layoutMenu'];
   elementsToToggle.forEach(function (id) {
      var element = document.getElementById(id);
      if (element) {
         if (id === 'flusher-layoutMenu' && flusher.states.flushState === true && flusher.states.chatEnabled) return;
         flusher.states.chatEnabled ? flusher.video.style.display = 'flex' : flusher.video.style.display = 'none';
      }
   });
}

export function hideMenu(flusher) {
   const baseMenu = flusher.menu.querySelector('.flusher-menu-base');
   const settingsMenu = flusher.menu.querySelector('.flusher-menu-settings');
   const layoutMenu = flusher.menu.querySelector('.flusher-menu-layout');
   const overlayMenu = flusher.menu.querySelector('.flusher-menu-overlay');
   const messageMenu = flusher.menu.querySelector('.flusher-menu-message');

   flusher.menu.style.display = 'none';
   settingsMenu.style.display = 'none';
   baseMenu.style.display = 'none';
   layoutMenu.style.display = 'none';
   overlayMenu.style.display = 'none';
   messageMenu.style.display = 'none';

   svgToggle(flusher);
   document.removeEventListener('mousedown', flusher.clickOutsideHandlerFunction);
}

export function clickOutsideHandler(event, flusher) {
   if (flusher.menu !== null && !flusher.menu.contains(event.target)
      && flusher.menu.style.display === 'block'
      && !isClickInsideShadowBox(event.target)) {
      if (flusher.toggle.contains(event.target) || event.target === flusher.toggle) return;
      hideMenu(flusher);
   }
   function isClickInsideShadowBox(target) {
      const path = event.composedPath();
      return path.some((node) => node.id === 'shadowbox');
   }
}

function togglePointerEvents(flusher) {
   if (flusher.states.flushState || !flusher.states.chatEnabled) {
      flusher.container.classList.remove('flusher-grab');
      flusher.container.classList.add('flusher-no-grab');
      return;
   }
   flusher.props.lastRow = 2;
   dragElement(flusher);

   flusher.container.classList.remove('flusher-no-grab');
   flusher.container.classList.add('flusher-grab');
}
