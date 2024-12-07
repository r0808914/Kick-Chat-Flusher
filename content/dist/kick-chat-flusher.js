/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./modules/flusher/states.js
class FlusherStates {
  constructor() {
    this.backgroundStates = ['SMALL', 'LARGE', 'OFF'];
    this.backgroundState = 0;
    this.positionStates = ['TOP LEFT', 'LEFT', 'BOTTOM LEFT', 'TOP RIGHT', 'RIGHT', 'BOTTOM RIGHT'];
    this.positionState = 4;
    this.sizeStates = ['SMALL', 'NORMAL', 'LARGE'];
    this.sizeState = 0;
    this.chatEnabled = true;
    this.flushState = false;
    this.shadow = true;
    this.slide = true;
    this.reply = true;
    this.timeState = false;
    this.spamState = false;
    this.fontState = 1;
    this.keybinds = {
      "overlay": "ALT + C",
      "flush": "ALT + G",
      "menu": "ALT + M",
      "spam": "ALT + S"
    };
    this.bans = true;
    this.banAlert = false;
    this.deleted = true;
    /* this.deletedAlert = false; */

    this.pinned = true;
    this.pinnedAlert = false;
  }
}
;// CONCATENATED MODULE: ./modules/flusher/props.js
class FlusherProps {
  constructor() {
    // General configuration and state
    this.chatroomId = null;
    this.domain = null;
    this.video = null;
    this.videoSize = null;
    this.isVod = false;
    this.isKickTools = false;
    this.external = false;
    this.loading = false;

    // Processing states
    this.isProcessingElements = false;
    this.isProcessingMessages = false;

    // Message-related properties
    this.displayedMessages = [];
    this.messageQueue = [];
    this.badgeCache = [];
    this.messageObservers = new Map();

    // Row and positioning related properties
    this.lastPositionPerRow = [];
    this.rowQueue = [];
    this.lastRow = 0;
    this.maxRows = 99;

    // Element queue and timeouts
    this.elementQueue = [];
    this.timeoutIds = [];

    // User and interaction related
    this.bannedUsers = [];
    this.clickOutsideHandlerFunction = null;

    // Keyboard input and keybinds
    this.keydownListener = null;
    this.keydownSetListener = null;
    this.isCaptureKeybind = false;
  }
}
;// CONCATENATED MODULE: ./modules/layout/horizontal.js
function selectRow(message, flusher) {
  let selectedRow = 0;
  const positions = flusher.props.lastPositionPerRow.length ?? 0;
  if (positions > 0) {
    for (let i = 0; i < positions; i++) {
      const item = flusher.props.lastPositionPerRow[i];
      if (item === undefined || item.run === true) {
        selectedRow = i;
        break;
      }
      if (flusher.props.rowQueue[i].length < 2) {
        message.row = i;
        message = prepareAnimation(message, flusher);
        if (message !== null) flusher.props.rowQueue[i].push(message);
        return;
      }
      selectedRow = i + 1;
    }
  }
  message.row = selectedRow;
  flusher.props.rowQueue[selectedRow] = flusher.props.rowQueue[selectedRow] ?? [];
  message = prepareAnimation(message, flusher);
  if (message !== null) startAnimation(message, flusher);
}
async function startAnimation(messageData, flusher) {
  const message = messageData.container;
  const space = 5;
  const rowIndex = messageData.row;
  const lastItem = flusher.props.lastPositionPerRow?.[rowIndex];
  !flusher.props.lastPositionPerRow ? flusher.props.lastPositionPerRow = [] : null;
  flusher.props.lastPositionPerRow[rowIndex] = {
    container: message,
    run: false
  };
  let overlap = 0;
  let messageWidth;
  const lastContainer = lastItem !== undefined ? lastItem.container : undefined;
  if (lastContainer !== undefined) {
    requestAnimationFrame(() => {
      flusher.messages.appendChild(message);
      messageWidth = message.offsetWidth;
      const rect2 = lastContainer.getBoundingClientRect();
      overlap = rect2.right - (flusher.props.parentRight ?? 0);

      /* queue running */
      if (lastItem.run === false) {
        message.style.marginRight = `-${messageWidth + overlap + space}px`;
        message.classList.add('flusher-animation');
      }

      /* queue ended */else {
        if (overlap > -8) {
          /* append last queue */
          message.style.marginRight = `-${messageWidth + overlap + space}px`;
          message.classList.add('flusher-animation');
        } else {
          /* new queue */
          message.style.marginRight = `-${messageWidth + space}px`;
          message.classList.add('flusher-animation');
          overlap = 0;
        }
      }
      requestNext(messageWidth, overlap, messageData, flusher);
    });
  }

  /* new row */else {
    flusher.messages.appendChild(message);
    messageWidth = message.offsetWidth;
    message.style.marginRight = `-${messageWidth + space}px`;
    message.classList.add('flusher-animation');
    overlap = 0;
    requestNext(messageWidth, overlap, messageData, flusher);
  }
  async function requestNext(messageWidth, overlap, messageData, flusher) {
    let timeNeeded = Math.ceil((messageWidth + space + overlap) / flusher.props.parentWidth * 16000);
    const timeoutId = setTimeout(() => {
      checkQueue(messageData, flusher);
      const index = flusher.props.timeoutIds.indexOf(timeoutId);
      if (index !== -1) {
        flusher.props.timeoutIds.splice(index, 1);
      }
    }, timeNeeded);
    flusher.props.timeoutIds.push(timeoutId);
  }
  function checkQueue(messageData, flusher) {
    const index = messageData.row;
    if (!flusher?.props?.rowQueue[index]) return;
    const queueItem = flusher.props.rowQueue[index].shift();
    if (queueItem) {
      checkRow(queueItem, index, flusher);
    } else {
      flusher.props.lastRow = flusher.props.lastRow - 1;
      flusher.props.lastPositionPerRow[index] = {
        container: messageData.container,
        run: true
      };
    }
  }
  function checkRow(messageData, rowIndex, flusher) {
    /* To be Fixed */

    /* if ((rowIndex + 1) > flusher.props.lastRow) {
    	for (let i = 0; i < rowIndex; i++) {
    		if (flusher.props.lastPositionPerRow[i] === undefined || flusher.props.lastPositionPerRow[i].run === true) {
    			if (messageData.message !== null) {
    				flusher.props.lastPositionPerRow[rowIndex] = undefined;
    				messageData.container.style.setProperty('--row', i);
    				messageData.container.classList.add('flusher-green');
    					startAnimation(messageData, flusher);
    			}
    			return;
    		}
    		if (flusher.props.rowQueue[i].length < 1) {
    			if (messageData.container !== null) {
    				flusher.props.lastPositionPerRow[i] = undefined;
    				messageData.container.style.setProperty('--row', i);
    				flusher.props.rowQueue[i].push(messageData);
    			}
    			return;
    		}
    	}
    } */

    startAnimation(messageData, flusher);
  }
}
function prepareAnimation(data, flusher) {
  if (!data.container) data.container = data;
  flusher.props.external ? data.container.classList.add('flusher-message') : data.container.classList.add('flusher-kick');
  data.container.style.setProperty('--row', data.row);
  data.container.addEventListener("animationend", function () {
    try {
      const oldest = flusher.messages.firstElementChild;
      if (flusher.states.spamState) {
        const entryId = flusher.props.isAeroKick ? oldest.querySelector('button')?.getAttribute('data-radial-id') : parseInt(oldest.getAttribute('flusher-id'), 10);
        if (entryId) flusher.props.displayedMessages = flusher.props.displayedMessages.filter(message => message.id !== entryId);
      }
      oldest.remove();
    } catch {}
  });
  return data;
}
;// CONCATENATED MODULE: ./modules/interface/menu/element.js
const menuHtml = `<div class="flusher-menu" style="display: none;">
  <div class="flusher-menu-base" style="display: block;">
    <div class="flex items-center justify-between px-2.5 pt-1 text-base font-bold">
      <div class="flex h-8 items-center space-x-2.5">
        <div class="flusher-menu-title">Chat&nbsp;Flusher</div>
      </div>
      <button class="flusher-menu-close variant-text size-xs flusher-icon-button">
        <div style="width: 12px; height: 12px;" class="flusher-icon icon">
          <svg width="12" height="12" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1.99602L10.504 0.5L6 4.99867L1.49602 0.5L0 1.99602L4.49867 6.5L0 11.004L1.49602 12.5L6 8.00133L10.504 12.5L12 11.004L7.50133 6.5L12 1.99602Z" fill="currentColor"></path>
          </svg>
        </div>
      </button>
    </div>
    <div class="chat-actions-content">
      <div class="chat-actions-menu-list">
        <div class="flusher-enable flusher-actions-item">
          <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Overlay</div>
          <div class="flex h-10 w-fit items-center justify-end">
            <div class="flusher-toggle-size-sm">
              <div class="flusher-toggle">
                <div class="flusher-toggle-indicator"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="flusher-flush flusher-actions-item" style="display: flex;">
          <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Flush</div>
          <div class="flex h-10 w-fit items-center justify-end">
            <div class="flusher-toggle-size-sm">
              <div class="flusher-toggle">
                <div class="flusher-toggle-indicator"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="flusher-layoutMenu flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60" style="display: flex;">
          <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Layout</div>
          <div class="flex h-10 w-fit items-center justify-end">
            <div style="width: 16px; height: 16px;" class="flusher-icon">
              <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                <path id="Layer" class="s0" d="m4.5 12.9l4.9-4.9-4.9-4.9 1.1-1.1 6 6-6 6z"></path>
              </svg>
            </div>
          </div>
        </div>
        <div class="flusher-settings flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60" style="display: flex;">
          <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Settings</div>
          <div class="flex h-10 w-fit items-center justify-end">
            <div style="width: 16px; height: 16px;" class="flusher-icon">
              <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                <path id="Layer" class="s0" d="m4.5 12.9l4.9-4.9-4.9-4.9 1.1-1.1 6 6-6 6z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="flusher-menu-settings" style="display: none;">
    <div class="flex items-center justify-between px-2.5 pt-1 text-base font-bold">
      <div class="flex h-8 items-center space-x-2.5">
        <button class="flusher-settings-back -ml-2 variant-text size-sm flusher-icon-button">
          <div style="width: 16px; height: 16px;" class="base-icon icon">
            <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m11.1 3.1l-4.9 4.9 4.9 4.9-1.1 1.1-6-6 6-6z"></path>
            </svg>
          </div>
        </button>
        <div class="pr-3">Settings</div>
      </div>
      <button class="flusher-settings-close variant-text size-xs flusher-icon-button">
        <div style="width: 12px; height: 12px;" class="base-icon icon">
          <svg width="12" height="12" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1.99602L10.504 0.5L6 4.99867L1.49602 0.5L0 1.99602L4.49867 6.5L0 11.004L1.49602 12.5L6 8.00133L10.504 12.5L12 11.004L7.50133 6.5L12 1.99602Z" fill="currentColor"></path>
          </svg>
        </div>
      </button>
    </div>
    <div class="chat-actions-content">
      <div class="flusher-spam flusher-actions-item">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Hide Spam</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div style="display: none;" class="flusher-font flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Font Size</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="select-none overflow-hidden truncate pr-0 text-sm font-medium"></div>
        </div>
      </div>
      <div class="flusher-spaced flusher-actions-item" style="display: none;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Spaced</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="flusher-background flusher-actions-item" style="display: none;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Background </div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="flusher-keybind flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Keybinds</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div style="width: 16px; height: 16px;" class="flusher-icon">
            <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m4.5 12.9l4.9-4.9-4.9-4.9 1.1-1.1 6 6-6 6z"></path>
            </svg>
          </div>
        </div>
      </div>
      <div class="flusher-event flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Events</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div style="width: 16px; height: 16px;" class="flusher-icon">
            <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m4.5 12.9l4.9-4.9-4.9-4.9 1.1-1.1 6 6-6 6z"></path>
            </svg>
          </div>
        </div>
      </div>
      <div class="flusher-about flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">About</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div style="width: 16px; height: 16px;" class="flusher-icon">
            <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m4.5 12.9l4.9-4.9-4.9-4.9 1.1-1.1 6 6-6 6z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="flusher-menu-keybind" style="display: none;">
    <div class="flex items-center justify-between px-2.5 pt-1 text-base font-bold">
      <div class="flex h-8 items-center space-x-2.5">
        <button class="flusher-keybind-back -ml-2 variant-text size-sm flusher-icon-button">
          <div style="width: 16px; height: 16px;" class="base-icon icon">
            <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m11.1 3.1l-4.9 4.9 4.9 4.9-1.1 1.1-6-6 6-6z"></path>
            </svg>
          </div>
        </button>
        <div class="pr-3">Keybinds</div>
      </div>
      <button class="flusher-keybind-close variant-text size-xs flusher-icon-button">
        <div style="width: 12px; height: 12px;" class="base-icon icon">
          <svg width="12" height="12" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1.99602L10.504 0.5L6 4.99867L1.49602 0.5L0 1.99602L4.49867 6.5L0 11.004L1.49602 12.5L6 8.00133L10.504 12.5L12 11.004L7.50133 6.5L12 1.99602Z" fill="currentColor"></path>
          </svg>
        </div>
      </button>
    </div>
    <div class="chat-actions-content">
      <div class="flusher-keybind-overlay flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-3 text-sm font-medium">Toggle Overlay</div>
        <div class="flex h-10 items-center" style="width: 50px;">
          <div class="select-none text-sm font-medium" style="white-space: nowrap;margin-right: auto;"></div>
        </div>
      </div>
      <div style="display: none;" class="flusher-keybind-menu flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-3 text-sm font-medium">Toggle Menu</div>
        <div class="flex h-10 items-center" style="width: 50px;">
          <div class="select-none text-sm font-medium" style="white-space: nowrap;margin-right: auto;"></div>
        </div>
      </div>
      <div class="flusher-keybind-flush flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-3 text-sm font-medium">Toggle Flush</div>
        <div class="flex h-10 items-center" style="width: 50px;">
          <div class="select-none text-sm font-medium" style="white-space: nowrap;margin-right: auto;"></div>
        </div>
      </div>
      <div class="flusher-keybind-spam flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-3 text-sm font-medium">Toggle Spam</div>
        <div class="flex h-10 items-center" style="width: 50px;">
          <div class="select-none text-sm font-medium" style="white-space: nowrap;margin-right: auto;"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="flusher-menu-about" style="display: none;">
    <div class="flex items-center justify-between px-2.5 pt-1 text-base font-bold">
      <div class="flex h-8 items-center space-x-2.5">
        <button class="flusher-about-back -ml-2 variant-text size-sm flusher-icon-button">
          <div style="width: 16px; height: 16px;" class="base-icon icon">
            <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m11.1 3.1l-4.9 4.9 4.9 4.9-1.1 1.1-6-6 6-6z"></path>
            </svg>
          </div>
        </button>
        <div class="pr-3">About</div>
      </div>
      <button class="flusher-about-close variant-text size-xs flusher-icon-button">
        <div style="width: 12px; height: 12px;" class="base-icon icon">
          <svg width="12" height="12" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1.99602L10.504 0.5L6 4.99867L1.49602 0.5L0 1.99602L4.49867 6.5L0 11.004L1.49602 12.5L6 8.00133L10.504 12.5L12 11.004L7.50133 6.5L12 1.99602Z" fill="currentColor"></path>
          </svg>
        </div>
      </button>
    </div>
    <div class="chat-actions-content">
      <div class="flusher-store flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-0 text-sm font-medium">Web Store </div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div style="width: 16px; height: 16px;" class="flusher-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.5 12.5V2H2V14H14V12.5H3.5Z" fill="currentColor"></path>
              <path d="M5.52869 11.5287L10.9999 6.06125V9.5H12.4999V3.5H6.49994V5H9.93869L4.47119 10.4712L5.52869 11.5287Z" fill="currentColor"></path>
            </svg>
          </div>
        </div>
      </div>
      <div class="flusher-home flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-0 text-sm font-medium">Report Bugs </div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div style="width: 16px; height: 16px;" class="flusher-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.5 12.5V2H2V14H14V12.5H3.5Z" fill="currentColor"></path>
              <path d="M5.52869 11.5287L10.9999 6.06125V9.5H12.4999V3.5H6.49994V5H9.93869L4.47119 10.4712L5.52869 11.5287Z" fill="currentColor"></path>
            </svg>
          </div>
        </div>
      </div>
      <div style="display: none;" class="flusher-debug flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-0 text-sm font-medium">Debug </div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div style="width: 16px; height: 16px;" class="flusher-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.5 12.5V2H2V14H14V12.5H3.5Z" fill="currentColor"></path>
              <path d="M5.52869 11.5287L10.9999 6.06125V9.5H12.4999V3.5H6.49994V5H9.93869L4.47119 10.4712L5.52869 11.5287Z" fill="currentColor"></path>
            </svg>
          </div>
        </div>
      </div>
      <div class="flusher-actions-item active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Version</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="select-none overflow-hidden truncate pr-0 text-sm font-medium">1.2.0</div>
        </div>
      </div>
    </div>
  </div>
  <div class="flusher-menu-layout" style="display: none;">
    <div class="flex items-center justify-between px-2.5 pt-1 text-base font-bold">
      <div class="flex h-8 items-center space-x-2.5">
        <button class="flusher-layout-back -ml-2 variant-text size-sm flusher-icon-button">
          <div style="width: 16px; height: 16px;" class="base-icon icon">
            <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m11.1 3.1l-4.9 4.9 4.9 4.9-1.1 1.1-6-6 6-6z"></path>
            </svg>
          </div>
        </button>
        <div class="pr-3">Layout</div>
      </div>
      <button class="flusher-layout-close variant-text size-xs flusher-icon-button">
        <div style="width: 12px; height: 12px;" class="base-icon icon">
          <svg width="12" height="12" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1.99602L10.504 0.5L6 4.99867L1.49602 0.5L0 1.99602L4.49867 6.5L0 11.004L1.49602 12.5L6 8.00133L10.504 12.5L12 11.004L7.50133 6.5L12 1.99602Z" fill="currentColor"></path>
          </svg>
        </div>
      </button>
    </div>
    <div class="chat-actions-content">
      <div class="flusher-messageMenu flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Message</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div style="width: 16px; height: 16px;" class="flusher-icon">
            <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m4.5 12.9l4.9-4.9-4.9-4.9 1.1-1.1 6 6-6 6z"></path>
            </svg>
          </div>
        </div>
      </div>
      <div class="flusher-overlayMenu flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Overlay</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div style="width: 16px; height: 16px;" class="flusher-icon">
            <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m4.5 12.9l4.9-4.9-4.9-4.9 1.1-1.1 6 6-6 6z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="flusher-menu-event" style="display: none;">
    <div class="flex items-center justify-between px-2.5 pt-1 text-base font-bold">
      <div class="flex h-8 items-center space-x-2.5">
        <button class="flusher-event-back -ml-2 variant-text size-sm flusher-icon-button">
          <div style="width: 16px; height: 16px;" class="base-icon icon">
            <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m11.1 3.1l-4.9 4.9 4.9 4.9-1.1 1.1-6-6 6-6z"></path>
            </svg>
          </div>
        </button>
        <div class="pr-3">Events</div>
      </div>
      <button class="flusher-event-close variant-text size-xs flusher-icon-button">
        <div style="width: 12px; height: 12px;" class="base-icon icon">
          <svg width="12" height="12" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1.99602L10.504 0.5L6 4.99867L1.49602 0.5L0 1.99602L4.49867 6.5L0 11.004L1.49602 12.5L6 8.00133L10.504 12.5L12 11.004L7.50133 6.5L12 1.99602Z" fill="currentColor"></path>
          </svg>
        </div>
      </button>
    </div>
    <div class="chat-actions-content">
      <div class="flusher-event-bans flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Bans</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div style="width: 16px; height: 16px;" class="flusher-icon">
            <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m4.5 12.9l4.9-4.9-4.9-4.9 1.1-1.1 6 6-6 6z"></path>
            </svg>
          </div>
        </div>
      </div>
      <div class="flusher-event-deleted flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Deleted</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div style="width: 16px; height: 16px;" class="flusher-icon">
            <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m4.5 12.9l4.9-4.9-4.9-4.9 1.1-1.1 6 6-6 6z"></path>
            </svg>
          </div>
        </div>
      </div>
      <div class="flusher-event-pinned flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Pinned</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div style="width: 16px; height: 16px;" class="flusher-icon">
            <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m4.5 12.9l4.9-4.9-4.9-4.9 1.1-1.1 6 6-6 6z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="flusher-menu-event-bans" style="display: none;">
    <div class="flex items-center justify-between px-2.5 pt-1 text-base font-bold">
      <div class="flex h-8 items-center space-x-2.5">
        <button class="flusher-event-bans-back -ml-2 variant-text size-sm flusher-icon-button">
          <div style="width: 16px; height: 16px;" class="base-icon icon">
            <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m11.1 3.1l-4.9 4.9 4.9 4.9-1.1 1.1-6-6 6-6z"></path>
            </svg>
          </div>
        </button>
        <div class="pr-3">Bans</div>
      </div>
      <button class="flusher-event-bans-close variant-text size-xs flusher-icon-button">
        <div style="width: 12px; height: 12px;" class="base-icon icon">
          <svg width="12" height="12" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1.99602L10.504 0.5L6 4.99867L1.49602 0.5L0 1.99602L4.49867 6.5L0 11.004L1.49602 12.5L6 8.00133L10.504 12.5L12 11.004L7.50133 6.5L12 1.99602Z" fill="currentColor"></path>
          </svg>
        </div>
      </button>
    </div>
    <div class="chat-actions-content">
      <div class="flusher-event-bans-show flusher-actions-item" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-3 text-sm font-medium">Show Bans</div>
        <div class="flex h-10 w-fit pl-2 items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="flusher-event-bans-alert flusher-actions-item">
        <div class="select-none overflow-hidden truncate pr-3 text-sm font-medium">Alert Tone</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="flusher-menu-event-pinned" style="display: none;">
    <div class="flex items-center justify-between px-2.5 pt-1 text-base font-bold">
      <div class="flex h-8 items-center space-x-2.5">
        <button class="flusher-event-pinned-back -ml-2 variant-text size-sm flusher-icon-button">
          <div style="width: 16px; height: 16px;" class="base-icon icon">
            <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m11.1 3.1l-4.9 4.9 4.9 4.9-1.1 1.1-6-6 6-6z"></path>
            </svg>
          </div>
        </button>
        <div class="pr-3">Pinned</div>
      </div>
      <button class="flusher-event-pinned-close variant-text size-xs flusher-icon-button">
        <div style="width: 12px; height: 12px;" class="base-icon icon">
          <svg width="12" height="12" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1.99602L10.504 0.5L6 4.99867L1.49602 0.5L0 1.99602L4.49867 6.5L0 11.004L1.49602 12.5L6 8.00133L10.504 12.5L12 11.004L7.50133 6.5L12 1.99602Z" fill="currentColor"></path>
          </svg>
        </div>
      </button>
    </div>
    <div class="chat-actions-content">
      <div class="flusher-event-pinned-show flusher-actions-item" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-3 text-sm font-medium">Show Pinned</div>
        <div class="flex h-10 w-fit pl-2 items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="flusher-event-pinned-alert flusher-actions-item">
        <div class="select-none overflow-hidden truncate pr-3 text-sm font-medium">Alert Tone</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="flusher-menu-event-deleted" style="display: none;">
    <div class="flex items-center justify-between px-2.5 pt-1 text-base font-bold">
      <div class="flex h-8 items-center space-x-2.5">
        <button class="flusher-event-deleted-back -ml-2 variant-text size-sm flusher-icon-button">
          <div style="width: 16px; height: 16px;" class="base-icon icon">
            <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m11.1 3.1l-4.9 4.9 4.9 4.9-1.1 1.1-6-6 6-6z"></path>
            </svg>
          </div>
        </button>
        <div class="pr-3">Deleted</div>
      </div>
      <button class="flusher-event-deleted-close variant-text size-xs flusher-icon-button">
        <div style="width: 12px; height: 12px;" class="base-icon icon">
          <svg width="12" height="12" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1.99602L10.504 0.5L6 4.99867L1.49602 0.5L0 1.99602L4.49867 6.5L0 11.004L1.49602 12.5L6 8.00133L10.504 12.5L12 11.004L7.50133 6.5L12 1.99602Z" fill="currentColor"></path>
          </svg>
        </div>
      </button>
    </div>
    <div class="chat-actions-content">
      <div class="flusher-event-deleted-show flusher-actions-item" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-3 text-sm font-medium">Show Deleted</div>
        <div class="flex h-10 w-fit pl-2 items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="flusher-menu-message" style="display: none;">
    <div class="flex items-center justify-between px-2.5 pt-1 text-base font-bold">
      <div class="flex h-8 items-center space-x-2.5">
        <button class="flusher-message-back -ml-2 variant-text size-sm flusher-icon-button">
          <div style="width: 16px; height: 16px;" class="base-icon icon">
            <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m11.1 3.1l-4.9 4.9 4.9 4.9-1.1 1.1-6-6 6-6z"></path>
            </svg>
          </div>
        </button>
        <div class="pr-3">Message</div>
      </div>
      <button class="flusher-message-close variant-text size-xs flusher-icon-button">
        <div style="width: 12px; height: 12px;" class="base-icon icon">
          <svg width="12" height="12" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1.99602L10.504 0.5L6 4.99867L1.49602 0.5L0 1.99602L4.49867 6.5L0 11.004L1.49602 12.5L6 8.00133L10.504 12.5L12 11.004L7.50133 6.5L12 1.99602Z" fill="currentColor"></path>
          </svg>
        </div>
      </button>
    </div>
    <div class="chat-actions-content">
      <div class="flusher-reply flusher-actions-item" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Show Reply</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="flusher-slide flusher-actions-item" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Animation</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="flusher-shadow flusher-actions-item" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Text Shadow</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="flusher-time flusher-actions-item" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Show Time</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="flusher-background flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Background</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="select-none overflow-hidden truncate pr-0 text-sm font-medium"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="flusher-menu-overlay" style="display: none;">
    <div class="flex items-center justify-between px-2.5 pt-1 text-base font-bold">
      <div class="flex h-8 items-center space-x-2.5">
        <button class="flusher-overlay-back -ml-2 variant-text size-sm flusher-icon-button">
          <div style="width: 16px; height: 16px;" class="base-icon icon">
            <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m11.1 3.1l-4.9 4.9 4.9 4.9-1.1 1.1-6-6 6-6z"></path>
            </svg>
          </div>
        </button>
        <div class="pr-3">Overlay</div>
      </div>
      <button class="flusher-overlay-close variant-text size-xs flusher-icon-button">
        <div style="width: 12px; height: 12px;" class="base-icon icon">
          <svg width="12" height="12" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1.99602L10.504 0.5L6 4.99867L1.49602 0.5L0 1.99602L4.49867 6.5L0 11.004L1.49602 12.5L6 8.00133L10.504 12.5L12 11.004L7.50133 6.5L12 1.99602Z" fill="currentColor"></path>
          </svg>
        </div>
      </button>
    </div>
    <div class="chat-actions-content">
      <div class="flusher-position flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Position</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="select-none overflow-hidden truncate pr-0 text-sm font-medium"></div>
        </div>
      </div>
      <div class="flusher-size flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Size</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="select-none overflow-hidden truncate pr-0 text-sm font-medium"></div>
        </div>
      </div>
    </div>
  </div>
</div>`;
const parser = new DOMParser();
const doc = parser.parseFromString(menuHtml, 'text/html');
const menu = doc.body.firstChild;
;// CONCATENATED MODULE: ./modules/interface/toggle/element.js
const toggleHtml = `<button class="flusher-toggle vjs-control vjs-button"><span class="vjs-icon-placeholder" aria-hidden="true"></span><svg
viewBox="0 0 16 16" color="white" class="mx-auto toggle-icon" style="width: 25px;">
<path
  d="M12.8191 7.99813C12.8191 7.64949 12.7816 7.30834 12.7104 6.97844L13.8913 6.29616L12.3918 3.69822L11.2071 4.38051C10.7048 3.9269 10.105 3.57076 9.44517 3.35708V2H6.44611V3.36082C5.78632 3.57451 5.19025 3.9269 4.68416 4.38426L3.49953 3.70197L2 6.29616L3.18088 6.97844C3.10965 7.30834 3.07217 7.64949 3.07217 7.99813C3.07217 8.34677 3.10965 8.68791 3.18088 9.01781L2 9.70009L3.49953 12.298L4.68416 11.6157C5.1865 12.0694 5.78632 12.4255 6.44611 12.6392V14H9.44517V12.6392C10.105 12.4255 10.701 12.0731 11.2071 11.6157L12.3918 12.298L13.8913 9.70009L12.7104 9.01781C12.7816 8.68791 12.8191 8.34677 12.8191 7.99813ZM9.82006 9.87254H6.07123V6.12371H9.82006V9.87254Z"
  fill="currentColor"></path>
</svg><span class="vjs-control-text" aria-live="polite">Chat Flusher</span>
</button>`;
const element_parser = new DOMParser();
const element_doc = element_parser.parseFromString(toggleHtml, 'text/html');
const toggle = element_doc.body.firstChild;
;// CONCATENATED MODULE: ./modules/interface/toggle/toggle.js


let clickOutsideHandlerFunction = null;
function createToggle(flusher) {
  /* const parent = (!flusher.props.isAeroKick && !flusher.props.external) ? flusher.video.closest('#video-holder') : flusher.video.parentNode; */
  const parent = flusher.video.parentNode;
  const popupMenu = parent.querySelector('#shadowbox').shadowRoot.querySelector('.flusher-menu');
  const baseMenu = popupMenu.querySelector('.flusher-menu-base');
  let toggleBtn;
  if (!flusher.toggleNative) {
    const domToggle = parent?.querySelector('.flusher-toggle-btn');
    if (domToggle !== null) return;
    toggleBtn = flusher.props.external || flusher.props.isAeroKick ? toggle.querySelector('svg').cloneNode(true) : toggle.cloneNode(true);
    if (flusher.props.external && !document.querySelector('.vjs-control-bar .flusher-toggle')) {
      toggleBtn.style.marginLeft = "1rem";
      toggleBtn.style.marginRight = "1rem";
    }
    const existingButton = flusher.props.external ? parent : flusher.props.isAeroKick ? flusher.video.parentElement.querySelector('button.bk-relative.bk-mr-4') : document.querySelector('.vjs-fullscreen-control');
    flusher.props.external ? existingButton.parentNode.append(toggleBtn) : existingButton.parentElement.insertBefore(toggleBtn, flusher.props.isAeroKick ? existingButton : existingButton.nextSibling);
  } else {
    toggleBtn = flusher.toggleNative;
  }

  /* svgToggle(flusher); */

  toggleBtn.addEventListener('mousedown', function (event) {
    event.stopPropagation();
    popupMenu.style.display === "block" ? hideMenu(flusher) : showMenu();
  });
  function showMenu() {
    flusher.clickOutsideHandlerFunction = event => clickOutsideHandler(event, flusher);
    const parentElement = flusher.video.parentElement;
    const config = {
      childList: true,
      subtree: true
    };
    const callback = mutationsList => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          const shadowbox = parentElement.querySelector('#shadowbox');
          if (!shadowbox) {
            observer.disconnect();
            hideMenu(flusher);
          }
        }
      }
    };
    const observer = new MutationObserver(callback);
    observer.observe(parentElement, config);
    baseMenu.style.display = 'block';
    popupMenu.style.display = 'block';
    function alignPopupMenu() {
      document.querySelector('#shadowbox').style.left = `${50}px`;
      const popupMenuRect = popupMenu.getBoundingClientRect();
      const toggleRect = flusher.toggle.getBoundingClientRect();
      const videoRect = flusher.video.parentElement.getBoundingClientRect();
      const toggleCenterX = toggleRect.left + toggleRect.width / 2;
      const popupCenterX = popupMenuRect.left + popupMenuRect.width / 2;
      let newLeftPosition = toggleCenterX - popupCenterX;
      const minLeft = videoRect.left;
      const maxLeft = videoRect.left + videoRect.width - popupMenuRect.width + 40;
      newLeftPosition = Math.max(minLeft, Math.min(newLeftPosition, maxLeft));
      document.querySelector('#shadowbox').style.left = `${newLeftPosition}px`;
    }
    alignPopupMenu();
    svgToggle(flusher);
    document.addEventListener('mousedown', flusher.clickOutsideHandlerFunction);
    flusher.container.classList.add('flusher-hover');
    if (flusher.props.popupContainer) {
      flusher.props.popupContainer.style.display = "block";
      window.addEventListener("click", closePopupOutside);
      const closeBtn = flusher.props.popupContainer.querySelector("#closeBtn");
      function closePopup() {
        flusher.props.popupContainer.style.display = "none";
        window.removeEventListener("click", closePopupOutside);
        const data = {
          ['flusher-intro']: true
        };
        chrome.storage.local.set(data, () => {
          /* logToConsole(`Value for key ${key} has been set to ${value} in extension storage.`); */
        });
        flusher.props.popupContainer = null;
      }
      function closePopupOutside(event) {
        if (!flusher.props.popupContainer.contains(event.target) && !flusher.toggle.contains(event.target)) {
          closePopup();
        }
      }
      closeBtn.onclick = closePopup;
    }
  }
  return toggleBtn;
}
function svgToggle(flusher) {
  const toggle = flusher?.toggle?.querySelector('rect');
  if (!toggle) return;
  const visible = flusher.menu.style.display === "block" ? true : false;
  if (flusher.states.chatEnabled || visible) {
    toggle.classList.add('svg-toggle');
  } else {
    toggle.classList.remove('svg-toggle');
  }
}
;// CONCATENATED MODULE: ./modules/utils/drag.js
function dragElement(flusher) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  let offsetX = 0,
    offsetY = 0;
  let lastValidX = 0,
    lastValidY = 0;
  flusher.container.onmousedown = function (e) {
    if (e.target.closest('div')?.classList.contains('flusher-close-btn')) return;
    e = e || window.event;
    e.preventDefault();
    const videoRect = flusher.video.getBoundingClientRect();
    const containerRect = flusher.container.getBoundingClientRect();
    offsetX = e.clientX - containerRect.left;
    offsetY = e.clientY - containerRect.top;
    pos3 = e.clientX;
    pos4 = e.clientY;
    lastValidX = pos3 - offsetX - videoRect.left;
    lastValidY = pos4 - offsetY - videoRect.top;
    setInitialPosition(flusher, videoRect, containerRect);
    flusher.container.removeAttribute("position");
    setInitialDimensions(flusher);
    if (isInResizeHandle(e)) {
      flusher.container.removeAttribute("size");
      document.onmouseup = closeResize;
      document.onmousemove = resizeElement;
    } else {
      document.onmouseup = closeDragElement;
      document.onmousemove = event => dragElement(event, videoRect);
    }
    function setInitialPosition(flusher, videoRect, containerRect) {
      const offsetTop = containerRect.top - videoRect.top;
      const offsetLeft = containerRect.left - videoRect.left;
      flusher.container.style.top = offsetTop + "px";
      flusher.container.style.left = offsetLeft + "px";
    }
    function setInitialDimensions(flusher) {
      flusher.container.style.width = flusher.container.offsetWidth + "px";
      flusher.container.style.height = flusher.container.offsetHeight + "px";
    }
  };
  function closeResize() {
    document.onmouseup = null;
    document.onmousemove = null;
    setPosition(flusher, false);
  }
  function dragElement(e, videoRect) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    lastValidX = pos3 - offsetX - videoRect.left;
    lastValidY = pos4 - offsetY - videoRect.top;
    requestAnimationFrame(() => {
      flusher.container.style.top = lastValidY + "px";
      flusher.container.style.left = lastValidX + "px";
    });
  }
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    requestAnimationFrame(() => {
      flusher.container.style.top = lastValidY + "px";
      flusher.container.style.left = lastValidX + "px";
    });
    setPosition(flusher, false);
  }
  function resizeElement(e) {
    e = e || window.event;
    e.preventDefault();
    flusher.container.style.width = Math.max(100, flusher.container.offsetWidth - (pos3 - e.clientX)) + "px";
    flusher.container.style.height = Math.max(100, flusher.container.offsetHeight - (pos4 - e.clientY)) + "px";
    pos3 = e.clientX;
    pos4 = e.clientY;
  }
  function isInResizeHandle(e) {
    var rect = flusher.container.getBoundingClientRect();
    var handleSize = 25;
    return e.clientX >= rect.right - handleSize && e.clientY >= rect.bottom - handleSize;
  }
  async function setPosition(flusher, event) {
    const scaleFactor = window.innerWidth / window.outerWidth;
    const rect = flusher.container.getBoundingClientRect();
    const rectVideo = flusher.video.getBoundingClientRect();
    const newPosition = {
      top: Math.round(rect.top - rectVideo.top) / scaleFactor,
      left: Math.round(rect.left - rectVideo.left) / scaleFactor,
      width: Math.round(rect.width) / scaleFactor,
      height: Math.round(rect.height) / scaleFactor
    };
    chrome.storage.local.get("positionsPerChannel", function (result) {
      const positionsPerChannel = result.positionsPerChannel || {};
      const positionsArray = positionsPerChannel[flusher.props.channelName] || [];
      const existingPositionIndex = positionsArray.findIndex(function (item) {
        return item.videoSize === flusher.props.videoSize;
      });
      if (existingPositionIndex !== -1) {
        positionsArray[existingPositionIndex].position.top = newPosition.top;
        positionsArray[existingPositionIndex].position.left = newPosition.left;
        positionsArray[existingPositionIndex].position.width = newPosition.width;
        positionsArray[existingPositionIndex].position.height = newPosition.height;
      } else {
        positionsArray.push({
          videoSize: flusher.props.videoSize,
          position: newPosition
        });
      }
      positionsPerChannel[flusher.props.channelName] = positionsArray;
      chrome.storage.local.set({
        "positionsPerChannel": positionsPerChannel
      });
    });
  }
}
;// CONCATENATED MODULE: ./modules/utils/utils.js
function visibilityChange(flusher) {
  if (window.handleVisibility) document.removeEventListener('visibilitychange', window.handleVisibility);
  window.handleVisibility = function handleVisibilityChange() {
    if (!flusher) return;
    if (document.hidden) {
      if (flusher.container !== null) flusher.container.style.display = "none";
      flusher.removeItems();
      if (flusher.states.flushState) {
        flusher.props.chatEnabledVisible = flusher.states.chatEnabled;
        flusher.states.chatEnabled = false;
      } else {
        flusher.provider.unbindRequests(flusher);
      }
    } else {
      if (flusher.container !== null) flusher.container.style.display = "flex";
      if (flusher.states.flushState) {
        flusher.states.chatEnabled = flusher.props.chatEnabledVisible;
      } else {
        flusher.provider.bindRequests(flusher);
      }
    }
  };
  document.addEventListener('visibilitychange', window.handleVisibility);
}
function getFont() {
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap';
  return fontLink;
}
function logToConsole(message) {
  const isChrome = navigator.userAgent.toLowerCase().includes('chrome');
  isChrome ? console.log(`%c Kick Chat Flusher %c ${message}`, 'background: #228B22; color: #FFFFFF; padding: 2px 0;', '') : console.log('Kick Chat Flusher - ', message);
}
function toTitleCase(str) {
  if (!str) return 'undefined';
  if (str === 'OFF' || str === 'ON') return str;
  return str.toLowerCase().replace(/\b\w/g, function (char) {
    return char.toUpperCase();
  });
}
;// CONCATENATED MODULE: ./modules/interface/menu/menu.js





function safeTextContent(element, content) {
  if (element) {
    try {
      element.textContent = content;
    } catch (error) {
      console.error('Error updating text content:', error);
    }
  }
}
async function createMenu(flusher) {
  const toggledClass = 'toggled-on';
  if (!flusher.video.querySelector('.flusher-menu')) {
    const b = typeof browser !== 'undefined' ? browser : chrome;
    let parent = flusher.props.external ? flusher.video.parentNode : flusher.props.isAeroKick ? flusher.video.closest('#bk-video-player') : flusher.controls;
    const shadowBox = document.createElement('div');
    shadowBox.id = 'shadowbox';
    if (flusher.props.isAeroKick) shadowBox.style.zIndex = 1020;
    const shadowRoot = shadowBox.attachShadow({
      mode: 'open'
    });
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
    if (flusher.props.isAeroKick) {
      flusher.menu.style.top = '0 !important';
      flusher.menu.style.right = '0 !important';
    }
    shadowRoot.appendChild(flusher.menu);
    let tempMenu;
    parent ? parent.append(shadowBox) : tempMenu = true;
    parent = shadowRoot;
    let settingsMenu = parent.querySelector('.flusher-menu-settings');
    let layoutMenu = parent.querySelector('.flusher-menu-layout');
    let messageMenu = parent.querySelector('.flusher-menu-message');
    let overlayMenu = parent.querySelector('.flusher-menu-overlay');
    let keybindMenu = parent.querySelector('.flusher-menu-keybind');
    let aboutMenu = parent.querySelector('.flusher-menu-about');
    let eventMenu = parent.querySelector('.flusher-menu-event');
    let eventBanMenu = parent.querySelector('.flusher-menu-event-bans');
    let eventDeletedMenu = parent.querySelector('.flusher-menu-event-deleted');
    let eventPinnedMenu = parent.querySelector('.flusher-menu-event-pinned');
    const closeBtn = parent.querySelector('.flusher-menu-close');
    closeBtn.addEventListener('mousedown', function (event) {
      hideMenu(flusher);
    });
    const homeBtn = parent.querySelector('.flusher-home');
    homeBtn.addEventListener('mousedown', function (event) {
      hideMenu(flusher);
      window.open('https://github.com/r0808914/Kick-Chat-Flusher/issues', '_blank');
    });
    const debugBtn = parent.querySelector('.flusher-debug');
    debugBtn.addEventListener('mousedown', function (event) {
      flusher.states.chatEnabled = !flusher.states.chatEnabled;
    });
    const storeBtn = parent.querySelector('.flusher-store');
    storeBtn.addEventListener('mousedown', function (event) {
      hideMenu(flusher);
      const userAgent = navigator.userAgent.toLowerCase();
      userAgent.includes("firefox") ? window.open('https://addons.mozilla.org/en-US/firefox/addon/kickchatflusher/', '_blank') : window.open('https://chromewebstore.google.com/detail/kick-chat-flusher/cefplanllnmdnnhncpopljmcjnlafdke', '_blank');
    });
    const positionBtn = overlayMenu.querySelector('.flusher-position');
    const divInsidePosition = positionBtn.querySelector('div:empty');
    safeTextContent(divInsidePosition, toTitleCase(flusher.states.positionStates[flusher.states.positionState]));
    positionBtn.addEventListener('mousedown', function (event) {
      if (flusher.states.sizeState === 2) {
        do {
          flusher.states.positionState = (flusher.states.positionState + 1) % flusher.states.positionStates.length;
        } while (flusher.states.positionState === 0 || flusher.states.positionState === 2 || flusher.states.positionState === 3 || flusher.states.positionState === 5);
      } else {
        flusher.states.positionState = (flusher.states.positionState + 1) % flusher.states.positionStates.length;
      }
      divInsidePosition.textContent = toTitleCase(flusher.states.positionStates[flusher.states.positionState]);
      flusher.container.setAttribute('position', flusher.states.positionStates[flusher.states.positionState].replace(/\s/g, ""));
      chrome.storage.local.get("positionsPerChannel", function (result) {
        flusher.container.style.top = "";
        flusher.container.style.left = "";
        flusher.container.style.alignItems = "";
        var positionsPerChannel = result.positionsPerChannel || {};
        var positionsArray = positionsPerChannel[flusher.props.channelName] || [];
        var existingPositionIndex = positionsArray.findIndex(function (item) {
          return item.videoSize === flusher.props.videoSize;
        });
        if (existingPositionIndex !== -1 && positionsArray[existingPositionIndex]?.position?.top !== undefined) {
          delete positionsArray[existingPositionIndex].position.top;
          delete positionsArray[existingPositionIndex].position.left;
        } else {
          if (positionsArray[existingPositionIndex]?.position) {
            positionsArray[existingPositionIndex].position.location = flusher.states.positionState;
          } else {
            positionsArray.push({
              videoSize: flusher.props.videoSize,
              position: {
                location: flusher.states.positionState
              }
            });
          }
        }
        positionsPerChannel[flusher.props.channelName] = positionsArray;
        chrome.storage.local.set({
          "positionsPerChannel": positionsPerChannel
        }, function () {
          /* console.log("positionsPerChannel:", positionsPerChannel); */
        });
      });
    });
    const sizeBtn = overlayMenu.querySelector('.flusher-size');
    const divInsideSize = sizeBtn.querySelector('div:empty');
    safeTextContent(divInsideSize, toTitleCase(flusher.states.sizeStates[flusher.states.sizeState]));
    sizeBtn.addEventListener('mousedown', function (event) {
      flusher.states.sizeState = (flusher.states.sizeState + 1) % flusher.states.sizeStates.length;
      divInsideSize.textContent = toTitleCase(flusher.states.sizeStates[flusher.states.sizeState]);
      flusher.container.setAttribute('size', flusher.states.sizeStates[flusher.states.sizeState].replace(/\s/g, ""));
      flusher.setVerticalWidth();
      if (flusher.states.sizeState === 2) {
        let position = flusher.states.positionStates[flusher.states.positionState].split(' ').pop();
        let positionId = flusher.states.positionStates.indexOf(position);
        flusher.states.positionState = positionId;
        divInsidePosition.textContent = toTitleCase(flusher.states.positionStates[flusher.states.positionState]);
        flusher.container.setAttribute('position', flusher.states.positionStates[flusher.states.positionState].replace(/\s/g, ""));
        chrome.storage.local.get("positionsPerChannel", function (result) {
          flusher.container.style.top = "";
          flusher.container.style.left = "";
          flusher.container.style.alignItems = "";
          var positionsPerChannel = result.positionsPerChannel || {};
          var positionsArray = positionsPerChannel[flusher.props.channelName] || [];
          var existingPositionIndex = positionsArray.findIndex(function (item) {
            return item.videoSize === flusher.props.videoSize;
          });
          if (existingPositionIndex !== -1 && positionsArray[existingPositionIndex]?.position?.top !== undefined) {
            delete positionsArray[existingPositionIndex].position.top;
            delete positionsArray[existingPositionIndex].position.left;
          } else {
            if (positionsArray[existingPositionIndex]?.position) {
              positionsArray[existingPositionIndex].position.location = flusher.states.positionState;
            } else {
              positionsArray.push({
                videoSize: flusher.props.videoSize,
                position: {
                  location: flusher.states.positionState
                }
              });
            }
          }
          positionsPerChannel[flusher.props.channelName] = positionsArray;
          chrome.storage.local.set({
            "positionsPerChannel": positionsPerChannel
          }, function () {
            /* console.log("positionsPerChannel:", positionsPerChannel); */
          });
        });
      }
      chrome.storage.local.get("positionsPerChannel", function (result) {
        flusher.container.style.width = "";
        flusher.container.style.height = "";
        var positionsPerChannel = result.positionsPerChannel || {};
        var positionsArray = positionsPerChannel[flusher.props.channelName] || [];
        var existingPositionIndex = positionsArray.findIndex(function (item) {
          return item.videoSize === flusher.props.videoSize;
        });
        if (existingPositionIndex !== -1 && positionsArray[existingPositionIndex].position.width) {
          delete positionsArray[existingPositionIndex].position.width;
          delete positionsArray[existingPositionIndex].position.height;
        } else {
          if (positionsArray[existingPositionIndex]?.position) {
            positionsArray[existingPositionIndex].position.size = flusher.states.sizeState;
          } else {
            positionsArray.push({
              videoSize: flusher.props.videoSize,
              position: {
                size: flusher.states.sizeState
              }
            });
          }
        }
        positionsPerChannel[flusher.props.channelName] = positionsArray;
        chrome.storage.local.set({
          "positionsPerChannel": positionsPerChannel
        }, function () {
          /* console.log("Position removed for videoSize:", flusher.props.videoSize); */
        });
      });
    });
    const backgroundBtn = messageMenu.querySelector('.flusher-background');
    const divInsideBackground = backgroundBtn.querySelector('div:empty');
    safeTextContent(divInsideBackground, toTitleCase(flusher.states.backgroundStates[flusher.states.backgroundState]));
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
    const keybindBtn = parent.querySelector('.flusher-keybind');
    keybindBtn.addEventListener('mousedown', function (event) {
      reloadKeybinds();
      keybindMenu.style.display = 'block';
      settingsMenu.style.display = 'none';
    });
    const keybindBackBtn = parent.querySelector('.flusher-keybind-back');
    keybindBackBtn.addEventListener('mousedown', function (event) {
      keybindMenu.style.display = 'none';
      settingsMenu.style.display = 'block';
    });
    const keybindCloseBtn = parent.querySelector('.flusher-keybind-close');
    keybindCloseBtn.addEventListener('mousedown', function (event) {
      hideMenu(flusher);
    });
    const eventBtn = parent.querySelector('.flusher-event');
    eventBtn.addEventListener('mousedown', function (event) {
      eventMenu.style.display = 'block';
      settingsMenu.style.display = 'none';
    });
    const eventBackBtn = parent.querySelector('.flusher-event-back');
    eventBackBtn.addEventListener('mousedown', function (event) {
      eventMenu.style.display = 'none';
      settingsMenu.style.display = 'block';
    });
    const eventCloseBtn = parent.querySelector('.flusher-event-close');
    eventCloseBtn.addEventListener('mousedown', function (event) {
      hideMenu(flusher);
    });
    const eventBanBtn = parent.querySelector('.flusher-event-bans');
    eventBanBtn.addEventListener('mousedown', function (event) {
      eventBanMenu.style.display = 'block';
      eventMenu.style.display = 'none';
    });
    const eventBanBackBtn = parent.querySelector('.flusher-event-bans-back');
    eventBanBackBtn.addEventListener('mousedown', function (event) {
      eventBanMenu.style.display = 'none';
      eventMenu.style.display = 'block';
    });
    const eventBanCloseBtn = parent.querySelector('.flusher-event-bans-close');
    eventBanCloseBtn.addEventListener('mousedown', function (event) {
      hideMenu(flusher);
    });
    const eventPinnedBtn = parent.querySelector('.flusher-event-pinned');
    eventPinnedBtn.addEventListener('mousedown', function (event) {
      eventPinnedMenu.style.display = 'block';
      eventMenu.style.display = 'none';
    });
    const eventPinnedBackBtn = parent.querySelector('.flusher-event-pinned-back');
    eventPinnedBackBtn.addEventListener('mousedown', function (event) {
      eventPinnedMenu.style.display = 'none';
      eventMenu.style.display = 'block';
    });
    const eventPinnedCloseBtn = parent.querySelector('.flusher-event-pinned-close');
    eventPinnedCloseBtn.addEventListener('mousedown', function (event) {
      hideMenu(flusher);
    });
    const eventDeletedBtn = parent.querySelector('.flusher-event-deleted');
    eventDeletedBtn.addEventListener('mousedown', function (event) {
      eventDeletedMenu.style.display = 'block';
      eventMenu.style.display = 'none';
    });
    const eventDeletedBackBtn = parent.querySelector('.flusher-event-deleted-back');
    eventDeletedBackBtn.addEventListener('mousedown', function (event) {
      eventDeletedMenu.style.display = 'none';
      eventMenu.style.display = 'block';
    });
    const eventDeletedCloseBtn = parent.querySelector('.flusher-event-deleted-close');
    eventDeletedCloseBtn.addEventListener('mousedown', function (event) {
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
    const aboutCloseBtn = parent.querySelector('.flusher-about-close');
    aboutCloseBtn.addEventListener('mousedown', function (event) {
      hideMenu(flusher);
    });
    const aboutMenuBtn = parent.querySelector('.flusher-about');
    aboutMenuBtn.addEventListener('mousedown', function (event) {
      aboutMenu.style.display = 'block';
      settingsMenu.style.display = 'none';
    });
    const aboutBackBtn = parent.querySelector('.flusher-about-back');
    aboutBackBtn.addEventListener('mousedown', function (event) {
      aboutMenu.style.display = 'none';
      settingsMenu.style.display = 'block';
    });
    const overlayCloseBtn = parent.querySelector('.flusher-overlay-close');
    overlayCloseBtn.addEventListener('mousedown', function (event) {
      hideMenu(flusher);
    });
    const overlayMenuBtn = parent.querySelector('.flusher-overlayMenu');
    overlayMenuBtn.addEventListener('mousedown', function (event) {
      chrome.storage.local.get("positionsPerChannel", function (result) {
        var positionsPerChannel = result.positionsPerChannel || {};
        var positionsArray = positionsPerChannel[flusher.props.channelName] || [];
        var existingPositionIndex = positionsArray.findIndex(function (item) {
          return item.videoSize === flusher.props.videoSize;
        });
        if (existingPositionIndex !== -1) {
          if (positionsPerChannel[flusher.props.channelName][existingPositionIndex].position.top) {
            divInsidePosition.textContent = "Custom";
          }
          if (positionsPerChannel[flusher.props.channelName][existingPositionIndex].position.width) {
            divInsideSize.textContent = "Custom";
          }
        }
        overlayMenu.style.display = 'block';
        layoutMenu.style.display = 'none';
      });
    });
    const overlayBackBtn = parent.querySelector('.flusher-overlay-back');
    overlayBackBtn.addEventListener('mousedown', function (event) {
      overlayMenu.style.display = 'none';
      layoutMenu.style.display = 'block';
    });
    flusher.states.flushState || !flusher.states.chatEnabled ? layoutMenuBtn.style.display = 'none' : layoutMenuBtn.style.display = 'flex';
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
    flusher.states.flushState || !flusher.states.chatEnabled ? spamBtnContainer.style.display = 'none' : spamBtnContainer.style.display = 'flex';
    if (flusher.states.spamState) spamBtn.classList.toggle(toggledClass);
    const fontBtn = settingsMenu.querySelector('.flusher-font');
    const divInsideFont = fontBtn.querySelector('div:empty');
    safeTextContent(divInsideFont, toTitleCase(flusher.states.sizeStates[flusher.states.fontState]));
    fontBtn.addEventListener('mousedown', function (event) {
      flusher.states.fontState = (flusher.states.fontState + 1) % flusher.states.sizeStates.length;
      setExtensionStorageItem('flusher-font', flusher.states.fontState);
      divInsideFont.textContent = toTitleCase(flusher.states.sizeStates[flusher.states.fontState]);
      flusher.container.setAttribute('font', flusher.states.sizeStates[flusher.states.fontState].replace(/\s/g, ""));
      if (flusher.states.flushState) flusher.clear();
    });

    /* (!flusher.states.chatEnabled) ? fontBtn.style.display = 'none' : fontBtn.style.display = 'flex'; */

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
    flusher.props.external || flusher.props.isVod ? replyToggleContainer.style.display = 'none' : replyToggleContainer.style.display = 'flex';
    if (flusher.states.reply) replyToggle.classList.toggle(toggledClass);
    const slideToggleContainer = parent.querySelector('.flusher-slide');
    const slideToggle = slideToggleContainer.querySelector('.flusher-toggle');
    slideToggle.addEventListener('mousedown', function (event) {
      const toggleElement = event.currentTarget;
      toggleElement.classList.toggle(toggledClass);
      const newSlideEnabled = toggleElement.classList.contains(toggledClass);
      flusher.states.slide = newSlideEnabled;
      setExtensionStorageItem('flusher-slide', newSlideEnabled);
    });
    if (flusher.states.slide) slideToggle.classList.toggle(toggledClass);
    const shadowToggleContainer = parent.querySelector('.flusher-shadow');
    const shadowToggle = shadowToggleContainer.querySelector('.flusher-toggle');
    shadowToggle.addEventListener('mousedown', function (event) {
      const toggleElement = event.currentTarget;
      toggleElement.classList.toggle(toggledClass);
      const newShadowEnabled = toggleElement.classList.contains(toggledClass);
      flusher.states.shadow = newShadowEnabled;
      flusher.container.setAttribute('shadow', newShadowEnabled);
      setExtensionStorageItem('flusher-shadow', newShadowEnabled);
    });
    if (flusher.states.shadow) shadowToggle.classList.toggle(toggledClass);
    const keybindOverlayBtn = keybindMenu.querySelector('.flusher-keybind-overlay');
    const divInsidekeybindOverlay = keybindOverlayBtn.querySelector('div:empty');
    keybindOverlayBtn.addEventListener('mousedown', async function (event) {
      reloadKeybinds();
      divInsidekeybindOverlay.textContent = `waiting`;
      const keyCombination = await captureKeybind();
      let keybind = `${keyCombination.alt ? 'ALT + ' : ''}${keyCombination.ctrl ? 'CTRL + ' : ''}${keyCombination.shift ? 'SHIFT + ' : ''}${keyCombination.key.toUpperCase()}`;
      keybind = keybind.trim();
      divInsidekeybindOverlay.textContent = keybind;
      flusher.states.keybinds.overlay = keybind;
      setExtensionStorageItem('flusher-keybinds', flusher.states.keybinds);
    });
    const keybindFlushBtn = keybindMenu.querySelector('.flusher-keybind-flush');
    const divInsidekeybindFlush = keybindFlushBtn.querySelector('div:empty');
    keybindFlushBtn.addEventListener('mousedown', async function (event) {
      reloadKeybinds();
      divInsidekeybindFlush.textContent = `waiting`;
      const keyCombination = await captureKeybind();
      let keybind = `${keyCombination.alt ? 'ALT + ' : ''}${keyCombination.ctrl ? 'CTRL + ' : ''}${keyCombination.shift ? 'SHIFT + ' : ''}${keyCombination.key.toUpperCase()}`;
      keybind = keybind.trim();
      divInsidekeybindFlush.textContent = keybind;
      flusher.states.keybinds.flush = keybind;
      setExtensionStorageItem('flusher-keybinds', flusher.states.keybinds);
    });
    const keybindSpamBtn = keybindMenu.querySelector('.flusher-keybind-spam');
    const divInsidekeybindSpam = keybindSpamBtn.querySelector('div:empty');
    keybindSpamBtn.addEventListener('mousedown', async function (event) {
      reloadKeybinds();
      divInsidekeybindSpam.textContent = `waiting`;
      const keyCombination = await captureKeybind();
      let keybind = `${keyCombination.alt ? 'ALT + ' : ''}${keyCombination.ctrl ? 'CTRL + ' : ''}${keyCombination.shift ? 'SHIFT + ' : ''}${keyCombination.key.toUpperCase()}`;
      keybind = keybind.trim();
      divInsidekeybindSpam.textContent = keybind;
      flusher.states.keybinds.spam = keybind;
      setExtensionStorageItem('flusher-keybinds', flusher.states.keybinds);
    });

    /* const keybindMenuBtn = keybindMenu.querySelector('.flusher-keybind-menu');
    const divInsidekeybindMenu = keybindMenuBtn.querySelector('div:empty');
     keybindMenuBtn.addEventListener('mousedown', async function (event) {
       reloadKeybinds();
       divInsidekeybindMenu.textContent = `waiting`;
        const keyCombination = await captureKeybind();
        let keybind = `${keyCombination.alt ? 'ALT + ' : ''}${keyCombination.ctrl ? 'CTRL + ' : ''}${keyCombination.shift ? 'SHIFT + ' : ''}${keyCombination.key.toUpperCase()}`;
       keybind = keybind.trim();
        divInsidekeybindMenu.textContent = keybind
        flusher.states.keybinds.menu = keybind;
       setExtensionStorageItem('flusher-keybinds', flusher.states.keybinds);
    }); */

    const timeToggleContainer = messageMenu.querySelector('.flusher-time');
    const timeToggle = timeToggleContainer.querySelector('.flusher-toggle');
    timeToggle.addEventListener('mousedown', function (event) {
      const toggleElement = event.currentTarget;
      toggleElement.classList.toggle(toggledClass);
      const newTimeEnabled = toggleElement.classList.contains(toggledClass);
      flusher.states.timeState = newTimeEnabled;
      flusher.props.elementQueue.forEach(element => {
        const chatEntry = element.querySelector('span.text-neutral.pr-1.font-semibold');
        if (chatEntry) chatEntry.style.display = flusher.states.timeState ? 'inline-block' : 'none';
      });
      flusher.messages.childNodes.forEach(childNode => {
        const chatEntry = childNode.querySelector('span.text-neutral.pr-1.font-semibold');
        if (chatEntry) chatEntry.style.display = flusher.states.timeState ? 'inline-block' : 'none';
      });
      flusher.container.setAttribute('time', newTimeEnabled);
      setExtensionStorageItem('flusher-time', newTimeEnabled);
    });
    if (flusher.states.timeState) timeToggle.classList.toggle(toggledClass);
    !flusher.props.isVod || flusher.states.flushState ? timeToggleContainer.style.display = 'none' : timeToggleContainer.style.display = 'flex';
    const eventBanAlertToggleContainer = parent.querySelector('.flusher-event-bans-alert');
    const eventBanAlertToggle = eventBanAlertToggleContainer.querySelector('.flusher-toggle');
    eventBanAlertToggle.addEventListener('mousedown', function (event) {
      const toggleElement = event.currentTarget;
      toggleElement.classList.toggle(toggledClass);
      const newBanState = toggleElement.classList.contains(toggledClass);
      flusher.states.banAlert = newBanState;
      if (newBanState && flusher?.alerts?.banAlert) flusher.alerts.banAlert.play().catch(error => console.error("Audio playback failed:", error));
      setExtensionStorageItem('flusher-event-bans-alert', newBanState);
    });
    !flusher.states.bans ? eventBanAlertToggleContainer.style.display = 'none' : eventBanAlertToggleContainer.style.display = 'flex';
    if (flusher.states.bans && flusher.states.banAlert) eventBanAlertToggle.classList.toggle(toggledClass);
    const eventBanToggleContainer = parent.querySelector('.flusher-event-bans-show');
    const eventBanToggle = eventBanToggleContainer.querySelector('.flusher-toggle');
    eventBanToggle.addEventListener('mousedown', function (event) {
      const toggleElement = event.currentTarget;
      toggleElement.classList.toggle(toggledClass);
      const newBanState = toggleElement.classList.contains(toggledClass);
      flusher.states.bans = newBanState;
      flusher.states.bans && flusher.states.banAlert ? eventBanAlertToggle.classList.add(toggledClass) : eventBanAlertToggle.classList.remove(toggledClass);
      !flusher.states.bans ? eventBanAlertToggleContainer.style.display = 'none' : eventBanAlertToggleContainer.style.display = 'flex';
      if (!flusher.states.bans) {
        flusher.states.banAlert = false;
        setExtensionStorageItem('flusher-event-bans-alert', false);
      }
      setExtensionStorageItem('flusher-event-bans', newBanState);
    });
    if (flusher.states.bans) eventBanToggle.classList.toggle(toggledClass);
    const eventPinnedAlertToggleContainer = parent.querySelector('.flusher-event-pinned-alert');
    const eventPinnedAlertToggle = eventPinnedAlertToggleContainer.querySelector('.flusher-toggle');
    eventPinnedAlertToggle.addEventListener('mousedown', function (event) {
      const toggleElement = event.currentTarget;
      toggleElement.classList.toggle(toggledClass);
      const newPinnedState = toggleElement.classList.contains(toggledClass);
      flusher.states.pinnedAlert = newPinnedState;
      if (newPinnedState && flusher?.alerts?.pinnedAlert) flusher.alerts.pinnedAlert.play().catch(error => console.error("Audio playback failed:", error));
      setExtensionStorageItem('flusher-event-pinned-alert', newPinnedState);
    });
    !flusher.states.pinned ? eventPinnedAlertToggleContainer.style.display = 'none' : eventPinnedAlertToggleContainer.style.display = 'flex';
    if (flusher.states.pinned && flusher.states.pinnedAlert) eventPinnedAlertToggle.classList.toggle(toggledClass);
    const eventPinnedToggleContainer = parent.querySelector('.flusher-event-pinned-show');
    const eventPinnedToggle = eventPinnedToggleContainer.querySelector('.flusher-toggle');
    eventPinnedToggle.addEventListener('mousedown', function (event) {
      const toggleElement = event.currentTarget;
      toggleElement.classList.toggle(toggledClass);
      const newPinnedState = toggleElement.classList.contains(toggledClass);
      flusher.states.pinned = newPinnedState;
      flusher.states.pinned && flusher.states.pinnedAlert ? eventPinnedAlertToggle.classList.add(toggledClass) : eventPinnedAlertToggle.classList.remove(toggledClass);
      !flusher.states.pinned ? eventPinnedAlertToggleContainer.style.display = 'none' : eventPinnedAlertToggleContainer.style.display = 'flex';
      if (!flusher.states.pinned) {
        flusher.states.pinnedAlert = false;
        setExtensionStorageItem('flusher-event-pinned-alert', false);
      }
      setExtensionStorageItem('flusher-event-pinned', newPinnedState);
    });
    if (flusher.states.pinned) eventPinnedToggle.classList.toggle(toggledClass);
    const eventdeletedToggleContainer = parent.querySelector('.flusher-event-deleted-show');
    const eventdeletedToggle = eventdeletedToggleContainer.querySelector('.flusher-toggle');
    eventdeletedToggle.addEventListener('mousedown', function (event) {
      const toggleElement = event.currentTarget;
      toggleElement.classList.toggle(toggledClass);
      const newdeletedState = toggleElement.classList.contains(toggledClass);
      flusher.states.deleted = newdeletedState;
      setExtensionStorageItem('flusher-event-deleted', newdeletedState);
    });
    if (flusher.states.deleted) eventdeletedToggle.classList.toggle(toggledClass);
    const flusherToggleContainer = parent.querySelector('.flusher-flush');
    const flushToggle = flusherToggleContainer.querySelector('.flusher-toggle');
    flushToggle.addEventListener('mousedown', function (event) {
      const toggleElement = event.currentTarget;
      toggleElement.classList.toggle(toggledClass);
      const newFlushState = toggleElement.classList.contains(toggledClass);
      newFlushState ? layoutMenuBtn.style.display = 'none' : layoutMenuBtn.style.display = 'flex';
      flusher.states.flushState = newFlushState;
      flusher.states.flushState || !flusher.states.chatEnabled ? spamBtnContainer.style.display = 'none' : spamBtnContainer.style.display = 'flex';
      flusher.container.style.display = 'none';
      if (flusher.states.chatEnabled && !flusher.states.flushState) dragElement(flusher);
      togglePointerEvents(flusher);
      checkPosition(flusher, null, null);
      flusher.container.setAttribute('layout', newFlushState ? 'horizontal' : 'vertical');
      flusher.clear();
      flusher.container.style.display = 'flex';
      setExtensionStorageItem('flusher-flush', newFlushState);
    });
    !flusher.states.chatEnabled ? flusherToggleContainer.style.display = 'none' : flusherToggleContainer.style.display = 'flex';
    if (flusher.states.flushState) flushToggle.classList.toggle(toggledClass);
    const flusherToggle = parent.querySelector('.flusher-enable .flusher-toggle');
    flusherToggle.addEventListener('mousedown', function (event) {
      const toggleElement = event.currentTarget;
      toggleElement.classList.toggle(toggledClass);
      const newChatEnabled = toggleElement.classList.contains(toggledClass);
      flusher.states.chatEnabled = newChatEnabled;
      newChatEnabled ? flusher.provider.bindRequests(flusher) : flusher.provider.unbindRequests(flusher);
      if (newChatEnabled && flusher.container.attributes['layout']?.nodeValue === 'vertical') dragElement(flusher);
      flusher.clear();
      svgToggle(flusher);
      /* toggleEnableMenu(); */
      togglePointerEvents(flusher);
      flusher.states.flushState || !flusher.states.chatEnabled ? spamBtnContainer.style.display = 'none' : spamBtnContainer.style.display = 'flex';
      flusher.states.flushState || !flusher.states.chatEnabled ? layoutMenuBtn.style.display = 'none' : layoutMenuBtn.style.display = 'flex';
      !flusher.states.chatEnabled ? flusherToggleContainer.style.display = 'none' : flusherToggleContainer.style.display = 'flex';
      /* (!flusher.states.chatEnabled) ? fontBtn.style.display = 'none' : fontBtn.style.display = 'flex'; */

      flusher.container.setAttribute('enabled', newChatEnabled);
      setExtensionStorageItem('flusher-enable', newChatEnabled);
    });
    if (flusher.states.chatEnabled) flusherToggle.classList.toggle(toggledClass);
    async function reloadKeybinds() {
      if (flusher.props.keydownSetListener) window.removeEventListener('keydown', flusher.props.keydownSetListener);
      divInsidekeybindOverlay.textContent = flusher.states.keybinds.overlay;
      divInsidekeybindFlush.textContent = flusher.states.keybinds.flush;
      divInsidekeybindSpam.textContent = flusher.states.keybinds.spam;
      /* divInsidekeybindMenu.textContent = flusher.states.keybinds.menu; */
    }

    /* temp disabled */

    /* if (!flusher.props.intro) {
       const popupHtml = `
       <div id="flusher-popup">
         <h2>Kick Chat Flusher</h2>
         <p>By default, spam messages are filtered. To view all messages, toggle the 'Show Spam' option in settings. Note that filtering spam may result in increased workload in certain scenarios.</p>
         <button id="closeBtn">OK</button>
       </div>`;
        const parser = new DOMParser();
       const popupDoc = parser.parseFromString(popupHtml, 'text/html');
       flusher.props.popupContainer = popupDoc.body.firstChild.cloneNode(true);
        flusher.video.insertAdjacentElement('afterend', flusher.props.popupContainer);
    } */

    return tempMenu ? menu : createToggle(flusher);
  }
  function captureKeybind() {
    return new Promise(resolve => {
      flusher.props.isCaptureKeybind = true;
      const keysPressed = {
        alt: false,
        ctrl: false,
        shift: false,
        key: null
      };
      flusher.props.keydownSetListener = function (event) {
        if (event.key === 'Alt' || event.key === 'Control' || event.key === 'Shift') {
          keysPressed[event.key.toLowerCase()] = true;
        } else {
          keysPressed.key = event.key;
          if (flusher.props.keydownSetListener) window.removeEventListener('keydown', flusher.props.keydownSetListener);
          flusher.props.isCaptureKeybind = false;
          resolve(keysPressed);
        }
      };
      window.addEventListener('keydown', flusher.props.keydownSetListener);
    });
  }
  function setExtensionStorageItem(key, value) {
    const data = {
      [key]: value
    };
    chrome.storage.local.set(data, () => {
      /* logToConsole(`Value for key ${key} has been set to ${value} in extension storage.`); */
    });
  }
}

/* export function toggleEnableMenu() {
   var elementsToToggle = ['flusher-flush', 'flusher-settings', 'flusher-layoutMenu'];
   elementsToToggle.forEach(function (id) {
      var element = document.getElementById(id);
      if (element) {
         if (id === 'flusher-layoutMenu' && flusher.states.flushState === true && flusher.states.chatEnabled) return;
         flusher.states.chatEnabled ? flusher.video.style.display = 'flex' : flusher.video.style.display = 'none';
      }
   });
} */

function hideMenu(flusher) {
  const baseMenu = flusher.menu.querySelector('.flusher-menu-base');
  const settingsMenu = flusher.menu.querySelector('.flusher-menu-settings');
  const layoutMenu = flusher.menu.querySelector('.flusher-menu-layout');
  const overlayMenu = flusher.menu.querySelector('.flusher-menu-overlay');
  const messageMenu = flusher.menu.querySelector('.flusher-menu-message');
  const keybindMenu = flusher.menu.querySelector('.flusher-menu-keybind');
  const aboutMenu = flusher.menu.querySelector('.flusher-menu-about');
  const eventMenu = flusher.menu.querySelector('.flusher-menu-event');
  const eventBanMenu = flusher.menu.querySelector('.flusher-menu-event-bans');
  const eventDeletedMenu = flusher.menu.querySelector('.flusher-menu-event-deleted');
  const eventPinnedMenu = flusher.menu.querySelector('.flusher-menu-event-pinned');
  flusher.menu.style.display = 'none';
  settingsMenu.style.display = 'none';
  baseMenu.style.display = 'none';
  layoutMenu.style.display = 'none';
  overlayMenu.style.display = 'none';
  messageMenu.style.display = 'none';
  keybindMenu.style.display = 'none';
  aboutMenu.style.display = 'none';
  eventMenu.style.display = 'none';
  eventBanMenu.style.display = 'none';
  eventDeletedMenu.style.display = 'none';
  eventPinnedMenu.style.display = 'none';
  svgToggle(flusher);
  document.removeEventListener('mousedown', flusher.clickOutsideHandlerFunction);
  flusher.container.classList.remove('flusher-hover');
}
function clickOutsideHandler(event, flusher) {
  if (flusher.menu !== null && !flusher.menu.contains(event.target) && flusher.menu.style.display === 'block' && !isClickInsideShadowBox(event.target) && !flusher.props.popupContainer?.contains(event.target)) {
    if (flusher.toggle.contains(event.target) || event.target === flusher.toggle) return;
    hideMenu(flusher);
  }
  function isClickInsideShadowBox(target) {
    const path = event.composedPath();
    return path.some(node => node.id === 'shadowbox');
  }
}
function togglePointerEvents(flusher) {
  if (flusher.states.flushState || !flusher.states.chatEnabled) {
    flusher.container.classList.remove('flusher-grab');
    flusher.container.classList.add('flusher-no-grab');
  } else {
    flusher.container.classList.remove('flusher-no-grab');
    flusher.container.classList.add('flusher-grab');
    flusher.props.lastRow = 2;
    dragElement(flusher);
  }
}
;// CONCATENATED MODULE: ./modules/utils/keybind.js
class KeybindListener {
  constructor(flusher) {
    this.flusher = flusher;
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.modifierKeys = {
      alt: false,
      control: false,
      shift: false
    };
    this.nonModifierKey = null;
    this.startListening();
  }
  startListening() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }
  stopListening() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
  handleKeyDown(event) {
    if (this.flusher.props.isCaptureKeybind) return;
    const key = event.key?.toLowerCase();
    if (['alt', 'control', 'shift'].includes(key)) {
      this.modifierKeys[key] = true;
    } else if (this.anyModifierKeyPressed()) {
      this.nonModifierKey = event.key.toUpperCase();
    }
    this.processKey();
  }
  handleKeyUp(event) {
    const key = event.key.toLowerCase();
    if (['alt', 'control', 'shift'].includes(key)) {
      this.modifierKeys[key] = false;
    }
    if (!this.anyModifierKeyPressed()) {
      this.nonModifierKey = null;
    }
  }
  anyModifierKeyPressed() {
    return Object.values(this.modifierKeys).some(modifier => modifier === true);
  }
  processKey() {
    if (!this.nonModifierKey) return;
    for (const action in this.flusher.states.keybinds) {
      if (this.flusher.states.keybinds.hasOwnProperty(action)) {
        const keyCombination = this.flusher.states.keybinds[action];
        const keys = keyCombination.split(' + ');
        const modifierKeysMatch = keys.includes('ALT') === this.modifierKeys.alt && keys.includes('CTRL') === this.modifierKeys.control && keys.includes('SHIFT') === this.modifierKeys.shift;
        const nonModifierKeyMatch = this.nonModifierKey === keys[keys.length - 1].toUpperCase();
        if (modifierKeysMatch && nonModifierKeyMatch) {
          this.activateAction(action);
          break;
        }
      }
    }
  }
  activateAction(action) {
    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      button: 0,
      buttons: 1
    });
    const selectorMap = {
      overlay: '.flusher-enable .flusher-toggle',
      flush: '.flusher-flush .flusher-toggle',
      spam: '.flusher-spam .flusher-toggle',
      menu: '.flusher-toggle'
    };
    const element = (action === 'menu' ? document : this.flusher.menu).querySelector(selectorMap[action]);
    if (element) {
      element.dispatchEvent(mouseDownEvent);
      if (action === 'menu') this.flusher.menu.focus();
    }
  }
}
;// CONCATENATED MODULE: ./modules/interface/overlay.js




let flusherObject;
async function createChat(flusher) {
  /* remove old */
  document.querySelectorAll('.flusher').forEach(item => item.remove());
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
  const shadowRoot = flusherObject.props.external ? chatflusherObject.attachShadow({
    mode: 'open'
  }) : null;
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
    const data = {
      [key]: value
    };
    chrome.storage.local.set(data, () => {});
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
  flusherObject.props.mouseMoveHandler = event => {
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
    if (flusherObject.chat.firstChild) return;
    chat = chatElement.parentElement;
    if (flusherObject.chat) {
      const clonedChat = chatElement.cloneNode(true);
      clonedChat.classList.add('flusher-temp');
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
          clonedButton.addEventListener('click', event => {
            sendButton.click();
          });
          originalButton.insertAdjacentElement('afterend', clonedButton);
        }
      } else {
        if (sendBtn) {
          if (sendButton) {
            sendBtn.addEventListener('click', event => {
              sendButton.click();
            });
            sendBtn.style.display = 'flex';
          }
        }
      }
      flusherObject.chat.appendChild(chatElement);
      if (chat && clonedChat) chat.appendChild(clonedChat);
      const inputField = chatElement.querySelector('[contenteditable="true"]');
      if (inputField) {
        inputField.focus();
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(inputField);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }
  flusherObject.container.addEventListener('mouseleave', () => {
    window.isDragging = false;
    flusherObject.video.addEventListener('mousemove', flusherObject.props.mouseMoveHandler);
    lastRun = 1000;
    let tempChat = chat?.querySelector('.flusher-temp');
    if (tempChat) tempChat.remove();
    let closed = flusherObject.chat.querySelector('.z-common.flex.w-full.border-x')?.classList.contains('border-transparent');
    if (!closed) {
      let emojiBtn = flusherObject.chat.querySelector('#chat-input-wrapper button');
      if (emojiBtn) emojiBtn.click();
    }
    let sendBtn = flusherObject.chat.querySelector('#flusher-chat-send');
    if (sendBtn) sendBtn.style.display = 'none';
    if (chat && flusherObject.chat.firstChild) chat.appendChild(flusherObject.chat.firstChild);
    while (flusherObject.chat.firstChild) {
      flusherObject.chat.firstChild.remove();
    }
    chat = null;
  });
  function throttledMove() {
    const now = Date.now();
    if (now - lastRun >= throttleDelay) {
      let node = flusherObject.video.parentNode.querySelector('.z-controls');
      if (node) {
        dupeBtn(node);
      } else {
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
    return new Promise(resolve => {
      chrome.storage.local.get([key], result => {
        const storedValue = result[key];
        resolve(storedValue !== undefined ? storedValue : defaultValue);
      });
    });
  }
}
function setCustomPosition(flusher) {
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
;// CONCATENATED MODULE: ./modules/utils/resize.js






function resize_reset(flusher) {
  const init = !flusher.props.external;
  if (flusher.resizeObserver) flusher.resizeObserver.disconnect();
  flusher.resizeObserver = null;
  if (flusher.props.keydownListener) flusher.props.keydownListener.stopListening();
  for (const id of flusher.props.timeoutIds) {
    clearTimeout(id);
  }

  /* temp fix */
  const flusherElements = document.querySelectorAll('.flusher');
  flusherElements.forEach(element => {
    element.remove();
  });
  if (flusher.video) flusher.video.removeAttribute('flusher');
  /* - */

  flusher.provider.unbindRequests(flusher);
  flusher.clear();
  flusher = null;
  if (init) kick.init();
}
function checkResize(flusher) {
  const videoElement = flusher.video.querySelector("video");
  const target = !flusher.props.isAeroKick && videoElement ? videoElement : flusher.video;
  flusher.resizeTimer = null;
  if (flusher.resizeObserver) flusher.resizeObserver.disconnect();
  flusher.resizeObserver = new ResizeObserver(entries => {
    if (flusher.resizeTimer) cancelAnimationFrame(flusher.resizeTimer);
    flusher.resizeTimer = requestAnimationFrame(() => {
      if (flusher.container !== null) flusher.container.style.display = "none";
      const rect = target.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const isUrlEqual = window.currentUrl === undefined || window.currentUrl === window.location.href;
      window.currentUrl = window.location.href;
      const videoChanged = flusher.props.isAeroKick ? checkAeroKick() : false;
      if ((width === null || width === 0) && (!height || height === 0) && !videoChanged || !isUrlEqual || !flusher?.container) {
        resize_reset(flusher);
        return;
      }
      if (flusher.props.isAeroKick) checkAeroKick();
      const oldWidth = flusher.props.parentWidth;
      flusher.props.parentWidth = Math.trunc(width) * 2;
      flusher.props.parentHeight = Math.trunc(height);
      flusher.props.parentRight = rect.right;
      setAttributes();
      setCustomPosition(flusher);
      detectViewMode();
      checkPosition(flusher, height, width);
      flusher.props.elementHeight = null;
      flusher.container.style.display = "flex";
      createIntroMessage(flusher);
      if (oldWidth == null || oldWidth === 0) {
        if (flusher.container === null) return;
        if (flusher.states.chatEnabled) flusher.provider.bindRequests(flusher);
        flusher.props.loading = false;
        processMessageQueue(flusher);
        togglePointerEvents(flusher);
        checkAddons(flusher);
        createTempChat();
        logToConsole(`(${flusher.props.channelName} ${flusher.props.domain} ${flusher.props.isVod ? "VOD" : "LIVE"}): Report bugs or collaborate at https://github.com/r0808914/Kick-Chat-Flusher`);
        flusher.props.keydownListener = new KeybindListener(flusher);
      } else {
        flusher.states.flushState ? flusher.clear() : null;
      }
    });
  });
  flusher.resizeObserver.observe(target);
  async function createTempChat() {
    await createMenu(flusher);
  }
  function checkAddons(flusher) {
    let counter = 0;
    const intervalId = setInterval(() => {
      const KickTools = document.querySelector('.vjs-progress-control')?.style?.display == 'flex' ? true : false;
      if (KickTools && !flusher.props.isKickTools) {
        logToConsole(`KickTools Detected`);
        flusher.props.isKickTools = true;
      }
      const AeroKick = document.body.classList.contains("aerokick-customization");
      if (AeroKick) {
        flusher.props.isAeroKick = true;
        /* logToConsole(`AeroKick Detected`); */
        checkAeroKick();
      }
      if (KickTools && AeroKick) clearInterval(intervalId);
      counter++;
      if (counter >= 5) {
        clearInterval(intervalId);
      }
    }, 1000);
    flusher.props.timeoutIds.push(intervalId);
  }
  function checkAeroKick() {
    /* if (flusher.props.isAeroKick) { */
    const videoHolder = flusher.video.closest('#video-holder');
    const bkVideoPlayer = document.getElementById('bk-video-player');
    const videoHolderWidth = videoHolder?.offsetWidth ?? 0;
    const bkVideoPlayerWidth = bkVideoPlayer?.offsetWidth ?? 0;
    flusher.toggle.setAttribute("AeroKick", "");
    let largestElement;
    if (videoHolderWidth > bkVideoPlayerWidth) {
      largestElement = videoHolder;
    } else if (videoHolderWidth < bkVideoPlayerWidth) {
      largestElement = bkVideoPlayer;
    }
    if (!largestElement) return false;
    if (largestElement !== target) {
      flusher.resizeObserver.disconnect();
      flusher.resizeObserver = null;
      const flusherElement = document.querySelector('.flusher');
      if (!flusherElement) return false;
      largestElement.appendChild(flusherElement);
      const shadowboxElement = document.querySelector('#shadowbox');
      if (shadowboxElement) largestElement.appendChild(shadowboxElement);
      flusher.video = largestElement;
      flusherElement.style.cssText = 'position: absolute !important; z-index: 1010;';
      flusher.menu.style.top = '0 !important';
      flusher.menu.style.right = '0 !important';
      shadowboxElement.style.zIndex = 1020;
      const toggle = flusher.toggle.querySelector('svg') ?? flusher.toggle;
      const existingButton = flusher.video.parentElement.querySelector('button.bk-relative.bk-mr-4');
      existingButton.parentElement.insertBefore(toggle, existingButton);
      checkResize(flusher, largestElement);
    }
  }
  function createIntroMessage(flusher) {
    const introContent = document.createElement("div");
    introContent.classList.add("flusher-message");
    const emojiSpan = document.createElement("span");
    emojiSpan.textContent = String.fromCodePoint(0x1f389) + " ";
    const introSpan = document.createElement("span");
    introSpan.textContent = `thanks for testing (version..)`;
    const introMessageSpan = document.createElement("span");
    introMessageSpan.append(emojiSpan, introSpan);
    introContent.appendChild(introMessageSpan);
    introContent.style.setProperty("--row", 0);
    introContent.classList.add("flusher-message");
    const parent = flusher.props.external ? flusher.container : document.body;
    parent.append(introContent);
    flusher.props.elementHeight = introContent.clientHeight;
    flusher.props.maxRows = Math.ceil(flusher.props.parentHeight / flusher.props.elementHeight);
    parent.removeChild(introContent);
    flusher.setVerticalWidth();
  }
  function setAttributes() {
    if (!flusher?.container) return;
    flusher.container.style.setProperty("--flusher-width", `-${flusher.props.parentWidth}px`);
    if (flusher.toggle) flusher.toggle.setAttribute("domain", flusher.props.domain);
    const newFlushState = flusher.states.flushState !== undefined ? flusher.states.flushState ? "horizontal" : "vertical" : flusher.states.flushState ? "horizontal" : "vertical";
    flusher.container.setAttribute("layout", newFlushState);
    flusher.container.setAttribute("enabled", flusher.states.chatEnabled);
    flusher.container.setAttribute("shadow", flusher.states.shadow);
    flusher.container.setAttribute("background", flusher.states.backgroundStates[flusher.states.backgroundState]);
    setAttribute(flusher.container, "font", flusher.states.sizeStates, flusher.states.fontState);
    flusher.container.setAttribute("time", flusher.states.timeState);
    if (flusher.props.isAeroKick) {
      flusher.container.setAttribute("aerokick", "");
    }
  }
  function detectViewMode() {
    const documentWidth = document.documentElement.clientWidth;
    if (documentWidth < flusher.props.parentWidth / 2 + 10) {
      flusher.props.videoSize = "fullscreen";
      startScrollingInterval(flusher);
    } else {
      stopScrollingInterval(flusher);
      const sidebar = document.querySelector('#sidebar-wrapper');
      if (sidebar && window.getComputedStyle(sidebar).display !== 'none') {
        flusher.props.videoSize = "default";
      } else {
        flusher.props.videoSize = "theater";
      }
    }
  }
}
function setAttribute(element, attribute, states, stateKey) {
  const state = states[stateKey];
  const value = state.replace(/\s/g, "");
  element.setAttribute(attribute, value);
}
function startScrollingInterval(flusher) {
  if (flusher.props.scrollIntervalId) return;
  scrollChat(flusher);
  flusher.props.scrollIntervalId = setInterval(function () {
    scrollChat(flusher);
  }, 10000);
}
function stopScrollingInterval(flusher) {
  if (!flusher.props.scrollIntervalId) return;
  clearInterval(flusher.props.scrollIntervalId);
  flusher.props.scrollIntervalId = null;
}
function checkPosition(flusher, height, width) {
  if (!height || !width) {
    const rect = flusher.video.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
  }
  if (flusher.states.flushState) {
    flusher.container.style.top = "";
    flusher.container.style.left = "";
    flusher.container.style.alignItems = "";
    flusher.container.style.width = "";
    flusher.container.style.height = "";
  } else {
    chrome.storage.local.get("positionsPerChannel", function (result) {
      var positionsPerChannel = result.positionsPerChannel || {};
      var positionsArray = positionsPerChannel[flusher.props.channelName] || [];
      var existingPositionIndex = positionsArray.findIndex(function (item) {
        return item.videoSize === flusher.props.videoSize;
      });
      if (existingPositionIndex !== -1) {
        const position = positionsArray[existingPositionIndex].position;
        if (position.top) {
          flusher.container.removeAttribute("position");
          var scaleFactor = window.innerWidth / window.outerWidth;
          flusher.container.style.top = position.top > height ? height - 70 + "px" : Math.round(position.top * scaleFactor) + "px";
          flusher.container.style.left = position.left > width ? width - 70 + "px" : Math.round(position.left * scaleFactor) + "px";
        } else {
          flusher.container.style.top = "";
          flusher.container.style.left = "";
          flusher.container.style.alignItems = "";
          setAttribute(flusher.container, "position", flusher.states.positionStates, flusher.states.positionState);
        }
        if (position.width) {
          flusher.container.removeAttribute("size");
          flusher.container.style.width = Math.round(position.width * scaleFactor) + "px";
          flusher.container.style.height = Math.round(position.height * scaleFactor) + "px";
        } else {
          flusher.container.style.width = "";
          flusher.container.style.height = "";
          setAttribute(flusher.container, "size", flusher.states.sizeStates, flusher.states.sizeState);
        }
      } else {
        flusher.container.style.top = "";
        flusher.container.style.left = "";
        flusher.container.style.alignItems = "";
        flusher.container.style.width = "";
        flusher.container.style.height = "";
        setAttribute(flusher.container, "position", flusher.states.positionStates, flusher.states.positionState);
        setAttribute(flusher.container, "size", flusher.states.sizeStates, flusher.states.sizeState);
      }
    });
  }
}
async function scrollChat(flusher) {
  const buttons = document.querySelectorAll('button.bg-surface-base');
  const chatBtn = Array.from(buttons).find(button => button.innerText.trim() === "Chat paused for scrolling");
  const chatContainer = document.querySelector('#chatroom-messages');
  let attempts = 0;
  const maxAttempts = 10;
  const interval = 500;
  if (chatContainer === null) return;
  while (attempts < maxAttempts) {
    if (chatBtn) chatBtn.click();
    chatContainer.scrollTop = chatContainer.scrollHeight;
    if (isScrolledToBottom(chatContainer)) break;
    attempts++;
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  function isScrolledToBottom(chatContainer) {
    return chatContainer.scrollTop + chatContainer.clientHeight >= chatContainer.scrollHeight;
  }
}
;// CONCATENATED MODULE: ./modules/layout/vertical.js

async function appendVertical(message, flusher) {
  if (!message) return;
  const lastItem = flusher.messages?.firstChild;
  if (flusher.props.external) {
    if (flusher.states.slide) message.container.classList.add("flusher-animation-vertical");
    const timestamp = new Date(message.created_at);
    message.container.dataset.timestamp = timestamp;
    if (lastItem) {
      const lastTimestamp = new Date(lastItem.dataset.timestamp ?? 0);
      if (timestamp < lastTimestamp) {
        flusher.messages.append(message.container);
      } else {
        let current = lastItem;
        while (current) {
          const currentTimestamp = new Date(current.dataset.timestamp);
          if (timestamp > currentTimestamp) {
            flusher.messages.insertBefore(message.container, current);
            break;
          }
          current = current.previousSibling;
        }
        if (!current) flusher.messages.insertBefore(message.container, lastItem);
      }
    } else {
      flusher.messages.append(message.container);
    }
  } else {
    if (message.container) {
      if (flusher.states.slide) message.container.classList.add("flusher-animation-vertical");
      flusher.messages['insertBefore'](message.container, lastItem);
    } else {
      if (flusher.states.slide) message.classList.add("flusher-animation-vertical");
      try {
        flusher.messages['insertBefore'](message, lastItem);
      } catch (error) {
        if (!flusher.messages) {
          resize_reset(flusher);
        }
      }
    }
  }
  try {
    while (flusher.messages.children.length > flusher.props.maxRows) {
      const oldest = flusher.messages.lastElementChild;
      const entryId = flusher.props.isAeroKick ? oldest.querySelector('button')?.getAttribute('data-radial-id') : parseInt(oldest.getAttribute('flusher-id'), 10);
      if (entryId) {
        const observer = flusher.props.messageObservers.get(entryId);
        if (observer) {
          observer.disconnect();
          flusher.props.messageObservers.delete(entryId);
        }
      }
      if (flusher.states.spamState && entryId) {
        flusher.props.displayedMessages = flusher.props.displayedMessages.filter(message => message.id !== entryId);
      }
      oldest.remove();
    }
  } catch (error) {}
}
;// CONCATENATED MODULE: ./modules/queue/queue.js



function getMessageKey(key, value, messageId, flusher) {
  const keyValue = key + "-" + value;
  const dupe = flusher.props.displayedMessages.find(obj => {
    return obj.key === keyValue;
  });
  const ignore = flusher.states.spamState && dupe && flusher.lastRow > 1 ? true : false;
  if (!ignore) flusher.props.displayedMessages.push({
    id: messageId,
    key: keyValue
  });
  return {
    key: keyValue,
    ignore: ignore
  };
}
async function processMessageQueue(flusher) {
  try {
    if (flusher.props.isProcessingMessages) return;
    flusher.props.isProcessingMessages = true;
    let queueItem = flusher.props.messageQueue.shift();
    if (!queueItem) {
      flusher.props.isProcessingMessages = false;
      return;
    }
    queueItem.chatroom_id = flusher.external ? queueItem?.chatroom_id : 0;
    const lastRow = flusher.props.lastRow;
    const maxRows = flusher.props.maxRows;
    if (lastRow === null || lastRow >= maxRows) {
      flusher.props.isProcessingMessages = false;
      return;
    }
    const eventType = queueItem.event ?? queueItem.eventName;
    if (eventType === "App\\Events\\ChatMessageEvent" && (flusher.props.external || flusher.states.flushState)) {
      createMessage(JSON.parse(queueItem.data), flusher);
    } else if (queueItem.type === "message" && flusher.props.external) {
      createMessage(queueItem, flusher);
    } else if (eventType === "App\\Events\\UserBannedEvent") {
      createUserBanMessage(JSON.parse(queueItem.data), flusher);
    } else if (eventType === "App\\Events\\GiftedSubscriptionsEvent" && (flusher.props.external || flusher.states.flushState)) {
      createGiftedMessage(JSON.parse(queueItem.data), flusher);
    } else if (eventType === "App\\Events\\FollowersUpdated" && (flusher.props.external || flusher.states.flushState)) {
      createFollowersMessage(JSON.parse(queueItem.data), flusher);
    } else if (eventType === "App\\Events\\StreamHostEvent" && (flusher.props.external || flusher.states.flushState)) {
      createHostMessage(JSON.parse(queueItem.data), flusher);
    } else if (eventType === "App\\Events\\SubscriptionEvent" && (flusher.props.external || flusher.states.flushState)) {
      createSubMessage(JSON.parse(queueItem.data), flusher);
    } else {
      flusher.props.isProcessingMessages = false;
      processMessageQueue(flusher);
    }
  } catch (error) {
    flusher.props.isProcessingMessages = false;
    processMessageQueue(flusher);
    console.error(error);
  }
}
function processElementQueue(flusher) {
  try {
    if (flusher.props.isProcessingElements) return;
    flusher.props.isProcessingElements = true;
    const queueItem = flusher.props.elementQueue.shift();
    if (!queueItem) {
      flusher.props.isProcessingElements = false;
      return;
    }
    const flushState = flusher.states.flushState;
    if (!flusher.states.chatEnabled) {
      flusher.props.isProcessingElements = false;
      return;
    }
    flushState ? selectRow(queueItem, flusher) : appendVertical(queueItem, flusher);
    if (flusher.props.isVod) {
      const queueLength = flusher.props.elementQueue.length;
      let wait = Math.trunc(3500 / queueLength);
      if (queueLength < 3 && flusher.props.isVod && flusher.props.flushState) wait = 500;
      setTimeout(function () {
        flusher.props.isProcessingElements = false;
        processElementQueue(flusher);
      }, wait);
    } else {
      let interval = window.flusherInterval;
      if (interval > 0) {
        let count = flusher.props.elementQueue.length;
        let wait = count > 0 ? Math.trunc(window.flusherInterval / count) : 0;
        setTimeout(function () {
          flusher.props.isProcessingElements = false;
          processElementQueue(flusher);
        }, wait);
      }
    }
  } catch (error) {
    flusher.props.isProcessingElements = false;
    processElementQueue(flusher);
    console.error(error);
  }
}
function appendMessage(queueItem, flusher) {
  flusher.props.elementQueue.push(queueItem);
  processElementQueue(flusher);
  flusher.props.isProcessingMessages = false;
  processMessageQueue(flusher);
}
async function createMessage(message, flusher) {
  const sender = message.sender;
  const username = sender.username;
  const content = message.content;
  const reduced = !flusher.props.spamState ? reduceRepeatedSentences(content) : content;
  if (flusher.states.spamState) {
    const messageKeyData = getMessageKey(sender.id, reduced, message.id, flusher);
    if (messageKeyData.ignore === true) {
      flusher.props.isProcessingMessages = false;
      processMessageQueue(flusher);
      return;
    }
    message.key = messageKeyData.key;
  }
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("flusher-message");
  const badgeSpan = document.createElement("span");
  badgeSpan.classList.add("flusher-badges");
  const badgeElements = await getBadges(message, flusher);
  badgeElements.forEach(badgeElement => {
    badgeSpan.appendChild(badgeElement.cloneNode(true));
  });
  const usernameSpan = document.createElement("span");
  usernameSpan.style.color = sender.identity.color;
  usernameSpan.classList.add("flusher-username");
  usernameSpan.textContent = username;
  const boldSpan = document.createElement("span");
  boldSpan.classList.add("font-bold", "text-white");
  boldSpan.textContent = ": ";
  const contentSpan = document.createElement("span");
  contentSpan.classList.add("flusher-content");
  const emoteRegex = /\[emote:(\d+):([\w-]+)\]/g;
  let lastIndex = 0;
  let match;
  while ((match = emoteRegex.exec(reduced)) !== null) {
    const textBeforeEmote = reduced.slice(lastIndex, match.index);
    if (textBeforeEmote.trim() !== "") {
      const textBeforeNode = document.createElement("span");
      textBeforeNode.textContent = textBeforeEmote;
      textBeforeNode.classList.add("flusher-content-text");
      contentSpan.appendChild(textBeforeNode);
    }
    const img = document.createElement("img");
    const [, id, name] = match;
    img.src = `https://files.kick.com/emotes/${id}/fullsize`;
    img.alt = name;
    img.classList.add("flusher-emote");
    contentSpan.appendChild(img);
    lastIndex = emoteRegex.lastIndex;
  }
  const textAfterLastEmote = reduced.slice(lastIndex);
  if (textAfterLastEmote.trim() !== "") {
    const textAfterNode = document.createElement("span");
    textAfterNode.textContent = textAfterLastEmote;
    textAfterNode.classList.add("flusher-content-text");
    contentSpan.appendChild(textAfterNode);
  } else {
    const lastChild = contentSpan.lastChild;
    if (lastChild.tagName === "IMG") {
      lastChild.className = "last-flusher-emote";
    }
  }
  badgeSpan.firstChild ? messageDiv.append(badgeSpan) : null;
  messageDiv.append(usernameSpan, boldSpan, contentSpan);
  messageDiv.setAttribute("data-chat-entry", message.id);
  message.container = messageDiv;
  appendMessage(message, flusher);
  function reduceRepeatedSentences(input) {
    const regexSentence = /(\b.+?\b)\1+/g;
    const sentence = input.replace(regexSentence, "$1");
    const regexChar = /(.)(\1{10,})/g;
    return sentence.replace(regexChar, "$1$1$1$1$1$1$1$1$1$1");
  }
}
async function getBadges(data, flusher) {
  const badges = data.sender.identity.badges || [];
  let badgeArray = [];
  if (badges.length === 0) return badgeArray;
  for (const badge of badges) {
    const cachedBadge = getBadgeImage(badge, flusher);
    if (!cachedBadge) continue;
    if (cachedBadge?.src) {
      const badgeElement = document.createElement("img");
      badgeElement.src = cachedBadge.src;
      badgeElement.alt = badge.type;
      badgeElement.classList.add("flusher-badge");
      badgeArray.push(badgeElement);
    } else {
      cachedBadge.classList.add("flusher-badge");
      badgeArray.push(cachedBadge);
    }
  }
  function getBadgeImage(badge, flusher) {
    let badgeImage;
    if (badge.type === "subscriber") {
      const months = badge.count;
      const correspondingBadge = findClosestBadge(months);
      badgeImage = correspondingBadge ? correspondingBadge : flusher.badges["subscriber"]?.cloneNode(true);
    } else {
      badgeImage = flusher.badges[badge.type]?.cloneNode(true) || null;
    }
    return badgeImage;
  }
  function findClosestBadge(months) {
    return flusher.props.badgeCache.reduce((closest, currentBadge) => {
      if (currentBadge.months <= months && (!closest || currentBadge.months > closest.months)) {
        return currentBadge;
      }
      return closest || flusher.badges["subscriber"]?.cloneNode(true);
    }, null)?.badge_image || flusher.props.badgeCache[flusher.props.badgeCache.length - 1]?.badge_image || flusher.badges["subscriber"]?.cloneNode(true);
  }

  /* Enable when iframe chatroom available */

  /* badges.forEach(badge => {
    let badgeText = badge.text;
    if (badge.count) {
      badgeText = `${badge.type}-${badge.count}`;
    }
    const cachedBadge = flusher.props.badgeCache.find(badgeCache => badgeCache.type === badgeText);
    if (cachedBadge) {
      badgeArray.push(cachedBadge.html);
      badgeCount++;
      return;
    }
  }); */

  /* let attempts = 0;
  while (badgeCount !== badges.length && attempts < 10) {
    const newBadges = checkForBadges(data, flusher);
    badgeArray = newBadges;
     badgeCount = badgeArray.length;
    attempts++;
     await new Promise(resolve => setTimeout(resolve, 750));
  } */

  return badgeArray;
  function checkForBadges(data, flusher) {
    const badges = data.sender.identity.badges || [];
    const badgeElements = [];
    flusher.props.isProcessingMessages = false;
    let firstChatIdentity = document.querySelector(`.chat-entry-username[data-chat-entry-user-id="${data.sender.id}"]`);
    if (firstChatIdentity !== null) {
      let identity = firstChatIdentity.closest(".chat-message-identity");
      identity.querySelectorAll("div.badge-tooltip").forEach(function (baseBadge, index) {
        let badge = badges[index];
        if (badge === undefined) return;
        let badgeText = badge.text;
        if (badge.count) {
          badgeText = `${badge.type}-${badge.count}`;
        }
        const cachedBadge = flusher.props.badgeCache.find(badgeCache => badgeCache.type === badgeText);
        if (cachedBadge) {
          props.badgeElements.push(cachedBadge.html);
          return;
        }
        const imgElement = baseBadge.querySelector(`img`);
        if (imgElement) {
          const imgUrl = imgElement.src;
          const newImg = document.createElement("img");
          newImg.src = imgUrl;
          newImg.classList.add("flusher-badge");
          flusher.props.badgeCache.push({
            type: badgeText,
            html: newImg
          });
          badgeElements.push(newImg);
          return;
        }
        const svgElement = baseBadge.querySelector("svg");
        if (svgElement) {
          const svgCopy = svgElement.cloneNode(true);
          svgCopy.classList.add("flusher-badge");
          flusher.props.badgeCache.push({
            type: badgeText,
            html: svgCopy
          });
          badgeElements.push(svgCopy);
          return;
        }
        console.warn("badge not found: " + badgeText);
      });
    }
    return badgeElements;
  }
}
function createUserBanMessage(data, flusher) {
  /* logToConsole("createUserBanMessage") */;
  if (!flusher.states.bans) return;
  const bannedUser = data.user.username;
  const bannedByUser = data.banned_by.username;
  const banMessageContent = document.createElement("div");
  banMessageContent.classList.add("flusher-message", "flusher-red");
  const banMessageSpan = document.createElement("span");
  let logText;
  if (data.expires_at) {
    const expiresAt = new Date(data.expires_at);
    const timeDifference = expiresAt - new Date();
    if (flusher?.states?.banAlert && flusher?.alerts?.banAlert) flusher.alerts.banAlert.play().catch(error => console.error("Audio playback failed:", error));
    let timeDiffText;
    if (timeDifference > 0) {
      timeDiffText = humanizeDuration(timeDifference + 5000);
      const userId = data.user.id;
      addBannedUser(bannedUser, bannedByUser, userId, expiresAt);
      logText = `👺 ${bannedUser} banned for ${timeDiffText} by ${bannedByUser}`;
      const expiresText = document.createTextNode(logText);
      banMessageSpan.appendChild(expiresText);
    } else {
      logText = `💀 ${bannedUser} banned by ${bannedByUser}`;
      const expiresText = document.createTextNode(logText);
      banMessageSpan.appendChild(expiresText);
    }
  } else {
    logText = `💀 ${bannedUser} banned by ${bannedByUser}`;
    const expiresText = document.createTextNode(logText);
    banMessageSpan.appendChild(expiresText);
  }
  banMessageContent.appendChild(banMessageSpan);
  data.created_at = Date.now();
  data.container = banMessageContent;
  logToConsole(logText);
  appendMessage(data, flusher);
  function addBannedUser(bannedUser, bannedByUser, userId, expiresAt) {
    const existingUserIndex = flusher.props.bannedUsers.findIndex(user => user.username === bannedUser);
    if (existingUserIndex !== -1) {
      flusher.props.bannedUsers[existingUserIndex] = {
        id: userId,
        username: bannedUser,
        bannedBy: bannedByUser,
        expiresAt: expiresAt
      };
    } else {
      flusher.props.bannedUsers.push({
        id: userId,
        username: bannedUser,
        bannedBy: bannedByUser,
        expiresAt: expiresAt
      });
      const now = new Date().getTime();
      const expirationTime = new Date(expiresAt).getTime();
      const timeUntilExpiration = expirationTime - now;
      flusher.props.timeoutIds.push(setTimeout(() => removeBannedUser(bannedUser), timeUntilExpiration));
    }
  }
  function removeBannedUser(username) {
    const index = flusher.props.bannedUsers.findIndex(user => user.username === username);
    if (index !== -1) {
      const currentUser = flusher.props.bannedUsers[index];
      const currentTime = new Date().getTime();
      if (currentTime + 5000 >= new Date(currentUser.expiresAt).getTime()) {
        flusher.props.bannedUsers.splice(index, 1);
        const unbanMessageContent = document.createElement("div");
        unbanMessageContent.classList.add("flusher-message", "flusher-green");
        const unbanMessageSpan = document.createElement("span");
        let logText;
        logText = `🕊 ${username}'s ban expired`;
        const unbanText = document.createTextNode(logText);
        unbanMessageSpan.appendChild(unbanText);
        unbanMessageContent.appendChild(unbanMessageSpan);
        data.created_at = Date.now();
        data.container = unbanMessageContent;
        logToConsole(logText);
        if (flusher.states.bans) appendMessage(data, flusher);
      }
    }
  }
  function humanizeDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    if (years > 0) {
      return years === 1 ? "1 year" : `${years} years`;
    } else if (months > 0) {
      return months === 1 ? "1 month" : `${months} months`;
    } else if (weeks > 0) {
      return weeks === 1 ? "1 week" : `${weeks} weeks`;
    } else if (days > 0) {
      return days === 1 ? "1 day" : `${days} days`;
    } else if (hours > 0) {
      return hours === 1 ? "1 hour" : `${hours} hours`;
    } else if (minutes > 0) {
      return minutes === 1 ? "1 minute" : `${minutes} minutes`;
    } else {
      return seconds === 1 ? "1 second" : `${seconds} seconds`;
    }
  }
}
function createSubMessage(data, flusher) {
  /* logToConsole(`createSubMessage`); */

  if (!flusher.states.flushState && !flusher.props.external) return;
  const username = data.username;
  const months = data.months;
  const subscriptionMessageContent = document.createElement("div");
  subscriptionMessageContent.classList.add("flusher-message", "flusher-green");
  const emojiSpan = document.createElement("span");
  emojiSpan.textContent = String.fromCodePoint(0x1f389) + " ";
  const subscriptionMessageSpan = document.createElement("span");
  subscriptionMessageSpan.style.color = "#00FF00";
  subscriptionMessageSpan.textContent = `${months > 1 ? months + " months" : "1 month"} subscription by ${username}`;
  const subSpan = document.createElement("span");
  subSpan.style.color = "#00FF00";
  subSpan.append(emojiSpan, subscriptionMessageSpan);
  subscriptionMessageContent.append(subSpan);
  data.created_at = Date.now();
  data.container = subscriptionMessageContent;
  appendMessage(data, flusher);
}
function createHostMessage(data, flusher) {
  /* logToConsole(`createHostMessage`); */

  if (flusher.states.flushState) return;
  const hostUsername = data.host_username;
  const viewersCount = data.number_viewers;
  const hostMessageContent = document.createElement("div");
  hostMessageContent.classList.add("flusher-message", "flusher-green");
  const emojiSpan = document.createElement("span");
  emojiSpan.textContent = String.fromCodePoint(0x1f389) + " ";
  const viewersCountSpan = document.createElement("span");
  viewersCountSpan.textContent = `${viewersCount > 1 ? viewersCount + " viewers" : "1 viewer"} hosted by ` + hostUsername;
  const hostMessageSpan = document.createElement("span");
  hostMessageSpan.style.color = "#00FF00";
  hostMessageSpan.append(emojiSpan, viewersCountSpan);
  hostMessageContent.appendChild(hostMessageSpan);
  data.created_at = Date.now();
  data.container = hostMessageContent;
  appendMessage(data, flusher);
}
function createGiftedMessage(data, flusher) {
  if (!flusher.states.flushState && !flusher.props.external) {
    flusher.props.isProcessingMessages = false;
    processMessageQueue(flusher);
    return;
  }

  /* logToConsole(`createGiftedMessage`); */

  const gifterUsername = data.gifter_username;
  const giftedUsernames = data.gifted_usernames;
  const giftedContent = document.createElement("div");
  giftedContent.classList.add("flusher-message", "flusher-green");
  const emojiSpan = document.createElement("span");
  emojiSpan.textContent = String.fromCodePoint(0x1f389) + " ";
  const gifterUsernameSpan = document.createElement("span");
  gifterUsernameSpan.textContent = `${giftedUsernames.length > 1 ? giftedUsernames.length + " Subscriptions" : "1 Subscription"} gifted by ` + gifterUsername;
  const giftedSpan = document.createElement("span");
  giftedSpan.style.color = "#00FF00";
  giftedSpan.append(emojiSpan, gifterUsernameSpan);
  giftedContent.appendChild(giftedSpan);
  data.created_at = Date.now();
  data.container = giftedContent;
  appendMessage(data, flusher);
}
function createFollowersMessage(data, flusher) {
  /* logToConsole(`createFollowersMessage`); */

  const followersCount = data.followersCount;
  const followersDiff = followersCount - (flusher.props.lastFollowersCount ?? followersCount);
  if (followersDiff === 0) {
    flusher.props.lastFollowersCount = followersCount ?? null;
    flusher.props.isProcessingMessages = false;
    processMessageQueue(flusher);
    return;
  }
  const messageContent = document.createElement("div");
  messageContent.classList.add("flusher-message");
  const followersMessageSpan = document.createElement("span");
  followersMessageSpan.textContent = `${followersDiff > 1 ? followersDiff + " new followers" : "1 new follower"}`;
  messageContent.append(followersMessageSpan);
  data.created_at = Date.now();
  data.container = messageContent;
  appendMessage(data, flusher);
  flusher.props.lastFollowersCount = followersCount;
}
;// CONCATENATED MODULE: ./modules/flusher/messages.js




class FlusherMessages {
  constructor() {
    this.socket = null;
    this.nativeChatObserver = null;
    this.channels = new Set();
    this.id = 0;
    this.pinnedId = 0;
    this.ignoredIds = [];
    this.isAeroKick = false;
    this.flusher;
    this.lastMutationTime;
    this.isScrolling = false;
    this.scrollObserver;
    this.pageObserver;
    this.vodObserver;
    this.taskInterval;
    this.pinnedFlusher = null;
    this.pinnedNative = null;
    this.pinnedObserver = null;
    this.pinnedObserverTimeout = null;
    this.pinnedObservers = {};
    this.pinnedMessageOld = null;
    this.pinnedTimeouts = {};
    this.checkPinnedTimeouts = {};
    this.debounceTimeout = null;
    this.dispose = false;
    this.seventv = false;
  }
  subscribeChannel() {
    const id = this.flusher.props.chatroomId;
    if (!id || this.channels.has(id)) return;
    const subscriptionMessage = {
      event: "pusher:subscribe",
      data: {
        auth: "",
        channel: `chatrooms.${id}.v2`
      }
    };
    if (!this.socket) {
      this.setupWebSocket(this.flusher, subscriptionMessage, id);
      return;
    }
    logToConsole(`WebSocket Connection Opened: ${this.flusher.props.channelName} (${id})`);
    this.socket.send(JSON.stringify(subscriptionMessage));
    this.channels.add(id);
    if (this.flusher.props.external) this.getHistory();
  }
  async getHistory() {
    const apiUrl = `https://kick.com/api/v2/channels/${flusher.props.hostId}/messages`;
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch messages. Status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.data && data.data.messages) {
        data.data.messages.forEach(message => {
          this.flusher.props.messageQueue.push(message);
        });
        processMessageQueue(this.flusher);
      }
    } catch (error) {
      console.error("Error Fetching Messages:", error.message);
    }
  }
  setupWebSocket() {
    if (this.socket) return;
    const webSocketUrl = "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0-rc2&flash=false";
    this.socket = new WebSocket(webSocketUrl);
    this.socket.onmessage = event => {
      const data = JSON.parse(event.data);
      document.body.contains(this.flusher.video) ? this.onMessage(data) : this.disposeChannel();
    };
    this.socket.addEventListener("open", event => {
      this.subscribeChannel();
    });
    this.socket.addEventListener("close", event => {
      if (this.dispose) {
        logToConsole(`WebSocket Connection Closed: ${this.flusher.props.channelName} (${this.flusher.props.chatroomId})`);
        this.channels.clear();
      } else {
        setTimeout(() => {
          logToConsole(`WebSocket Connection Closed By Host: ${this.flusher.props.channelName} (${this.flusher.props.chatroomId})`);
          this.setupWebSocket();
        }, 30000);
      }
    });
    this.socket.addEventListener("error", event => {
      console.error("WebSocket error:", event);
    });
  }
  onMessage(data) {
    if (!this.flusher.states.chatEnabled || data === null || this.flusher.props.loading) return;
    this.flusher.props.messageQueue.push(data);
    processMessageQueue(this.flusher);
  }
  disposeChannel() {
    this.dispose = true;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      return;
    }
  }
  interceptNative() {
    this.lastMutationTime = new Date().getTime();
    window.flusherInterval = 1000;
    this.AeroKick = document.body.classList.contains("aerokick-customization");
    if (this.AeroKick) logToConsole(`AeroKick Detected`);
    const b = typeof browser !== "undefined" ? browser : chrome;
    const defaultAvatar = b.runtime.getURL("lib/kick/user-profile-pic.png");
    waitForChat(this.AeroKick).then(chatElement => {
      this.flusher.nativeChat = chatElement;
      this.parseNativeChat();
      this.observeScrolling();
      this.observeNativechatState();
      this.observeNativechatMessages();
      if (!this.flusher.props.isVod) this.observePinned();
      this.seventv = document.querySelector('seventv-container') ? true : false;
    });
    function waitForChat(AeroKick) {
      let parent = AeroKick ? ".chat-container .bk-overflow-y-auto" : "#chatroom-messages";
      let parentElement = document.querySelector(parent);
      return new Promise((resolve, reject) => {
        let checkParentInterval;
        let resolved = false;
        function checkParentElement() {
          parentElement = document.querySelector(AeroKick ? ".chat-container .bk-overflow-y-auto" : "#chatroom-messages");
          if (parentElement) {
            const scrollbar = parentElement.querySelector('.no-scrollbar.relative');
            if (scrollbar && !resolved) {
              clearInterval(checkParentInterval);
              resolved = true;
              resolve(scrollbar);
            }
          }
        }
        checkParentElement();
        if (!resolved) {
          checkParentInterval = setInterval(checkParentElement, 1000);
        }
      });
    }
  }
  observeNativechatState() {
    const pageParent = document.querySelector('nav').nextSibling;
    if (!pageParent) return;
    const vodObserver = this.flusher.props.isVod ? document.getElementById('channel-chatroom')?.querySelector('div.overflow-hidden').parentElement : null;
    const handleMutations = (mutations, observer) => {
      if (mutations[0].type === "childList" && mutations[0].removedNodes.length > 0) {
        if (!document.querySelector('#chatroom-messages') || window.currentUrl !== window.location.href) {
          resize_reset(this.flusher);
          observer.disconnect();
        }
      }
    };
    if (this.pageObserver) this.pageObserver.disconnect();
    this.pageObserver = new MutationObserver(mutations => handleMutations(mutations, this.pageObserver));
    this.pageObserver.observe(pageParent, {
      childList: true,
      subtree: false
    });
    if (vodObserver) {
      if (this.vodObserver) this.vodObserver.disconnect();
      this.vodObserver = new MutationObserver(mutations => handleMutations(mutations, this.vodObserver));
      this.vodObserver.observe(vodObserver, {
        childList: true,
        subtree: false
      });
    }
  }
  observePinned() {
    this.pinnedNative = document.getElementById('chatroom-messages')?.parentElement?.firstElementChild;
    this.pinnedFlusher = this.flusher?.container?.querySelector(".flusher-pinned");
    if (!this.pinnedNative || !this.pinnedFlusher) return;
    let parent = this.pinnedNative.querySelector('.relative.flex');
    if (!parent) return;
    this.checkPinned(parent, this.pinnedFlusher);
    if (this.pinnedObserver) this.pinnedObserver.disconnect();
    this.pinnedObserver = new MutationObserver(mutations => {
      this.checkPinned(parent, this.pinnedFlusher);
    });
    this.pinnedObserver.observe(parent, {
      childList: true,
      subtree: false
    });
  }
  checkPinned(parent) {
    this.removePinned();
    Array.from(parent?.children || []).forEach(pinElement => {
      let id = pinElement.getAttribute('flusher-id');
      if (!id || !this.ignoredIds.includes(id)) {
        const pinId = this.pinnedId++;
        this.checkPinnedTimeouts[pinId] = setTimeout(() => {
          pinElement.setAttribute('flusher-id', pinId);
          this.appendPinned(pinId);
        }, 1500);
      }
    });
  }
  appendPinned(pinId) {
    let pinElement = this.pinnedNative?.querySelector(`[flusher-id="${pinId}"]`);
    if (!pinElement) return;
    const innerText = pinElement.innerText.replace(/\s+/g, ' ').trim();
    logToConsole(innerText);
    const currentPinnedId = pinId;
    let pinElementObject = pinElement.cloneNode(true);
    pinElementObject.removeAttribute('style');
    let isMessage = pinElementObject.querySelector('button.inline.font-bold');
    if (isMessage) {
      if (!pinElementObject.querySelector('.line-clamp-2') || !this.flusher.states.pinned) return;
      const newInnerText = pinElement.innerText.replace(/\s+/g, ' ').trim();
      if (this.pinnedMessageOld === newInnerText) return;
      this.pinnedMessageOld = newInnerText;
      pinElementObject.classList.add('pinned');
      pinElementObject.querySelector('div.flex-nowrap.justify-between button').remove();
      pinElementObject.querySelectorAll('.line-clamp-2').forEach(element => {
        element.classList.remove('line-clamp-2');
      });
      this.setPinnedRemoveTimer(currentPinnedId);
    } else {
      if (!pinElementObject.matches('.z-absolute')) {
        this.pinnedFlusher.classList.add('flusher-top');
      } else {
        if (!this.flusher.states.pinned) return;
      }
    }
    let hideBtn = pinElementObject.querySelector('button.box-border.flex');
    if (hideBtn) {
      hideBtn.parentElement.classList.add('flusher-close-btn');
      hideBtn.onclick = () => {
        this.ignoredIds.push(currentPinnedId.toString());
        this.removePinned(currentPinnedId);
      };
    }
    if (this.flusher?.states?.pinnedAlert && this.flusher?.alerts?.pinnedAlert) this.flusher.alerts.pinnedAlert.play().catch(error => console.error("Audio playback failed:", error));
    pinElementObject.classList.add('downward-transition');
    this.pinnedFlusher.append(pinElementObject);
    pinElementObject.offsetHeight;
    pinElementObject.classList.add('in-view');
    let pinObserver = new MutationObserver(mutations => {
      /* hotfix */
      /* if (mutations[0].type === "attributes" && mutations[0].attributeName === "class") {
        if (mutations[0].target.className === "z-absolute w-full") return;
      } */

      let newClone = pinElement.cloneNode(true);
      pinElementObject = this.pinnedFlusher?.querySelector(`[flusher-id="${pinElement.getAttribute('flusher-id', '')}"]`);
      if (pinElementObject) {
        pinElementObject.replaceWith(newClone);
        pinElementObject = newClone;
        if (pinElementObject.querySelector('button.inline.font-bold')) {
          if (!pinElementObject.matches('.z-absolute.w-full')) return;
          const newText = pinElement.innerText.replace(/\s+/g, ' ').trim();
          if (this.pinnedMessageOld === newText) return;
          this.pinnedMessageOld = newText;
          pinElementObject.classList.remove('upward-transition');
          pinElementObject.classList.add('downward-transition');
          pinElementObject.offsetHeight;
          pinElementObject.classList.add('in-view');
          this.setPinnedRemoveTimer(pinElementObject.getAttribute('flusher-id'));
        }
      } else {
        pinObserver.disconnect();
        const newPinId = this.pinnedId++;
        pinElement.setAttribute('flusher-id', newPinId);
        this.appendPinned(pinElement);
      }
    });
    pinObserver.observe(pinElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true
    });
    this.pinnedObservers[currentPinnedId] = pinObserver;
  }
  setPinnedRemoveTimer(id) {
    if (id === undefined || id === null) return;
    if (this.pinnedTimeouts[id]) clearTimeout(this.pinnedTimeouts[id]);
    this.pinnedTimeouts[id] = setTimeout(() => {
      this.removePinned(id);
    }, 8000);
  }
  removePinned(id) {
    const pinElement = this.pinnedFlusher?.querySelector(`[flusher-id="${id}"]`);
    if (!pinElement && id) return;
    if (pinElement) {
      this.removePin(pinElement);
    } else {
      const nativeItems = Array.from(this.pinnedNative?.children || []).map(child => child.getAttribute('flusher-id') || '');
      Array.from(this.pinnedFlusher?.children || []).forEach(child => {
        const flusherId = child.getAttribute('flusher-id') || '';
        if (!nativeItems.includes(flusherId)) {
          this.removePin(child);
        }
      });
    }
  }
  removePin(pinElement) {
    const flusherId = pinElement.getAttribute('flusher-id') || '';
    pinElement.classList.remove('downward-transition');
    pinElement.classList.remove('in-view');
    pinElement.classList.add('upward-transition');
    setTimeout(() => {
      const exists = this.pinnedNative?.querySelector(`[flusher-id="${pinElement.getAttribute('flusher-id', '')}"]`);
      pinElement.remove();
      if (this.pinnedObservers[flusherId] && (!exists || !pinElement.querySelector('button.inline.font-bold'))) this.pinnedObservers[flusherId].disconnect();
      if (this.pinnedTimeouts[flusherId]) clearTimeout(this.pinnedTimeouts[flusherId]);
      if (pinElement.matches('.bg-shade-lower')) {
        let addTop;
        Array.from(this.pinnedFlusher.children).forEach(child => {
          if (child.matches('.bg-shade-lower')) {
            addTop = true;
            this.pinnedFlusher.classList.remove('flusher-top');
          }
        });
        if (addTop) this.pinnedFlusher.classList.remove('flusher-top');
      }
    }, 1000);
  }
  parseNativeChat() {
    if (!this.flusher.states.flushState) setTimeout(() => {
      this.flusher.nativeChat.childNodes.forEach(addedNode => {
        this.prepareMessage(addedNode, false);
      });
    }, 500);
  }
  observeNativechatMessages() {
    if (this.nativeChatObserver) this.nativeChatObserver.disconnect();
    this.nativeChatObserver = new MutationObserver(mutations => {
      if (this.isScrolling) return;
      this.interval(mutations.length);
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) {
          this.prepareMessage(mutation.addedNodes[0], false);
        }
      });
    });
    const observerConfig = {
      childList: true,
      subtree: false
    };
    this.nativeChatObserver.observe(this.flusher.nativeChat, observerConfig);
  }
  async interval(count) {
    const currentMutationTime = new Date().getTime();
    if (count === 1) {
      this.debounceTimeout = setTimeout(() => {
        this.lastMutationTime = currentMutationTime;
        window.flusherInterval = 1000;
      }, 1000);
      return;
    }
    clearTimeout(this.debounceTimeout);
    const interval = Math.round(currentMutationTime - this.lastMutationTime + window.flusherInterval * 0.5);
    window.flusherInterval = Math.max(interval, 1500);
    this.lastMutationTime = currentMutationTime;
  }
  observeScrolling() {
    const targetElement = document.querySelector("#chatroom-messages")?.nextSibling;
    if (targetElement) {
      if (this.scrollObserver) this.scrollObserver.disconnect();
      this.scrollObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === "childList") {
            if (mutation.addedNodes.length > 0) this.isScrolling = true;
            if (targetElement.children.length === 0) this.isScrolling = false;
          }
        });
      });
      this.scrollObserver.observe(targetElement, {
        childList: true
      });
    }
  }
  prepareMessage(addedNode, update) {
    if (!addedNode || addedNode.nodeName !== "DIV") return;
    if (!update) {
      this.id++;
      addedNode = addedNode.firstElementChild;
      addedNode.setAttribute('flusher-id', this.id);
    }
    if (this.AeroKick && !this.flusher.props.isVod) {
      const button = addedNode.querySelector("button");
      if (!button) return;
    }
    const clonedNode = addedNode.cloneNode(true);
    const userId = this.AeroKick && this.flusher.props.isAeroKick ? clonedNode.querySelector("button").getAttribute("data-radial-username") : clonedNode.querySelector('button[title]')?.getAttribute('title');
    if (!userId) clonedNode.style.padding = '0';
    if (this.flusher.states.flushState && !userId) return;

    /* history_breaker */
    if (clonedNode.classList.contains('items-center')) return;
    clonedNode.classList.remove("relative", "group");
    if (this.flusher.props.isAeroKick) {
      clonedNode.style.fontSize = null;
      clonedNode.style.marginTop = null;
      clonedNode.classList.remove("relative", "bk-pl-1.5");
      if (this.flusher.states.flushState) {
        var elements = clonedNode.querySelectorAll("[class*=bk-top-]");
        elements.forEach(element => {
          var classes = element.classList;
          var classesToRemove = Array.from(classes).filter(className => className.includes("bk-top-"));
          classesToRemove.forEach(className => {
            element.classList.remove(className);
          });
        });
      }
      const avatar = clonedNode.querySelector('img[alt="avatar"]');
      if (avatar) {
        avatar.closest("button").classList.remove("bk-ease-in-out", "bk-duration-100", "bk-transition-colors", "bk-translate-y-px");
        avatar.style.animation = "none";
        const username = clonedNode.querySelector(".bk-text-transparent");
        if (username) username.style.color = username.style.backgroundColor ?? "white";
        avatar.onerror = function () {
          this.style.display = "none";
          this.onerror = null;
          this.src = defaultAvatar;
          this.style.display = "block";
        };
      }
    }
    if (this.id || this.id === "") {
      if ((this.flusher.states.spamState || this.flusher.states.flushState) && !this.flusher.props.isVod) {
        let lastText;
        let textDupe = false;
        let lastEmoji;
        let emojiCount = 0;
        let emojiTrain = [];
        /* let isTrain = false; */

        const elements = Array.from(clonedNode.querySelectorAll('.chat-entry-content, .chat-emote-container'));
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          if (element.classList.contains('chat-entry-content')) {
            let text;
            emojiCount = 0;
            /* isTrain = false; */

            /* Remove if same as last */
            if (element.textContent === lastText) {
              element.parentElement.remove();
              textDupe = true;
            } else {
              text = element.textContent;
              lastText = text;
              textDupe = false;
              try {
                /* excessive spaces and newlines */
                /* text = text.replace(/\s+/g, ' '); */
                text = text.trim();

                /* Remove duplicate consecutive characters */
                /* text = text.replace(/([\s\S])(\1{2,})/gu, '$1$1$1'); */
                text = text.replace(/([\p{Emoji}]|[\p{L}])(\1{2,})/gu, '$1$1$1');
                let regex;

                /* Remove duplicate sentences */
                /* 
                text = text.replace(regex, "$1"); */
                /* text = splitAndFilterStringByEmoji(text); */

                // Regular expression to match repeating sequences
                regex = /(this.flusher.+?)\1{2,}/g;
                text.replace(regex, (match, group) => group + '(' + match.length / group.length + ')');
                element.textContent = text;
                function splitAndFilterStringByEmoji(inputString) {
                  let lastText2 = "";
                  let textDupe2 = false;
                  let lastEmoji2;
                  let emojiCount2 = 0;
                  let emojiTrain2 = [];
                  let result = [];
                  let regex2 = /([\p{Emoji}]\s?|[^\p{Emoji}]+)/gu;
                  let matches = [...inputString.matchAll(regex2)];
                  for (let i = 0; i < matches.length; i++) {
                    let segment = matches[i].input;
                    const regexExp = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;
                    if (!regexExp.test(segment)) {
                      emojiCount2 = 0;
                      /* isTrain = false; */

                      const regexSentence = /(\b.+?\b)\1+/g;
                      segment = segment.replace(regexSentence, "$1");

                      /* Remove if same as last */
                      if (lastText2.includes(segment)) {
                        textDupe2 = true;
                      } else {
                        result.push(segment);
                        lastText2 = segment;
                        textDupe2 = false;
                      }
                    } else {
                      /* Train hits on > 1 emojis */
                      if (emojiTrain2.length > 1 && emojiTrain2[0] === segment) {
                        // Start checking for the train
                        let currentElementCount = i + 1;
                        let currentElement = matches[currentElementCount]?.input;
                        let detectedTrain = [];
                        if (currentElement) {
                          for (let i = 1; i < emojiTrain2.length; i++) {
                            if (currentElement !== emojiTrain2[i]) {
                              /* isTrain = false; */
                              detectedTrain = [];
                              break;
                            }
                            detectedTrain.push(currentElement);
                            currentElementCount++;
                            currentElement = matches[currentElementCount]?.input;
                          }
                        }

                        // Remove the detected train
                        if (detectedTrain.length > 0) {
                          /* elements.splice(i, detectedTrain.length);
                          i--; */
                        } else {
                          processTrain();
                        }
                      } else {
                        /* if (!isTrain) {
                          emojiTrain = [];
                          lastEmoji = null;
                        } */
                        processTrain();
                      }
                      function processTrain() {
                        // Start a new train
                        /* isTrain = true; */
                        emojiTrain2.push(segment);
                        if (segment === lastEmoji2) {
                          /* Remove excessive emojis */
                          emojiCount2++;
                          if (emojiCount2 > 2) {}

                          /* Check if emoji + text spam */else if (!textDupe2 && emojiCount2 === 1) {
                            const nextElement = elements[i + 1];
                            if (nextElement && /[\p{Emoji}]/gu.test(nextElement)) {
                              if (nextElement === lastText2) {}
                            }
                          } else {
                            result.push(segment);
                          }
                        } else {
                          result.push(segment);
                          lastText2 = segment;
                          emojiCount2 = 0;
                        }
                      }
                    }
                  }
                  return result.join('');
                }
              } catch (error) {
                console.error('Error occurred while processing text:', error);
                console.log('Text causing error:', text);
              }
            }
          } else {
            const alt = element.querySelector('img').getAttribute('alt');

            /* Train hits on > 1 emojis */
            if (emojiTrain.length > 1 && emojiTrain[0] === alt) {
              // Start checking for the train
              let currentElement = element.parentElement.nextElementSibling;
              let detectedTrain = [];
              if (currentElement) {
                for (let i = 1; i < emojiTrain.length; i++) {
                  if (currentElement?.querySelector('img')?.getAttribute('alt') !== emojiTrain[i]) {
                    /* isTrain = false; */
                    detectedTrain = [];
                    break;
                  }
                  detectedTrain.push(currentElement);
                  currentElement = currentElement.nextElementSibling;
                }
              }

              // Remove the detected train
              if (detectedTrain.length > 0) {
                detectedTrain.push(element.parentElement);
                detectedTrain.forEach(element => element.remove());
                elements.splice(i, detectedTrain.length);
                i--;
              } else {
                processTrain();
              }
            } else {
              /* if (!isTrain) {
                emojiTrain = [];
                lastEmoji = null;
              } */
              processTrain();
            }
            function processTrain() {
              // Start a new train
              /* isTrain = true; */
              emojiTrain.push(alt);
              if (alt === lastEmoji) {
                /* Remove excessive emojis */
                emojiCount++;
                if (emojiCount > 3) {
                  element.parentElement.remove();
                }

                /* Check if emoji + text spam */else if (!textDupe && emojiCount === 1) {
                  const nextElement = elements[i + 1];
                  if (nextElement && nextElement.classList.contains('chat-entry-content')) {
                    if (nextElement.textContent === lastText) {
                      element.parentElement.remove();
                    }
                  }
                }
              } else {
                lastEmoji = alt;
                emojiCount = 0;
              }
            }
          }
        }
      }
      if (this.checkDupe(clonedNode) && !update) return;
      if (!this.flusher.states.reply || this.flusher.states.flushState) {
        if (this.AeroKick) {
          const chatEntry = clonedNode.querySelector(".bk-text-sm");
          if (chatEntry) chatEntry.style.display = "none";
        } else {
          const chatEntry = clonedNode.querySelector(".chat-entry");
          if (chatEntry && chatEntry.childElementCount > 1) {
            chatEntry.firstElementChild.style.display = "none";
          }
        }
      }

      /* hide time in vod messages if enabled */
      if (this.flusher.props.isVod && (this.flusher.states.flushState || !this.flusher.states.timeState)) {
        const chatEntryDiv = clonedNode.querySelector("span.text-neutral.pr-1.font-semibold");
        if (chatEntryDiv) chatEntryDiv.style.display = "none";
      }
    }
    clonedNode.classList.remove("mt-0.5");
    if (!update) {
      this.addMessage(addedNode, clonedNode);
    } else {
      return clonedNode;
    }
  }
  checkDupe(clonedNode) {
    if (this.id || this.id === "") {
      const userId = this.AeroKick && this.flusher.props.isAeroKick ? clonedNode.querySelector("button").getAttribute("data-radial-username") : clonedNode.querySelector('button[title]')?.getAttribute('title');
      if (!userId) {
        /* console.log('event', clonedNode); */
        return false;
      }
      if (this.flusher.props.isKickTools) {
        if (clonedNode.style.opacity ?? 1 < 1) {
          const isUserBanned = this.flusher.props.bannedUsers.some(user => user.id === userId);
          if (isUserBanned) {
            console.log(userId + ' allowed');
          } else {
            return true;
          }
        }
      }
      if (this.flusher.states.spamState || this.flusher.states.flushState) {
        let emoteElements;
        let uniqueString = "";
        const divTextContent = this.AeroKick && this.flusher.props.isAeroKick ? clonedNode.querySelector("span.bk-inline").textContent : clonedNode.querySelector('span.font-normal')?.textContent;

        /* set text content */
        if (divTextContent) {
          uniqueString += divTextContent + " ";
          /* Remove duplicate consecutive characters */
          uniqueString = uniqueString.replace(/([\p{Emoji}]|[\p{L}])(\1{2,})/gu, '$1');
        }

        /* set emotes */
        if (this.AeroKick) {
          emoteElements = clonedNode.querySelectorAll("img");
          if (emoteElements.length > 0) {
            emoteElements.forEach(emoteElement => {
              const emoteValue = emoteElement.getAttribute("alt");
              if (uniqueString.indexOf(emoteValue) === -1) {
                uniqueString += emoteValue + " ";
              }
            });

            /* Remove duplicate sentences */
            const regex = /(.+)(?= \1)/g;
            uniqueString = uniqueString.replace(regex, "").trim();
          }
        } else {
          emoteElements = clonedNode.querySelectorAll('span.font-normal img');
          if (emoteElements.length > 0) {
            emoteElements.forEach(emoteElement => {
              const emoteValue = emoteElement.getAttribute("alt");
              if (uniqueString.indexOf(emoteValue) === -1) {
                uniqueString += emoteValue + " ";
              }
            });

            /* Remove duplicate sentences */
            const regex = /(.+)(?= \1)/g;
            uniqueString = uniqueString.replace(regex, "").trim();
          }
        }

        /* set userId */
        uniqueString = userId + uniqueString;

        /* remove spaces */
        uniqueString = uniqueString.replace(/\s/g, '');
        uniqueString = uniqueString.toLowerCase();
        const exist = this.flusher.props.displayedMessages.find(obj => {
          return obj.key === uniqueString;
        });
        if (exist) return true;
        this.flusher.props.displayedMessages.push({
          id: this.id,
          key: uniqueString
        });
        return false;
      }
    }
    return false;
  }
  addMessage(addedNode, clonedNode) {
    this.flusher.props.elementQueue.push(clonedNode);
    processElementQueue(this.flusher);
    if (this.id && !this.flusher.states.flushState) this.observeNestedChildren(addedNode, this.id, clonedNode);
  }
  observeNestedChildren(parentNode, id, clonedNode) {
    const observer = new MutationObserver(() => {
      if (clonedNode) {
        /* check when changing that 7TV still works */
        if (this.flusher.states.deleted && parentNode.querySelector('span.text-neutral span.font-semibold')) {
          clonedNode.classList.add('flusher-deleted');
        } else {
          clonedNode.replaceWith(this.prepareMessage(parentNode, true));
          if (!this.seventv) parentNode.classList.add('flusher-red-border');
          /* let currentTextElement = clonedNode.querySelector('span.font-normal');
          if (currentTextElement) {
          let newTextElement = this.prepareMessage(parentNode, true)?.querySelector('span.font-normal');
          if (newTextElement) currentTextElement.replaceWith(newTextElement);
          } */
        }
      }
    });
    const observerConfig = {
      childList: true,
      subtree: true
    };
    observer.observe(parentNode, observerConfig);
    this.flusher.props.messageObservers.set(id, observer);
  }
  async bindRequests(flusher) {
    this.dispose = false;
    if (!flusher) return;
    this.flusher = flusher;
    if (!this.flusher.props.external) this.interceptNative();
    if (this.flusher?.props?.bindTimeout) clearTimeout(this.flusher.props.bindTimeout);
    this.flusher.props.bindTimeout = setTimeout(async () => {
      if (!this.flusher) return;
      if (!this.flusher.props.chatroomId && !this.flusher.props.isVod) {
        try {
          const channelName = this.flusher.props.channelName.toLowerCase().replace(/\s/g, '');
          const response = await fetch(`https://kick.com/api/v1/channels/${channelName}`);
          const data = await response.json();
          this.flusher.props.chatroomId = data && data.chatroom && data.chatroom.id;
          this.flusher.props.hostId = data.id;
          if (this.flusher.props.external) {
            this.flusher.props.badgeCache.push(this.flusher.data.subscriber_badges);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
      if (!this.socket && !this.flusher.props.isVod) this.subscribeChannel();
    }, this.flusher.props.external ? 0 : 30000);
  }
  unbindRequests() {
    this.disposeChannel();
    if (!this.flusher?.props?.external || this.flusher.states.flushState) {
      if (this.nativeChatObserver) {
        this.nativeChatObserver.disconnect();
        this.nativeChatObserver = null;
      }
      if (this.scrollObserver) {
        this.scrollObserver.disconnect();
        this.scrollObserver = null;
      }
      if (this.pageObserver) {
        this.pageObserver.disconnect();
        this.pageObserver = null;
      }
      if (this.vodObserver) {
        this.vodObserver.disconnect();
        this.vodObserver = null;
      }
      if (this.pinnedObserver) {
        this.pinnedObserver.disconnect();
        this.pinnedObserver = null;
      }
      if (this.checkPinnedTimeouts) {
        for (const id in this.checkPinnedTimeouts) {
          clearTimeout(this.checkPinnedTimeouts[id]);
          delete this.pinnedTimeouts[id];
        }
      }
      if (this.pinnedMessageOld) {
        this.pinnedMessageOld = null;
      }
      if (this.pinnedObserverTimeout) clearTimeout(this.pinnedObserverTimeout);
      if (this.pinnedTimeouts) {
        for (const id in this.pinnedTimeouts) {
          clearTimeout(this.pinnedTimeouts[id]);
          delete this.pinnedTimeouts[id];
        }
      }
      if (this.pinnedObservers) {
        for (const id in this.pinnedObservers) {
          this.pinnedObservers[id].disconnect();
          delete this.pinnedObservers[id];
        }
      }
      if (this.taskInterval) {
        clearInterval(this.taskInterval);
        this.taskInterval = null;
      }
      if (this.flusher?.props?.bindTimeout) {
        clearTimeout(this.flusher.props.bindTimeout);
        this.flusher.props.bindTimeout = null;
      }
      if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
    }
  }
}
;// CONCATENATED MODULE: ./modules/utils/badges.js
class Badges {
  broadcasterSVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" space="preserve" width="16" height="16">
   <g id="Badge_Chat_host"><linearGradient id="badge-host-gradient-1" gradientUnits="userSpaceOnUse" x1="4" y1="180.5864" x2="4" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><rect x="3.2" y="9.6" style="fill:url(#badge-host-gradient-1);" width="1.6" height="1.6"></rect><linearGradient id="badge-host-gradient-2" gradientUnits="userSpaceOnUse" x1="8" y1="180.5864" x2="8" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><polygon style="fill:url(#badge-host-gradient-2);" points="6.4,9.6 9.6,9.6 9.6,8 11.2,8 
		11.2,1.6 9.6,1.6 9.6,0 6.4,0 6.4,1.6 4.8,1.6 4.8,8 6.4,8 	"></polygon><linearGradient id="badge-host-gradient-3" gradientUnits="userSpaceOnUse" x1="2.4" y1="180.5864" x2="2.4" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><rect x="1.6" y="6.4" style="fill:url(#badge-host-gradient-3);" width="1.6" height="3.2"></rect><linearGradient id="badge-host-gradient-4" gradientUnits="userSpaceOnUse" x1="12" y1="180.5864" x2="12" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><rect x="11.2" y="9.6" style="fill:url(#badge-host-gradient-4);" width="1.6" height="1.6"></rect><linearGradient id="badge-host-gradient-5" gradientUnits="userSpaceOnUse" x1="8" y1="180.5864" x2="8" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><polygon style="fill:url(#badge-host-gradient-5);" points="4.8,12.8 6.4,12.8 6.4,14.4 
		4.8,14.4 4.8,16 11.2,16 11.2,14.4 9.6,14.4 9.6,12.8 11.2,12.8 11.2,11.2 4.8,11.2 	"></polygon><linearGradient id="badge-host-gradient-6" gradientUnits="userSpaceOnUse" x1="13.6" y1="180.5864" x2="13.6" y2="200.6666" gradientTransform="matrix(1 0 0 1 0 -182)"><stop offset="0" style="stop-color:#FF1CD2;"></stop><stop offset="0.99" style="stop-color:#B20DFF;"></stop></linearGradient><rect x="12.8" y="6.4" style="fill:url(#badge-host-gradient-6);" width="1.6" height="3.2"></rect></g>
</svg>`;
  founderSVG = `<svg version="1.1" x="0px" y="0px" viewBox="0 0 16 16" space="preserve" width="16" height="16"><linearGradient id="badge-founder-gradient" gradientUnits="userSpaceOnUse" x1="7.874" y1="20.2333" x2="8.1274" y2="-0.3467" gradientTransform="matrix(1 0 0 -1 0 18)"><stop offset="0" style="stop-color: rgb(255, 201, 0);"></stop><stop offset="0.99" style="stop-color: rgb(255, 149, 0);"></stop></linearGradient><path d="
M14.6,4V2.7h-1.3V1.4H12V0H4v1.4H2.7v1.3H1.3V4H0v8h1.3v1.3h1.4v1.3H4V16h8v-1.4h1.3v-1.3h1.3V12H16V4H14.6z M9.9,12.9H6.7V6.4H4.5
V5.2h1V4.1h1v-1h3.4V12.9z" style="fill-rule: evenodd; clip-rule: evenodd; fill: url(&quot;#badge-founder-gradient&quot;);"></path></svg>`;
  moderatorSVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" space="preserve" width="16" height="16">
   <path d="M11.7,1.3v1.5h-1.5v1.5 H8.7v1.5H7.3v1.5H5.8V5.8h-3v3h1.5v1.5H2.8v1.5H1.3v3h3v-1.5h1.5v-1.5h1.5v1.5h3v-3H8.7V8.7h1.5V7.3h1.5V5.8h1.5V4.3h1.5v-3 C14.7,1.3,11.7,1.3,11.7,1.3z" style="fill: #00C7FF"></path>
</svg>`;
  ogSVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" space="preserve" width="16" height="16">
   <g>
      <linearGradient id="badge-og-gradient-1" gradientUnits="userSpaceOnUse" x1="12.2" y1="-180" x2="12.2" y2="-165.2556" gradientTransform="matrix(1 0 0 -1 0 -164)">
         <stop offset="0" style="stop-color:#00FFF2;"></stop><stop offset="0.99" style="stop-color:#006399;"></stop>
      </linearGradient>
      <path style="fill:url(#badge-og-gradient-1);" d="M16,16H9.2v-0.8H8.4v-8h0.8V6.4H16v3.2h-4.5v4.8H13v-1.6h-0.8v-1.6H16V16z"></path>
      <linearGradient id="badge-og-gradient-2" gradientUnits="userSpaceOnUse" x1="3.7636" y1="-164.265" x2="4.0623" y2="-179.9352" gradientTransform="matrix(1 0 0 -1 0 -164)">
         <stop offset="0" style="stop-color:#00FFF2;"></stop>
         <stop offset="0.99" style="stop-color:#006399;"></stop>
      </linearGradient>
      <path style="fill:url(#badge-og-gradient-2);" d="M6.8,8.8v0.8h-6V8.8H0v-8h0.8V0h6.1v0.8 h0.8v8H6.8z M4.5,6.4V1.6H3v4.8H4.5z"></path>
      <path style="fill:#00FFF2;" d="M6.8,15.2V16h-6v-0.8H0V8.8h0.8V8h6.1v0.8h0.8v6.4C7.7,15.2,6.8,15.2,6.8,15.2z M4.5,14.4V9.6H3v4.8 C3,14.4,4.5,14.4,4.5,14.4z"></path>
      <path style="fill:#00FFF2;" d="M16,8H9.2V7.2H8.4V0.8h0.8V0H16v1.6h-4.5v4.8H13V4.8h-0.8V3.2H16V8z"></path>
   </g>
</svg>`;
  staffSVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="16" height="16" viewBox="0 0 16 16" fill="none">
   <path fill-rule="evenodd" clip-rule="evenodd" d="M2.07324 1.33331H6.51991V4.29331H7.99991V2.81331H9.47991V1.33331H13.9266V5.77998H12.4466V7.25998H10.9599V8.73998H12.4466V10.22H13.9266V14.6666H9.47991V13.1866H7.99991V11.7066H6.51991V14.6666H2.07324V1.33331Z" fill="url(#badge-verified-gradient)"></path>
   <defs>
      <linearGradient id="badge-verified-gradient" x1="33.791%" y1="97.416%" x2="65.541%" y2="4.5%" gradientUnits="objectBoundingBox">
         <stop stop-color="#1EFF00"></stop>
         <stop offset="0.99" stop-color="#00FF8C"></stop>
      </linearGradient>
   </defs>
</svg>`;
  subGifter1SVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="16" height="16" viewBox="0 0 16 16" fill="none">
   <g clip-path="url(#clip0_301_17810)">
      <path d="M7.99999 9.14999V6.62499L0.484985 3.35999V6.34499L1.15499 6.63499V12.73L7.99999 15.995V9.14999Z" fill="#0269D4"></path>
      <path d="M8.00003 10.735V9.61501L1.15503 6.63501V7.70501L8.00003 10.735Z" fill="#0269D4"></path>
      <path d="M15.515 3.355V6.345L14.85 6.64V12.73L12.705 13.755L11.185 14.48L8.00499 15.995V6.715L4.81999 5.295H4.81499L3.29499 4.61L0.484985 3.355L3.66999 1.935L3.67999 1.93L5.09499 1.3L8.00499 0L10.905 1.3L12.32 1.925L12.33 1.935L15.515 3.355Z" fill="#04D0FF"></path>
      <path d="M14.845 6.63501V7.70501L8 10.735V9.61501L14.845 6.63501Z" fill="#0269D4"></path>
   </g>
   <defs>
      <clipPath id="clip0_301_17810">
         <rect width="16" height="16" fill="white"></rect>
      </clipPath>
   </defs>
</svg>`;
  subGufter2SVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="16" height="16" viewBox="0 0 16 16" fill="none">
   <g clip-path="url(#clip0_301_17825)"><path d="M7.99999 9.14999V6.62499L0.484985 3.35999V6.34499L1.14999 6.63999V12.73L7.99999 16V9.14999Z" fill="#FF5008"></path>
      <path d="M8.00002 10.74V9.61501L1.15002 6.64001V7.71001L8.00002 10.74Z" fill="#FF5008"></path>
      <path d="M15.515 3.355V6.345L14.85 6.64V12.73L12.705 13.755L11.185 14.48L8.00499 15.995V6.715L4.81999 5.295H4.81499L3.29499 4.61L0.484985 3.355L3.66999 1.935L3.67999 1.93L5.09499 1.3L8.00499 0L10.905 1.3L12.32 1.925L12.33 1.935L15.515 3.355Z" fill="#FFC800"></path>
      <path d="M14.85 6.64001V7.71001L8 10.74V9.61501L14.85 6.64001Z" fill="#FF5008"></path>
   </g>
   <defs>
      <clipPath id="clip0_301_17825">
         <rect width="16" height="16" fill="white"></rect>
      </clipPath>
   </defs>
</svg>`;
  subscriberSVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="16" height="16" viewBox="0 0 16 16" fill="none">
   <g>
      <linearGradient id="badge-subscriber-gradient-1" gradientUnits="userSpaceOnUse" x1="-2.386" y1="-151.2764" x2="42.2073" y2="-240.4697" gradientTransform="matrix(1 0 0 -1 0 -164)">
         <stop offset="0" style="stop-color:#E1FF00;"></stop>
         <stop offset="0.99" style="stop-color:#2AA300;"></stop>
      </linearGradient>
      <path style="fill:url(#badge-subscriber-gradient-1);" d="M14.8,7.3V6.1h-2.4V4.9H11V3.7H9.9V1.2H8.7V0H7.3v1.2H6.1v2.5H5v1.2H3.7v1.3H1.2v1.2H0v1.4 h1.2V10h2.4v1.3H5v1.2h1.2V15h1.2v1h1.3v-1.2h1.2v-2.5H11v-1.2h1.3V9.9h2.4V8.7H16V7.3H14.8z"></path>
      <linearGradient id="badge-subscriber-gradient-2" gradientUnits="userSpaceOnUse" x1="-5.3836" y1="-158.3055" x2="14.9276" y2="-189.0962" gradientTransform="matrix(1 0 0 -1 0 -164)">
         <stop offset="0" style="stop-color:#E1FF00;"></stop>
         <stop offset="0.99" style="stop-color:#2AA300;"></stop>
      </linearGradient>
      <path style="fill:url(#badge-subscriber-gradient-2);" d="M7.3,7.3v7.5H6.1v-2.5H5v-1.2H3.7V9.9H1.2 V8.7H0V7.3H7.3z"></path>
      <linearGradient id="badge-subscriber-gradient-3" gradientUnits="userSpaceOnUse" x1="3.65" y1="-160.7004" x2="3.65" y2="-184.1244" gradientTransform="matrix(1 0 0 -1 0 -164)">
         <stop offset="0" style="stop-color:#E1FF00;"></stop>
         <stop offset="0.99" style="stop-color:#2AA300;"></stop>
      </linearGradient>
      <path style="fill:url(#badge-subscriber-gradient-3);" d="M7.3,7.3v7.5H6.1v-2.5H5v-1.2H3.7V9.9H1.2 V8.7H0V7.3H7.3z"></path>
      <linearGradient id="badge-subscriber-gradient-4" gradientUnits="userSpaceOnUse" x1="22.9659" y1="-167.65" x2="-5.3142" y2="-167.65" gradientTransform="matrix(1 0 0 -1 0 -164)">
         <stop offset="0" style="stop-color:#E1FF00;"></stop>
         <stop offset="0.99" style="stop-color:#2AA300;"></stop>
      </linearGradient>
      <path style="fill:url(#badge-subscriber-gradient-4);" d="M8.7,0v7.3H1.2V6.1h2.4V4.9H5V3.7h1.2V1.2 h1.2V0H8.7z"></path>
      <linearGradient id="badge-subscriber-gradient-5" gradientUnits="userSpaceOnUse" x1="12.35" y1="-187.6089" x2="12.35" y2="-161.5965" gradientTransform="matrix(1 0 0 -1 0 -164)">
         <stop offset="0" style="stop-color:#E1FF00;"></stop>
         <stop offset="0.99" style="stop-color:#2AA300;"></stop>
      </linearGradient>
      <path style="fill:url(#badge-subscriber-gradient-5);" d="M8.7,8.7V1.2h1.2v2.5H11v1.2h1.3v1.3h2.4 v1.2H16v1.4L8.7,8.7L8.7,8.7z"></path>
      <linearGradient id="badge-subscriber-gradient-6" gradientUnits="userSpaceOnUse" x1="-6.5494" y1="-176.35" x2="21.3285" y2="-176.35" gradientTransform="matrix(1 0 0 -1 0 -164)">
         <stop offset="0" style="stop-color:#E1FF00;"></stop>
         <stop offset="0.99" style="stop-color:#2AA300;"></stop>
      </linearGradient>
      <path style="fill:url(#badge-subscriber-gradient-6);" d="M7.3,16V8.7h7.4v1.2h-2.4v1.3H11v1.2H9.9 v2.5H8.7V16H7.3z"></path>
      <linearGradient id="badge-subscriber-gradient-7" gradientUnits="userSpaceOnUse" x1="6.72" y1="-169.44" x2="12.2267" y2="-180.4533" gradientTransform="matrix(1 0 0 -1 0 -164)">
         <stop offset="0" style="stop-color:#E1FF00;"></stop>
         <stop offset="0.99" style="stop-color:#2AA300;"></stop>
      </linearGradient>
      <path style="fill:url(#badge-subscriber-gradient-7);" d="M8.7,7.3H7.3v1.4h1.3L8.7,7.3L8.7,7.3z"></path>
   </g>
</svg>`;
  verifiedSVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="16" height="16" viewBox="0 0 16 16" fill="none">
   <path d="M14.72 7.00003V6.01336H15.64V4.12003H14.6733V3.16003H9.97332V1.2667H8.96665V0.280029H7.03332V1.2667H6.03332V3.16003H1.32665V4.12003H0.359985V6.01336H1.28665V7.00003H2.23332V9.0067H1.28665V9.99336H0.359985V11.8867H1.32665V12.8467H6.03332V14.74H7.03332V15.7267H8.96665V14.74H9.97332V12.8467H14.6733V11.8867H15.64V9.99336H14.72V9.0067H13.7733V7.00003H14.72ZM12.5 6.59336H11.44V7.66003H10.3733V8.72003H9.31332V9.7867H8.24665V10.8467L7.09332 10.9V11.8H6.02665V10.8467H5.05999V9.7867H3.99332V7.66003H6.11999V8.72003H7.18665V7.66003H8.24665V6.59336H9.31332V5.53336H10.3733V4.4667H12.5V6.59336Z" fill="url(#badge-verified-gradient)"></path>
   <defs>
      <linearGradient id="badge-verified-gradient" x1="25.333%" y1="99.375%" x2="73.541%" y2="2.917%" gradientUnits="objectBoundingBox">
         <stop stop-color="#1EFF00"></stop>
         <stop offset="0.99" stop-color="#00FF8C"></stop>
      </linearGradient>
   </defs>
</svg>`;
  vipSVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 16 16" space="preserve" width="16" height="16">
   <linearGradient id="badge-vip-gradient" gradientUnits="userSpaceOnUse" x1="8" y1="-163.4867" x2="8" y2="-181.56" gradientTransform="matrix(1 0 0 -1 0 -164)">
      <stop offset="0" style="stop-color: rgb(255, 201, 0);"></stop>
      <stop offset="0.99" style="stop-color: rgb(255, 149, 0);"></stop>
   </linearGradient>
   <path d="M13.9,2.4v1.1h-1.2v2.3 h-1.1v1.1h-1.1V4.6H9.3V1.3H6.7v3.3H5.6v2.3H4.4V5.8H3.3V3.5H2.1V2.4H0v12.3h16V2.4H13.9z" style="fill: url(&quot;#badge-vip-gradient&quot;);"></path>
</svg>`;
  parseSVGStringToElement(svgString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(svgString, "image/svg+xml");
    return xmlDoc.documentElement;
  }
  badgeTypeToSVG = {
    subscriber: this.parseSVGStringToElement(this.subscriberSVG),
    founder: this.parseSVGStringToElement(this.founderSVG),
    broadcaster: this.parseSVGStringToElement(this.broadcasterSVG),
    moderator: this.parseSVGStringToElement(this.moderatorSVG),
    og: this.parseSVGStringToElement(this.ogSVG),
    staff: this.parseSVGStringToElement(this.staffSVG),
    sub_gifter: this.parseSVGStringToElement(this.subGifter1SVG),
    sub_gifter_1: this.parseSVGStringToElement(this.subGifter2SVG),
    verified: this.parseSVGStringToElement(this.verifiedSVG),
    vip: this.parseSVGStringToElement(this.vipSVG)
  };
}
/* harmony default export */ const badges = (Badges);
;// CONCATENATED MODULE: ./modules/flusher/flusher.js






class Flusher {
  constructor(video, domain, channelName, aeroKick) {
    this.video = video;
    this.states = new FlusherStates();
    this.props = new FlusherProps();
    this.badges = new badges().badgeTypeToSVG;
    this.props.domain = domain;
    this.props.external = domain === 'KICK' ? false : true;
    this.props.isVod = window.location.href.includes('/videos/');
    this.props.isAeroKick = aeroKick ?? false;
    this.props.channelName = channelName;
    this.alerts = {};
    this.alerts.pinnedAlert = new Audio(chrome.runtime.getURL('lib/flusher/pinned.wav'));
    this.alerts.pinnedAlert.volume = 0.2;
    this.alerts.banAlert = new Audio(chrome.runtime.getURL('lib/flusher/banned.wav'));
    this.alerts.banAlert.volume = 1;
    this.provider = new FlusherMessages();
    window.currentUrl = window.location.href;
    visibilityChange(this);
  }
  resetConnection() {
    if (!this.props.flusher) return;
    /* clearChat(this.props.flusher); */
    isVod = false;
    if (this.props.flusher && this.props.resizeObserver) {
      this.props.resizeObserver.disconnect();
    }
  }
  clear() {
    /* temp fix */
    if (this.props.controlsDupeObserver) this.props.controlsDupeObserver.disconnect();
    if (this.props.controlsObserver) this.props.controlsObserver.disconnect();
    /* - */

    if (this.container) this.container.style.display = 'none';
    const isEnabled = this.states.chatEnabled;
    this.states.chatEnabled = false;
    this.props.elementQueue.length = 0;
    this.props.messageQueue.length = 0;
    this.props.lastRow = 0;
    for (const id of this.props.timeoutIds) {
      clearTimeout(id);
    }
    stopScrollingInterval(this);
    this.removeItems();
    if (this.props.keydownSetListener) window.removeEventListener('keydown', this.props.keydownSetListener);
    this.props.isCaptureKeybind = false;
    this.props.displayedMessages = [];
    if (this.provider.taskInterval) clearTimeout(this.provider.taskInterval);
    this.props.messageObservers.forEach((observer, entryId) => {
      observer.disconnect();
      this.props.messageObservers.delete(entryId);
    });
    if (this.props.lastPositionPerRow) {
      this.props.lastPositionPerRow.length = 0;
    } else {
      this.props.lastPositionPerRow = [];
    }
    if (this.props.rowQueue) {
      this.props.rowQueue.length = 0;
    } else {
      this.props.rowQueue = [];
    }
    this.props.timeoutIds.length = 0;
    if (this.container !== null) this.container.style.display = 'flex';
    this.states.chatEnabled = isEnabled;
    this.props.isProcessingElements = false;
    this.props.isProcessingMessages = false;
  }
  removeItems() {
    if (this.messages !== null) {
      while (this.messages?.firstChild) {
        this.messages.removeChild(this.messages.firstChild);
      }
    }
  }
  setVerticalWidth() {
    const elementHeight = this.props.elementHeight;
    switch (this.states.sizeStates[this.states.sizeState]) {
      case 'LARGE':
        this.container.style.setProperty('--flusher-vertical-width', `${elementHeight * 14}px`);
        break;
      case 'NORMAL':
        this.container.style.setProperty('--flusher-vertical-width', `${elementHeight * 14}px`);
        break;
      case 'SMALL':
        this.container.style.setProperty('--flusher-vertical-width', `${elementHeight * 9}px`);
        break;
      default:
        break;
    }
  }
}
;// CONCATENATED MODULE: ./modules/site/kick.js



class Kick {
  static init() {
    if (window.isObserving) return;
    window.isObserving = true;

    /* logToConsole(`Initialize`); */
    let stopObserver = false;
    const observeVideo = () => {
      const videoObserver = new MutationObserver(() => {
        let video = document.getElementsByTagName('video');
        video = video[video.length - 1];
        if (video) {
          /* logToConsole(`KICK video found`); */
          videoObserver.disconnect();
          setTimeout(() => {
            let video = document.getElementsByTagName('video');
            video = video[video.length - 1];
            let channelName = document.getElementById("channel-username");
            if (channelName && video) {
              channelName = channelName.innerText.trim();
              const AeroKick = video.classList.contains('bk-aspect-video');
              /* if (AeroKick) logToConsole(`AeroKick Detected`); */
              const flusher = new Flusher(video, "KICK", channelName, AeroKick);
              try {
                createChat(flusher);
                window.isObserving = false;
                return;
              } catch (error) {
                window.isObserving = false;
              }
            }

            /* logToConsole(`KICK start video observer`); */

            const observer = new MutationObserver(mutations => {
              mutations.forEach(mutation => {
                if (!stopObserver && mutation.addedNodes) {
                  if (document.getElementById("channel-username")) {
                    let video = document.getElementsByTagName('video');
                    video = video[video.length - 1];
                    if (video) {
                      /* logToConsole(`KICK stop video observer`); */
                      stopObserver = true;
                      const channelName = document.getElementById("channel-username").innerText.trim();
                      const AeroKick = video.classList.contains('bk-aspect-video');
                      /* if (AeroKick) logToConsole(`AeroKick Detected`); */
                      const flusher = new Flusher(video, "KICK", channelName, AeroKick);
                      try {
                        createChat(flusher);
                        window.isObserving = false;
                      } catch (error) {
                        stopObserver = false;
                        window.isObserving = false;
                      }
                      if (stopObserver) observer.disconnect();
                    }
                  }
                }
              });
            });
            observer.observe(document.body, {
              childList: true,
              subtree: true
            });
          }, 1000);
        }
      });
      videoObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    };
    observeVideo();
  }
}
/* harmony default export */ const kick = (Kick);
;// CONCATENATED MODULE: ./modules/site/ip2.js



class Ip2 {
  static async init() {
    /* logToConsole(`Initialize`) */

    const targetNode = await waitForCondition(() => document.getElementById('streamViewerContainer'));
    const callback = async function (mutationsList, observer) {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          if (mutation.addedNodes.length > 0) {
            for (const node of mutation.addedNodes) {
              if (targetNode.contains(node) && node.parentElement === targetNode) {
                if (node.id && !node.id.includes('-chat-') && node.id.includes('-video-')) {
                  const hasFlusherAttribute = node.hasAttribute('flusher');
                  if (hasFlusherAttribute) return;
                  const iframe = await waitForCondition(() => node.querySelector('iframe'));
                  node.setAttribute('flusher', '');
                  createChannel(iframe);
                }
              }
            }
          }
        }
      }
    };
    const observer = new MutationObserver(callback);
    const config = {
      childList: true,
      subtree: false
    };
    observer.observe(targetNode, config);
    function createChannel(iframe) {
      const src = iframe.getAttribute('src');
      if (src && src.includes('kick.com')) {
        const channelName = new URL(src).pathname.slice(1);
        const flusher = new Flusher(iframe, "IP2", channelName);
        createChat(flusher);
      }
    }
    function waitForCondition(conditionCallback) {
      return new Promise((resolve, reject) => {
        const checkCondition = () => {
          const result = conditionCallback();
          if (result) {
            resolve(result);
            return;
          }
          setTimeout(checkCondition, 500);
        };
        checkCondition();
      });
    }

    /* try { 
    	const chatFrame = document.createElement('iframe');
    	chatFrame.src = 'https://kick.com/USERNAME/chatroom';
    	document.body.append(chatFrame);
    	const elementText = chatFrame.$eval('body', (element) => {
    		return element.textContent;
    	});
    	logToConsole('Element Text inside iframe:', elementText);
    } catch (error) {
    	console.error('Error:', error);
    } */
  }
}
/* harmony default export */ const ip2 = (Ip2);
;// CONCATENATED MODULE: ./modules/content.js


window.location.hostname.includes('kick.com') ? kick.init() : ip2.init();
/******/ })()
;