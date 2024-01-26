import { menu } from './element.js';
import { createToggle, svgToggle } from '../toggle/toggle.js';
import { dragElement } from '../../utils/drag.js';
import { FlusherMessageProvider } from '../../flusher/messages.js';

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
      shadowRoot.appendChild(getFont());

      const menuLink = document.createElement('link');
      menuLink.rel = 'stylesheet';
      menuLink.href = b.runtime.getURL('lib/flusher/menu.css');
      shadowRoot.appendChild(menuLink);

      /* const menuStylesDom = document.getElementById('flusher-css');
      shadowRoot.appendChild(menuStylesDom.cloneNode(true)); */

      flusher.menu = menu.cloneNode(true);

      shadowRoot.appendChild(flusher.menu);
      parent.append(shadowBox);
      parent = parent.querySelector('#shadowbox').shadowRoot;

      const chatEnabledValue = localStorage.getItem('flusher-enable');
      flusher.props.chatEnabled = chatEnabledValue ? JSON.parse(chatEnabledValue) : flusher.props.chatEnabled;

      const flushStateValue = localStorage.getItem('flusher-flush');
      flusher.props.flushState = flushStateValue ? JSON.parse(flushStateValue) : flusher.props.flushState;

      const spamStateValue = localStorage.getItem('flusher-spam');
      flusher.states.spamState = spamStateValue ? JSON.parse(spamStateValue) : flusher.states.spamState;
      if (flusher.states.spamState === 0 && flusher.props.flushState) flusher.states.spamState = 2;

      const positionStateValue = localStorage.getItem('flusher-position');
      flusher.states.positionState = positionStateValue ? JSON.parse(positionStateValue) : flusher.states.positionState;

      const sizeStateValue = localStorage.getItem('flusher-size');
      flusher.states.sizeState = sizeStateValue ? JSON.parse(sizeStateValue) : flusher.states.sizeState;

      const backgroundStateValue = localStorage.getItem('flusher-background');
      flusher.states.backgroundState = backgroundStateValue ? JSON.parse(backgroundStateValue) : flusher.states.backgroundState;

      /* const spamBtn = parent.querySelector('.flusher-spam');
      const divInsideSpam = spamBtn.querySelector('div:empty');
      divInsideSpam.textContent = spamStates[flusher.states.spamState]; */

      /* spamBtn.addEventListener('mousedown', function (event) {
         flusher.states.spamState = (flusher.states.spamState + 1) % spamStates.length;
         if (flusher.states.spamState === 0 && !flusher.props.flushState) flusher.states.spamState++;
         localStorage.setItem('flusher-spam', JSON.stringify(flusher.states.spamState));
         divInsideSpam.textContent = spamStates[flusher.states.spamState];
         flusher.clear();
      }); */

      let settingsMenu = parent.querySelector('.flusher-menu-settings');
      let layoutMenu = parent.querySelector('.flusher-menu-layout');

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

      const positionBtn = layoutMenu.querySelector('.flusher-position');
      const divInsidePosition = positionBtn.querySelector('div:empty');
      divInsidePosition.textContent = toTitleCase(flusher.states.positionStates[flusher.states.positionState]);

      positionBtn.addEventListener('mousedown', function (event) {
         flusher.states.positionState = (flusher.states.positionState + 1) % flusher.states.positionStates.length;
         localStorage.setItem('flusher-position', JSON.stringify(flusher.states.positionState));
         divInsidePosition.textContent = toTitleCase(flusher.states.positionStates[flusher.states.positionState]);
         flusher.container.setAttribute('position', flusher.states.positionStates[flusher.states.positionState].replace(/\s/g, ""));
         flusher.resetPosition();
      });

      const sizeBtn = layoutMenu.querySelector('.flusher-size');
      const divInsideSize = sizeBtn.querySelector('div:empty');
      divInsideSize.textContent = toTitleCase(flusher.states.sizeStates[flusher.states.sizeState]);

      sizeBtn.addEventListener('mousedown', function (event) {
         flusher.states.sizeState = (flusher.states.sizeState + 1) % flusher.states.sizeStates.length;
         localStorage.setItem('flusher-size', JSON.stringify(flusher.states.sizeState));
         divInsideSize.textContent = toTitleCase(flusher.states.sizeStates[flusher.states.sizeState]);
         flusher.container.setAttribute('size', flusher.states.sizeStates[flusher.states.sizeState].replace(/\s/g, ""));
         flusher.resetPosition();
         flusher.setVerticalWidth();
      });

      const backgroundBtn = layoutMenu.querySelector('.flusher-background');
      const divInsideBackground = backgroundBtn.querySelector('div:empty');
      divInsideBackground.textContent = toTitleCase(flusher.states.backgroundStates[flusher.states.backgroundState]);

      backgroundBtn.addEventListener('mousedown', function (event) {
         flusher.states.backgroundState = (flusher.states.backgroundState + 1) % flusher.states.backgroundStates.length;
         localStorage.setItem('flusher-background', JSON.stringify(flusher.states.backgroundState));
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

      flusher.props.flushState ? layoutMenuBtn.style.display = 'none' : layoutMenuBtn.style.display = 'flex';

      const flusherToggle = parent.querySelector('.flusher-enable .flusher-toggle');
      flusherToggle.addEventListener('mousedown', function (event) {
         const toggleElement = event.currentTarget;
         toggleElement.classList.toggle(toggledClass);

         const newChatEnabled = toggleElement.classList.contains(toggledClass);
         flusher.props.chatEnabled = newChatEnabled;

         if (!flusher.props.external) newChatEnabled ? FlusherMessageProvider.bindRequests(flusher) : FlusherMessageProvider.unbindRequests(flusher)
         if (flusher.props.external) newChatEnabled ? subscribeChannel(flusher) : disposeChannel(flusher);

         if (newChatEnabled && flusher.container.attributes['layout'].nodeValue === 'vertical') dragElement(flusher);

         flusher.clear();

         svgToggle(flusher);
         toggleEnableMenu();
         togglePointerEvents(flusher);

         flusher.container.setAttribute('enabled', newChatEnabled);
         localStorage.setItem('flusher-enable', JSON.stringify(newChatEnabled));
      });

      if (flusher.props.chatEnabled) flusherToggle.classList.toggle(toggledClass);

      const flushToggle = parent.querySelector('.flusher-flush .flusher-toggle');
      flushToggle.addEventListener('mousedown', function (event) {
         const toggleElement = event.currentTarget;
         toggleElement.classList.toggle(toggledClass);

         const newFlushState = toggleElement.classList.contains(toggledClass);
         newFlushState ? layoutMenuBtn.style.display = 'none' : layoutMenuBtn.style.display = 'flex';
         flusher.props.flushState = newFlushState;

         if (flusher.props.flushState) {

         } else {

         }

         if (flusher.props.chatEnabled && flusher.container.attributes['layout'].nodeValue !== 'vertical') dragElement(flusher);

         togglePointerEvents(flusher);
         flusher.clear();
         flusher.container.setAttribute('layout', newFlushState ? 'horizontal' : 'vertical');

         localStorage.setItem('flusher-flush', JSON.stringify(newFlushState));
      });

      if (flusher.props.flushState) flushToggle.classList.toggle(toggledClass);

      togglePointerEvents(flusher);

      return createToggle(flusher);

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
         if (id === 'flusher-layoutMenu' && flusher.props.flushState === true && flusher.props.chatEnabled) return;
         flusher.props.chatEnabled ? flusher.video.style.display = 'flex' : flusher.video.style.display = 'none';
      }
   });
}

export function hideMenu(flusher) {
   const baseMenu = flusher.menu.querySelector('.flusher-menu-base');
   const settingsMenu = flusher.menu.querySelector('.flusher-menu-settings');
   const layoutMenu = flusher.menu.querySelector('.flusher-menu-layout');
   flusher.menu.style.display = 'none';
   settingsMenu.style.display = 'none';
   baseMenu.style.display = 'none';
   layoutMenu.style.display = 'none';
   svgToggle(flusher);
   document.removeEventListener('mousedown', flusher.clickOutsideHandlerFunction);
}

export function clickOutsideHandler(event, flusher) {
   const toggle = flusher.video.querySelector(flusher.props.external ? '.svg-toggle' : '.flusher-toggle');
   if (flusher.menu !== null && !flusher.menu.contains(event.target)
      && flusher.menu.style.display === 'block'
      && !isClickInsideShadowBox(event.target)) {
      if (toggle.contains(event.target) || event.target === toggle) return;
      hideMenu(flusher);
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

function togglePointerEvents(flusher) {
   if (flusher.props.flushState || !flusher.props.chatEnabled) {
      flusher.container.classList.remove('flusher-grab');
      flusher.container.classList.add('flusher-no-grab');
      return;
   }
   flusher.props.lastRow = 2;
   if (flusher.states.spamState === 0 && !flusher.props.flushState) flusher.states.spamState = 2;
   dragElement(flusher);
   /* localStorage.setItem('flusher-spam', JSON.stringify(flusher.props.flusher.spamState)); */
   /*  document.querySelector('.flusher-spam span').textContent = spamStates[flusher.props.flusher.spamState]; */
   flusher.container.classList.remove('flusher-no-grab');
   flusher.container.classList.add('flusher-grab');
}
