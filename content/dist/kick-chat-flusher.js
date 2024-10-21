/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/ansi-html-community/index.js":
/*!***************************************************!*\
  !*** ./node_modules/ansi-html-community/index.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


module.exports = ansiHTML

// Reference to https://github.com/sindresorhus/ansi-regex
var _regANSI = /(?:(?:\u001b\[)|\u009b)(?:(?:[0-9]{1,3})?(?:(?:;[0-9]{0,3})*)?[A-M|f-m])|\u001b[A-M]/

var _defColors = {
  reset: ['fff', '000'], // [FOREGROUD_COLOR, BACKGROUND_COLOR]
  black: '000',
  red: 'ff0000',
  green: '209805',
  yellow: 'e8bf03',
  blue: '0000ff',
  magenta: 'ff00ff',
  cyan: '00ffee',
  lightgrey: 'f0f0f0',
  darkgrey: '888'
}
var _styles = {
  30: 'black',
  31: 'red',
  32: 'green',
  33: 'yellow',
  34: 'blue',
  35: 'magenta',
  36: 'cyan',
  37: 'lightgrey'
}
var _openTags = {
  '1': 'font-weight:bold', // bold
  '2': 'opacity:0.5', // dim
  '3': '<i>', // italic
  '4': '<u>', // underscore
  '8': 'display:none', // hidden
  '9': '<del>' // delete
}
var _closeTags = {
  '23': '</i>', // reset italic
  '24': '</u>', // reset underscore
  '29': '</del>' // reset delete
}

;[0, 21, 22, 27, 28, 39, 49].forEach(function (n) {
  _closeTags[n] = '</span>'
})

/**
 * Converts text with ANSI color codes to HTML markup.
 * @param {String} text
 * @returns {*}
 */
function ansiHTML (text) {
  // Returns the text if the string has no ANSI escape code.
  if (!_regANSI.test(text)) {
    return text
  }

  // Cache opened sequence.
  var ansiCodes = []
  // Replace with markup.
  var ret = text.replace(/\033\[(\d+)m/g, function (match, seq) {
    var ot = _openTags[seq]
    if (ot) {
      // If current sequence has been opened, close it.
      if (!!~ansiCodes.indexOf(seq)) { // eslint-disable-line no-extra-boolean-cast
        ansiCodes.pop()
        return '</span>'
      }
      // Open tag.
      ansiCodes.push(seq)
      return ot[0] === '<' ? ot : '<span style="' + ot + ';">'
    }

    var ct = _closeTags[seq]
    if (ct) {
      // Pop sequence
      ansiCodes.pop()
      return ct
    }
    return ''
  })

  // Make sure tags are closed.
  var l = ansiCodes.length
  ;(l > 0) && (ret += Array(l + 1).join('</span>'))

  return ret
}

/**
 * Customize colors.
 * @param {Object} colors reference to _defColors
 */
ansiHTML.setColors = function (colors) {
  if (typeof colors !== 'object') {
    throw new Error('`colors` parameter must be an Object.')
  }

  var _finalColors = {}
  for (var key in _defColors) {
    var hex = colors.hasOwnProperty(key) ? colors[key] : null
    if (!hex) {
      _finalColors[key] = _defColors[key]
      continue
    }
    if ('reset' === key) {
      if (typeof hex === 'string') {
        hex = [hex]
      }
      if (!Array.isArray(hex) || hex.length === 0 || hex.some(function (h) {
        return typeof h !== 'string'
      })) {
        throw new Error('The value of `' + key + '` property must be an Array and each item could only be a hex string, e.g.: FF0000')
      }
      var defHexColor = _defColors[key]
      if (!hex[0]) {
        hex[0] = defHexColor[0]
      }
      if (hex.length === 1 || !hex[1]) {
        hex = [hex[0]]
        hex.push(defHexColor[1])
      }

      hex = hex.slice(0, 2)
    } else if (typeof hex !== 'string') {
      throw new Error('The value of `' + key + '` property must be a hex string, e.g.: FF0000')
    }
    _finalColors[key] = hex
  }
  _setTags(_finalColors)
}

/**
 * Reset colors.
 */
ansiHTML.reset = function () {
  _setTags(_defColors)
}

/**
 * Expose tags, including open and close.
 * @type {Object}
 */
ansiHTML.tags = {}

if (Object.defineProperty) {
  Object.defineProperty(ansiHTML.tags, 'open', {
    get: function () { return _openTags }
  })
  Object.defineProperty(ansiHTML.tags, 'close', {
    get: function () { return _closeTags }
  })
} else {
  ansiHTML.tags.open = _openTags
  ansiHTML.tags.close = _closeTags
}

function _setTags (colors) {
  // reset all
  _openTags['0'] = 'font-weight:normal;opacity:1;color:#' + colors.reset[0] + ';background:#' + colors.reset[1]
  // inverse
  _openTags['7'] = 'color:#' + colors.reset[1] + ';background:#' + colors.reset[0]
  // dark grey
  _openTags['90'] = 'color:#' + colors.darkgrey

  for (var code in _styles) {
    var color = _styles[code]
    var oriColor = colors[color] || '000'
    _openTags[code] = 'color:#' + oriColor
    code = parseInt(code)
    _openTags[(code + 10).toString()] = 'background:#' + oriColor
  }
}

ansiHTML.reset()


/***/ }),

/***/ "./modules/flusher/flusher.js":
/*!************************************!*\
  !*** ./modules/flusher/flusher.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Flusher: () => (/* binding */ Flusher)
/* harmony export */ });
/* harmony import */ var _states_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./states.js */ "./modules/flusher/states.js");
/* harmony import */ var _props_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./props.js */ "./modules/flusher/props.js");
/* harmony import */ var _messages_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./messages.js */ "./modules/flusher/messages.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/utils.js */ "./modules/utils/utils.js");
/* harmony import */ var _utils_badges_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/badges.js */ "./modules/utils/badges.js");





class Flusher {
  constructor(video, domain, channelName, aeroKick) {
    this.video = video;
    this.states = new _states_js__WEBPACK_IMPORTED_MODULE_0__.FlusherStates();
    this.props = new _props_js__WEBPACK_IMPORTED_MODULE_1__.FlusherProps();
    this.badges = new _utils_badges_js__WEBPACK_IMPORTED_MODULE_4__["default"]().badgeTypeToSVG;
    this.props.domain = domain;
    this.props.external = domain === 'KICK' ? false : true;
    this.props.isVod = window.location.href.includes('/videos/');
    this.props.isAeroKick = aeroKick ?? false;
    this.props.channelName = channelName;
    this.provider = new _messages_js__WEBPACK_IMPORTED_MODULE_2__.FlusherMessages();
    window.currentUrl = window.location.href;
    (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_3__.visibilityChange)(this);
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
    this.removeItems();
    if (this.props.keydownSetListener) window.removeEventListener('keydown', this.props.keydownSetListener);
    this.props.isCaptureKeybind = false;
    this.props.displayedMessages = [];

    /* console.log('clear timeout')
    clearTimeout(this.props.taskInterval); */

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

/***/ }),

/***/ "./modules/flusher/messages.js":
/*!*************************************!*\
  !*** ./modules/flusher/messages.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FlusherMessages: () => (/* binding */ FlusherMessages)
/* harmony export */ });
/* harmony import */ var _queue_queue_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../queue/queue.js */ "./modules/queue/queue.js");
/* harmony import */ var _utils_resize_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/resize.js */ "./modules/utils/resize.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/utils.js */ "./modules/utils/utils.js");




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
    this.taskInterval;
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
    (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_2__.logToConsole)(`WebSocket Connection Opened: ${flusher.props.channelName} (${id})`);
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
        (0,_queue_queue_js__WEBPACK_IMPORTED_MODULE_0__.processMessageQueue)();
      }
    } catch (error) {
      console.error("Error Fetching Messages:", error.message);
    }
  }
  setupWebSocket() {
    if (this.socket) return;
    const webSocketUrl = "wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.6.0&flash=false";
    this.socket = new WebSocket(webSocketUrl);
    this.socket.onmessage = event => {
      const data = JSON.parse(event.data);
      document.body.contains(this.flusher.video) ? this.onMessage(data) : this.disposeChannel();
    };
    this.socket.addEventListener("open", event => {
      this.subscribeChannel();
    });
    this.socket.addEventListener("close", event => {
      (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_2__.logToConsole)(`WebSocket Connection Closed: ${flusher.props.channelName} (${flusher.props.chatroomId})`);
      this.channels.clear();
    });
    this.socket.addEventListener("error", event => {
      console.error("WebSocket error:", event);
    });
  }
  onMessage(data) {
    if (!this.flusher.states.chatEnabled || data === null || this.flusher.props.loading) return;
    this.flusher.props.messageQueue.push(data);
    (0,_queue_queue_js__WEBPACK_IMPORTED_MODULE_0__.processMessageQueue)();
  }
  disposeChannel() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      return;
    }
  }
  async interceptNative() {
    console.log('interceptNative');
    /* time between messages */
    this.lastMutationTime = new Date().getTime();
    window.flusherInterval = 1000;

    /* check if this.AeroKick present */
    this.AeroKick = document.body.classList.contains("aerokick-customization");
    if (this.AeroKick) (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_2__.logToConsole)(`AeroKick Detected`);
    const b = typeof browser !== "undefined" ? browser : chrome;
    const defaultAvatar = b.runtime.getURL("lib/kick/user-profile-pic.png");

    /* wait for native chat */
    this.flusher.nativeChat = await waitForChat(document.querySelector(this.AeroKick ? ".chat-container .bk-overflow-y-auto" : "#chatroom-messages"), this.AeroKick);

    /* parse existing items in native chat */
    this.parseNativeChat();

    /* block old messages in observeNativechatMessages if chat scrolling */
    this.observeScrolling();

    /* handle pinned messages */
    if (!this.flusher.props.isVod) this.observePinned();

    /* native chat exists else reset  */
    this.observeNativechatState();

    /* handle native chat messages */
    this.observeNativechatMessages();

    /* auto scroll chat in fullscreen etc */
    this.runTasks();
    function waitForChat(parent) {
      if (!parent) parent = document.body;
      const chatEntry = parent.querySelector(".rounded-md.bk-block") ?? parent.querySelector(".group.relative");

      /* hotfix */
      /* if (chatEntry) return chatEntry.parentElement; */
      if (chatEntry) return chatEntry.closest('.no-scrollbar.relative');
      return new Promise(resolve => {
        const config = {
          attributes: true,
          childList: true,
          subtree: true
        };
        let found = false;
        let parent = document.querySelector('#chatroom-messages');
        const startObserver = () => {
          if (!parent) return;
          const mutationCallback = function (mutationsList, observer) {
            for (const mutation of mutationsList) {
              if (mutation.type === "childList") {
                mutation.addedNodes.forEach(node => {
                  if (node.nodeType === 1 && (node.classList.contains("bk-block.rounded-md") || !!node.querySelector(".group.relative"))) {
                    if (found) {
                      return;
                    }
                    found = true;
                    observer.disconnect();
                    clearInterval(intervalId);
                    resolve(node.closest('.no-scrollbar.relative'));
                  }
                });
              }
            }
          };
          const observer = new MutationObserver(mutationCallback);
          observer.observe(parent, config);
        };
        startObserver();
        const intervalId = setInterval(() => {
          if (!document.body.contains(parent)) {
            found = false;
            parent = document.querySelector('#chatroom-messages');
          } else {}
        }, 2000);
        const originalResolve = resolve;
        resolve = result => {
          clearInterval(intervalId);
          originalResolve(result);
        };
      });
    }
  }
  observeNativechatState() {
    const pageParent = document.querySelector('nav').nextSibling;
    if (!pageParent) return;
    if (this.pageObserver) this.pageObserver.disconnect();
    this.pageObserver = new MutationObserver(mutations => {
      if (mutations[0].type === "childList" && mutations[0].removedNodes.length > 0) {
        if (!document.querySelector('#chatroom-messages') || window.currentUrl !== window.location.href) {
          (0,_utils_resize_js__WEBPACK_IMPORTED_MODULE_1__.reset)(this.flusher);
          this.pageObserver.disconnect();
        }
      }
    });
    this.pageObserver.observe(pageParent, {
      childList: true,
      subtree: false
    });
  }
  observePinned() {
    let pinnedNative = document.getElementById('chatroom-messages')?.parentElement?.firstElementChild;
    let pinnedFlusher = this.flusher?.container?.querySelector(".flusher-pinned");
    if (!pinnedNative || !pinnedFlusher) return;
    if (pinnedNative.querySelector('.z-absolute.w-full')?.firstChild) {
      this.addPinned(pinnedNative.querySelector('.z-absolute.w-full'), pinnedFlusher);
    }
    if (this.pinnedObserver) this.pinnedObserver.disconnect();
    this.pinnedObserver = new MutationObserver(mutations => {
      if (mutations[0].type === "childList" && mutations[0].removedNodes.length > 0) {
        this.removePinned(pinnedFlusher);
      } else if (mutations[0].type === "attributes") {
        this.updatePinned(pinnedNative.querySelector('.z-absolute.w-full'), pinnedFlusher);
      } else if (mutations[0].type === "characterData") {
        this.updatePinned(pinnedNative.querySelector('.z-absolute.w-full'), pinnedFlusher);
      } else {
        this.addPinned(pinnedNative.querySelector('.z-absolute.w-full'), pinnedFlusher);
      }
    });
    this.pinnedObserver.observe(pinnedNative.querySelector('.relative.flex'), {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });
  }
  updatePinned(pinElement, pinnedFlusher) {
    if (!pinElement || this.ignoredIds.includes(pinElement?.firstChild?.getAttribute('flusher-id'))) {
      return;
    }
    let pinElementObject = pinElement.cloneNode(true);
    this.appendPinned(pinElementObject, pinnedFlusher);
  }
  appendPinned(pinElementObject, pinnedFlusher) {
    pinElementObject.removeAttribute('style');
    let isPin = pinElementObject.querySelector('button.inline.font-bold');
    if (isPin) pinElementObject.querySelector('div.flex-nowrap.justify-between button').remove();
    isPin ? pinnedFlusher.classList.add('pinned') : pinnedFlusher.classList.remove('pinned');
    let hideBtn = pinElementObject.querySelector('button.box-border.flex');
    if (hideBtn) {
      hideBtn.parentElement.classList.add('flusher-close-btn');
      hideBtn.onclick = () => {
        this.ignoredIds.push(this.pinnedId.toString());
        this.removePinned(pinnedFlusher);
      };
    }
    pinnedFlusher.firstChild ? pinnedFlusher.firstChild.replaceWith(pinElementObject) : pinnedFlusher.append(pinElementObject);
    this.setPinnedRemoveTimer(pinnedFlusher);
    downwardAnimation();
    function downwardAnimation() {
      pinnedFlusher.classList.add('downward-transition');
      pinnedFlusher.offsetHeight;
      pinnedFlusher.classList.add('in-view');
    }
  }
  setPinnedRemoveTimer(pinnedFlusher) {
    if (this.flusher.props.pinnedTimeout) clearTimeout(this.flusher.props.pinnedTimeout);
    this.flusher.props.pinnedTimeout = setTimeout(() => {
      this.removePinned(pinnedFlusher);
    }, 8000);
  }
  removePinned(pinnedFlusher) {
    let firstChild = pinnedFlusher.firstChild;
    if (!firstChild) return;
    pinnedFlusher.classList.remove('downward-transition');
    pinnedFlusher.classList.remove('in-view');
    pinnedFlusher.classList.add('upward-transition');
    setTimeout(() => {
      while (pinnedFlusher.firstChild) {
        pinnedFlusher.removeChild(pinnedFlusher.firstChild);
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
      this.interval(mutations.length);
      if (this.isScrolling) return;
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
  interval(count) {
    const currentMutationTime = new Date().getTime();
    if (count == 1) {
      this.lastMutationTime = currentMutationTime;
      window.flusherInterval = 1000;
      return;
    }
    const interval = Math.round(currentMutationTime - this.lastMutationTime + window.flusherInterval / 1.5);
    window.flusherInterval = Math.max(interval, 1000);
    this.lastMutationTime = currentMutationTime;
  }
  observeScrolling() {
    const targetElement = document.querySelector("#chatroom-messages")?.nextSibling;
    if (targetElement) {
      if (this.scrollObserver) this.scrollObserver.disconnect();
      this.scrollObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === "childList") {
            if (mutation.addedNodes.length > 0) {
              this.isScrolling = true;
            }
            if (targetElement.children.length === 0) {
              this.isScrolling = false;
            }
          }
        });
      });
      this.scrollObserver.observe(targetElement, {
        childList: true
      });
    }
  }
  runTasks() {
    if (this.taskInterval) clearInterval(this.taskInterval);
    this.taskInterval = setInterval(() => {
      console.log('do tasks');
      if (this.flusher.props.videoSize === "fullscreen" && !this.flusher.props.isVod) (0,_utils_resize_js__WEBPACK_IMPORTED_MODULE_1__.scrollChat)();
    }, 10000);
  }
  prepareMessage(addedNode, update) {
    if (!addedNode || addedNode.nodeName !== "DIV") return;

    /* temp testing */
    const userId = this.AeroKick && this.flusher.props.isAeroKick ? addedNode.querySelector("button").getAttribute("data-radial-username") : addedNode.querySelector('button[title]')?.getAttribute('title');
    if (!userId) {
      /* console.log('event', clonedNode); */
      console.log('event');
      return false;
    }
    /* end testing */

    if (!update) {
      this.id++;
      addedNode = addedNode.firstElementChild;
      addedNode.setAttribute('flusher-id', this.id);
    }
    if (this.AeroKick && !this.flusher.props.isVod) {
      const button = addedNode.querySelector("button");
      if (!button) {
        /* console.log(
          "Kick Chat this.flusher - Button does not exist in the added node:",
          addedNode
        ); */
        return;
      }
    }

    /* const id =
      this.AeroKick && this.flusher.props.isAeroKick
        ? addedNode.querySelector("button").getAttribute("data-radial-id")
        : addedNode.getAttribute("data-chat-entry"); */

    if (this.flusher.states.flushState && (!this.id || this.id === "")) return;
    const clonedNode = addedNode.cloneNode(true);

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
    (0,_queue_queue_js__WEBPACK_IMPORTED_MODULE_0__.processElementQueue)(this.flusher);
    if (this.id && !this.flusher.states.flushState) this.observeNestedChildren(addedNode, this.id, clonedNode);
  }
  observeNestedChildren(parentNode, id, clonedNode) {
    const observer = new MutationObserver(() => {
      if (clonedNode) {
        if (this.flusher.states.deleted && parentNode.querySelector('.chat-entry-content-deleted')) {
          clonedNode.classList.add('flusher-deleted');
        } else {
          let currentTextElement = clonedNode.querySelector('span.font-normal');
          if (currentTextElement) {
            let newTextElement = this.prepareMessage(parentNode, true)?.querySelector('span.font-normal');
            if (newTextElement) currentTextElement.replaceWith(newTextElement);
          }
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
  addPinned(pinElement, pinnedFlusher) {
    if (!pinElement || this.ignoredIds.includes(pinElement?.firstChild?.getAttribute('flusher-id'))) {
      return;
    }
    this.removePinned(pinnedFlusher);
    setTimeout(() => {
      this.pinnedId++;
      pinElement.firstChild.setAttribute('flusher-id', this.pinnedId);
      let pinElementObject = pinElement.cloneNode(true);
      this.appendPinned(pinElementObject, pinnedFlusher);
    }, 1500);
  }
  async bindRequests(flusher) {
    if (!flusher) return;
    this.flusher = flusher;
    if (!this.flusher.props.external && !this.nativeChatObserver) this.interceptNative();
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

      /* if (!this.socket && !this.flusher.props.isVod)
        this.subscribeChannel(); */
    }, this.flusher.props.external ? 0 : 5000);
  }
  unbindRequests() {
    this.disposeChannel();
    if (!this.flusher?.props?.external || this.flusher.states.flushState) {
      if (this.nativeChatObserver) this.nativeChatObserver.disconnect();
      if (this.scrollObserver) this.scrollObserver.disconnect();
      if (this.pageObserver) this.pageObserver.disconnect();
      if (this.pinnedObserver) this.pinnedObserver.disconnect();
      if (this.taskInterval) clearInterval(this.taskInterval);
      clearTimeout(this.flusher.props.bindTimeout);
    }
  }
}

/***/ }),

/***/ "./modules/flusher/props.js":
/*!**********************************!*\
  !*** ./modules/flusher/props.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FlusherProps: () => (/* binding */ FlusherProps)
/* harmony export */ });
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

/***/ }),

/***/ "./modules/flusher/states.js":
/*!***********************************!*\
  !*** ./modules/flusher/states.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FlusherStates: () => (/* binding */ FlusherStates)
/* harmony export */ });
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
    this.deleted = true;
  }
}

/***/ }),

/***/ "./modules/interface/menu/element.js":
/*!*******************************************!*\
  !*** ./modules/interface/menu/element.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   menu: () => (/* binding */ menu)
/* harmony export */ });
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
      <div style="display: none;" class="flusher-event flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60" style="display: flex;">
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
      <div class="flusher-debug flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
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
          <div class="select-none overflow-hidden truncate pr-0 text-sm font-medium">1.0.9</div>
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
      <div class="flusher-event-delete flusher-actions-item" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-3 text-sm font-medium">Show Deleted</div>
        <div class="flex h-10 w-fit pl-2 items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="flusher-event-ban flusher-actions-item">
        <div class="select-none overflow-hidden truncate pr-3 text-sm font-medium">Show Bans</div>
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

/***/ }),

/***/ "./modules/interface/menu/menu.js":
/*!****************************************!*\
  !*** ./modules/interface/menu/menu.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clickOutsideHandler: () => (/* binding */ clickOutsideHandler),
/* harmony export */   createMenu: () => (/* binding */ createMenu),
/* harmony export */   hideMenu: () => (/* binding */ hideMenu),
/* harmony export */   togglePointerEvents: () => (/* binding */ togglePointerEvents)
/* harmony export */ });
/* harmony import */ var _element_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./element.js */ "./modules/interface/menu/element.js");
/* harmony import */ var _toggle_toggle_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../toggle/toggle.js */ "./modules/interface/toggle/toggle.js");
/* harmony import */ var _utils_drag_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/drag.js */ "./modules/utils/drag.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/utils.js */ "./modules/utils/utils.js");
/* harmony import */ var _utils_resize_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils/resize.js */ "./modules/utils/resize.js");





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
  const domMenu = flusher.video.querySelector('.flusher-menu');
  if (domMenu === null) {
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
    flusher.menu = _element_js__WEBPACK_IMPORTED_MODULE_0__.menu.cloneNode(true);
    flusher.menu.setAttribute('domain', flusher.props.domain);
    if (flusher.props.isAeroKick) {
      flusher.menu.style.top = '0 !important';
      flusher.menu.style.right = '0 !important';
    }
    shadowRoot.appendChild(flusher.menu);
    parent.append(shadowBox);
    parent = parent.querySelector('#shadowbox').shadowRoot;
    let settingsMenu = parent.querySelector('.flusher-menu-settings');
    let layoutMenu = parent.querySelector('.flusher-menu-layout');
    let messageMenu = parent.querySelector('.flusher-menu-message');
    let overlayMenu = parent.querySelector('.flusher-menu-overlay');
    let keybindMenu = parent.querySelector('.flusher-menu-keybind');
    let aboutMenu = parent.querySelector('.flusher-menu-about');
    let eventMenu = parent.querySelector('.flusher-menu-event');
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
    console.log(flusher.states.positionStates[flusher.states.positionState]);
    console.log(flusher.states.positionState + ' videoSize: ' + flusher.props.videoSize);
    safeTextContent(divInsidePosition, (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_3__.toTitleCase)(flusher.states.positionStates[flusher.states.positionState]));
    positionBtn.addEventListener('mousedown', function (event) {
      if (flusher.states.sizeState === 2) {
        do {
          flusher.states.positionState = (flusher.states.positionState + 1) % flusher.states.positionStates.length;
        } while (flusher.states.positionState === 0 || flusher.states.positionState === 2 || flusher.states.positionState === 3 || flusher.states.positionState === 5);
      } else {
        flusher.states.positionState = (flusher.states.positionState + 1) % flusher.states.positionStates.length;
      }
      divInsidePosition.textContent = (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_3__.toTitleCase)(flusher.states.positionStates[flusher.states.positionState]);
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
            console.log({
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
    safeTextContent(divInsideSize, (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_3__.toTitleCase)(flusher.states.sizeStates[flusher.states.sizeState]));
    sizeBtn.addEventListener('mousedown', function (event) {
      flusher.states.sizeState = (flusher.states.sizeState + 1) % flusher.states.sizeStates.length;
      divInsideSize.textContent = (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_3__.toTitleCase)(flusher.states.sizeStates[flusher.states.sizeState]);
      flusher.container.setAttribute('size', flusher.states.sizeStates[flusher.states.sizeState].replace(/\s/g, ""));
      flusher.setVerticalWidth();
      if (flusher.states.sizeState === 2) {
        let position = flusher.states.positionStates[flusher.states.positionState].split(' ').pop();
        console.log(position);
        let positionId = flusher.states.positionStates.indexOf(position);
        flusher.states.positionState = positionId;
        console.log('position id; ' + positionId);
        divInsidePosition.textContent = (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_3__.toTitleCase)(flusher.states.positionStates[flusher.states.positionState]);
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
              console.log('set ' + flusher.states.positionState + ' videoSize: ' + flusher.props.videoSize);
            } else {
              positionsArray.push({
                videoSize: flusher.props.videoSize,
                position: {
                  location: flusher.states.positionState
                }
              });
              console.log({
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
            console.log({
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
          /* console.log("Position removed for videoSize:", flusher.props.videoSize); */
        });
      });
    });
    const backgroundBtn = messageMenu.querySelector('.flusher-background');
    const divInsideBackground = backgroundBtn.querySelector('div:empty');
    safeTextContent(divInsideBackground, (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_3__.toTitleCase)(flusher.states.backgroundStates[flusher.states.backgroundState]));
    backgroundBtn.addEventListener('mousedown', function (event) {
      flusher.states.backgroundState = (flusher.states.backgroundState + 1) % flusher.states.backgroundStates.length;
      setExtensionStorageItem('flusher-background', flusher.states.backgroundState);
      divInsideBackground.textContent = (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_3__.toTitleCase)(flusher.states.backgroundStates[flusher.states.backgroundState]);
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
    safeTextContent(divInsideFont, (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_3__.toTitleCase)(flusher.states.sizeStates[flusher.states.fontState]));
    fontBtn.addEventListener('mousedown', function (event) {
      flusher.states.fontState = (flusher.states.fontState + 1) % flusher.states.sizeStates.length;
      setExtensionStorageItem('flusher-font', flusher.states.fontState);
      divInsideFont.textContent = (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_3__.toTitleCase)(flusher.states.sizeStates[flusher.states.fontState]);
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
      flusher.messages.childNodes.forEach(childNode => {
        const chatEntry = childNode.querySelector('span.text-neutral.pr-1.font-semibold');
        if (chatEntry) chatEntry.style.display = flusher.states.timeState ? 'inline-block' : 'none';
      });
      flusher.container.setAttribute('time', newTimeEnabled);
      setExtensionStorageItem('flusher-time', newTimeEnabled);
    });
    if (flusher.states.timeState) timeToggle.classList.toggle(toggledClass);
    !flusher.props.isVod || flusher.states.flushState ? timeToggleContainer.style.display = 'none' : timeToggleContainer.style.display = 'flex';
    const banToggleContainer = parent.querySelector('.flusher-event-ban');
    const banToggle = banToggleContainer.querySelector('.flusher-toggle');
    banToggle.addEventListener('mousedown', function (event) {
      const toggleElement = event.currentTarget;
      toggleElement.classList.toggle(toggledClass);
      const newBanState = toggleElement.classList.contains(toggledClass);
      flusher.states.bans = newBanState;
      setExtensionStorageItem('flusher-event-bans', newBanState);
    });
    if (flusher.states.bans) banToggle.classList.toggle(toggledClass);
    const deletedToggleContainer = parent.querySelector('.flusher-event-delete');
    const deletedToggle = deletedToggleContainer.querySelector('.flusher-toggle');
    deletedToggle.addEventListener('mousedown', function (event) {
      const toggleElement = event.currentTarget;
      toggleElement.classList.toggle(toggledClass);
      const newDeletedState = toggleElement.classList.contains(toggledClass);
      flusher.states.deleted = newDeletedState;
      setExtensionStorageItem('flusher-event-deleted', newDeletedState);
    });
    if (flusher.states.deleted) deletedToggle.classList.toggle(toggledClass);
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
      if (flusher.states.chatEnabled && !flusher.states.flushState) (0,_utils_drag_js__WEBPACK_IMPORTED_MODULE_2__.dragElement)(flusher);
      togglePointerEvents(flusher);
      (0,_utils_resize_js__WEBPACK_IMPORTED_MODULE_4__.checkPosition)(flusher, null, null);
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
      if (newChatEnabled && flusher.container.attributes['layout']?.nodeValue === 'vertical') (0,_utils_drag_js__WEBPACK_IMPORTED_MODULE_2__.dragElement)(flusher);
      flusher.clear();
      (0,_toggle_toggle_js__WEBPACK_IMPORTED_MODULE_1__.svgToggle)(flusher);
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

    return (0,_toggle_toggle_js__WEBPACK_IMPORTED_MODULE_1__.createToggle)(flusher);
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
  flusher.menu.style.display = 'none';
  settingsMenu.style.display = 'none';
  baseMenu.style.display = 'none';
  layoutMenu.style.display = 'none';
  overlayMenu.style.display = 'none';
  messageMenu.style.display = 'none';
  keybindMenu.style.display = 'none';
  aboutMenu.style.display = 'none';
  eventMenu.style.display = 'none';
  (0,_toggle_toggle_js__WEBPACK_IMPORTED_MODULE_1__.svgToggle)(flusher);
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
    (0,_utils_drag_js__WEBPACK_IMPORTED_MODULE_2__.dragElement)(flusher);
  }
}

/***/ }),

/***/ "./modules/interface/overlay.js":
/*!**************************************!*\
  !*** ./modules/interface/overlay.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createChat: () => (/* binding */ createChat),
/* harmony export */   setCustomPosition: () => (/* binding */ setCustomPosition)
/* harmony export */ });
/* harmony import */ var _menu_menu_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./menu/menu.js */ "./modules/interface/menu/menu.js");
/* harmony import */ var _utils_resize_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/resize.js */ "./modules/utils/resize.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/utils.js */ "./modules/utils/utils.js");
/* harmony import */ var _interface_toggle_toggle_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../interface/toggle/toggle.js */ "./modules/interface/toggle/toggle.js");




let flusherObject;
async function createChat(flusher) {
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
  const flusherObjectDiv = document.createElement("div");
  flusherObjectDiv.classList.add("flusher-messages");
  flusherObjectContainer.append(flusherObjectPinned);
  flusherObjectContainer.append(flusherObjectDiv);
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
    const font = (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_2__.getFont)();
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
      setExtensionStorageItem('flusher-version', currentVersion);
      chrome.storage.local.remove("positionsPerChannel", function () {
        (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_2__.logToConsole)('New update detected. Resetting settings to default.');
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
      flusherObject.toggle = await (0,_menu_menu_js__WEBPACK_IMPORTED_MODULE_0__.createMenu)(flusherObject);
      (0,_interface_toggle_toggle_js__WEBPACK_IMPORTED_MODULE_3__.svgToggle)(flusherObject);
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

  /* remove old first */
  /* flusherObject.video.parentNode.removeEventListener('mousemove', throttledMove); */

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
  });
  flusherObject.container.addEventListener('mouseleave', () => {
    window.isDragging = false;
    flusherObject.video.addEventListener('mousemove', flusherObject.props.mouseMoveHandler);
    lastRun = 1000;
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
        attemptToDupeButton(); // Call the function
      }
      lastRun = now;
    }
  }

  /* temp fix */
  flusherObject.props.isAeroKick ? flusherObject.video.append(chatflusherObject) : flusherObject.video.parentNode.append(chatflusherObject);
  flusherObject.props.external ? shadowRoot.appendChild(flusherObjectDiv) : chatflusherObject.append(flusherObjectContainer);
  (0,_utils_resize_js__WEBPACK_IMPORTED_MODULE_1__.checkResize)(flusherObject);
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
        divInsideSize.textContent = (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_2__.toTitleCase)(flusher.states.sizeStates[flusher.states.sizeState]);
      }
      const positionBtn = flusher.menu.querySelector('.flusher-position');
      if (positionBtn) {
        const divInsidePosition = positionBtn.querySelector('div.pr-0');
        divInsidePosition.textContent = (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_2__.toTitleCase)(flusher.states.positionStates[flusher.states.positionState]);
      }
    }
  });
}

/***/ }),

/***/ "./modules/interface/toggle/element.js":
/*!*********************************************!*\
  !*** ./modules/interface/toggle/element.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   toggle: () => (/* binding */ toggle)
/* harmony export */ });
const toggleHtml = `<button class="flusher-toggle vjs-control vjs-button"><span class="vjs-icon-placeholder" aria-hidden="true"></span><svg
viewBox="0 0 16 16" color="white" class="mx-auto toggle-icon" style="width: 25px;">
<path
  d="M12.8191 7.99813C12.8191 7.64949 12.7816 7.30834 12.7104 6.97844L13.8913 6.29616L12.3918 3.69822L11.2071 4.38051C10.7048 3.9269 10.105 3.57076 9.44517 3.35708V2H6.44611V3.36082C5.78632 3.57451 5.19025 3.9269 4.68416 4.38426L3.49953 3.70197L2 6.29616L3.18088 6.97844C3.10965 7.30834 3.07217 7.64949 3.07217 7.99813C3.07217 8.34677 3.10965 8.68791 3.18088 9.01781L2 9.70009L3.49953 12.298L4.68416 11.6157C5.1865 12.0694 5.78632 12.4255 6.44611 12.6392V14H9.44517V12.6392C10.105 12.4255 10.701 12.0731 11.2071 11.6157L12.3918 12.298L13.8913 9.70009L12.7104 9.01781C12.7816 8.68791 12.8191 8.34677 12.8191 7.99813ZM9.82006 9.87254H6.07123V6.12371H9.82006V9.87254Z"
  fill="currentColor"></path>
</svg><span class="vjs-control-text" aria-live="polite">Chat Flusher</span>
</button>`;
const parser = new DOMParser();
const doc = parser.parseFromString(toggleHtml, 'text/html');
const toggle = doc.body.firstChild;

/***/ }),

/***/ "./modules/interface/toggle/toggle.js":
/*!********************************************!*\
  !*** ./modules/interface/toggle/toggle.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clickOutsideHandlerFunction: () => (/* binding */ clickOutsideHandlerFunction),
/* harmony export */   createToggle: () => (/* binding */ createToggle),
/* harmony export */   svgToggle: () => (/* binding */ svgToggle)
/* harmony export */ });
/* harmony import */ var _element_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./element.js */ "./modules/interface/toggle/element.js");
/* harmony import */ var _menu_menu_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../menu/menu.js */ "./modules/interface/menu/menu.js");


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
    toggleBtn = flusher.props.external || flusher.props.isAeroKick ? _element_js__WEBPACK_IMPORTED_MODULE_0__.toggle.querySelector('svg').cloneNode(true) : _element_js__WEBPACK_IMPORTED_MODULE_0__.toggle.cloneNode(true);
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
    popupMenu.style.display === "block" ? (0,_menu_menu_js__WEBPACK_IMPORTED_MODULE_1__.hideMenu)(flusher) : showMenu();
  });
  function showMenu() {
    flusher.clickOutsideHandlerFunction = event => (0,_menu_menu_js__WEBPACK_IMPORTED_MODULE_1__.clickOutsideHandler)(event, flusher);
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
            (0,_menu_menu_js__WEBPACK_IMPORTED_MODULE_1__.hideMenu)(flusher);
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

/***/ }),

/***/ "./modules/layout/horizontal.js":
/*!**************************************!*\
  !*** ./modules/layout/horizontal.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   selectRow: () => (/* binding */ selectRow)
/* harmony export */ });
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

/***/ }),

/***/ "./modules/layout/vertical.js":
/*!************************************!*\
  !*** ./modules/layout/vertical.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   appendVertical: () => (/* binding */ appendVertical)
/* harmony export */ });
/* harmony import */ var _utils_resize_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/resize.js */ "./modules/utils/resize.js");

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
          (0,_utils_resize_js__WEBPACK_IMPORTED_MODULE_0__.reset)(flusher);
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

/***/ }),

/***/ "./modules/queue/queue.js":
/*!********************************!*\
  !*** ./modules/queue/queue.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createUserBanMessage: () => (/* binding */ createUserBanMessage),
/* harmony export */   getMessageKey: () => (/* binding */ getMessageKey),
/* harmony export */   processElementQueue: () => (/* binding */ processElementQueue),
/* harmony export */   processMessageQueue: () => (/* binding */ processMessageQueue)
/* harmony export */ });
/* harmony import */ var _layout_horizontal_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../layout/horizontal.js */ "./modules/layout/horizontal.js");
/* harmony import */ var _layout_vertical_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../layout/vertical.js */ "./modules/layout/vertical.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/utils.js */ "./modules/utils/utils.js");



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
    if (eventType === "App\\Events\\ChatMessageEvent" && flusher.props.external) {
      createMessage(JSON.parse(queueItem.data), flusher);
    } else if (queueItem.type === "message" && flusher.props.external) {
      createMessage(queueItem, flusher);
    } else if (eventType === "App\\Events\\UserBannedEvent") {
      createUserBanMessage(JSON.parse(queueItem.data), flusher);
    } else if (eventType === "App\\Events\\GiftedSubscriptionsEvent") {
      createGiftedMessage(JSON.parse(queueItem.data), flusher);
    } else if (eventType === "App\\Events\\FollowersUpdated") {
      createFollowersMessage(JSON.parse(queueItem.data), flusher);
    } else if (eventType === "App\\Events\\StreamHostEvent") {
      createHostMessage(JSON.parse(queueItem.data), flusher);
    } else if (eventType === "App\\Events\\SubscriptionEvent") {
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
    flushState ? (0,_layout_horizontal_js__WEBPACK_IMPORTED_MODULE_0__.selectRow)(queueItem, flusher) : (0,_layout_vertical_js__WEBPACK_IMPORTED_MODULE_1__.appendVertical)(queueItem, flusher);
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
    let timeDiffText;
    if (timeDifference > 0) {
      timeDiffText = humanizeDuration(timeDifference + 5000);
      const userId = data.user.id;
      addBannedUser(bannedUser, bannedByUser, userId, expiresAt);
      logText = `🟥 ${bannedUser} banned for ${timeDiffText} by ${bannedByUser}`;
      const expiresText = document.createTextNode(logText);
      banMessageSpan.appendChild(expiresText);
    } else {
      logText = `🟥 🟥 ${bannedUser} banned by ${bannedByUser}`;
      const expiresText = document.createTextNode(logText);
      banMessageSpan.appendChild(expiresText);
    }
  } else {
    logText = `🟥 🟥 ${bannedUser} banned by ${bannedByUser}`;
    const expiresText = document.createTextNode(logText);
    banMessageSpan.appendChild(expiresText);
  }
  banMessageContent.appendChild(banMessageSpan);
  data.created_at = Date.now();
  data.container = banMessageContent;
  (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_2__.logToConsole)(logText);
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
        logText = `🟩 ${username}'s ban expired`;
        const unbanText = document.createTextNode(logText);
        unbanMessageSpan.appendChild(unbanText);
        unbanMessageContent.appendChild(unbanMessageSpan);
        data.created_at = Date.now();
        data.container = unbanMessageContent;
        (0,_utils_utils_js__WEBPACK_IMPORTED_MODULE_2__.logToConsole)(logText);
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

/***/ }),

/***/ "./modules/site/ip2.js":
/*!*****************************!*\
  !*** ./modules/site/ip2.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _flusher_flusher_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../flusher/flusher.js */ "./modules/flusher/flusher.js");
/* harmony import */ var _interface_overlay_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../interface/overlay.js */ "./modules/interface/overlay.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/utils.js */ "./modules/utils/utils.js");



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
        const flusher = new _flusher_flusher_js__WEBPACK_IMPORTED_MODULE_0__.Flusher(iframe, "IP2", channelName);
        (0,_interface_overlay_js__WEBPACK_IMPORTED_MODULE_1__.createChat)(flusher);
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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Ip2);

/***/ }),

/***/ "./modules/site/kick.js":
/*!******************************!*\
  !*** ./modules/site/kick.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _flusher_flusher_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../flusher/flusher.js */ "./modules/flusher/flusher.js");
/* harmony import */ var _interface_overlay_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../interface/overlay.js */ "./modules/interface/overlay.js");
/* harmony import */ var _utils_utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/utils.js */ "./modules/utils/utils.js");



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
              const flusher = new _flusher_flusher_js__WEBPACK_IMPORTED_MODULE_0__.Flusher(video, "KICK", channelName, AeroKick);
              try {
                (0,_interface_overlay_js__WEBPACK_IMPORTED_MODULE_1__.createChat)(flusher);
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
                      const flusher = new _flusher_flusher_js__WEBPACK_IMPORTED_MODULE_0__.Flusher(video, "KICK", channelName, AeroKick);
                      try {
                        (0,_interface_overlay_js__WEBPACK_IMPORTED_MODULE_1__.createChat)(flusher);
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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Kick);

/***/ }),

/***/ "./modules/utils/badges.js":
/*!*********************************!*\
  !*** ./modules/utils/badges.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Badges);

/***/ }),

/***/ "./modules/utils/drag.js":
/*!*******************************!*\
  !*** ./modules/utils/drag.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   dragElement: () => (/* binding */ dragElement)
/* harmony export */ });
function throttle(fn, videoRect, wait) {
  let lastTime = 0;
  return function (...args) {
    const now = new Date().getTime();
    if (now - lastTime >= wait) {
      lastTime = now;
      fn(...args, videoRect);
    }
  };
}
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
    if (isInResizeHandle(e)) {
      setInitialDimensions(flusher);
      flusher.container.removeAttribute("size");
      document.onmouseup = closeResize;
      document.onmousemove = resizeElement;
    } else {
      setInitialPosition(flusher, videoRect, containerRect);
      flusher.container.removeAttribute("position");
      document.onmouseup = closeDragElement;
      document.onmousemove = throttle(dragElement, videoRect, 16);
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
    flusher.container.style.width = flusher.container.offsetWidth - (pos3 - e.clientX) + "px";
    flusher.container.style.height = flusher.container.offsetHeight - (pos4 - e.clientY) + "px";
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

/***/ }),

/***/ "./modules/utils/keybind.js":
/*!**********************************!*\
  !*** ./modules/utils/keybind.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   KeybindListener: () => (/* binding */ KeybindListener)
/* harmony export */ });
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
    if (key === 'alt' || key === 'control' || key === 'shift') {
      this.modifierKeys[key] = true;
    } else if (this.anyModifierKeyPressed()) {
      this.nonModifierKey = event.key.toUpperCase();
    }
    this.processKey();
  }
  handleKeyUp(event) {
    if (event.key === 'Alt' || event.key === 'Control' || event.key === 'Shift') {
      this.modifierKeys[event.key.toLowerCase()] = false;
    }
    if (!this.anyModifierKeyPressed()) {
      this.nonModifierKey = null;
    }
  }
  anyModifierKeyPressed() {
    return Object.values(this.modifierKeys).some(modifier => modifier === true);
  }
  processKey() {
    if (this.nonModifierKey) {
      for (const action in this.flusher.states.keybinds) {
        if (this.flusher.states.keybinds.hasOwnProperty(action)) {
          const keyCombination = this.flusher.states.keybinds[action];
          const keys = keyCombination.split(' + ');
          let modifierKeysMatch = true;
          if (keys.includes('ALT') && !this.modifierKeys.alt || keys.includes('CTRL') && !this.modifierKeys.control || keys.includes('SHIFT') && !this.modifierKeys.shift) {
            modifierKeysMatch = false;
          }
          const nonModifierKeyMatch = this.nonModifierKey === keys[keys.length - 1].toUpperCase();
          if (modifierKeysMatch && nonModifierKeyMatch) {
            this.activateAction(action);
            break;
          }
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
    switch (action) {
      case "overlay":
        const flusherToggle = this.flusher.menu.querySelector('.flusher-enable .flusher-toggle');
        flusherToggle.dispatchEvent(mouseDownEvent);
        break;
      case "flush":
        const flushToggle = this.flusher.menu.querySelector('.flusher-flush .flusher-toggle');
        flushToggle.dispatchEvent(mouseDownEvent);
        break;
      case "spam":
        const spamToggle = this.flusher.menu.querySelector('.flusher-spam .flusher-toggle');
        spamToggle.dispatchEvent(mouseDownEvent);
        break;
      case "menu":
        const menuToggle = document.querySelector('.flusher-toggle');
        menuToggle.dispatchEvent(mouseDownEvent);
        this.flusher.menu.focus();
        break;
      default:
        break;
    }
  }
}

/***/ }),

/***/ "./modules/utils/resize.js":
/*!*********************************!*\
  !*** ./modules/utils/resize.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkPosition: () => (/* binding */ checkPosition),
/* harmony export */   checkResize: () => (/* binding */ checkResize),
/* harmony export */   reset: () => (/* binding */ reset),
/* harmony export */   scrollChat: () => (/* binding */ scrollChat)
/* harmony export */ });
/* harmony import */ var _site_kick_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../site/kick.js */ "./modules/site/kick.js");
/* harmony import */ var _interface_menu_menu_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../interface/menu/menu.js */ "./modules/interface/menu/menu.js");
/* harmony import */ var _queue_queue_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../queue/queue.js */ "./modules/queue/queue.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils.js */ "./modules/utils/utils.js");
/* harmony import */ var _keybind_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./keybind.js */ "./modules/utils/keybind.js");
/* harmony import */ var _interface_overlay_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../interface/overlay.js */ "./modules/interface/overlay.js");






function reset(flusher) {
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

  console.log('reset resize');
  flusher.clear();
  flusher.provider.unbindRequests(flusher);
  flusher = null;
  if (init) _site_kick_js__WEBPACK_IMPORTED_MODULE_0__["default"].init();
}
function checkResize(flusher) {
  const videoElement = flusher.video.querySelector("video");
  let target;
  if (!flusher.props.isAeroKick && videoElement) {
    target = videoElement;
  } else {
    target = flusher.video;
  }
  flusher.resizeTimer = null;
  if (flusher.resizeObserver) flusher.resizeObserver.disconnect();
  flusher.resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      if (flusher.resizeTimer) clearTimeout(flusher.resizeTimer);
      flusher.resizeTimer = setTimeout(() => {
        for (let entry of entries) {
          if (flusher.container !== null) flusher.container.style.display = "none";
          const rect = target.getBoundingClientRect();
          let width = rect.width;
          let height = rect.height;

          /* temp fix */
          const isUrlEqual = window.currentUrl === undefined || window.currentUrl === window.location.href;
          window.currentUrl = window.location.href;
          const videoChanged = flusher.props.isAeroKick ? checkAeroKick() : false;
          if ((width === null || width === 0) && (!height || height === 0) && !videoChanged || !isUrlEqual || !flusher?.container) {
            if (flusher !== null) reset(flusher);
            return;
          }
          if (flusher.props.isAeroKick) checkAeroKick();
          const oldWidth = flusher.props.parentWidth;
          flusher.props.parentWidth = Math.trunc(width) * 2;
          flusher.props.parentHeight = Math.trunc(height);
          flusher.props.parentRight = rect.right;

          /* set data for css */
          setAttributes();

          /* toggleEnableMenu(); */

          /* set overlay data within menu */
          (0,_interface_overlay_js__WEBPACK_IMPORTED_MODULE_5__.setCustomPosition)(flusher);

          /* check if fullscreen, theater, etc. */
          detectViewMode();

          /* set custom overlay position */
          checkPosition(flusher, height, width);
          flusher.props.elementHeight = null;
          flusher.container.style.display = "flex";
          createIntroMessage(flusher);
          if (oldWidth == null || oldWidth == 0) {
            if (flusher.container === null) return;
            if (flusher.states.chatEnabled) flusher.provider.bindRequests(flusher);
            flusher.props.loading = false;
            (0,_queue_queue_js__WEBPACK_IMPORTED_MODULE_2__.processMessageQueue)(flusher);
            (0,_interface_menu_menu_js__WEBPACK_IMPORTED_MODULE_1__.togglePointerEvents)(flusher);
            checkAddons(flusher);

            /* temp fix moved */
            window.currentUrl = window.location.href;

            /* temp fix toggle btn not clickable in theater */
            /* const element = document.querySelector(".z\\-\\[500\\].flex.w-screen");
            if (element) element.classList.remove("z-[500]"); */

            flusher.props.keydownListener = new _keybind_js__WEBPACK_IMPORTED_MODULE_4__.KeybindListener(flusher);
            (0,_utils_js__WEBPACK_IMPORTED_MODULE_3__.logToConsole)(`(${flusher.props.channelName} ${flusher.props.domain} ${flusher.props.isVod ? "VOD" : "LIVE"}): Report bugs or collaborate at https://github.com/r0808914/Kick-Chat-Flusher`);
          } else {
            flusher.states.flushState ? flusher.clear() : null;
          }
        }
      }, 500);
    }
  });
  flusher.resizeObserver.observe(flusher.video);
  function checkAddons(flusher) {
    let counter = 0;
    const intervalId = setInterval(() => {
      const KickTools = document.querySelector('.vjs-progress-control')?.style?.display == 'flex' ? true : false;
      if (KickTools && !flusher.props.isKickTools) {
        (0,_utils_js__WEBPACK_IMPORTED_MODULE_3__.logToConsole)(`KickTools Detected`);
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
    } else {
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
    console.log('scrolling chat');
    if (chatBtn) chatBtn.click();
    chatContainer.scrollTop = chatContainer.scrollHeight;
    if (isScrolledToBottom(chatContainer)) break;
    attempts++;
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  /* if (attempts === maxAttempts) {
    console.log("Reached max attempts without scrolling to the bottom.");
  } */

  function isScrolledToBottom(chatContainer) {
    return chatContainer.scrollTop + chatContainer.clientHeight >= chatContainer.scrollHeight;
  }
}

/***/ }),

/***/ "./modules/utils/utils.js":
/*!********************************!*\
  !*** ./modules/utils/utils.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getFont: () => (/* binding */ getFont),
/* harmony export */   logToConsole: () => (/* binding */ logToConsole),
/* harmony export */   toTitleCase: () => (/* binding */ toTitleCase),
/* harmony export */   visibilityChange: () => (/* binding */ visibilityChange)
/* harmony export */ });
function visibilityChange(flusher) {
  document.addEventListener('visibilitychange', function handleVisibilityChange() {
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
  });
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

/***/ }),

/***/ "./node_modules/events/events.js":
/*!***************************************!*\
  !*** ./node_modules/events/events.js ***!
  \***************************************/
/***/ ((module) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}


/***/ }),

/***/ "./node_modules/html-entities/lib/index.js":
/*!*************************************************!*\
  !*** ./node_modules/html-entities/lib/index.js ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var named_references_1 = __webpack_require__(/*! ./named-references */ "./node_modules/html-entities/lib/named-references.js");
var numeric_unicode_map_1 = __webpack_require__(/*! ./numeric-unicode-map */ "./node_modules/html-entities/lib/numeric-unicode-map.js");
var surrogate_pairs_1 = __webpack_require__(/*! ./surrogate-pairs */ "./node_modules/html-entities/lib/surrogate-pairs.js");
var allNamedReferences = __assign(__assign({}, named_references_1.namedReferences), { all: named_references_1.namedReferences.html5 });
var encodeRegExps = {
    specialChars: /[<>'"&]/g,
    nonAscii: /[<>'"&\u0080-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g,
    nonAsciiPrintable: /[<>'"&\x01-\x08\x11-\x15\x17-\x1F\x7f-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g,
    nonAsciiPrintableOnly: /[\x01-\x08\x11-\x15\x17-\x1F\x7f-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g,
    extensive: /[\x01-\x0c\x0e-\x1f\x21-\x2c\x2e-\x2f\x3a-\x40\x5b-\x60\x7b-\x7d\x7f-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g
};
var defaultEncodeOptions = {
    mode: 'specialChars',
    level: 'all',
    numeric: 'decimal'
};
/** Encodes all the necessary (specified by `level`) characters in the text */
function encode(text, _a) {
    var _b = _a === void 0 ? defaultEncodeOptions : _a, _c = _b.mode, mode = _c === void 0 ? 'specialChars' : _c, _d = _b.numeric, numeric = _d === void 0 ? 'decimal' : _d, _e = _b.level, level = _e === void 0 ? 'all' : _e;
    if (!text) {
        return '';
    }
    var encodeRegExp = encodeRegExps[mode];
    var references = allNamedReferences[level].characters;
    var isHex = numeric === 'hexadecimal';
    encodeRegExp.lastIndex = 0;
    var _b = encodeRegExp.exec(text);
    var _c;
    if (_b) {
        _c = '';
        var _d = 0;
        do {
            if (_d !== _b.index) {
                _c += text.substring(_d, _b.index);
            }
            var _e = _b[0];
            var result_1 = references[_e];
            if (!result_1) {
                var code_1 = _e.length > 1 ? surrogate_pairs_1.getCodePoint(_e, 0) : _e.charCodeAt(0);
                result_1 = (isHex ? '&#x' + code_1.toString(16) : '&#' + code_1) + ';';
            }
            _c += result_1;
            _d = _b.index + _e.length;
        } while ((_b = encodeRegExp.exec(text)));
        if (_d !== text.length) {
            _c += text.substring(_d);
        }
    }
    else {
        _c =
            text;
    }
    return _c;
}
exports.encode = encode;
var defaultDecodeOptions = {
    scope: 'body',
    level: 'all'
};
var strict = /&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);/g;
var attribute = /&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+)[;=]?/g;
var baseDecodeRegExps = {
    xml: {
        strict: strict,
        attribute: attribute,
        body: named_references_1.bodyRegExps.xml
    },
    html4: {
        strict: strict,
        attribute: attribute,
        body: named_references_1.bodyRegExps.html4
    },
    html5: {
        strict: strict,
        attribute: attribute,
        body: named_references_1.bodyRegExps.html5
    }
};
var decodeRegExps = __assign(__assign({}, baseDecodeRegExps), { all: baseDecodeRegExps.html5 });
var fromCharCode = String.fromCharCode;
var outOfBoundsChar = fromCharCode(65533);
var defaultDecodeEntityOptions = {
    level: 'all'
};
/** Decodes a single entity */
function decodeEntity(entity, _a) {
    var _b = (_a === void 0 ? defaultDecodeEntityOptions : _a).level, level = _b === void 0 ? 'all' : _b;
    if (!entity) {
        return '';
    }
    var _b = entity;
    var decodeEntityLastChar_1 = entity[entity.length - 1];
    if (false) {}
    else if (false) {}
    else {
        var decodeResultByReference_1 = allNamedReferences[level].entities[entity];
        if (decodeResultByReference_1) {
            _b = decodeResultByReference_1;
        }
        else if (entity[0] === '&' && entity[1] === '#') {
            var decodeSecondChar_1 = entity[2];
            var decodeCode_1 = decodeSecondChar_1 == 'x' || decodeSecondChar_1 == 'X'
                ? parseInt(entity.substr(3), 16)
                : parseInt(entity.substr(2));
            _b =
                decodeCode_1 >= 0x10ffff
                    ? outOfBoundsChar
                    : decodeCode_1 > 65535
                        ? surrogate_pairs_1.fromCodePoint(decodeCode_1)
                        : fromCharCode(numeric_unicode_map_1.numericUnicodeMap[decodeCode_1] || decodeCode_1);
        }
    }
    return _b;
}
exports.decodeEntity = decodeEntity;
/** Decodes all entities in the text */
function decode(text, _a) {
    var decodeSecondChar_1 = _a === void 0 ? defaultDecodeOptions : _a, decodeCode_1 = decodeSecondChar_1.level, level = decodeCode_1 === void 0 ? 'all' : decodeCode_1, _b = decodeSecondChar_1.scope, scope = _b === void 0 ? level === 'xml' ? 'strict' : 'body' : _b;
    if (!text) {
        return '';
    }
    var decodeRegExp = decodeRegExps[level][scope];
    var references = allNamedReferences[level].entities;
    var isAttribute = scope === 'attribute';
    var isStrict = scope === 'strict';
    decodeRegExp.lastIndex = 0;
    var replaceMatch_1 = decodeRegExp.exec(text);
    var replaceResult_1;
    if (replaceMatch_1) {
        replaceResult_1 = '';
        var replaceLastIndex_1 = 0;
        do {
            if (replaceLastIndex_1 !== replaceMatch_1.index) {
                replaceResult_1 += text.substring(replaceLastIndex_1, replaceMatch_1.index);
            }
            var replaceInput_1 = replaceMatch_1[0];
            var decodeResult_1 = replaceInput_1;
            var decodeEntityLastChar_2 = replaceInput_1[replaceInput_1.length - 1];
            if (isAttribute
                && decodeEntityLastChar_2 === '=') {
                decodeResult_1 = replaceInput_1;
            }
            else if (isStrict
                && decodeEntityLastChar_2 !== ';') {
                decodeResult_1 = replaceInput_1;
            }
            else {
                var decodeResultByReference_2 = references[replaceInput_1];
                if (decodeResultByReference_2) {
                    decodeResult_1 = decodeResultByReference_2;
                }
                else if (replaceInput_1[0] === '&' && replaceInput_1[1] === '#') {
                    var decodeSecondChar_2 = replaceInput_1[2];
                    var decodeCode_2 = decodeSecondChar_2 == 'x' || decodeSecondChar_2 == 'X'
                        ? parseInt(replaceInput_1.substr(3), 16)
                        : parseInt(replaceInput_1.substr(2));
                    decodeResult_1 =
                        decodeCode_2 >= 0x10ffff
                            ? outOfBoundsChar
                            : decodeCode_2 > 65535
                                ? surrogate_pairs_1.fromCodePoint(decodeCode_2)
                                : fromCharCode(numeric_unicode_map_1.numericUnicodeMap[decodeCode_2] || decodeCode_2);
                }
            }
            replaceResult_1 += decodeResult_1;
            replaceLastIndex_1 = replaceMatch_1.index + replaceInput_1.length;
        } while ((replaceMatch_1 = decodeRegExp.exec(text)));
        if (replaceLastIndex_1 !== text.length) {
            replaceResult_1 += text.substring(replaceLastIndex_1);
        }
    }
    else {
        replaceResult_1 =
            text;
    }
    return replaceResult_1;
}
exports.decode = decode;


/***/ }),

/***/ "./node_modules/html-entities/lib/named-references.js":
/*!************************************************************!*\
  !*** ./node_modules/html-entities/lib/named-references.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.bodyRegExps={xml:/&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);?/g,html4:/&notin;|&(?:nbsp|iexcl|cent|pound|curren|yen|brvbar|sect|uml|copy|ordf|laquo|not|shy|reg|macr|deg|plusmn|sup2|sup3|acute|micro|para|middot|cedil|sup1|ordm|raquo|frac14|frac12|frac34|iquest|Agrave|Aacute|Acirc|Atilde|Auml|Aring|AElig|Ccedil|Egrave|Eacute|Ecirc|Euml|Igrave|Iacute|Icirc|Iuml|ETH|Ntilde|Ograve|Oacute|Ocirc|Otilde|Ouml|times|Oslash|Ugrave|Uacute|Ucirc|Uuml|Yacute|THORN|szlig|agrave|aacute|acirc|atilde|auml|aring|aelig|ccedil|egrave|eacute|ecirc|euml|igrave|iacute|icirc|iuml|eth|ntilde|ograve|oacute|ocirc|otilde|ouml|divide|oslash|ugrave|uacute|ucirc|uuml|yacute|thorn|yuml|quot|amp|lt|gt|#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);?/g,html5:/&centerdot;|&copysr;|&divideontimes;|&gtcc;|&gtcir;|&gtdot;|&gtlPar;|&gtquest;|&gtrapprox;|&gtrarr;|&gtrdot;|&gtreqless;|&gtreqqless;|&gtrless;|&gtrsim;|&ltcc;|&ltcir;|&ltdot;|&lthree;|&ltimes;|&ltlarr;|&ltquest;|&ltrPar;|&ltri;|&ltrie;|&ltrif;|&notin;|&notinE;|&notindot;|&notinva;|&notinvb;|&notinvc;|&notni;|&notniva;|&notnivb;|&notnivc;|&parallel;|&timesb;|&timesbar;|&timesd;|&(?:AElig|AMP|Aacute|Acirc|Agrave|Aring|Atilde|Auml|COPY|Ccedil|ETH|Eacute|Ecirc|Egrave|Euml|GT|Iacute|Icirc|Igrave|Iuml|LT|Ntilde|Oacute|Ocirc|Ograve|Oslash|Otilde|Ouml|QUOT|REG|THORN|Uacute|Ucirc|Ugrave|Uuml|Yacute|aacute|acirc|acute|aelig|agrave|amp|aring|atilde|auml|brvbar|ccedil|cedil|cent|copy|curren|deg|divide|eacute|ecirc|egrave|eth|euml|frac12|frac14|frac34|gt|iacute|icirc|iexcl|igrave|iquest|iuml|laquo|lt|macr|micro|middot|nbsp|not|ntilde|oacute|ocirc|ograve|ordf|ordm|oslash|otilde|ouml|para|plusmn|pound|quot|raquo|reg|sect|shy|sup1|sup2|sup3|szlig|thorn|times|uacute|ucirc|ugrave|uml|uuml|yacute|yen|yuml|#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);?/g};exports.namedReferences={xml:{entities:{"&lt;":"<","&gt;":">","&quot;":'"',"&apos;":"'","&amp;":"&"},characters:{"<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;","&":"&amp;"}},html4:{entities:{"&apos;":"'","&nbsp":" ","&nbsp;":" ","&iexcl":"¡","&iexcl;":"¡","&cent":"¢","&cent;":"¢","&pound":"£","&pound;":"£","&curren":"¤","&curren;":"¤","&yen":"¥","&yen;":"¥","&brvbar":"¦","&brvbar;":"¦","&sect":"§","&sect;":"§","&uml":"¨","&uml;":"¨","&copy":"©","&copy;":"©","&ordf":"ª","&ordf;":"ª","&laquo":"«","&laquo;":"«","&not":"¬","&not;":"¬","&shy":"­","&shy;":"­","&reg":"®","&reg;":"®","&macr":"¯","&macr;":"¯","&deg":"°","&deg;":"°","&plusmn":"±","&plusmn;":"±","&sup2":"²","&sup2;":"²","&sup3":"³","&sup3;":"³","&acute":"´","&acute;":"´","&micro":"µ","&micro;":"µ","&para":"¶","&para;":"¶","&middot":"·","&middot;":"·","&cedil":"¸","&cedil;":"¸","&sup1":"¹","&sup1;":"¹","&ordm":"º","&ordm;":"º","&raquo":"»","&raquo;":"»","&frac14":"¼","&frac14;":"¼","&frac12":"½","&frac12;":"½","&frac34":"¾","&frac34;":"¾","&iquest":"¿","&iquest;":"¿","&Agrave":"À","&Agrave;":"À","&Aacute":"Á","&Aacute;":"Á","&Acirc":"Â","&Acirc;":"Â","&Atilde":"Ã","&Atilde;":"Ã","&Auml":"Ä","&Auml;":"Ä","&Aring":"Å","&Aring;":"Å","&AElig":"Æ","&AElig;":"Æ","&Ccedil":"Ç","&Ccedil;":"Ç","&Egrave":"È","&Egrave;":"È","&Eacute":"É","&Eacute;":"É","&Ecirc":"Ê","&Ecirc;":"Ê","&Euml":"Ë","&Euml;":"Ë","&Igrave":"Ì","&Igrave;":"Ì","&Iacute":"Í","&Iacute;":"Í","&Icirc":"Î","&Icirc;":"Î","&Iuml":"Ï","&Iuml;":"Ï","&ETH":"Ð","&ETH;":"Ð","&Ntilde":"Ñ","&Ntilde;":"Ñ","&Ograve":"Ò","&Ograve;":"Ò","&Oacute":"Ó","&Oacute;":"Ó","&Ocirc":"Ô","&Ocirc;":"Ô","&Otilde":"Õ","&Otilde;":"Õ","&Ouml":"Ö","&Ouml;":"Ö","&times":"×","&times;":"×","&Oslash":"Ø","&Oslash;":"Ø","&Ugrave":"Ù","&Ugrave;":"Ù","&Uacute":"Ú","&Uacute;":"Ú","&Ucirc":"Û","&Ucirc;":"Û","&Uuml":"Ü","&Uuml;":"Ü","&Yacute":"Ý","&Yacute;":"Ý","&THORN":"Þ","&THORN;":"Þ","&szlig":"ß","&szlig;":"ß","&agrave":"à","&agrave;":"à","&aacute":"á","&aacute;":"á","&acirc":"â","&acirc;":"â","&atilde":"ã","&atilde;":"ã","&auml":"ä","&auml;":"ä","&aring":"å","&aring;":"å","&aelig":"æ","&aelig;":"æ","&ccedil":"ç","&ccedil;":"ç","&egrave":"è","&egrave;":"è","&eacute":"é","&eacute;":"é","&ecirc":"ê","&ecirc;":"ê","&euml":"ë","&euml;":"ë","&igrave":"ì","&igrave;":"ì","&iacute":"í","&iacute;":"í","&icirc":"î","&icirc;":"î","&iuml":"ï","&iuml;":"ï","&eth":"ð","&eth;":"ð","&ntilde":"ñ","&ntilde;":"ñ","&ograve":"ò","&ograve;":"ò","&oacute":"ó","&oacute;":"ó","&ocirc":"ô","&ocirc;":"ô","&otilde":"õ","&otilde;":"õ","&ouml":"ö","&ouml;":"ö","&divide":"÷","&divide;":"÷","&oslash":"ø","&oslash;":"ø","&ugrave":"ù","&ugrave;":"ù","&uacute":"ú","&uacute;":"ú","&ucirc":"û","&ucirc;":"û","&uuml":"ü","&uuml;":"ü","&yacute":"ý","&yacute;":"ý","&thorn":"þ","&thorn;":"þ","&yuml":"ÿ","&yuml;":"ÿ","&quot":'"',"&quot;":'"',"&amp":"&","&amp;":"&","&lt":"<","&lt;":"<","&gt":">","&gt;":">","&OElig;":"Œ","&oelig;":"œ","&Scaron;":"Š","&scaron;":"š","&Yuml;":"Ÿ","&circ;":"ˆ","&tilde;":"˜","&ensp;":" ","&emsp;":" ","&thinsp;":" ","&zwnj;":"‌","&zwj;":"‍","&lrm;":"‎","&rlm;":"‏","&ndash;":"–","&mdash;":"—","&lsquo;":"‘","&rsquo;":"’","&sbquo;":"‚","&ldquo;":"“","&rdquo;":"”","&bdquo;":"„","&dagger;":"†","&Dagger;":"‡","&permil;":"‰","&lsaquo;":"‹","&rsaquo;":"›","&euro;":"€","&fnof;":"ƒ","&Alpha;":"Α","&Beta;":"Β","&Gamma;":"Γ","&Delta;":"Δ","&Epsilon;":"Ε","&Zeta;":"Ζ","&Eta;":"Η","&Theta;":"Θ","&Iota;":"Ι","&Kappa;":"Κ","&Lambda;":"Λ","&Mu;":"Μ","&Nu;":"Ν","&Xi;":"Ξ","&Omicron;":"Ο","&Pi;":"Π","&Rho;":"Ρ","&Sigma;":"Σ","&Tau;":"Τ","&Upsilon;":"Υ","&Phi;":"Φ","&Chi;":"Χ","&Psi;":"Ψ","&Omega;":"Ω","&alpha;":"α","&beta;":"β","&gamma;":"γ","&delta;":"δ","&epsilon;":"ε","&zeta;":"ζ","&eta;":"η","&theta;":"θ","&iota;":"ι","&kappa;":"κ","&lambda;":"λ","&mu;":"μ","&nu;":"ν","&xi;":"ξ","&omicron;":"ο","&pi;":"π","&rho;":"ρ","&sigmaf;":"ς","&sigma;":"σ","&tau;":"τ","&upsilon;":"υ","&phi;":"φ","&chi;":"χ","&psi;":"ψ","&omega;":"ω","&thetasym;":"ϑ","&upsih;":"ϒ","&piv;":"ϖ","&bull;":"•","&hellip;":"…","&prime;":"′","&Prime;":"″","&oline;":"‾","&frasl;":"⁄","&weierp;":"℘","&image;":"ℑ","&real;":"ℜ","&trade;":"™","&alefsym;":"ℵ","&larr;":"←","&uarr;":"↑","&rarr;":"→","&darr;":"↓","&harr;":"↔","&crarr;":"↵","&lArr;":"⇐","&uArr;":"⇑","&rArr;":"⇒","&dArr;":"⇓","&hArr;":"⇔","&forall;":"∀","&part;":"∂","&exist;":"∃","&empty;":"∅","&nabla;":"∇","&isin;":"∈","&notin;":"∉","&ni;":"∋","&prod;":"∏","&sum;":"∑","&minus;":"−","&lowast;":"∗","&radic;":"√","&prop;":"∝","&infin;":"∞","&ang;":"∠","&and;":"∧","&or;":"∨","&cap;":"∩","&cup;":"∪","&int;":"∫","&there4;":"∴","&sim;":"∼","&cong;":"≅","&asymp;":"≈","&ne;":"≠","&equiv;":"≡","&le;":"≤","&ge;":"≥","&sub;":"⊂","&sup;":"⊃","&nsub;":"⊄","&sube;":"⊆","&supe;":"⊇","&oplus;":"⊕","&otimes;":"⊗","&perp;":"⊥","&sdot;":"⋅","&lceil;":"⌈","&rceil;":"⌉","&lfloor;":"⌊","&rfloor;":"⌋","&lang;":"〈","&rang;":"〉","&loz;":"◊","&spades;":"♠","&clubs;":"♣","&hearts;":"♥","&diams;":"♦"},characters:{"'":"&apos;"," ":"&nbsp;","¡":"&iexcl;","¢":"&cent;","£":"&pound;","¤":"&curren;","¥":"&yen;","¦":"&brvbar;","§":"&sect;","¨":"&uml;","©":"&copy;","ª":"&ordf;","«":"&laquo;","¬":"&not;","­":"&shy;","®":"&reg;","¯":"&macr;","°":"&deg;","±":"&plusmn;","²":"&sup2;","³":"&sup3;","´":"&acute;","µ":"&micro;","¶":"&para;","·":"&middot;","¸":"&cedil;","¹":"&sup1;","º":"&ordm;","»":"&raquo;","¼":"&frac14;","½":"&frac12;","¾":"&frac34;","¿":"&iquest;","À":"&Agrave;","Á":"&Aacute;","Â":"&Acirc;","Ã":"&Atilde;","Ä":"&Auml;","Å":"&Aring;","Æ":"&AElig;","Ç":"&Ccedil;","È":"&Egrave;","É":"&Eacute;","Ê":"&Ecirc;","Ë":"&Euml;","Ì":"&Igrave;","Í":"&Iacute;","Î":"&Icirc;","Ï":"&Iuml;","Ð":"&ETH;","Ñ":"&Ntilde;","Ò":"&Ograve;","Ó":"&Oacute;","Ô":"&Ocirc;","Õ":"&Otilde;","Ö":"&Ouml;","×":"&times;","Ø":"&Oslash;","Ù":"&Ugrave;","Ú":"&Uacute;","Û":"&Ucirc;","Ü":"&Uuml;","Ý":"&Yacute;","Þ":"&THORN;","ß":"&szlig;","à":"&agrave;","á":"&aacute;","â":"&acirc;","ã":"&atilde;","ä":"&auml;","å":"&aring;","æ":"&aelig;","ç":"&ccedil;","è":"&egrave;","é":"&eacute;","ê":"&ecirc;","ë":"&euml;","ì":"&igrave;","í":"&iacute;","î":"&icirc;","ï":"&iuml;","ð":"&eth;","ñ":"&ntilde;","ò":"&ograve;","ó":"&oacute;","ô":"&ocirc;","õ":"&otilde;","ö":"&ouml;","÷":"&divide;","ø":"&oslash;","ù":"&ugrave;","ú":"&uacute;","û":"&ucirc;","ü":"&uuml;","ý":"&yacute;","þ":"&thorn;","ÿ":"&yuml;",'"':"&quot;","&":"&amp;","<":"&lt;",">":"&gt;","Œ":"&OElig;","œ":"&oelig;","Š":"&Scaron;","š":"&scaron;","Ÿ":"&Yuml;","ˆ":"&circ;","˜":"&tilde;"," ":"&ensp;"," ":"&emsp;"," ":"&thinsp;","‌":"&zwnj;","‍":"&zwj;","‎":"&lrm;","‏":"&rlm;","–":"&ndash;","—":"&mdash;","‘":"&lsquo;","’":"&rsquo;","‚":"&sbquo;","“":"&ldquo;","”":"&rdquo;","„":"&bdquo;","†":"&dagger;","‡":"&Dagger;","‰":"&permil;","‹":"&lsaquo;","›":"&rsaquo;","€":"&euro;","ƒ":"&fnof;","Α":"&Alpha;","Β":"&Beta;","Γ":"&Gamma;","Δ":"&Delta;","Ε":"&Epsilon;","Ζ":"&Zeta;","Η":"&Eta;","Θ":"&Theta;","Ι":"&Iota;","Κ":"&Kappa;","Λ":"&Lambda;","Μ":"&Mu;","Ν":"&Nu;","Ξ":"&Xi;","Ο":"&Omicron;","Π":"&Pi;","Ρ":"&Rho;","Σ":"&Sigma;","Τ":"&Tau;","Υ":"&Upsilon;","Φ":"&Phi;","Χ":"&Chi;","Ψ":"&Psi;","Ω":"&Omega;","α":"&alpha;","β":"&beta;","γ":"&gamma;","δ":"&delta;","ε":"&epsilon;","ζ":"&zeta;","η":"&eta;","θ":"&theta;","ι":"&iota;","κ":"&kappa;","λ":"&lambda;","μ":"&mu;","ν":"&nu;","ξ":"&xi;","ο":"&omicron;","π":"&pi;","ρ":"&rho;","ς":"&sigmaf;","σ":"&sigma;","τ":"&tau;","υ":"&upsilon;","φ":"&phi;","χ":"&chi;","ψ":"&psi;","ω":"&omega;","ϑ":"&thetasym;","ϒ":"&upsih;","ϖ":"&piv;","•":"&bull;","…":"&hellip;","′":"&prime;","″":"&Prime;","‾":"&oline;","⁄":"&frasl;","℘":"&weierp;","ℑ":"&image;","ℜ":"&real;","™":"&trade;","ℵ":"&alefsym;","←":"&larr;","↑":"&uarr;","→":"&rarr;","↓":"&darr;","↔":"&harr;","↵":"&crarr;","⇐":"&lArr;","⇑":"&uArr;","⇒":"&rArr;","⇓":"&dArr;","⇔":"&hArr;","∀":"&forall;","∂":"&part;","∃":"&exist;","∅":"&empty;","∇":"&nabla;","∈":"&isin;","∉":"&notin;","∋":"&ni;","∏":"&prod;","∑":"&sum;","−":"&minus;","∗":"&lowast;","√":"&radic;","∝":"&prop;","∞":"&infin;","∠":"&ang;","∧":"&and;","∨":"&or;","∩":"&cap;","∪":"&cup;","∫":"&int;","∴":"&there4;","∼":"&sim;","≅":"&cong;","≈":"&asymp;","≠":"&ne;","≡":"&equiv;","≤":"&le;","≥":"&ge;","⊂":"&sub;","⊃":"&sup;","⊄":"&nsub;","⊆":"&sube;","⊇":"&supe;","⊕":"&oplus;","⊗":"&otimes;","⊥":"&perp;","⋅":"&sdot;","⌈":"&lceil;","⌉":"&rceil;","⌊":"&lfloor;","⌋":"&rfloor;","〈":"&lang;","〉":"&rang;","◊":"&loz;","♠":"&spades;","♣":"&clubs;","♥":"&hearts;","♦":"&diams;"}},html5:{entities:{"&AElig":"Æ","&AElig;":"Æ","&AMP":"&","&AMP;":"&","&Aacute":"Á","&Aacute;":"Á","&Abreve;":"Ă","&Acirc":"Â","&Acirc;":"Â","&Acy;":"А","&Afr;":"𝔄","&Agrave":"À","&Agrave;":"À","&Alpha;":"Α","&Amacr;":"Ā","&And;":"⩓","&Aogon;":"Ą","&Aopf;":"𝔸","&ApplyFunction;":"⁡","&Aring":"Å","&Aring;":"Å","&Ascr;":"𝒜","&Assign;":"≔","&Atilde":"Ã","&Atilde;":"Ã","&Auml":"Ä","&Auml;":"Ä","&Backslash;":"∖","&Barv;":"⫧","&Barwed;":"⌆","&Bcy;":"Б","&Because;":"∵","&Bernoullis;":"ℬ","&Beta;":"Β","&Bfr;":"𝔅","&Bopf;":"𝔹","&Breve;":"˘","&Bscr;":"ℬ","&Bumpeq;":"≎","&CHcy;":"Ч","&COPY":"©","&COPY;":"©","&Cacute;":"Ć","&Cap;":"⋒","&CapitalDifferentialD;":"ⅅ","&Cayleys;":"ℭ","&Ccaron;":"Č","&Ccedil":"Ç","&Ccedil;":"Ç","&Ccirc;":"Ĉ","&Cconint;":"∰","&Cdot;":"Ċ","&Cedilla;":"¸","&CenterDot;":"·","&Cfr;":"ℭ","&Chi;":"Χ","&CircleDot;":"⊙","&CircleMinus;":"⊖","&CirclePlus;":"⊕","&CircleTimes;":"⊗","&ClockwiseContourIntegral;":"∲","&CloseCurlyDoubleQuote;":"”","&CloseCurlyQuote;":"’","&Colon;":"∷","&Colone;":"⩴","&Congruent;":"≡","&Conint;":"∯","&ContourIntegral;":"∮","&Copf;":"ℂ","&Coproduct;":"∐","&CounterClockwiseContourIntegral;":"∳","&Cross;":"⨯","&Cscr;":"𝒞","&Cup;":"⋓","&CupCap;":"≍","&DD;":"ⅅ","&DDotrahd;":"⤑","&DJcy;":"Ђ","&DScy;":"Ѕ","&DZcy;":"Џ","&Dagger;":"‡","&Darr;":"↡","&Dashv;":"⫤","&Dcaron;":"Ď","&Dcy;":"Д","&Del;":"∇","&Delta;":"Δ","&Dfr;":"𝔇","&DiacriticalAcute;":"´","&DiacriticalDot;":"˙","&DiacriticalDoubleAcute;":"˝","&DiacriticalGrave;":"`","&DiacriticalTilde;":"˜","&Diamond;":"⋄","&DifferentialD;":"ⅆ","&Dopf;":"𝔻","&Dot;":"¨","&DotDot;":"⃜","&DotEqual;":"≐","&DoubleContourIntegral;":"∯","&DoubleDot;":"¨","&DoubleDownArrow;":"⇓","&DoubleLeftArrow;":"⇐","&DoubleLeftRightArrow;":"⇔","&DoubleLeftTee;":"⫤","&DoubleLongLeftArrow;":"⟸","&DoubleLongLeftRightArrow;":"⟺","&DoubleLongRightArrow;":"⟹","&DoubleRightArrow;":"⇒","&DoubleRightTee;":"⊨","&DoubleUpArrow;":"⇑","&DoubleUpDownArrow;":"⇕","&DoubleVerticalBar;":"∥","&DownArrow;":"↓","&DownArrowBar;":"⤓","&DownArrowUpArrow;":"⇵","&DownBreve;":"̑","&DownLeftRightVector;":"⥐","&DownLeftTeeVector;":"⥞","&DownLeftVector;":"↽","&DownLeftVectorBar;":"⥖","&DownRightTeeVector;":"⥟","&DownRightVector;":"⇁","&DownRightVectorBar;":"⥗","&DownTee;":"⊤","&DownTeeArrow;":"↧","&Downarrow;":"⇓","&Dscr;":"𝒟","&Dstrok;":"Đ","&ENG;":"Ŋ","&ETH":"Ð","&ETH;":"Ð","&Eacute":"É","&Eacute;":"É","&Ecaron;":"Ě","&Ecirc":"Ê","&Ecirc;":"Ê","&Ecy;":"Э","&Edot;":"Ė","&Efr;":"𝔈","&Egrave":"È","&Egrave;":"È","&Element;":"∈","&Emacr;":"Ē","&EmptySmallSquare;":"◻","&EmptyVerySmallSquare;":"▫","&Eogon;":"Ę","&Eopf;":"𝔼","&Epsilon;":"Ε","&Equal;":"⩵","&EqualTilde;":"≂","&Equilibrium;":"⇌","&Escr;":"ℰ","&Esim;":"⩳","&Eta;":"Η","&Euml":"Ë","&Euml;":"Ë","&Exists;":"∃","&ExponentialE;":"ⅇ","&Fcy;":"Ф","&Ffr;":"𝔉","&FilledSmallSquare;":"◼","&FilledVerySmallSquare;":"▪","&Fopf;":"𝔽","&ForAll;":"∀","&Fouriertrf;":"ℱ","&Fscr;":"ℱ","&GJcy;":"Ѓ","&GT":">","&GT;":">","&Gamma;":"Γ","&Gammad;":"Ϝ","&Gbreve;":"Ğ","&Gcedil;":"Ģ","&Gcirc;":"Ĝ","&Gcy;":"Г","&Gdot;":"Ġ","&Gfr;":"𝔊","&Gg;":"⋙","&Gopf;":"𝔾","&GreaterEqual;":"≥","&GreaterEqualLess;":"⋛","&GreaterFullEqual;":"≧","&GreaterGreater;":"⪢","&GreaterLess;":"≷","&GreaterSlantEqual;":"⩾","&GreaterTilde;":"≳","&Gscr;":"𝒢","&Gt;":"≫","&HARDcy;":"Ъ","&Hacek;":"ˇ","&Hat;":"^","&Hcirc;":"Ĥ","&Hfr;":"ℌ","&HilbertSpace;":"ℋ","&Hopf;":"ℍ","&HorizontalLine;":"─","&Hscr;":"ℋ","&Hstrok;":"Ħ","&HumpDownHump;":"≎","&HumpEqual;":"≏","&IEcy;":"Е","&IJlig;":"Ĳ","&IOcy;":"Ё","&Iacute":"Í","&Iacute;":"Í","&Icirc":"Î","&Icirc;":"Î","&Icy;":"И","&Idot;":"İ","&Ifr;":"ℑ","&Igrave":"Ì","&Igrave;":"Ì","&Im;":"ℑ","&Imacr;":"Ī","&ImaginaryI;":"ⅈ","&Implies;":"⇒","&Int;":"∬","&Integral;":"∫","&Intersection;":"⋂","&InvisibleComma;":"⁣","&InvisibleTimes;":"⁢","&Iogon;":"Į","&Iopf;":"𝕀","&Iota;":"Ι","&Iscr;":"ℐ","&Itilde;":"Ĩ","&Iukcy;":"І","&Iuml":"Ï","&Iuml;":"Ï","&Jcirc;":"Ĵ","&Jcy;":"Й","&Jfr;":"𝔍","&Jopf;":"𝕁","&Jscr;":"𝒥","&Jsercy;":"Ј","&Jukcy;":"Є","&KHcy;":"Х","&KJcy;":"Ќ","&Kappa;":"Κ","&Kcedil;":"Ķ","&Kcy;":"К","&Kfr;":"𝔎","&Kopf;":"𝕂","&Kscr;":"𝒦","&LJcy;":"Љ","&LT":"<","&LT;":"<","&Lacute;":"Ĺ","&Lambda;":"Λ","&Lang;":"⟪","&Laplacetrf;":"ℒ","&Larr;":"↞","&Lcaron;":"Ľ","&Lcedil;":"Ļ","&Lcy;":"Л","&LeftAngleBracket;":"⟨","&LeftArrow;":"←","&LeftArrowBar;":"⇤","&LeftArrowRightArrow;":"⇆","&LeftCeiling;":"⌈","&LeftDoubleBracket;":"⟦","&LeftDownTeeVector;":"⥡","&LeftDownVector;":"⇃","&LeftDownVectorBar;":"⥙","&LeftFloor;":"⌊","&LeftRightArrow;":"↔","&LeftRightVector;":"⥎","&LeftTee;":"⊣","&LeftTeeArrow;":"↤","&LeftTeeVector;":"⥚","&LeftTriangle;":"⊲","&LeftTriangleBar;":"⧏","&LeftTriangleEqual;":"⊴","&LeftUpDownVector;":"⥑","&LeftUpTeeVector;":"⥠","&LeftUpVector;":"↿","&LeftUpVectorBar;":"⥘","&LeftVector;":"↼","&LeftVectorBar;":"⥒","&Leftarrow;":"⇐","&Leftrightarrow;":"⇔","&LessEqualGreater;":"⋚","&LessFullEqual;":"≦","&LessGreater;":"≶","&LessLess;":"⪡","&LessSlantEqual;":"⩽","&LessTilde;":"≲","&Lfr;":"𝔏","&Ll;":"⋘","&Lleftarrow;":"⇚","&Lmidot;":"Ŀ","&LongLeftArrow;":"⟵","&LongLeftRightArrow;":"⟷","&LongRightArrow;":"⟶","&Longleftarrow;":"⟸","&Longleftrightarrow;":"⟺","&Longrightarrow;":"⟹","&Lopf;":"𝕃","&LowerLeftArrow;":"↙","&LowerRightArrow;":"↘","&Lscr;":"ℒ","&Lsh;":"↰","&Lstrok;":"Ł","&Lt;":"≪","&Map;":"⤅","&Mcy;":"М","&MediumSpace;":" ","&Mellintrf;":"ℳ","&Mfr;":"𝔐","&MinusPlus;":"∓","&Mopf;":"𝕄","&Mscr;":"ℳ","&Mu;":"Μ","&NJcy;":"Њ","&Nacute;":"Ń","&Ncaron;":"Ň","&Ncedil;":"Ņ","&Ncy;":"Н","&NegativeMediumSpace;":"​","&NegativeThickSpace;":"​","&NegativeThinSpace;":"​","&NegativeVeryThinSpace;":"​","&NestedGreaterGreater;":"≫","&NestedLessLess;":"≪","&NewLine;":"\n","&Nfr;":"𝔑","&NoBreak;":"⁠","&NonBreakingSpace;":" ","&Nopf;":"ℕ","&Not;":"⫬","&NotCongruent;":"≢","&NotCupCap;":"≭","&NotDoubleVerticalBar;":"∦","&NotElement;":"∉","&NotEqual;":"≠","&NotEqualTilde;":"≂̸","&NotExists;":"∄","&NotGreater;":"≯","&NotGreaterEqual;":"≱","&NotGreaterFullEqual;":"≧̸","&NotGreaterGreater;":"≫̸","&NotGreaterLess;":"≹","&NotGreaterSlantEqual;":"⩾̸","&NotGreaterTilde;":"≵","&NotHumpDownHump;":"≎̸","&NotHumpEqual;":"≏̸","&NotLeftTriangle;":"⋪","&NotLeftTriangleBar;":"⧏̸","&NotLeftTriangleEqual;":"⋬","&NotLess;":"≮","&NotLessEqual;":"≰","&NotLessGreater;":"≸","&NotLessLess;":"≪̸","&NotLessSlantEqual;":"⩽̸","&NotLessTilde;":"≴","&NotNestedGreaterGreater;":"⪢̸","&NotNestedLessLess;":"⪡̸","&NotPrecedes;":"⊀","&NotPrecedesEqual;":"⪯̸","&NotPrecedesSlantEqual;":"⋠","&NotReverseElement;":"∌","&NotRightTriangle;":"⋫","&NotRightTriangleBar;":"⧐̸","&NotRightTriangleEqual;":"⋭","&NotSquareSubset;":"⊏̸","&NotSquareSubsetEqual;":"⋢","&NotSquareSuperset;":"⊐̸","&NotSquareSupersetEqual;":"⋣","&NotSubset;":"⊂⃒","&NotSubsetEqual;":"⊈","&NotSucceeds;":"⊁","&NotSucceedsEqual;":"⪰̸","&NotSucceedsSlantEqual;":"⋡","&NotSucceedsTilde;":"≿̸","&NotSuperset;":"⊃⃒","&NotSupersetEqual;":"⊉","&NotTilde;":"≁","&NotTildeEqual;":"≄","&NotTildeFullEqual;":"≇","&NotTildeTilde;":"≉","&NotVerticalBar;":"∤","&Nscr;":"𝒩","&Ntilde":"Ñ","&Ntilde;":"Ñ","&Nu;":"Ν","&OElig;":"Œ","&Oacute":"Ó","&Oacute;":"Ó","&Ocirc":"Ô","&Ocirc;":"Ô","&Ocy;":"О","&Odblac;":"Ő","&Ofr;":"𝔒","&Ograve":"Ò","&Ograve;":"Ò","&Omacr;":"Ō","&Omega;":"Ω","&Omicron;":"Ο","&Oopf;":"𝕆","&OpenCurlyDoubleQuote;":"“","&OpenCurlyQuote;":"‘","&Or;":"⩔","&Oscr;":"𝒪","&Oslash":"Ø","&Oslash;":"Ø","&Otilde":"Õ","&Otilde;":"Õ","&Otimes;":"⨷","&Ouml":"Ö","&Ouml;":"Ö","&OverBar;":"‾","&OverBrace;":"⏞","&OverBracket;":"⎴","&OverParenthesis;":"⏜","&PartialD;":"∂","&Pcy;":"П","&Pfr;":"𝔓","&Phi;":"Φ","&Pi;":"Π","&PlusMinus;":"±","&Poincareplane;":"ℌ","&Popf;":"ℙ","&Pr;":"⪻","&Precedes;":"≺","&PrecedesEqual;":"⪯","&PrecedesSlantEqual;":"≼","&PrecedesTilde;":"≾","&Prime;":"″","&Product;":"∏","&Proportion;":"∷","&Proportional;":"∝","&Pscr;":"𝒫","&Psi;":"Ψ","&QUOT":'"',"&QUOT;":'"',"&Qfr;":"𝔔","&Qopf;":"ℚ","&Qscr;":"𝒬","&RBarr;":"⤐","&REG":"®","&REG;":"®","&Racute;":"Ŕ","&Rang;":"⟫","&Rarr;":"↠","&Rarrtl;":"⤖","&Rcaron;":"Ř","&Rcedil;":"Ŗ","&Rcy;":"Р","&Re;":"ℜ","&ReverseElement;":"∋","&ReverseEquilibrium;":"⇋","&ReverseUpEquilibrium;":"⥯","&Rfr;":"ℜ","&Rho;":"Ρ","&RightAngleBracket;":"⟩","&RightArrow;":"→","&RightArrowBar;":"⇥","&RightArrowLeftArrow;":"⇄","&RightCeiling;":"⌉","&RightDoubleBracket;":"⟧","&RightDownTeeVector;":"⥝","&RightDownVector;":"⇂","&RightDownVectorBar;":"⥕","&RightFloor;":"⌋","&RightTee;":"⊢","&RightTeeArrow;":"↦","&RightTeeVector;":"⥛","&RightTriangle;":"⊳","&RightTriangleBar;":"⧐","&RightTriangleEqual;":"⊵","&RightUpDownVector;":"⥏","&RightUpTeeVector;":"⥜","&RightUpVector;":"↾","&RightUpVectorBar;":"⥔","&RightVector;":"⇀","&RightVectorBar;":"⥓","&Rightarrow;":"⇒","&Ropf;":"ℝ","&RoundImplies;":"⥰","&Rrightarrow;":"⇛","&Rscr;":"ℛ","&Rsh;":"↱","&RuleDelayed;":"⧴","&SHCHcy;":"Щ","&SHcy;":"Ш","&SOFTcy;":"Ь","&Sacute;":"Ś","&Sc;":"⪼","&Scaron;":"Š","&Scedil;":"Ş","&Scirc;":"Ŝ","&Scy;":"С","&Sfr;":"𝔖","&ShortDownArrow;":"↓","&ShortLeftArrow;":"←","&ShortRightArrow;":"→","&ShortUpArrow;":"↑","&Sigma;":"Σ","&SmallCircle;":"∘","&Sopf;":"𝕊","&Sqrt;":"√","&Square;":"□","&SquareIntersection;":"⊓","&SquareSubset;":"⊏","&SquareSubsetEqual;":"⊑","&SquareSuperset;":"⊐","&SquareSupersetEqual;":"⊒","&SquareUnion;":"⊔","&Sscr;":"𝒮","&Star;":"⋆","&Sub;":"⋐","&Subset;":"⋐","&SubsetEqual;":"⊆","&Succeeds;":"≻","&SucceedsEqual;":"⪰","&SucceedsSlantEqual;":"≽","&SucceedsTilde;":"≿","&SuchThat;":"∋","&Sum;":"∑","&Sup;":"⋑","&Superset;":"⊃","&SupersetEqual;":"⊇","&Supset;":"⋑","&THORN":"Þ","&THORN;":"Þ","&TRADE;":"™","&TSHcy;":"Ћ","&TScy;":"Ц","&Tab;":"\t","&Tau;":"Τ","&Tcaron;":"Ť","&Tcedil;":"Ţ","&Tcy;":"Т","&Tfr;":"𝔗","&Therefore;":"∴","&Theta;":"Θ","&ThickSpace;":"  ","&ThinSpace;":" ","&Tilde;":"∼","&TildeEqual;":"≃","&TildeFullEqual;":"≅","&TildeTilde;":"≈","&Topf;":"𝕋","&TripleDot;":"⃛","&Tscr;":"𝒯","&Tstrok;":"Ŧ","&Uacute":"Ú","&Uacute;":"Ú","&Uarr;":"↟","&Uarrocir;":"⥉","&Ubrcy;":"Ў","&Ubreve;":"Ŭ","&Ucirc":"Û","&Ucirc;":"Û","&Ucy;":"У","&Udblac;":"Ű","&Ufr;":"𝔘","&Ugrave":"Ù","&Ugrave;":"Ù","&Umacr;":"Ū","&UnderBar;":"_","&UnderBrace;":"⏟","&UnderBracket;":"⎵","&UnderParenthesis;":"⏝","&Union;":"⋃","&UnionPlus;":"⊎","&Uogon;":"Ų","&Uopf;":"𝕌","&UpArrow;":"↑","&UpArrowBar;":"⤒","&UpArrowDownArrow;":"⇅","&UpDownArrow;":"↕","&UpEquilibrium;":"⥮","&UpTee;":"⊥","&UpTeeArrow;":"↥","&Uparrow;":"⇑","&Updownarrow;":"⇕","&UpperLeftArrow;":"↖","&UpperRightArrow;":"↗","&Upsi;":"ϒ","&Upsilon;":"Υ","&Uring;":"Ů","&Uscr;":"𝒰","&Utilde;":"Ũ","&Uuml":"Ü","&Uuml;":"Ü","&VDash;":"⊫","&Vbar;":"⫫","&Vcy;":"В","&Vdash;":"⊩","&Vdashl;":"⫦","&Vee;":"⋁","&Verbar;":"‖","&Vert;":"‖","&VerticalBar;":"∣","&VerticalLine;":"|","&VerticalSeparator;":"❘","&VerticalTilde;":"≀","&VeryThinSpace;":" ","&Vfr;":"𝔙","&Vopf;":"𝕍","&Vscr;":"𝒱","&Vvdash;":"⊪","&Wcirc;":"Ŵ","&Wedge;":"⋀","&Wfr;":"𝔚","&Wopf;":"𝕎","&Wscr;":"𝒲","&Xfr;":"𝔛","&Xi;":"Ξ","&Xopf;":"𝕏","&Xscr;":"𝒳","&YAcy;":"Я","&YIcy;":"Ї","&YUcy;":"Ю","&Yacute":"Ý","&Yacute;":"Ý","&Ycirc;":"Ŷ","&Ycy;":"Ы","&Yfr;":"𝔜","&Yopf;":"𝕐","&Yscr;":"𝒴","&Yuml;":"Ÿ","&ZHcy;":"Ж","&Zacute;":"Ź","&Zcaron;":"Ž","&Zcy;":"З","&Zdot;":"Ż","&ZeroWidthSpace;":"​","&Zeta;":"Ζ","&Zfr;":"ℨ","&Zopf;":"ℤ","&Zscr;":"𝒵","&aacute":"á","&aacute;":"á","&abreve;":"ă","&ac;":"∾","&acE;":"∾̳","&acd;":"∿","&acirc":"â","&acirc;":"â","&acute":"´","&acute;":"´","&acy;":"а","&aelig":"æ","&aelig;":"æ","&af;":"⁡","&afr;":"𝔞","&agrave":"à","&agrave;":"à","&alefsym;":"ℵ","&aleph;":"ℵ","&alpha;":"α","&amacr;":"ā","&amalg;":"⨿","&amp":"&","&amp;":"&","&and;":"∧","&andand;":"⩕","&andd;":"⩜","&andslope;":"⩘","&andv;":"⩚","&ang;":"∠","&ange;":"⦤","&angle;":"∠","&angmsd;":"∡","&angmsdaa;":"⦨","&angmsdab;":"⦩","&angmsdac;":"⦪","&angmsdad;":"⦫","&angmsdae;":"⦬","&angmsdaf;":"⦭","&angmsdag;":"⦮","&angmsdah;":"⦯","&angrt;":"∟","&angrtvb;":"⊾","&angrtvbd;":"⦝","&angsph;":"∢","&angst;":"Å","&angzarr;":"⍼","&aogon;":"ą","&aopf;":"𝕒","&ap;":"≈","&apE;":"⩰","&apacir;":"⩯","&ape;":"≊","&apid;":"≋","&apos;":"'","&approx;":"≈","&approxeq;":"≊","&aring":"å","&aring;":"å","&ascr;":"𝒶","&ast;":"*","&asymp;":"≈","&asympeq;":"≍","&atilde":"ã","&atilde;":"ã","&auml":"ä","&auml;":"ä","&awconint;":"∳","&awint;":"⨑","&bNot;":"⫭","&backcong;":"≌","&backepsilon;":"϶","&backprime;":"‵","&backsim;":"∽","&backsimeq;":"⋍","&barvee;":"⊽","&barwed;":"⌅","&barwedge;":"⌅","&bbrk;":"⎵","&bbrktbrk;":"⎶","&bcong;":"≌","&bcy;":"б","&bdquo;":"„","&becaus;":"∵","&because;":"∵","&bemptyv;":"⦰","&bepsi;":"϶","&bernou;":"ℬ","&beta;":"β","&beth;":"ℶ","&between;":"≬","&bfr;":"𝔟","&bigcap;":"⋂","&bigcirc;":"◯","&bigcup;":"⋃","&bigodot;":"⨀","&bigoplus;":"⨁","&bigotimes;":"⨂","&bigsqcup;":"⨆","&bigstar;":"★","&bigtriangledown;":"▽","&bigtriangleup;":"△","&biguplus;":"⨄","&bigvee;":"⋁","&bigwedge;":"⋀","&bkarow;":"⤍","&blacklozenge;":"⧫","&blacksquare;":"▪","&blacktriangle;":"▴","&blacktriangledown;":"▾","&blacktriangleleft;":"◂","&blacktriangleright;":"▸","&blank;":"␣","&blk12;":"▒","&blk14;":"░","&blk34;":"▓","&block;":"█","&bne;":"=⃥","&bnequiv;":"≡⃥","&bnot;":"⌐","&bopf;":"𝕓","&bot;":"⊥","&bottom;":"⊥","&bowtie;":"⋈","&boxDL;":"╗","&boxDR;":"╔","&boxDl;":"╖","&boxDr;":"╓","&boxH;":"═","&boxHD;":"╦","&boxHU;":"╩","&boxHd;":"╤","&boxHu;":"╧","&boxUL;":"╝","&boxUR;":"╚","&boxUl;":"╜","&boxUr;":"╙","&boxV;":"║","&boxVH;":"╬","&boxVL;":"╣","&boxVR;":"╠","&boxVh;":"╫","&boxVl;":"╢","&boxVr;":"╟","&boxbox;":"⧉","&boxdL;":"╕","&boxdR;":"╒","&boxdl;":"┐","&boxdr;":"┌","&boxh;":"─","&boxhD;":"╥","&boxhU;":"╨","&boxhd;":"┬","&boxhu;":"┴","&boxminus;":"⊟","&boxplus;":"⊞","&boxtimes;":"⊠","&boxuL;":"╛","&boxuR;":"╘","&boxul;":"┘","&boxur;":"└","&boxv;":"│","&boxvH;":"╪","&boxvL;":"╡","&boxvR;":"╞","&boxvh;":"┼","&boxvl;":"┤","&boxvr;":"├","&bprime;":"‵","&breve;":"˘","&brvbar":"¦","&brvbar;":"¦","&bscr;":"𝒷","&bsemi;":"⁏","&bsim;":"∽","&bsime;":"⋍","&bsol;":"\\","&bsolb;":"⧅","&bsolhsub;":"⟈","&bull;":"•","&bullet;":"•","&bump;":"≎","&bumpE;":"⪮","&bumpe;":"≏","&bumpeq;":"≏","&cacute;":"ć","&cap;":"∩","&capand;":"⩄","&capbrcup;":"⩉","&capcap;":"⩋","&capcup;":"⩇","&capdot;":"⩀","&caps;":"∩︀","&caret;":"⁁","&caron;":"ˇ","&ccaps;":"⩍","&ccaron;":"č","&ccedil":"ç","&ccedil;":"ç","&ccirc;":"ĉ","&ccups;":"⩌","&ccupssm;":"⩐","&cdot;":"ċ","&cedil":"¸","&cedil;":"¸","&cemptyv;":"⦲","&cent":"¢","&cent;":"¢","&centerdot;":"·","&cfr;":"𝔠","&chcy;":"ч","&check;":"✓","&checkmark;":"✓","&chi;":"χ","&cir;":"○","&cirE;":"⧃","&circ;":"ˆ","&circeq;":"≗","&circlearrowleft;":"↺","&circlearrowright;":"↻","&circledR;":"®","&circledS;":"Ⓢ","&circledast;":"⊛","&circledcirc;":"⊚","&circleddash;":"⊝","&cire;":"≗","&cirfnint;":"⨐","&cirmid;":"⫯","&cirscir;":"⧂","&clubs;":"♣","&clubsuit;":"♣","&colon;":":","&colone;":"≔","&coloneq;":"≔","&comma;":",","&commat;":"@","&comp;":"∁","&compfn;":"∘","&complement;":"∁","&complexes;":"ℂ","&cong;":"≅","&congdot;":"⩭","&conint;":"∮","&copf;":"𝕔","&coprod;":"∐","&copy":"©","&copy;":"©","&copysr;":"℗","&crarr;":"↵","&cross;":"✗","&cscr;":"𝒸","&csub;":"⫏","&csube;":"⫑","&csup;":"⫐","&csupe;":"⫒","&ctdot;":"⋯","&cudarrl;":"⤸","&cudarrr;":"⤵","&cuepr;":"⋞","&cuesc;":"⋟","&cularr;":"↶","&cularrp;":"⤽","&cup;":"∪","&cupbrcap;":"⩈","&cupcap;":"⩆","&cupcup;":"⩊","&cupdot;":"⊍","&cupor;":"⩅","&cups;":"∪︀","&curarr;":"↷","&curarrm;":"⤼","&curlyeqprec;":"⋞","&curlyeqsucc;":"⋟","&curlyvee;":"⋎","&curlywedge;":"⋏","&curren":"¤","&curren;":"¤","&curvearrowleft;":"↶","&curvearrowright;":"↷","&cuvee;":"⋎","&cuwed;":"⋏","&cwconint;":"∲","&cwint;":"∱","&cylcty;":"⌭","&dArr;":"⇓","&dHar;":"⥥","&dagger;":"†","&daleth;":"ℸ","&darr;":"↓","&dash;":"‐","&dashv;":"⊣","&dbkarow;":"⤏","&dblac;":"˝","&dcaron;":"ď","&dcy;":"д","&dd;":"ⅆ","&ddagger;":"‡","&ddarr;":"⇊","&ddotseq;":"⩷","&deg":"°","&deg;":"°","&delta;":"δ","&demptyv;":"⦱","&dfisht;":"⥿","&dfr;":"𝔡","&dharl;":"⇃","&dharr;":"⇂","&diam;":"⋄","&diamond;":"⋄","&diamondsuit;":"♦","&diams;":"♦","&die;":"¨","&digamma;":"ϝ","&disin;":"⋲","&div;":"÷","&divide":"÷","&divide;":"÷","&divideontimes;":"⋇","&divonx;":"⋇","&djcy;":"ђ","&dlcorn;":"⌞","&dlcrop;":"⌍","&dollar;":"$","&dopf;":"𝕕","&dot;":"˙","&doteq;":"≐","&doteqdot;":"≑","&dotminus;":"∸","&dotplus;":"∔","&dotsquare;":"⊡","&doublebarwedge;":"⌆","&downarrow;":"↓","&downdownarrows;":"⇊","&downharpoonleft;":"⇃","&downharpoonright;":"⇂","&drbkarow;":"⤐","&drcorn;":"⌟","&drcrop;":"⌌","&dscr;":"𝒹","&dscy;":"ѕ","&dsol;":"⧶","&dstrok;":"đ","&dtdot;":"⋱","&dtri;":"▿","&dtrif;":"▾","&duarr;":"⇵","&duhar;":"⥯","&dwangle;":"⦦","&dzcy;":"џ","&dzigrarr;":"⟿","&eDDot;":"⩷","&eDot;":"≑","&eacute":"é","&eacute;":"é","&easter;":"⩮","&ecaron;":"ě","&ecir;":"≖","&ecirc":"ê","&ecirc;":"ê","&ecolon;":"≕","&ecy;":"э","&edot;":"ė","&ee;":"ⅇ","&efDot;":"≒","&efr;":"𝔢","&eg;":"⪚","&egrave":"è","&egrave;":"è","&egs;":"⪖","&egsdot;":"⪘","&el;":"⪙","&elinters;":"⏧","&ell;":"ℓ","&els;":"⪕","&elsdot;":"⪗","&emacr;":"ē","&empty;":"∅","&emptyset;":"∅","&emptyv;":"∅","&emsp13;":" ","&emsp14;":" ","&emsp;":" ","&eng;":"ŋ","&ensp;":" ","&eogon;":"ę","&eopf;":"𝕖","&epar;":"⋕","&eparsl;":"⧣","&eplus;":"⩱","&epsi;":"ε","&epsilon;":"ε","&epsiv;":"ϵ","&eqcirc;":"≖","&eqcolon;":"≕","&eqsim;":"≂","&eqslantgtr;":"⪖","&eqslantless;":"⪕","&equals;":"=","&equest;":"≟","&equiv;":"≡","&equivDD;":"⩸","&eqvparsl;":"⧥","&erDot;":"≓","&erarr;":"⥱","&escr;":"ℯ","&esdot;":"≐","&esim;":"≂","&eta;":"η","&eth":"ð","&eth;":"ð","&euml":"ë","&euml;":"ë","&euro;":"€","&excl;":"!","&exist;":"∃","&expectation;":"ℰ","&exponentiale;":"ⅇ","&fallingdotseq;":"≒","&fcy;":"ф","&female;":"♀","&ffilig;":"ﬃ","&fflig;":"ﬀ","&ffllig;":"ﬄ","&ffr;":"𝔣","&filig;":"ﬁ","&fjlig;":"fj","&flat;":"♭","&fllig;":"ﬂ","&fltns;":"▱","&fnof;":"ƒ","&fopf;":"𝕗","&forall;":"∀","&fork;":"⋔","&forkv;":"⫙","&fpartint;":"⨍","&frac12":"½","&frac12;":"½","&frac13;":"⅓","&frac14":"¼","&frac14;":"¼","&frac15;":"⅕","&frac16;":"⅙","&frac18;":"⅛","&frac23;":"⅔","&frac25;":"⅖","&frac34":"¾","&frac34;":"¾","&frac35;":"⅗","&frac38;":"⅜","&frac45;":"⅘","&frac56;":"⅚","&frac58;":"⅝","&frac78;":"⅞","&frasl;":"⁄","&frown;":"⌢","&fscr;":"𝒻","&gE;":"≧","&gEl;":"⪌","&gacute;":"ǵ","&gamma;":"γ","&gammad;":"ϝ","&gap;":"⪆","&gbreve;":"ğ","&gcirc;":"ĝ","&gcy;":"г","&gdot;":"ġ","&ge;":"≥","&gel;":"⋛","&geq;":"≥","&geqq;":"≧","&geqslant;":"⩾","&ges;":"⩾","&gescc;":"⪩","&gesdot;":"⪀","&gesdoto;":"⪂","&gesdotol;":"⪄","&gesl;":"⋛︀","&gesles;":"⪔","&gfr;":"𝔤","&gg;":"≫","&ggg;":"⋙","&gimel;":"ℷ","&gjcy;":"ѓ","&gl;":"≷","&glE;":"⪒","&gla;":"⪥","&glj;":"⪤","&gnE;":"≩","&gnap;":"⪊","&gnapprox;":"⪊","&gne;":"⪈","&gneq;":"⪈","&gneqq;":"≩","&gnsim;":"⋧","&gopf;":"𝕘","&grave;":"`","&gscr;":"ℊ","&gsim;":"≳","&gsime;":"⪎","&gsiml;":"⪐","&gt":">","&gt;":">","&gtcc;":"⪧","&gtcir;":"⩺","&gtdot;":"⋗","&gtlPar;":"⦕","&gtquest;":"⩼","&gtrapprox;":"⪆","&gtrarr;":"⥸","&gtrdot;":"⋗","&gtreqless;":"⋛","&gtreqqless;":"⪌","&gtrless;":"≷","&gtrsim;":"≳","&gvertneqq;":"≩︀","&gvnE;":"≩︀","&hArr;":"⇔","&hairsp;":" ","&half;":"½","&hamilt;":"ℋ","&hardcy;":"ъ","&harr;":"↔","&harrcir;":"⥈","&harrw;":"↭","&hbar;":"ℏ","&hcirc;":"ĥ","&hearts;":"♥","&heartsuit;":"♥","&hellip;":"…","&hercon;":"⊹","&hfr;":"𝔥","&hksearow;":"⤥","&hkswarow;":"⤦","&hoarr;":"⇿","&homtht;":"∻","&hookleftarrow;":"↩","&hookrightarrow;":"↪","&hopf;":"𝕙","&horbar;":"―","&hscr;":"𝒽","&hslash;":"ℏ","&hstrok;":"ħ","&hybull;":"⁃","&hyphen;":"‐","&iacute":"í","&iacute;":"í","&ic;":"⁣","&icirc":"î","&icirc;":"î","&icy;":"и","&iecy;":"е","&iexcl":"¡","&iexcl;":"¡","&iff;":"⇔","&ifr;":"𝔦","&igrave":"ì","&igrave;":"ì","&ii;":"ⅈ","&iiiint;":"⨌","&iiint;":"∭","&iinfin;":"⧜","&iiota;":"℩","&ijlig;":"ĳ","&imacr;":"ī","&image;":"ℑ","&imagline;":"ℐ","&imagpart;":"ℑ","&imath;":"ı","&imof;":"⊷","&imped;":"Ƶ","&in;":"∈","&incare;":"℅","&infin;":"∞","&infintie;":"⧝","&inodot;":"ı","&int;":"∫","&intcal;":"⊺","&integers;":"ℤ","&intercal;":"⊺","&intlarhk;":"⨗","&intprod;":"⨼","&iocy;":"ё","&iogon;":"į","&iopf;":"𝕚","&iota;":"ι","&iprod;":"⨼","&iquest":"¿","&iquest;":"¿","&iscr;":"𝒾","&isin;":"∈","&isinE;":"⋹","&isindot;":"⋵","&isins;":"⋴","&isinsv;":"⋳","&isinv;":"∈","&it;":"⁢","&itilde;":"ĩ","&iukcy;":"і","&iuml":"ï","&iuml;":"ï","&jcirc;":"ĵ","&jcy;":"й","&jfr;":"𝔧","&jmath;":"ȷ","&jopf;":"𝕛","&jscr;":"𝒿","&jsercy;":"ј","&jukcy;":"є","&kappa;":"κ","&kappav;":"ϰ","&kcedil;":"ķ","&kcy;":"к","&kfr;":"𝔨","&kgreen;":"ĸ","&khcy;":"х","&kjcy;":"ќ","&kopf;":"𝕜","&kscr;":"𝓀","&lAarr;":"⇚","&lArr;":"⇐","&lAtail;":"⤛","&lBarr;":"⤎","&lE;":"≦","&lEg;":"⪋","&lHar;":"⥢","&lacute;":"ĺ","&laemptyv;":"⦴","&lagran;":"ℒ","&lambda;":"λ","&lang;":"⟨","&langd;":"⦑","&langle;":"⟨","&lap;":"⪅","&laquo":"«","&laquo;":"«","&larr;":"←","&larrb;":"⇤","&larrbfs;":"⤟","&larrfs;":"⤝","&larrhk;":"↩","&larrlp;":"↫","&larrpl;":"⤹","&larrsim;":"⥳","&larrtl;":"↢","&lat;":"⪫","&latail;":"⤙","&late;":"⪭","&lates;":"⪭︀","&lbarr;":"⤌","&lbbrk;":"❲","&lbrace;":"{","&lbrack;":"[","&lbrke;":"⦋","&lbrksld;":"⦏","&lbrkslu;":"⦍","&lcaron;":"ľ","&lcedil;":"ļ","&lceil;":"⌈","&lcub;":"{","&lcy;":"л","&ldca;":"⤶","&ldquo;":"“","&ldquor;":"„","&ldrdhar;":"⥧","&ldrushar;":"⥋","&ldsh;":"↲","&le;":"≤","&leftarrow;":"←","&leftarrowtail;":"↢","&leftharpoondown;":"↽","&leftharpoonup;":"↼","&leftleftarrows;":"⇇","&leftrightarrow;":"↔","&leftrightarrows;":"⇆","&leftrightharpoons;":"⇋","&leftrightsquigarrow;":"↭","&leftthreetimes;":"⋋","&leg;":"⋚","&leq;":"≤","&leqq;":"≦","&leqslant;":"⩽","&les;":"⩽","&lescc;":"⪨","&lesdot;":"⩿","&lesdoto;":"⪁","&lesdotor;":"⪃","&lesg;":"⋚︀","&lesges;":"⪓","&lessapprox;":"⪅","&lessdot;":"⋖","&lesseqgtr;":"⋚","&lesseqqgtr;":"⪋","&lessgtr;":"≶","&lesssim;":"≲","&lfisht;":"⥼","&lfloor;":"⌊","&lfr;":"𝔩","&lg;":"≶","&lgE;":"⪑","&lhard;":"↽","&lharu;":"↼","&lharul;":"⥪","&lhblk;":"▄","&ljcy;":"љ","&ll;":"≪","&llarr;":"⇇","&llcorner;":"⌞","&llhard;":"⥫","&lltri;":"◺","&lmidot;":"ŀ","&lmoust;":"⎰","&lmoustache;":"⎰","&lnE;":"≨","&lnap;":"⪉","&lnapprox;":"⪉","&lne;":"⪇","&lneq;":"⪇","&lneqq;":"≨","&lnsim;":"⋦","&loang;":"⟬","&loarr;":"⇽","&lobrk;":"⟦","&longleftarrow;":"⟵","&longleftrightarrow;":"⟷","&longmapsto;":"⟼","&longrightarrow;":"⟶","&looparrowleft;":"↫","&looparrowright;":"↬","&lopar;":"⦅","&lopf;":"𝕝","&loplus;":"⨭","&lotimes;":"⨴","&lowast;":"∗","&lowbar;":"_","&loz;":"◊","&lozenge;":"◊","&lozf;":"⧫","&lpar;":"(","&lparlt;":"⦓","&lrarr;":"⇆","&lrcorner;":"⌟","&lrhar;":"⇋","&lrhard;":"⥭","&lrm;":"‎","&lrtri;":"⊿","&lsaquo;":"‹","&lscr;":"𝓁","&lsh;":"↰","&lsim;":"≲","&lsime;":"⪍","&lsimg;":"⪏","&lsqb;":"[","&lsquo;":"‘","&lsquor;":"‚","&lstrok;":"ł","&lt":"<","&lt;":"<","&ltcc;":"⪦","&ltcir;":"⩹","&ltdot;":"⋖","&lthree;":"⋋","&ltimes;":"⋉","&ltlarr;":"⥶","&ltquest;":"⩻","&ltrPar;":"⦖","&ltri;":"◃","&ltrie;":"⊴","&ltrif;":"◂","&lurdshar;":"⥊","&luruhar;":"⥦","&lvertneqq;":"≨︀","&lvnE;":"≨︀","&mDDot;":"∺","&macr":"¯","&macr;":"¯","&male;":"♂","&malt;":"✠","&maltese;":"✠","&map;":"↦","&mapsto;":"↦","&mapstodown;":"↧","&mapstoleft;":"↤","&mapstoup;":"↥","&marker;":"▮","&mcomma;":"⨩","&mcy;":"м","&mdash;":"—","&measuredangle;":"∡","&mfr;":"𝔪","&mho;":"℧","&micro":"µ","&micro;":"µ","&mid;":"∣","&midast;":"*","&midcir;":"⫰","&middot":"·","&middot;":"·","&minus;":"−","&minusb;":"⊟","&minusd;":"∸","&minusdu;":"⨪","&mlcp;":"⫛","&mldr;":"…","&mnplus;":"∓","&models;":"⊧","&mopf;":"𝕞","&mp;":"∓","&mscr;":"𝓂","&mstpos;":"∾","&mu;":"μ","&multimap;":"⊸","&mumap;":"⊸","&nGg;":"⋙̸","&nGt;":"≫⃒","&nGtv;":"≫̸","&nLeftarrow;":"⇍","&nLeftrightarrow;":"⇎","&nLl;":"⋘̸","&nLt;":"≪⃒","&nLtv;":"≪̸","&nRightarrow;":"⇏","&nVDash;":"⊯","&nVdash;":"⊮","&nabla;":"∇","&nacute;":"ń","&nang;":"∠⃒","&nap;":"≉","&napE;":"⩰̸","&napid;":"≋̸","&napos;":"ŉ","&napprox;":"≉","&natur;":"♮","&natural;":"♮","&naturals;":"ℕ","&nbsp":" ","&nbsp;":" ","&nbump;":"≎̸","&nbumpe;":"≏̸","&ncap;":"⩃","&ncaron;":"ň","&ncedil;":"ņ","&ncong;":"≇","&ncongdot;":"⩭̸","&ncup;":"⩂","&ncy;":"н","&ndash;":"–","&ne;":"≠","&neArr;":"⇗","&nearhk;":"⤤","&nearr;":"↗","&nearrow;":"↗","&nedot;":"≐̸","&nequiv;":"≢","&nesear;":"⤨","&nesim;":"≂̸","&nexist;":"∄","&nexists;":"∄","&nfr;":"𝔫","&ngE;":"≧̸","&nge;":"≱","&ngeq;":"≱","&ngeqq;":"≧̸","&ngeqslant;":"⩾̸","&nges;":"⩾̸","&ngsim;":"≵","&ngt;":"≯","&ngtr;":"≯","&nhArr;":"⇎","&nharr;":"↮","&nhpar;":"⫲","&ni;":"∋","&nis;":"⋼","&nisd;":"⋺","&niv;":"∋","&njcy;":"њ","&nlArr;":"⇍","&nlE;":"≦̸","&nlarr;":"↚","&nldr;":"‥","&nle;":"≰","&nleftarrow;":"↚","&nleftrightarrow;":"↮","&nleq;":"≰","&nleqq;":"≦̸","&nleqslant;":"⩽̸","&nles;":"⩽̸","&nless;":"≮","&nlsim;":"≴","&nlt;":"≮","&nltri;":"⋪","&nltrie;":"⋬","&nmid;":"∤","&nopf;":"𝕟","&not":"¬","&not;":"¬","&notin;":"∉","&notinE;":"⋹̸","&notindot;":"⋵̸","&notinva;":"∉","&notinvb;":"⋷","&notinvc;":"⋶","&notni;":"∌","&notniva;":"∌","&notnivb;":"⋾","&notnivc;":"⋽","&npar;":"∦","&nparallel;":"∦","&nparsl;":"⫽⃥","&npart;":"∂̸","&npolint;":"⨔","&npr;":"⊀","&nprcue;":"⋠","&npre;":"⪯̸","&nprec;":"⊀","&npreceq;":"⪯̸","&nrArr;":"⇏","&nrarr;":"↛","&nrarrc;":"⤳̸","&nrarrw;":"↝̸","&nrightarrow;":"↛","&nrtri;":"⋫","&nrtrie;":"⋭","&nsc;":"⊁","&nsccue;":"⋡","&nsce;":"⪰̸","&nscr;":"𝓃","&nshortmid;":"∤","&nshortparallel;":"∦","&nsim;":"≁","&nsime;":"≄","&nsimeq;":"≄","&nsmid;":"∤","&nspar;":"∦","&nsqsube;":"⋢","&nsqsupe;":"⋣","&nsub;":"⊄","&nsubE;":"⫅̸","&nsube;":"⊈","&nsubset;":"⊂⃒","&nsubseteq;":"⊈","&nsubseteqq;":"⫅̸","&nsucc;":"⊁","&nsucceq;":"⪰̸","&nsup;":"⊅","&nsupE;":"⫆̸","&nsupe;":"⊉","&nsupset;":"⊃⃒","&nsupseteq;":"⊉","&nsupseteqq;":"⫆̸","&ntgl;":"≹","&ntilde":"ñ","&ntilde;":"ñ","&ntlg;":"≸","&ntriangleleft;":"⋪","&ntrianglelefteq;":"⋬","&ntriangleright;":"⋫","&ntrianglerighteq;":"⋭","&nu;":"ν","&num;":"#","&numero;":"№","&numsp;":" ","&nvDash;":"⊭","&nvHarr;":"⤄","&nvap;":"≍⃒","&nvdash;":"⊬","&nvge;":"≥⃒","&nvgt;":">⃒","&nvinfin;":"⧞","&nvlArr;":"⤂","&nvle;":"≤⃒","&nvlt;":"<⃒","&nvltrie;":"⊴⃒","&nvrArr;":"⤃","&nvrtrie;":"⊵⃒","&nvsim;":"∼⃒","&nwArr;":"⇖","&nwarhk;":"⤣","&nwarr;":"↖","&nwarrow;":"↖","&nwnear;":"⤧","&oS;":"Ⓢ","&oacute":"ó","&oacute;":"ó","&oast;":"⊛","&ocir;":"⊚","&ocirc":"ô","&ocirc;":"ô","&ocy;":"о","&odash;":"⊝","&odblac;":"ő","&odiv;":"⨸","&odot;":"⊙","&odsold;":"⦼","&oelig;":"œ","&ofcir;":"⦿","&ofr;":"𝔬","&ogon;":"˛","&ograve":"ò","&ograve;":"ò","&ogt;":"⧁","&ohbar;":"⦵","&ohm;":"Ω","&oint;":"∮","&olarr;":"↺","&olcir;":"⦾","&olcross;":"⦻","&oline;":"‾","&olt;":"⧀","&omacr;":"ō","&omega;":"ω","&omicron;":"ο","&omid;":"⦶","&ominus;":"⊖","&oopf;":"𝕠","&opar;":"⦷","&operp;":"⦹","&oplus;":"⊕","&or;":"∨","&orarr;":"↻","&ord;":"⩝","&order;":"ℴ","&orderof;":"ℴ","&ordf":"ª","&ordf;":"ª","&ordm":"º","&ordm;":"º","&origof;":"⊶","&oror;":"⩖","&orslope;":"⩗","&orv;":"⩛","&oscr;":"ℴ","&oslash":"ø","&oslash;":"ø","&osol;":"⊘","&otilde":"õ","&otilde;":"õ","&otimes;":"⊗","&otimesas;":"⨶","&ouml":"ö","&ouml;":"ö","&ovbar;":"⌽","&par;":"∥","&para":"¶","&para;":"¶","&parallel;":"∥","&parsim;":"⫳","&parsl;":"⫽","&part;":"∂","&pcy;":"п","&percnt;":"%","&period;":".","&permil;":"‰","&perp;":"⊥","&pertenk;":"‱","&pfr;":"𝔭","&phi;":"φ","&phiv;":"ϕ","&phmmat;":"ℳ","&phone;":"☎","&pi;":"π","&pitchfork;":"⋔","&piv;":"ϖ","&planck;":"ℏ","&planckh;":"ℎ","&plankv;":"ℏ","&plus;":"+","&plusacir;":"⨣","&plusb;":"⊞","&pluscir;":"⨢","&plusdo;":"∔","&plusdu;":"⨥","&pluse;":"⩲","&plusmn":"±","&plusmn;":"±","&plussim;":"⨦","&plustwo;":"⨧","&pm;":"±","&pointint;":"⨕","&popf;":"𝕡","&pound":"£","&pound;":"£","&pr;":"≺","&prE;":"⪳","&prap;":"⪷","&prcue;":"≼","&pre;":"⪯","&prec;":"≺","&precapprox;":"⪷","&preccurlyeq;":"≼","&preceq;":"⪯","&precnapprox;":"⪹","&precneqq;":"⪵","&precnsim;":"⋨","&precsim;":"≾","&prime;":"′","&primes;":"ℙ","&prnE;":"⪵","&prnap;":"⪹","&prnsim;":"⋨","&prod;":"∏","&profalar;":"⌮","&profline;":"⌒","&profsurf;":"⌓","&prop;":"∝","&propto;":"∝","&prsim;":"≾","&prurel;":"⊰","&pscr;":"𝓅","&psi;":"ψ","&puncsp;":" ","&qfr;":"𝔮","&qint;":"⨌","&qopf;":"𝕢","&qprime;":"⁗","&qscr;":"𝓆","&quaternions;":"ℍ","&quatint;":"⨖","&quest;":"?","&questeq;":"≟","&quot":'"',"&quot;":'"',"&rAarr;":"⇛","&rArr;":"⇒","&rAtail;":"⤜","&rBarr;":"⤏","&rHar;":"⥤","&race;":"∽̱","&racute;":"ŕ","&radic;":"√","&raemptyv;":"⦳","&rang;":"⟩","&rangd;":"⦒","&range;":"⦥","&rangle;":"⟩","&raquo":"»","&raquo;":"»","&rarr;":"→","&rarrap;":"⥵","&rarrb;":"⇥","&rarrbfs;":"⤠","&rarrc;":"⤳","&rarrfs;":"⤞","&rarrhk;":"↪","&rarrlp;":"↬","&rarrpl;":"⥅","&rarrsim;":"⥴","&rarrtl;":"↣","&rarrw;":"↝","&ratail;":"⤚","&ratio;":"∶","&rationals;":"ℚ","&rbarr;":"⤍","&rbbrk;":"❳","&rbrace;":"}","&rbrack;":"]","&rbrke;":"⦌","&rbrksld;":"⦎","&rbrkslu;":"⦐","&rcaron;":"ř","&rcedil;":"ŗ","&rceil;":"⌉","&rcub;":"}","&rcy;":"р","&rdca;":"⤷","&rdldhar;":"⥩","&rdquo;":"”","&rdquor;":"”","&rdsh;":"↳","&real;":"ℜ","&realine;":"ℛ","&realpart;":"ℜ","&reals;":"ℝ","&rect;":"▭","&reg":"®","&reg;":"®","&rfisht;":"⥽","&rfloor;":"⌋","&rfr;":"𝔯","&rhard;":"⇁","&rharu;":"⇀","&rharul;":"⥬","&rho;":"ρ","&rhov;":"ϱ","&rightarrow;":"→","&rightarrowtail;":"↣","&rightharpoondown;":"⇁","&rightharpoonup;":"⇀","&rightleftarrows;":"⇄","&rightleftharpoons;":"⇌","&rightrightarrows;":"⇉","&rightsquigarrow;":"↝","&rightthreetimes;":"⋌","&ring;":"˚","&risingdotseq;":"≓","&rlarr;":"⇄","&rlhar;":"⇌","&rlm;":"‏","&rmoust;":"⎱","&rmoustache;":"⎱","&rnmid;":"⫮","&roang;":"⟭","&roarr;":"⇾","&robrk;":"⟧","&ropar;":"⦆","&ropf;":"𝕣","&roplus;":"⨮","&rotimes;":"⨵","&rpar;":")","&rpargt;":"⦔","&rppolint;":"⨒","&rrarr;":"⇉","&rsaquo;":"›","&rscr;":"𝓇","&rsh;":"↱","&rsqb;":"]","&rsquo;":"’","&rsquor;":"’","&rthree;":"⋌","&rtimes;":"⋊","&rtri;":"▹","&rtrie;":"⊵","&rtrif;":"▸","&rtriltri;":"⧎","&ruluhar;":"⥨","&rx;":"℞","&sacute;":"ś","&sbquo;":"‚","&sc;":"≻","&scE;":"⪴","&scap;":"⪸","&scaron;":"š","&sccue;":"≽","&sce;":"⪰","&scedil;":"ş","&scirc;":"ŝ","&scnE;":"⪶","&scnap;":"⪺","&scnsim;":"⋩","&scpolint;":"⨓","&scsim;":"≿","&scy;":"с","&sdot;":"⋅","&sdotb;":"⊡","&sdote;":"⩦","&seArr;":"⇘","&searhk;":"⤥","&searr;":"↘","&searrow;":"↘","&sect":"§","&sect;":"§","&semi;":";","&seswar;":"⤩","&setminus;":"∖","&setmn;":"∖","&sext;":"✶","&sfr;":"𝔰","&sfrown;":"⌢","&sharp;":"♯","&shchcy;":"щ","&shcy;":"ш","&shortmid;":"∣","&shortparallel;":"∥","&shy":"­","&shy;":"­","&sigma;":"σ","&sigmaf;":"ς","&sigmav;":"ς","&sim;":"∼","&simdot;":"⩪","&sime;":"≃","&simeq;":"≃","&simg;":"⪞","&simgE;":"⪠","&siml;":"⪝","&simlE;":"⪟","&simne;":"≆","&simplus;":"⨤","&simrarr;":"⥲","&slarr;":"←","&smallsetminus;":"∖","&smashp;":"⨳","&smeparsl;":"⧤","&smid;":"∣","&smile;":"⌣","&smt;":"⪪","&smte;":"⪬","&smtes;":"⪬︀","&softcy;":"ь","&sol;":"/","&solb;":"⧄","&solbar;":"⌿","&sopf;":"𝕤","&spades;":"♠","&spadesuit;":"♠","&spar;":"∥","&sqcap;":"⊓","&sqcaps;":"⊓︀","&sqcup;":"⊔","&sqcups;":"⊔︀","&sqsub;":"⊏","&sqsube;":"⊑","&sqsubset;":"⊏","&sqsubseteq;":"⊑","&sqsup;":"⊐","&sqsupe;":"⊒","&sqsupset;":"⊐","&sqsupseteq;":"⊒","&squ;":"□","&square;":"□","&squarf;":"▪","&squf;":"▪","&srarr;":"→","&sscr;":"𝓈","&ssetmn;":"∖","&ssmile;":"⌣","&sstarf;":"⋆","&star;":"☆","&starf;":"★","&straightepsilon;":"ϵ","&straightphi;":"ϕ","&strns;":"¯","&sub;":"⊂","&subE;":"⫅","&subdot;":"⪽","&sube;":"⊆","&subedot;":"⫃","&submult;":"⫁","&subnE;":"⫋","&subne;":"⊊","&subplus;":"⪿","&subrarr;":"⥹","&subset;":"⊂","&subseteq;":"⊆","&subseteqq;":"⫅","&subsetneq;":"⊊","&subsetneqq;":"⫋","&subsim;":"⫇","&subsub;":"⫕","&subsup;":"⫓","&succ;":"≻","&succapprox;":"⪸","&succcurlyeq;":"≽","&succeq;":"⪰","&succnapprox;":"⪺","&succneqq;":"⪶","&succnsim;":"⋩","&succsim;":"≿","&sum;":"∑","&sung;":"♪","&sup1":"¹","&sup1;":"¹","&sup2":"²","&sup2;":"²","&sup3":"³","&sup3;":"³","&sup;":"⊃","&supE;":"⫆","&supdot;":"⪾","&supdsub;":"⫘","&supe;":"⊇","&supedot;":"⫄","&suphsol;":"⟉","&suphsub;":"⫗","&suplarr;":"⥻","&supmult;":"⫂","&supnE;":"⫌","&supne;":"⊋","&supplus;":"⫀","&supset;":"⊃","&supseteq;":"⊇","&supseteqq;":"⫆","&supsetneq;":"⊋","&supsetneqq;":"⫌","&supsim;":"⫈","&supsub;":"⫔","&supsup;":"⫖","&swArr;":"⇙","&swarhk;":"⤦","&swarr;":"↙","&swarrow;":"↙","&swnwar;":"⤪","&szlig":"ß","&szlig;":"ß","&target;":"⌖","&tau;":"τ","&tbrk;":"⎴","&tcaron;":"ť","&tcedil;":"ţ","&tcy;":"т","&tdot;":"⃛","&telrec;":"⌕","&tfr;":"𝔱","&there4;":"∴","&therefore;":"∴","&theta;":"θ","&thetasym;":"ϑ","&thetav;":"ϑ","&thickapprox;":"≈","&thicksim;":"∼","&thinsp;":" ","&thkap;":"≈","&thksim;":"∼","&thorn":"þ","&thorn;":"þ","&tilde;":"˜","&times":"×","&times;":"×","&timesb;":"⊠","&timesbar;":"⨱","&timesd;":"⨰","&tint;":"∭","&toea;":"⤨","&top;":"⊤","&topbot;":"⌶","&topcir;":"⫱","&topf;":"𝕥","&topfork;":"⫚","&tosa;":"⤩","&tprime;":"‴","&trade;":"™","&triangle;":"▵","&triangledown;":"▿","&triangleleft;":"◃","&trianglelefteq;":"⊴","&triangleq;":"≜","&triangleright;":"▹","&trianglerighteq;":"⊵","&tridot;":"◬","&trie;":"≜","&triminus;":"⨺","&triplus;":"⨹","&trisb;":"⧍","&tritime;":"⨻","&trpezium;":"⏢","&tscr;":"𝓉","&tscy;":"ц","&tshcy;":"ћ","&tstrok;":"ŧ","&twixt;":"≬","&twoheadleftarrow;":"↞","&twoheadrightarrow;":"↠","&uArr;":"⇑","&uHar;":"⥣","&uacute":"ú","&uacute;":"ú","&uarr;":"↑","&ubrcy;":"ў","&ubreve;":"ŭ","&ucirc":"û","&ucirc;":"û","&ucy;":"у","&udarr;":"⇅","&udblac;":"ű","&udhar;":"⥮","&ufisht;":"⥾","&ufr;":"𝔲","&ugrave":"ù","&ugrave;":"ù","&uharl;":"↿","&uharr;":"↾","&uhblk;":"▀","&ulcorn;":"⌜","&ulcorner;":"⌜","&ulcrop;":"⌏","&ultri;":"◸","&umacr;":"ū","&uml":"¨","&uml;":"¨","&uogon;":"ų","&uopf;":"𝕦","&uparrow;":"↑","&updownarrow;":"↕","&upharpoonleft;":"↿","&upharpoonright;":"↾","&uplus;":"⊎","&upsi;":"υ","&upsih;":"ϒ","&upsilon;":"υ","&upuparrows;":"⇈","&urcorn;":"⌝","&urcorner;":"⌝","&urcrop;":"⌎","&uring;":"ů","&urtri;":"◹","&uscr;":"𝓊","&utdot;":"⋰","&utilde;":"ũ","&utri;":"▵","&utrif;":"▴","&uuarr;":"⇈","&uuml":"ü","&uuml;":"ü","&uwangle;":"⦧","&vArr;":"⇕","&vBar;":"⫨","&vBarv;":"⫩","&vDash;":"⊨","&vangrt;":"⦜","&varepsilon;":"ϵ","&varkappa;":"ϰ","&varnothing;":"∅","&varphi;":"ϕ","&varpi;":"ϖ","&varpropto;":"∝","&varr;":"↕","&varrho;":"ϱ","&varsigma;":"ς","&varsubsetneq;":"⊊︀","&varsubsetneqq;":"⫋︀","&varsupsetneq;":"⊋︀","&varsupsetneqq;":"⫌︀","&vartheta;":"ϑ","&vartriangleleft;":"⊲","&vartriangleright;":"⊳","&vcy;":"в","&vdash;":"⊢","&vee;":"∨","&veebar;":"⊻","&veeeq;":"≚","&vellip;":"⋮","&verbar;":"|","&vert;":"|","&vfr;":"𝔳","&vltri;":"⊲","&vnsub;":"⊂⃒","&vnsup;":"⊃⃒","&vopf;":"𝕧","&vprop;":"∝","&vrtri;":"⊳","&vscr;":"𝓋","&vsubnE;":"⫋︀","&vsubne;":"⊊︀","&vsupnE;":"⫌︀","&vsupne;":"⊋︀","&vzigzag;":"⦚","&wcirc;":"ŵ","&wedbar;":"⩟","&wedge;":"∧","&wedgeq;":"≙","&weierp;":"℘","&wfr;":"𝔴","&wopf;":"𝕨","&wp;":"℘","&wr;":"≀","&wreath;":"≀","&wscr;":"𝓌","&xcap;":"⋂","&xcirc;":"◯","&xcup;":"⋃","&xdtri;":"▽","&xfr;":"𝔵","&xhArr;":"⟺","&xharr;":"⟷","&xi;":"ξ","&xlArr;":"⟸","&xlarr;":"⟵","&xmap;":"⟼","&xnis;":"⋻","&xodot;":"⨀","&xopf;":"𝕩","&xoplus;":"⨁","&xotime;":"⨂","&xrArr;":"⟹","&xrarr;":"⟶","&xscr;":"𝓍","&xsqcup;":"⨆","&xuplus;":"⨄","&xutri;":"△","&xvee;":"⋁","&xwedge;":"⋀","&yacute":"ý","&yacute;":"ý","&yacy;":"я","&ycirc;":"ŷ","&ycy;":"ы","&yen":"¥","&yen;":"¥","&yfr;":"𝔶","&yicy;":"ї","&yopf;":"𝕪","&yscr;":"𝓎","&yucy;":"ю","&yuml":"ÿ","&yuml;":"ÿ","&zacute;":"ź","&zcaron;":"ž","&zcy;":"з","&zdot;":"ż","&zeetrf;":"ℨ","&zeta;":"ζ","&zfr;":"𝔷","&zhcy;":"ж","&zigrarr;":"⇝","&zopf;":"𝕫","&zscr;":"𝓏","&zwj;":"‍","&zwnj;":"‌"},characters:{"Æ":"&AElig;","&":"&amp;","Á":"&Aacute;","Ă":"&Abreve;","Â":"&Acirc;","А":"&Acy;","𝔄":"&Afr;","À":"&Agrave;","Α":"&Alpha;","Ā":"&Amacr;","⩓":"&And;","Ą":"&Aogon;","𝔸":"&Aopf;","⁡":"&af;","Å":"&angst;","𝒜":"&Ascr;","≔":"&coloneq;","Ã":"&Atilde;","Ä":"&Auml;","∖":"&ssetmn;","⫧":"&Barv;","⌆":"&doublebarwedge;","Б":"&Bcy;","∵":"&because;","ℬ":"&bernou;","Β":"&Beta;","𝔅":"&Bfr;","𝔹":"&Bopf;","˘":"&breve;","≎":"&bump;","Ч":"&CHcy;","©":"&copy;","Ć":"&Cacute;","⋒":"&Cap;","ⅅ":"&DD;","ℭ":"&Cfr;","Č":"&Ccaron;","Ç":"&Ccedil;","Ĉ":"&Ccirc;","∰":"&Cconint;","Ċ":"&Cdot;","¸":"&cedil;","·":"&middot;","Χ":"&Chi;","⊙":"&odot;","⊖":"&ominus;","⊕":"&oplus;","⊗":"&otimes;","∲":"&cwconint;","”":"&rdquor;","’":"&rsquor;","∷":"&Proportion;","⩴":"&Colone;","≡":"&equiv;","∯":"&DoubleContourIntegral;","∮":"&oint;","ℂ":"&complexes;","∐":"&coprod;","∳":"&awconint;","⨯":"&Cross;","𝒞":"&Cscr;","⋓":"&Cup;","≍":"&asympeq;","⤑":"&DDotrahd;","Ђ":"&DJcy;","Ѕ":"&DScy;","Џ":"&DZcy;","‡":"&ddagger;","↡":"&Darr;","⫤":"&DoubleLeftTee;","Ď":"&Dcaron;","Д":"&Dcy;","∇":"&nabla;","Δ":"&Delta;","𝔇":"&Dfr;","´":"&acute;","˙":"&dot;","˝":"&dblac;","`":"&grave;","˜":"&tilde;","⋄":"&diamond;","ⅆ":"&dd;","𝔻":"&Dopf;","¨":"&uml;","⃜":"&DotDot;","≐":"&esdot;","⇓":"&dArr;","⇐":"&lArr;","⇔":"&iff;","⟸":"&xlArr;","⟺":"&xhArr;","⟹":"&xrArr;","⇒":"&rArr;","⊨":"&vDash;","⇑":"&uArr;","⇕":"&vArr;","∥":"&spar;","↓":"&downarrow;","⤓":"&DownArrowBar;","⇵":"&duarr;","̑":"&DownBreve;","⥐":"&DownLeftRightVector;","⥞":"&DownLeftTeeVector;","↽":"&lhard;","⥖":"&DownLeftVectorBar;","⥟":"&DownRightTeeVector;","⇁":"&rightharpoondown;","⥗":"&DownRightVectorBar;","⊤":"&top;","↧":"&mapstodown;","𝒟":"&Dscr;","Đ":"&Dstrok;","Ŋ":"&ENG;","Ð":"&ETH;","É":"&Eacute;","Ě":"&Ecaron;","Ê":"&Ecirc;","Э":"&Ecy;","Ė":"&Edot;","𝔈":"&Efr;","È":"&Egrave;","∈":"&isinv;","Ē":"&Emacr;","◻":"&EmptySmallSquare;","▫":"&EmptyVerySmallSquare;","Ę":"&Eogon;","𝔼":"&Eopf;","Ε":"&Epsilon;","⩵":"&Equal;","≂":"&esim;","⇌":"&rlhar;","ℰ":"&expectation;","⩳":"&Esim;","Η":"&Eta;","Ë":"&Euml;","∃":"&exist;","ⅇ":"&exponentiale;","Ф":"&Fcy;","𝔉":"&Ffr;","◼":"&FilledSmallSquare;","▪":"&squf;","𝔽":"&Fopf;","∀":"&forall;","ℱ":"&Fscr;","Ѓ":"&GJcy;",">":"&gt;","Γ":"&Gamma;","Ϝ":"&Gammad;","Ğ":"&Gbreve;","Ģ":"&Gcedil;","Ĝ":"&Gcirc;","Г":"&Gcy;","Ġ":"&Gdot;","𝔊":"&Gfr;","⋙":"&ggg;","𝔾":"&Gopf;","≥":"&geq;","⋛":"&gtreqless;","≧":"&geqq;","⪢":"&GreaterGreater;","≷":"&gtrless;","⩾":"&ges;","≳":"&gtrsim;","𝒢":"&Gscr;","≫":"&gg;","Ъ":"&HARDcy;","ˇ":"&caron;","^":"&Hat;","Ĥ":"&Hcirc;","ℌ":"&Poincareplane;","ℋ":"&hamilt;","ℍ":"&quaternions;","─":"&boxh;","Ħ":"&Hstrok;","≏":"&bumpeq;","Е":"&IEcy;","Ĳ":"&IJlig;","Ё":"&IOcy;","Í":"&Iacute;","Î":"&Icirc;","И":"&Icy;","İ":"&Idot;","ℑ":"&imagpart;","Ì":"&Igrave;","Ī":"&Imacr;","ⅈ":"&ii;","∬":"&Int;","∫":"&int;","⋂":"&xcap;","⁣":"&ic;","⁢":"&it;","Į":"&Iogon;","𝕀":"&Iopf;","Ι":"&Iota;","ℐ":"&imagline;","Ĩ":"&Itilde;","І":"&Iukcy;","Ï":"&Iuml;","Ĵ":"&Jcirc;","Й":"&Jcy;","𝔍":"&Jfr;","𝕁":"&Jopf;","𝒥":"&Jscr;","Ј":"&Jsercy;","Є":"&Jukcy;","Х":"&KHcy;","Ќ":"&KJcy;","Κ":"&Kappa;","Ķ":"&Kcedil;","К":"&Kcy;","𝔎":"&Kfr;","𝕂":"&Kopf;","𝒦":"&Kscr;","Љ":"&LJcy;","<":"&lt;","Ĺ":"&Lacute;","Λ":"&Lambda;","⟪":"&Lang;","ℒ":"&lagran;","↞":"&twoheadleftarrow;","Ľ":"&Lcaron;","Ļ":"&Lcedil;","Л":"&Lcy;","⟨":"&langle;","←":"&slarr;","⇤":"&larrb;","⇆":"&lrarr;","⌈":"&lceil;","⟦":"&lobrk;","⥡":"&LeftDownTeeVector;","⇃":"&downharpoonleft;","⥙":"&LeftDownVectorBar;","⌊":"&lfloor;","↔":"&leftrightarrow;","⥎":"&LeftRightVector;","⊣":"&dashv;","↤":"&mapstoleft;","⥚":"&LeftTeeVector;","⊲":"&vltri;","⧏":"&LeftTriangleBar;","⊴":"&trianglelefteq;","⥑":"&LeftUpDownVector;","⥠":"&LeftUpTeeVector;","↿":"&upharpoonleft;","⥘":"&LeftUpVectorBar;","↼":"&lharu;","⥒":"&LeftVectorBar;","⋚":"&lesseqgtr;","≦":"&leqq;","≶":"&lg;","⪡":"&LessLess;","⩽":"&les;","≲":"&lsim;","𝔏":"&Lfr;","⋘":"&Ll;","⇚":"&lAarr;","Ŀ":"&Lmidot;","⟵":"&xlarr;","⟷":"&xharr;","⟶":"&xrarr;","𝕃":"&Lopf;","↙":"&swarrow;","↘":"&searrow;","↰":"&lsh;","Ł":"&Lstrok;","≪":"&ll;","⤅":"&Map;","М":"&Mcy;"," ":"&MediumSpace;","ℳ":"&phmmat;","𝔐":"&Mfr;","∓":"&mp;","𝕄":"&Mopf;","Μ":"&Mu;","Њ":"&NJcy;","Ń":"&Nacute;","Ň":"&Ncaron;","Ņ":"&Ncedil;","Н":"&Ncy;","​":"&ZeroWidthSpace;","\n":"&NewLine;","𝔑":"&Nfr;","⁠":"&NoBreak;"," ":"&nbsp;","ℕ":"&naturals;","⫬":"&Not;","≢":"&nequiv;","≭":"&NotCupCap;","∦":"&nspar;","∉":"&notinva;","≠":"&ne;","≂̸":"&nesim;","∄":"&nexists;","≯":"&ngtr;","≱":"&ngeq;","≧̸":"&ngeqq;","≫̸":"&nGtv;","≹":"&ntgl;","⩾̸":"&nges;","≵":"&ngsim;","≎̸":"&nbump;","≏̸":"&nbumpe;","⋪":"&ntriangleleft;","⧏̸":"&NotLeftTriangleBar;","⋬":"&ntrianglelefteq;","≮":"&nlt;","≰":"&nleq;","≸":"&ntlg;","≪̸":"&nLtv;","⩽̸":"&nles;","≴":"&nlsim;","⪢̸":"&NotNestedGreaterGreater;","⪡̸":"&NotNestedLessLess;","⊀":"&nprec;","⪯̸":"&npreceq;","⋠":"&nprcue;","∌":"&notniva;","⋫":"&ntriangleright;","⧐̸":"&NotRightTriangleBar;","⋭":"&ntrianglerighteq;","⊏̸":"&NotSquareSubset;","⋢":"&nsqsube;","⊐̸":"&NotSquareSuperset;","⋣":"&nsqsupe;","⊂⃒":"&vnsub;","⊈":"&nsubseteq;","⊁":"&nsucc;","⪰̸":"&nsucceq;","⋡":"&nsccue;","≿̸":"&NotSucceedsTilde;","⊃⃒":"&vnsup;","⊉":"&nsupseteq;","≁":"&nsim;","≄":"&nsimeq;","≇":"&ncong;","≉":"&napprox;","∤":"&nsmid;","𝒩":"&Nscr;","Ñ":"&Ntilde;","Ν":"&Nu;","Œ":"&OElig;","Ó":"&Oacute;","Ô":"&Ocirc;","О":"&Ocy;","Ő":"&Odblac;","𝔒":"&Ofr;","Ò":"&Ograve;","Ō":"&Omacr;","Ω":"&ohm;","Ο":"&Omicron;","𝕆":"&Oopf;","“":"&ldquo;","‘":"&lsquo;","⩔":"&Or;","𝒪":"&Oscr;","Ø":"&Oslash;","Õ":"&Otilde;","⨷":"&Otimes;","Ö":"&Ouml;","‾":"&oline;","⏞":"&OverBrace;","⎴":"&tbrk;","⏜":"&OverParenthesis;","∂":"&part;","П":"&Pcy;","𝔓":"&Pfr;","Φ":"&Phi;","Π":"&Pi;","±":"&pm;","ℙ":"&primes;","⪻":"&Pr;","≺":"&prec;","⪯":"&preceq;","≼":"&preccurlyeq;","≾":"&prsim;","″":"&Prime;","∏":"&prod;","∝":"&vprop;","𝒫":"&Pscr;","Ψ":"&Psi;",'"':"&quot;","𝔔":"&Qfr;","ℚ":"&rationals;","𝒬":"&Qscr;","⤐":"&drbkarow;","®":"&reg;","Ŕ":"&Racute;","⟫":"&Rang;","↠":"&twoheadrightarrow;","⤖":"&Rarrtl;","Ř":"&Rcaron;","Ŗ":"&Rcedil;","Р":"&Rcy;","ℜ":"&realpart;","∋":"&niv;","⇋":"&lrhar;","⥯":"&duhar;","Ρ":"&Rho;","⟩":"&rangle;","→":"&srarr;","⇥":"&rarrb;","⇄":"&rlarr;","⌉":"&rceil;","⟧":"&robrk;","⥝":"&RightDownTeeVector;","⇂":"&downharpoonright;","⥕":"&RightDownVectorBar;","⌋":"&rfloor;","⊢":"&vdash;","↦":"&mapsto;","⥛":"&RightTeeVector;","⊳":"&vrtri;","⧐":"&RightTriangleBar;","⊵":"&trianglerighteq;","⥏":"&RightUpDownVector;","⥜":"&RightUpTeeVector;","↾":"&upharpoonright;","⥔":"&RightUpVectorBar;","⇀":"&rightharpoonup;","⥓":"&RightVectorBar;","ℝ":"&reals;","⥰":"&RoundImplies;","⇛":"&rAarr;","ℛ":"&realine;","↱":"&rsh;","⧴":"&RuleDelayed;","Щ":"&SHCHcy;","Ш":"&SHcy;","Ь":"&SOFTcy;","Ś":"&Sacute;","⪼":"&Sc;","Š":"&Scaron;","Ş":"&Scedil;","Ŝ":"&Scirc;","С":"&Scy;","𝔖":"&Sfr;","↑":"&uparrow;","Σ":"&Sigma;","∘":"&compfn;","𝕊":"&Sopf;","√":"&radic;","□":"&square;","⊓":"&sqcap;","⊏":"&sqsubset;","⊑":"&sqsubseteq;","⊐":"&sqsupset;","⊒":"&sqsupseteq;","⊔":"&sqcup;","𝒮":"&Sscr;","⋆":"&sstarf;","⋐":"&Subset;","⊆":"&subseteq;","≻":"&succ;","⪰":"&succeq;","≽":"&succcurlyeq;","≿":"&succsim;","∑":"&sum;","⋑":"&Supset;","⊃":"&supset;","⊇":"&supseteq;","Þ":"&THORN;","™":"&trade;","Ћ":"&TSHcy;","Ц":"&TScy;","\t":"&Tab;","Τ":"&Tau;","Ť":"&Tcaron;","Ţ":"&Tcedil;","Т":"&Tcy;","𝔗":"&Tfr;","∴":"&therefore;","Θ":"&Theta;","  ":"&ThickSpace;"," ":"&thinsp;","∼":"&thksim;","≃":"&simeq;","≅":"&cong;","≈":"&thkap;","𝕋":"&Topf;","⃛":"&tdot;","𝒯":"&Tscr;","Ŧ":"&Tstrok;","Ú":"&Uacute;","↟":"&Uarr;","⥉":"&Uarrocir;","Ў":"&Ubrcy;","Ŭ":"&Ubreve;","Û":"&Ucirc;","У":"&Ucy;","Ű":"&Udblac;","𝔘":"&Ufr;","Ù":"&Ugrave;","Ū":"&Umacr;",_:"&lowbar;","⏟":"&UnderBrace;","⎵":"&bbrk;","⏝":"&UnderParenthesis;","⋃":"&xcup;","⊎":"&uplus;","Ų":"&Uogon;","𝕌":"&Uopf;","⤒":"&UpArrowBar;","⇅":"&udarr;","↕":"&varr;","⥮":"&udhar;","⊥":"&perp;","↥":"&mapstoup;","↖":"&nwarrow;","↗":"&nearrow;","ϒ":"&upsih;","Υ":"&Upsilon;","Ů":"&Uring;","𝒰":"&Uscr;","Ũ":"&Utilde;","Ü":"&Uuml;","⊫":"&VDash;","⫫":"&Vbar;","В":"&Vcy;","⊩":"&Vdash;","⫦":"&Vdashl;","⋁":"&xvee;","‖":"&Vert;","∣":"&smid;","|":"&vert;","❘":"&VerticalSeparator;","≀":"&wreath;"," ":"&hairsp;","𝔙":"&Vfr;","𝕍":"&Vopf;","𝒱":"&Vscr;","⊪":"&Vvdash;","Ŵ":"&Wcirc;","⋀":"&xwedge;","𝔚":"&Wfr;","𝕎":"&Wopf;","𝒲":"&Wscr;","𝔛":"&Xfr;","Ξ":"&Xi;","𝕏":"&Xopf;","𝒳":"&Xscr;","Я":"&YAcy;","Ї":"&YIcy;","Ю":"&YUcy;","Ý":"&Yacute;","Ŷ":"&Ycirc;","Ы":"&Ycy;","𝔜":"&Yfr;","𝕐":"&Yopf;","𝒴":"&Yscr;","Ÿ":"&Yuml;","Ж":"&ZHcy;","Ź":"&Zacute;","Ž":"&Zcaron;","З":"&Zcy;","Ż":"&Zdot;","Ζ":"&Zeta;","ℨ":"&zeetrf;","ℤ":"&integers;","𝒵":"&Zscr;","á":"&aacute;","ă":"&abreve;","∾":"&mstpos;","∾̳":"&acE;","∿":"&acd;","â":"&acirc;","а":"&acy;","æ":"&aelig;","𝔞":"&afr;","à":"&agrave;","ℵ":"&aleph;","α":"&alpha;","ā":"&amacr;","⨿":"&amalg;","∧":"&wedge;","⩕":"&andand;","⩜":"&andd;","⩘":"&andslope;","⩚":"&andv;","∠":"&angle;","⦤":"&ange;","∡":"&measuredangle;","⦨":"&angmsdaa;","⦩":"&angmsdab;","⦪":"&angmsdac;","⦫":"&angmsdad;","⦬":"&angmsdae;","⦭":"&angmsdaf;","⦮":"&angmsdag;","⦯":"&angmsdah;","∟":"&angrt;","⊾":"&angrtvb;","⦝":"&angrtvbd;","∢":"&angsph;","⍼":"&angzarr;","ą":"&aogon;","𝕒":"&aopf;","⩰":"&apE;","⩯":"&apacir;","≊":"&approxeq;","≋":"&apid;","'":"&apos;","å":"&aring;","𝒶":"&ascr;","*":"&midast;","ã":"&atilde;","ä":"&auml;","⨑":"&awint;","⫭":"&bNot;","≌":"&bcong;","϶":"&bepsi;","‵":"&bprime;","∽":"&bsim;","⋍":"&bsime;","⊽":"&barvee;","⌅":"&barwedge;","⎶":"&bbrktbrk;","б":"&bcy;","„":"&ldquor;","⦰":"&bemptyv;","β":"&beta;","ℶ":"&beth;","≬":"&twixt;","𝔟":"&bfr;","◯":"&xcirc;","⨀":"&xodot;","⨁":"&xoplus;","⨂":"&xotime;","⨆":"&xsqcup;","★":"&starf;","▽":"&xdtri;","△":"&xutri;","⨄":"&xuplus;","⤍":"&rbarr;","⧫":"&lozf;","▴":"&utrif;","▾":"&dtrif;","◂":"&ltrif;","▸":"&rtrif;","␣":"&blank;","▒":"&blk12;","░":"&blk14;","▓":"&blk34;","█":"&block;","=⃥":"&bne;","≡⃥":"&bnequiv;","⌐":"&bnot;","𝕓":"&bopf;","⋈":"&bowtie;","╗":"&boxDL;","╔":"&boxDR;","╖":"&boxDl;","╓":"&boxDr;","═":"&boxH;","╦":"&boxHD;","╩":"&boxHU;","╤":"&boxHd;","╧":"&boxHu;","╝":"&boxUL;","╚":"&boxUR;","╜":"&boxUl;","╙":"&boxUr;","║":"&boxV;","╬":"&boxVH;","╣":"&boxVL;","╠":"&boxVR;","╫":"&boxVh;","╢":"&boxVl;","╟":"&boxVr;","⧉":"&boxbox;","╕":"&boxdL;","╒":"&boxdR;","┐":"&boxdl;","┌":"&boxdr;","╥":"&boxhD;","╨":"&boxhU;","┬":"&boxhd;","┴":"&boxhu;","⊟":"&minusb;","⊞":"&plusb;","⊠":"&timesb;","╛":"&boxuL;","╘":"&boxuR;","┘":"&boxul;","└":"&boxur;","│":"&boxv;","╪":"&boxvH;","╡":"&boxvL;","╞":"&boxvR;","┼":"&boxvh;","┤":"&boxvl;","├":"&boxvr;","¦":"&brvbar;","𝒷":"&bscr;","⁏":"&bsemi;","\\":"&bsol;","⧅":"&bsolb;","⟈":"&bsolhsub;","•":"&bullet;","⪮":"&bumpE;","ć":"&cacute;","∩":"&cap;","⩄":"&capand;","⩉":"&capbrcup;","⩋":"&capcap;","⩇":"&capcup;","⩀":"&capdot;","∩︀":"&caps;","⁁":"&caret;","⩍":"&ccaps;","č":"&ccaron;","ç":"&ccedil;","ĉ":"&ccirc;","⩌":"&ccups;","⩐":"&ccupssm;","ċ":"&cdot;","⦲":"&cemptyv;","¢":"&cent;","𝔠":"&cfr;","ч":"&chcy;","✓":"&checkmark;","χ":"&chi;","○":"&cir;","⧃":"&cirE;","ˆ":"&circ;","≗":"&cire;","↺":"&olarr;","↻":"&orarr;","Ⓢ":"&oS;","⊛":"&oast;","⊚":"&ocir;","⊝":"&odash;","⨐":"&cirfnint;","⫯":"&cirmid;","⧂":"&cirscir;","♣":"&clubsuit;",":":"&colon;",",":"&comma;","@":"&commat;","∁":"&complement;","⩭":"&congdot;","𝕔":"&copf;","℗":"&copysr;","↵":"&crarr;","✗":"&cross;","𝒸":"&cscr;","⫏":"&csub;","⫑":"&csube;","⫐":"&csup;","⫒":"&csupe;","⋯":"&ctdot;","⤸":"&cudarrl;","⤵":"&cudarrr;","⋞":"&curlyeqprec;","⋟":"&curlyeqsucc;","↶":"&curvearrowleft;","⤽":"&cularrp;","∪":"&cup;","⩈":"&cupbrcap;","⩆":"&cupcap;","⩊":"&cupcup;","⊍":"&cupdot;","⩅":"&cupor;","∪︀":"&cups;","↷":"&curvearrowright;","⤼":"&curarrm;","⋎":"&cuvee;","⋏":"&cuwed;","¤":"&curren;","∱":"&cwint;","⌭":"&cylcty;","⥥":"&dHar;","†":"&dagger;","ℸ":"&daleth;","‐":"&hyphen;","⤏":"&rBarr;","ď":"&dcaron;","д":"&dcy;","⇊":"&downdownarrows;","⩷":"&eDDot;","°":"&deg;","δ":"&delta;","⦱":"&demptyv;","⥿":"&dfisht;","𝔡":"&dfr;","♦":"&diams;","ϝ":"&gammad;","⋲":"&disin;","÷":"&divide;","⋇":"&divonx;","ђ":"&djcy;","⌞":"&llcorner;","⌍":"&dlcrop;",$:"&dollar;","𝕕":"&dopf;","≑":"&eDot;","∸":"&minusd;","∔":"&plusdo;","⊡":"&sdotb;","⌟":"&lrcorner;","⌌":"&drcrop;","𝒹":"&dscr;","ѕ":"&dscy;","⧶":"&dsol;","đ":"&dstrok;","⋱":"&dtdot;","▿":"&triangledown;","⦦":"&dwangle;","џ":"&dzcy;","⟿":"&dzigrarr;","é":"&eacute;","⩮":"&easter;","ě":"&ecaron;","≖":"&eqcirc;","ê":"&ecirc;","≕":"&eqcolon;","э":"&ecy;","ė":"&edot;","≒":"&fallingdotseq;","𝔢":"&efr;","⪚":"&eg;","è":"&egrave;","⪖":"&eqslantgtr;","⪘":"&egsdot;","⪙":"&el;","⏧":"&elinters;","ℓ":"&ell;","⪕":"&eqslantless;","⪗":"&elsdot;","ē":"&emacr;","∅":"&varnothing;"," ":"&emsp13;"," ":"&emsp14;"," ":"&emsp;","ŋ":"&eng;"," ":"&ensp;","ę":"&eogon;","𝕖":"&eopf;","⋕":"&epar;","⧣":"&eparsl;","⩱":"&eplus;","ε":"&epsilon;","ϵ":"&varepsilon;","=":"&equals;","≟":"&questeq;","⩸":"&equivDD;","⧥":"&eqvparsl;","≓":"&risingdotseq;","⥱":"&erarr;","ℯ":"&escr;","η":"&eta;","ð":"&eth;","ë":"&euml;","€":"&euro;","!":"&excl;","ф":"&fcy;","♀":"&female;","ﬃ":"&ffilig;","ﬀ":"&fflig;","ﬄ":"&ffllig;","𝔣":"&ffr;","ﬁ":"&filig;",fj:"&fjlig;","♭":"&flat;","ﬂ":"&fllig;","▱":"&fltns;","ƒ":"&fnof;","𝕗":"&fopf;","⋔":"&pitchfork;","⫙":"&forkv;","⨍":"&fpartint;","½":"&half;","⅓":"&frac13;","¼":"&frac14;","⅕":"&frac15;","⅙":"&frac16;","⅛":"&frac18;","⅔":"&frac23;","⅖":"&frac25;","¾":"&frac34;","⅗":"&frac35;","⅜":"&frac38;","⅘":"&frac45;","⅚":"&frac56;","⅝":"&frac58;","⅞":"&frac78;","⁄":"&frasl;","⌢":"&sfrown;","𝒻":"&fscr;","⪌":"&gtreqqless;","ǵ":"&gacute;","γ":"&gamma;","⪆":"&gtrapprox;","ğ":"&gbreve;","ĝ":"&gcirc;","г":"&gcy;","ġ":"&gdot;","⪩":"&gescc;","⪀":"&gesdot;","⪂":"&gesdoto;","⪄":"&gesdotol;","⋛︀":"&gesl;","⪔":"&gesles;","𝔤":"&gfr;","ℷ":"&gimel;","ѓ":"&gjcy;","⪒":"&glE;","⪥":"&gla;","⪤":"&glj;","≩":"&gneqq;","⪊":"&gnapprox;","⪈":"&gneq;","⋧":"&gnsim;","𝕘":"&gopf;","ℊ":"&gscr;","⪎":"&gsime;","⪐":"&gsiml;","⪧":"&gtcc;","⩺":"&gtcir;","⋗":"&gtrdot;","⦕":"&gtlPar;","⩼":"&gtquest;","⥸":"&gtrarr;","≩︀":"&gvnE;","ъ":"&hardcy;","⥈":"&harrcir;","↭":"&leftrightsquigarrow;","ℏ":"&plankv;","ĥ":"&hcirc;","♥":"&heartsuit;","…":"&mldr;","⊹":"&hercon;","𝔥":"&hfr;","⤥":"&searhk;","⤦":"&swarhk;","⇿":"&hoarr;","∻":"&homtht;","↩":"&larrhk;","↪":"&rarrhk;","𝕙":"&hopf;","―":"&horbar;","𝒽":"&hscr;","ħ":"&hstrok;","⁃":"&hybull;","í":"&iacute;","î":"&icirc;","и":"&icy;","е":"&iecy;","¡":"&iexcl;","𝔦":"&ifr;","ì":"&igrave;","⨌":"&qint;","∭":"&tint;","⧜":"&iinfin;","℩":"&iiota;","ĳ":"&ijlig;","ī":"&imacr;","ı":"&inodot;","⊷":"&imof;","Ƶ":"&imped;","℅":"&incare;","∞":"&infin;","⧝":"&infintie;","⊺":"&intercal;","⨗":"&intlarhk;","⨼":"&iprod;","ё":"&iocy;","į":"&iogon;","𝕚":"&iopf;","ι":"&iota;","¿":"&iquest;","𝒾":"&iscr;","⋹":"&isinE;","⋵":"&isindot;","⋴":"&isins;","⋳":"&isinsv;","ĩ":"&itilde;","і":"&iukcy;","ï":"&iuml;","ĵ":"&jcirc;","й":"&jcy;","𝔧":"&jfr;","ȷ":"&jmath;","𝕛":"&jopf;","𝒿":"&jscr;","ј":"&jsercy;","є":"&jukcy;","κ":"&kappa;","ϰ":"&varkappa;","ķ":"&kcedil;","к":"&kcy;","𝔨":"&kfr;","ĸ":"&kgreen;","х":"&khcy;","ќ":"&kjcy;","𝕜":"&kopf;","𝓀":"&kscr;","⤛":"&lAtail;","⤎":"&lBarr;","⪋":"&lesseqqgtr;","⥢":"&lHar;","ĺ":"&lacute;","⦴":"&laemptyv;","λ":"&lambda;","⦑":"&langd;","⪅":"&lessapprox;","«":"&laquo;","⤟":"&larrbfs;","⤝":"&larrfs;","↫":"&looparrowleft;","⤹":"&larrpl;","⥳":"&larrsim;","↢":"&leftarrowtail;","⪫":"&lat;","⤙":"&latail;","⪭":"&late;","⪭︀":"&lates;","⤌":"&lbarr;","❲":"&lbbrk;","{":"&lcub;","[":"&lsqb;","⦋":"&lbrke;","⦏":"&lbrksld;","⦍":"&lbrkslu;","ľ":"&lcaron;","ļ":"&lcedil;","л":"&lcy;","⤶":"&ldca;","⥧":"&ldrdhar;","⥋":"&ldrushar;","↲":"&ldsh;","≤":"&leq;","⇇":"&llarr;","⋋":"&lthree;","⪨":"&lescc;","⩿":"&lesdot;","⪁":"&lesdoto;","⪃":"&lesdotor;","⋚︀":"&lesg;","⪓":"&lesges;","⋖":"&ltdot;","⥼":"&lfisht;","𝔩":"&lfr;","⪑":"&lgE;","⥪":"&lharul;","▄":"&lhblk;","љ":"&ljcy;","⥫":"&llhard;","◺":"&lltri;","ŀ":"&lmidot;","⎰":"&lmoustache;","≨":"&lneqq;","⪉":"&lnapprox;","⪇":"&lneq;","⋦":"&lnsim;","⟬":"&loang;","⇽":"&loarr;","⟼":"&xmap;","↬":"&rarrlp;","⦅":"&lopar;","𝕝":"&lopf;","⨭":"&loplus;","⨴":"&lotimes;","∗":"&lowast;","◊":"&lozenge;","(":"&lpar;","⦓":"&lparlt;","⥭":"&lrhard;","‎":"&lrm;","⊿":"&lrtri;","‹":"&lsaquo;","𝓁":"&lscr;","⪍":"&lsime;","⪏":"&lsimg;","‚":"&sbquo;","ł":"&lstrok;","⪦":"&ltcc;","⩹":"&ltcir;","⋉":"&ltimes;","⥶":"&ltlarr;","⩻":"&ltquest;","⦖":"&ltrPar;","◃":"&triangleleft;","⥊":"&lurdshar;","⥦":"&luruhar;","≨︀":"&lvnE;","∺":"&mDDot;","¯":"&strns;","♂":"&male;","✠":"&maltese;","▮":"&marker;","⨩":"&mcomma;","м":"&mcy;","—":"&mdash;","𝔪":"&mfr;","℧":"&mho;","µ":"&micro;","⫰":"&midcir;","−":"&minus;","⨪":"&minusdu;","⫛":"&mlcp;","⊧":"&models;","𝕞":"&mopf;","𝓂":"&mscr;","μ":"&mu;","⊸":"&mumap;","⋙̸":"&nGg;","≫⃒":"&nGt;","⇍":"&nlArr;","⇎":"&nhArr;","⋘̸":"&nLl;","≪⃒":"&nLt;","⇏":"&nrArr;","⊯":"&nVDash;","⊮":"&nVdash;","ń":"&nacute;","∠⃒":"&nang;","⩰̸":"&napE;","≋̸":"&napid;","ŉ":"&napos;","♮":"&natural;","⩃":"&ncap;","ň":"&ncaron;","ņ":"&ncedil;","⩭̸":"&ncongdot;","⩂":"&ncup;","н":"&ncy;","–":"&ndash;","⇗":"&neArr;","⤤":"&nearhk;","≐̸":"&nedot;","⤨":"&toea;","𝔫":"&nfr;","↮":"&nleftrightarrow;","⫲":"&nhpar;","⋼":"&nis;","⋺":"&nisd;","њ":"&njcy;","≦̸":"&nleqq;","↚":"&nleftarrow;","‥":"&nldr;","𝕟":"&nopf;","¬":"&not;","⋹̸":"&notinE;","⋵̸":"&notindot;","⋷":"&notinvb;","⋶":"&notinvc;","⋾":"&notnivb;","⋽":"&notnivc;","⫽⃥":"&nparsl;","∂̸":"&npart;","⨔":"&npolint;","↛":"&nrightarrow;","⤳̸":"&nrarrc;","↝̸":"&nrarrw;","𝓃":"&nscr;","⊄":"&nsub;","⫅̸":"&nsubseteqq;","⊅":"&nsup;","⫆̸":"&nsupseteqq;","ñ":"&ntilde;","ν":"&nu;","#":"&num;","№":"&numero;"," ":"&numsp;","⊭":"&nvDash;","⤄":"&nvHarr;","≍⃒":"&nvap;","⊬":"&nvdash;","≥⃒":"&nvge;",">⃒":"&nvgt;","⧞":"&nvinfin;","⤂":"&nvlArr;","≤⃒":"&nvle;","<⃒":"&nvlt;","⊴⃒":"&nvltrie;","⤃":"&nvrArr;","⊵⃒":"&nvrtrie;","∼⃒":"&nvsim;","⇖":"&nwArr;","⤣":"&nwarhk;","⤧":"&nwnear;","ó":"&oacute;","ô":"&ocirc;","о":"&ocy;","ő":"&odblac;","⨸":"&odiv;","⦼":"&odsold;","œ":"&oelig;","⦿":"&ofcir;","𝔬":"&ofr;","˛":"&ogon;","ò":"&ograve;","⧁":"&ogt;","⦵":"&ohbar;","⦾":"&olcir;","⦻":"&olcross;","⧀":"&olt;","ō":"&omacr;","ω":"&omega;","ο":"&omicron;","⦶":"&omid;","𝕠":"&oopf;","⦷":"&opar;","⦹":"&operp;","∨":"&vee;","⩝":"&ord;","ℴ":"&oscr;","ª":"&ordf;","º":"&ordm;","⊶":"&origof;","⩖":"&oror;","⩗":"&orslope;","⩛":"&orv;","ø":"&oslash;","⊘":"&osol;","õ":"&otilde;","⨶":"&otimesas;","ö":"&ouml;","⌽":"&ovbar;","¶":"&para;","⫳":"&parsim;","⫽":"&parsl;","п":"&pcy;","%":"&percnt;",".":"&period;","‰":"&permil;","‱":"&pertenk;","𝔭":"&pfr;","φ":"&phi;","ϕ":"&varphi;","☎":"&phone;","π":"&pi;","ϖ":"&varpi;","ℎ":"&planckh;","+":"&plus;","⨣":"&plusacir;","⨢":"&pluscir;","⨥":"&plusdu;","⩲":"&pluse;","⨦":"&plussim;","⨧":"&plustwo;","⨕":"&pointint;","𝕡":"&popf;","£":"&pound;","⪳":"&prE;","⪷":"&precapprox;","⪹":"&prnap;","⪵":"&prnE;","⋨":"&prnsim;","′":"&prime;","⌮":"&profalar;","⌒":"&profline;","⌓":"&profsurf;","⊰":"&prurel;","𝓅":"&pscr;","ψ":"&psi;"," ":"&puncsp;","𝔮":"&qfr;","𝕢":"&qopf;","⁗":"&qprime;","𝓆":"&qscr;","⨖":"&quatint;","?":"&quest;","⤜":"&rAtail;","⥤":"&rHar;","∽̱":"&race;","ŕ":"&racute;","⦳":"&raemptyv;","⦒":"&rangd;","⦥":"&range;","»":"&raquo;","⥵":"&rarrap;","⤠":"&rarrbfs;","⤳":"&rarrc;","⤞":"&rarrfs;","⥅":"&rarrpl;","⥴":"&rarrsim;","↣":"&rightarrowtail;","↝":"&rightsquigarrow;","⤚":"&ratail;","∶":"&ratio;","❳":"&rbbrk;","}":"&rcub;","]":"&rsqb;","⦌":"&rbrke;","⦎":"&rbrksld;","⦐":"&rbrkslu;","ř":"&rcaron;","ŗ":"&rcedil;","р":"&rcy;","⤷":"&rdca;","⥩":"&rdldhar;","↳":"&rdsh;","▭":"&rect;","⥽":"&rfisht;","𝔯":"&rfr;","⥬":"&rharul;","ρ":"&rho;","ϱ":"&varrho;","⇉":"&rrarr;","⋌":"&rthree;","˚":"&ring;","‏":"&rlm;","⎱":"&rmoustache;","⫮":"&rnmid;","⟭":"&roang;","⇾":"&roarr;","⦆":"&ropar;","𝕣":"&ropf;","⨮":"&roplus;","⨵":"&rotimes;",")":"&rpar;","⦔":"&rpargt;","⨒":"&rppolint;","›":"&rsaquo;","𝓇":"&rscr;","⋊":"&rtimes;","▹":"&triangleright;","⧎":"&rtriltri;","⥨":"&ruluhar;","℞":"&rx;","ś":"&sacute;","⪴":"&scE;","⪸":"&succapprox;","š":"&scaron;","ş":"&scedil;","ŝ":"&scirc;","⪶":"&succneqq;","⪺":"&succnapprox;","⋩":"&succnsim;","⨓":"&scpolint;","с":"&scy;","⋅":"&sdot;","⩦":"&sdote;","⇘":"&seArr;","§":"&sect;",";":"&semi;","⤩":"&tosa;","✶":"&sext;","𝔰":"&sfr;","♯":"&sharp;","щ":"&shchcy;","ш":"&shcy;","­":"&shy;","σ":"&sigma;","ς":"&varsigma;","⩪":"&simdot;","⪞":"&simg;","⪠":"&simgE;","⪝":"&siml;","⪟":"&simlE;","≆":"&simne;","⨤":"&simplus;","⥲":"&simrarr;","⨳":"&smashp;","⧤":"&smeparsl;","⌣":"&ssmile;","⪪":"&smt;","⪬":"&smte;","⪬︀":"&smtes;","ь":"&softcy;","/":"&sol;","⧄":"&solb;","⌿":"&solbar;","𝕤":"&sopf;","♠":"&spadesuit;","⊓︀":"&sqcaps;","⊔︀":"&sqcups;","𝓈":"&sscr;","☆":"&star;","⊂":"&subset;","⫅":"&subseteqq;","⪽":"&subdot;","⫃":"&subedot;","⫁":"&submult;","⫋":"&subsetneqq;","⊊":"&subsetneq;","⪿":"&subplus;","⥹":"&subrarr;","⫇":"&subsim;","⫕":"&subsub;","⫓":"&subsup;","♪":"&sung;","¹":"&sup1;","²":"&sup2;","³":"&sup3;","⫆":"&supseteqq;","⪾":"&supdot;","⫘":"&supdsub;","⫄":"&supedot;","⟉":"&suphsol;","⫗":"&suphsub;","⥻":"&suplarr;","⫂":"&supmult;","⫌":"&supsetneqq;","⊋":"&supsetneq;","⫀":"&supplus;","⫈":"&supsim;","⫔":"&supsub;","⫖":"&supsup;","⇙":"&swArr;","⤪":"&swnwar;","ß":"&szlig;","⌖":"&target;","τ":"&tau;","ť":"&tcaron;","ţ":"&tcedil;","т":"&tcy;","⌕":"&telrec;","𝔱":"&tfr;","θ":"&theta;","ϑ":"&vartheta;","þ":"&thorn;","×":"&times;","⨱":"&timesbar;","⨰":"&timesd;","⌶":"&topbot;","⫱":"&topcir;","𝕥":"&topf;","⫚":"&topfork;","‴":"&tprime;","▵":"&utri;","≜":"&trie;","◬":"&tridot;","⨺":"&triminus;","⨹":"&triplus;","⧍":"&trisb;","⨻":"&tritime;","⏢":"&trpezium;","𝓉":"&tscr;","ц":"&tscy;","ћ":"&tshcy;","ŧ":"&tstrok;","⥣":"&uHar;","ú":"&uacute;","ў":"&ubrcy;","ŭ":"&ubreve;","û":"&ucirc;","у":"&ucy;","ű":"&udblac;","⥾":"&ufisht;","𝔲":"&ufr;","ù":"&ugrave;","▀":"&uhblk;","⌜":"&ulcorner;","⌏":"&ulcrop;","◸":"&ultri;","ū":"&umacr;","ų":"&uogon;","𝕦":"&uopf;","υ":"&upsilon;","⇈":"&uuarr;","⌝":"&urcorner;","⌎":"&urcrop;","ů":"&uring;","◹":"&urtri;","𝓊":"&uscr;","⋰":"&utdot;","ũ":"&utilde;","ü":"&uuml;","⦧":"&uwangle;","⫨":"&vBar;","⫩":"&vBarv;","⦜":"&vangrt;","⊊︀":"&vsubne;","⫋︀":"&vsubnE;","⊋︀":"&vsupne;","⫌︀":"&vsupnE;","в":"&vcy;","⊻":"&veebar;","≚":"&veeeq;","⋮":"&vellip;","𝔳":"&vfr;","𝕧":"&vopf;","𝓋":"&vscr;","⦚":"&vzigzag;","ŵ":"&wcirc;","⩟":"&wedbar;","≙":"&wedgeq;","℘":"&wp;","𝔴":"&wfr;","𝕨":"&wopf;","𝓌":"&wscr;","𝔵":"&xfr;","ξ":"&xi;","⋻":"&xnis;","𝕩":"&xopf;","𝓍":"&xscr;","ý":"&yacute;","я":"&yacy;","ŷ":"&ycirc;","ы":"&ycy;","¥":"&yen;","𝔶":"&yfr;","ї":"&yicy;","𝕪":"&yopf;","𝓎":"&yscr;","ю":"&yucy;","ÿ":"&yuml;","ź":"&zacute;","ž":"&zcaron;","з":"&zcy;","ż":"&zdot;","ζ":"&zeta;","𝔷":"&zfr;","ж":"&zhcy;","⇝":"&zigrarr;","𝕫":"&zopf;","𝓏":"&zscr;","‍":"&zwj;","‌":"&zwnj;"}}};

/***/ }),

/***/ "./node_modules/html-entities/lib/numeric-unicode-map.js":
/*!***************************************************************!*\
  !*** ./node_modules/html-entities/lib/numeric-unicode-map.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.numericUnicodeMap={0:65533,128:8364,130:8218,131:402,132:8222,133:8230,134:8224,135:8225,136:710,137:8240,138:352,139:8249,140:338,142:381,145:8216,146:8217,147:8220,148:8221,149:8226,150:8211,151:8212,152:732,153:8482,154:353,155:8250,156:339,158:382,159:376};

/***/ }),

/***/ "./node_modules/html-entities/lib/surrogate-pairs.js":
/*!***********************************************************!*\
  !*** ./node_modules/html-entities/lib/surrogate-pairs.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.fromCodePoint=String.fromCodePoint||function(astralCodePoint){return String.fromCharCode(Math.floor((astralCodePoint-65536)/1024)+55296,(astralCodePoint-65536)%1024+56320)};exports.getCodePoint=String.prototype.codePointAt?function(input,position){return input.codePointAt(position)}:function(input,position){return(input.charCodeAt(position)-55296)*1024+input.charCodeAt(position+1)-56320+65536};exports.highSurrogateFrom=55296;exports.highSurrogateTo=56319;

/***/ }),

/***/ "./node_modules/webpack-dev-server/client/clients/WebSocketClient.js":
/*!***************************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/clients/WebSocketClient.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ WebSocketClient)
/* harmony export */ });
/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/log.js */ "./node_modules/webpack-dev-server/client/utils/log.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }

var WebSocketClient = /*#__PURE__*/function () {
  /**
   * @param {string} url
   */
  function WebSocketClient(url) {
    _classCallCheck(this, WebSocketClient);
    this.client = new WebSocket(url);
    this.client.onerror = function (error) {
      _utils_log_js__WEBPACK_IMPORTED_MODULE_0__.log.error(error);
    };
  }

  /**
   * @param {(...args: any[]) => void} f
   */
  _createClass(WebSocketClient, [{
    key: "onOpen",
    value: function onOpen(f) {
      this.client.onopen = f;
    }

    /**
     * @param {(...args: any[]) => void} f
     */
  }, {
    key: "onClose",
    value: function onClose(f) {
      this.client.onclose = f;
    }

    // call f with the message string as the first argument
    /**
     * @param {(...args: any[]) => void} f
     */
  }, {
    key: "onMessage",
    value: function onMessage(f) {
      this.client.onmessage = function (e) {
        f(e.data);
      };
    }
  }]);
  return WebSocketClient;
}();


/***/ }),

/***/ "./node_modules/webpack-dev-server/client/modules/logger/index.js":
/*!************************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/modules/logger/index.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./client-src/modules/logger/SyncBailHookFake.js":
/*!*******************************************************!*\
  !*** ./client-src/modules/logger/SyncBailHookFake.js ***!
  \*******************************************************/
/***/ (function(module) {



/**
 * Client stub for tapable SyncBailHook
 */
module.exports = function clientTapableSyncBailHook() {
  return {
    call: function call() {}
  };
};

/***/ }),

/***/ "./node_modules/webpack/lib/logging/Logger.js":
/*!****************************************************!*\
  !*** ./node_modules/webpack/lib/logging/Logger.js ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/



function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _iterableToArray(iter) {
  if (typeof (typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }) !== "undefined" && iter[(typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }).iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[(typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }).toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
var LogType = Object.freeze({
  error: /** @type {"error"} */"error",
  // message, c style arguments
  warn: /** @type {"warn"} */"warn",
  // message, c style arguments
  info: /** @type {"info"} */"info",
  // message, c style arguments
  log: /** @type {"log"} */"log",
  // message, c style arguments
  debug: /** @type {"debug"} */"debug",
  // message, c style arguments

  trace: /** @type {"trace"} */"trace",
  // no arguments

  group: /** @type {"group"} */"group",
  // [label]
  groupCollapsed: /** @type {"groupCollapsed"} */"groupCollapsed",
  // [label]
  groupEnd: /** @type {"groupEnd"} */"groupEnd",
  // [label]

  profile: /** @type {"profile"} */"profile",
  // [profileName]
  profileEnd: /** @type {"profileEnd"} */"profileEnd",
  // [profileName]

  time: /** @type {"time"} */"time",
  // name, time as [seconds, nanoseconds]

  clear: /** @type {"clear"} */"clear",
  // no arguments
  status: /** @type {"status"} */"status" // message, arguments
});

exports.LogType = LogType;

/** @typedef {typeof LogType[keyof typeof LogType]} LogTypeEnum */

var LOG_SYMBOL = (typeof Symbol !== "undefined" ? Symbol : function (i) { return i; })("webpack logger raw log method");
var TIMERS_SYMBOL = (typeof Symbol !== "undefined" ? Symbol : function (i) { return i; })("webpack logger times");
var TIMERS_AGGREGATES_SYMBOL = (typeof Symbol !== "undefined" ? Symbol : function (i) { return i; })("webpack logger aggregated times");
var WebpackLogger = /*#__PURE__*/function () {
  /**
   * @param {function(LogTypeEnum, any[]=): void} log log function
   * @param {function(string | function(): string): WebpackLogger} getChildLogger function to create child logger
   */
  function WebpackLogger(log, getChildLogger) {
    _classCallCheck(this, WebpackLogger);
    this[LOG_SYMBOL] = log;
    this.getChildLogger = getChildLogger;
  }
  _createClass(WebpackLogger, [{
    key: "error",
    value: function error() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      this[LOG_SYMBOL](LogType.error, args);
    }
  }, {
    key: "warn",
    value: function warn() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      this[LOG_SYMBOL](LogType.warn, args);
    }
  }, {
    key: "info",
    value: function info() {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      this[LOG_SYMBOL](LogType.info, args);
    }
  }, {
    key: "log",
    value: function log() {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }
      this[LOG_SYMBOL](LogType.log, args);
    }
  }, {
    key: "debug",
    value: function debug() {
      for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }
      this[LOG_SYMBOL](LogType.debug, args);
    }
  }, {
    key: "assert",
    value: function assert(assertion) {
      if (!assertion) {
        for (var _len6 = arguments.length, args = new Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
          args[_key6 - 1] = arguments[_key6];
        }
        this[LOG_SYMBOL](LogType.error, args);
      }
    }
  }, {
    key: "trace",
    value: function trace() {
      this[LOG_SYMBOL](LogType.trace, ["Trace"]);
    }
  }, {
    key: "clear",
    value: function clear() {
      this[LOG_SYMBOL](LogType.clear);
    }
  }, {
    key: "status",
    value: function status() {
      for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
      }
      this[LOG_SYMBOL](LogType.status, args);
    }
  }, {
    key: "group",
    value: function group() {
      for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        args[_key8] = arguments[_key8];
      }
      this[LOG_SYMBOL](LogType.group, args);
    }
  }, {
    key: "groupCollapsed",
    value: function groupCollapsed() {
      for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
        args[_key9] = arguments[_key9];
      }
      this[LOG_SYMBOL](LogType.groupCollapsed, args);
    }
  }, {
    key: "groupEnd",
    value: function groupEnd() {
      for (var _len10 = arguments.length, args = new Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
        args[_key10] = arguments[_key10];
      }
      this[LOG_SYMBOL](LogType.groupEnd, args);
    }
  }, {
    key: "profile",
    value: function profile(label) {
      this[LOG_SYMBOL](LogType.profile, [label]);
    }
  }, {
    key: "profileEnd",
    value: function profileEnd(label) {
      this[LOG_SYMBOL](LogType.profileEnd, [label]);
    }
  }, {
    key: "time",
    value: function time(label) {
      this[TIMERS_SYMBOL] = this[TIMERS_SYMBOL] || new Map();
      this[TIMERS_SYMBOL].set(label, process.hrtime());
    }
  }, {
    key: "timeLog",
    value: function timeLog(label) {
      var prev = this[TIMERS_SYMBOL] && this[TIMERS_SYMBOL].get(label);
      if (!prev) {
        throw new Error("No such label '".concat(label, "' for WebpackLogger.timeLog()"));
      }
      var time = process.hrtime(prev);
      this[LOG_SYMBOL](LogType.time, [label].concat(_toConsumableArray(time)));
    }
  }, {
    key: "timeEnd",
    value: function timeEnd(label) {
      var prev = this[TIMERS_SYMBOL] && this[TIMERS_SYMBOL].get(label);
      if (!prev) {
        throw new Error("No such label '".concat(label, "' for WebpackLogger.timeEnd()"));
      }
      var time = process.hrtime(prev);
      this[TIMERS_SYMBOL].delete(label);
      this[LOG_SYMBOL](LogType.time, [label].concat(_toConsumableArray(time)));
    }
  }, {
    key: "timeAggregate",
    value: function timeAggregate(label) {
      var prev = this[TIMERS_SYMBOL] && this[TIMERS_SYMBOL].get(label);
      if (!prev) {
        throw new Error("No such label '".concat(label, "' for WebpackLogger.timeAggregate()"));
      }
      var time = process.hrtime(prev);
      this[TIMERS_SYMBOL].delete(label);
      this[TIMERS_AGGREGATES_SYMBOL] = this[TIMERS_AGGREGATES_SYMBOL] || new Map();
      var current = this[TIMERS_AGGREGATES_SYMBOL].get(label);
      if (current !== undefined) {
        if (time[1] + current[1] > 1e9) {
          time[0] += current[0] + 1;
          time[1] = time[1] - 1e9 + current[1];
        } else {
          time[0] += current[0];
          time[1] += current[1];
        }
      }
      this[TIMERS_AGGREGATES_SYMBOL].set(label, time);
    }
  }, {
    key: "timeAggregateEnd",
    value: function timeAggregateEnd(label) {
      if (this[TIMERS_AGGREGATES_SYMBOL] === undefined) return;
      var time = this[TIMERS_AGGREGATES_SYMBOL].get(label);
      if (time === undefined) return;
      this[TIMERS_AGGREGATES_SYMBOL].delete(label);
      this[LOG_SYMBOL](LogType.time, [label].concat(_toConsumableArray(time)));
    }
  }]);
  return WebpackLogger;
}();
exports.Logger = WebpackLogger;

/***/ }),

/***/ "./node_modules/webpack/lib/logging/createConsoleLogger.js":
/*!*****************************************************************!*\
  !*** ./node_modules/webpack/lib/logging/createConsoleLogger.js ***!
  \*****************************************************************/
/***/ (function(module, __unused_webpack_exports, __nested_webpack_require_11285__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/



function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _iterableToArray(iter) {
  if (typeof (typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }) !== "undefined" && iter[(typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }).iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
var _require = __nested_webpack_require_11285__(/*! ./Logger */ "./node_modules/webpack/lib/logging/Logger.js"),
  LogType = _require.LogType;

/** @typedef {import("../../declarations/WebpackOptions").FilterItemTypes} FilterItemTypes */
/** @typedef {import("../../declarations/WebpackOptions").FilterTypes} FilterTypes */
/** @typedef {import("./Logger").LogTypeEnum} LogTypeEnum */

/** @typedef {function(string): boolean} FilterFunction */

/**
 * @typedef {Object} LoggerConsole
 * @property {function(): void} clear
 * @property {function(): void} trace
 * @property {(...args: any[]) => void} info
 * @property {(...args: any[]) => void} log
 * @property {(...args: any[]) => void} warn
 * @property {(...args: any[]) => void} error
 * @property {(...args: any[]) => void=} debug
 * @property {(...args: any[]) => void=} group
 * @property {(...args: any[]) => void=} groupCollapsed
 * @property {(...args: any[]) => void=} groupEnd
 * @property {(...args: any[]) => void=} status
 * @property {(...args: any[]) => void=} profile
 * @property {(...args: any[]) => void=} profileEnd
 * @property {(...args: any[]) => void=} logTime
 */

/**
 * @typedef {Object} LoggerOptions
 * @property {false|true|"none"|"error"|"warn"|"info"|"log"|"verbose"} level loglevel
 * @property {FilterTypes|boolean} debug filter for debug logging
 * @property {LoggerConsole} console the console to log to
 */

/**
 * @param {FilterItemTypes} item an input item
 * @returns {FilterFunction} filter function
 */
var filterToFunction = function filterToFunction(item) {
  if (typeof item === "string") {
    var regExp = new RegExp("[\\\\/]".concat(item.replace(
    // eslint-disable-next-line no-useless-escape
    /[-[\]{}()*+?.\\^$|]/g, "\\$&"), "([\\\\/]|$|!|\\?)"));
    return function (ident) {
      return regExp.test(ident);
    };
  }
  if (item && typeof item === "object" && typeof item.test === "function") {
    return function (ident) {
      return item.test(ident);
    };
  }
  if (typeof item === "function") {
    return item;
  }
  if (typeof item === "boolean") {
    return function () {
      return item;
    };
  }
};

/**
 * @enum {number}
 */
var LogLevel = {
  none: 6,
  false: 6,
  error: 5,
  warn: 4,
  info: 3,
  log: 2,
  true: 2,
  verbose: 1
};

/**
 * @param {LoggerOptions} options options object
 * @returns {function(string, LogTypeEnum, any[]): void} logging function
 */
module.exports = function (_ref) {
  var _ref$level = _ref.level,
    level = _ref$level === void 0 ? "info" : _ref$level,
    _ref$debug = _ref.debug,
    debug = _ref$debug === void 0 ? false : _ref$debug,
    console = _ref.console;
  var debugFilters = typeof debug === "boolean" ? [function () {
    return debug;
  }] : /** @type {FilterItemTypes[]} */[].concat(debug).map(filterToFunction);
  /** @type {number} */
  var loglevel = LogLevel["".concat(level)] || 0;

  /**
   * @param {string} name name of the logger
   * @param {LogTypeEnum} type type of the log entry
   * @param {any[]} args arguments of the log entry
   * @returns {void}
   */
  var logger = function logger(name, type, args) {
    var labeledArgs = function labeledArgs() {
      if (Array.isArray(args)) {
        if (args.length > 0 && typeof args[0] === "string") {
          return ["[".concat(name, "] ").concat(args[0])].concat(_toConsumableArray(args.slice(1)));
        } else {
          return ["[".concat(name, "]")].concat(_toConsumableArray(args));
        }
      } else {
        return [];
      }
    };
    var debug = debugFilters.some(function (f) {
      return f(name);
    });
    switch (type) {
      case LogType.debug:
        if (!debug) return;
        // eslint-disable-next-line node/no-unsupported-features/node-builtins
        if (typeof console.debug === "function") {
          // eslint-disable-next-line node/no-unsupported-features/node-builtins
          console.debug.apply(console, _toConsumableArray(labeledArgs()));
        } else {
          console.log.apply(console, _toConsumableArray(labeledArgs()));
        }
        break;
      case LogType.log:
        if (!debug && loglevel > LogLevel.log) return;
        console.log.apply(console, _toConsumableArray(labeledArgs()));
        break;
      case LogType.info:
        if (!debug && loglevel > LogLevel.info) return;
        console.info.apply(console, _toConsumableArray(labeledArgs()));
        break;
      case LogType.warn:
        if (!debug && loglevel > LogLevel.warn) return;
        console.warn.apply(console, _toConsumableArray(labeledArgs()));
        break;
      case LogType.error:
        if (!debug && loglevel > LogLevel.error) return;
        console.error.apply(console, _toConsumableArray(labeledArgs()));
        break;
      case LogType.trace:
        if (!debug) return;
        console.trace();
        break;
      case LogType.groupCollapsed:
        if (!debug && loglevel > LogLevel.log) return;
        if (!debug && loglevel > LogLevel.verbose) {
          // eslint-disable-next-line node/no-unsupported-features/node-builtins
          if (typeof console.groupCollapsed === "function") {
            // eslint-disable-next-line node/no-unsupported-features/node-builtins
            console.groupCollapsed.apply(console, _toConsumableArray(labeledArgs()));
          } else {
            console.log.apply(console, _toConsumableArray(labeledArgs()));
          }
          break;
        }
      // falls through
      case LogType.group:
        if (!debug && loglevel > LogLevel.log) return;
        // eslint-disable-next-line node/no-unsupported-features/node-builtins
        if (typeof console.group === "function") {
          // eslint-disable-next-line node/no-unsupported-features/node-builtins
          console.group.apply(console, _toConsumableArray(labeledArgs()));
        } else {
          console.log.apply(console, _toConsumableArray(labeledArgs()));
        }
        break;
      case LogType.groupEnd:
        if (!debug && loglevel > LogLevel.log) return;
        // eslint-disable-next-line node/no-unsupported-features/node-builtins
        if (typeof console.groupEnd === "function") {
          // eslint-disable-next-line node/no-unsupported-features/node-builtins
          console.groupEnd();
        }
        break;
      case LogType.time:
        {
          if (!debug && loglevel > LogLevel.log) return;
          var ms = args[1] * 1000 + args[2] / 1000000;
          var msg = "[".concat(name, "] ").concat(args[0], ": ").concat(ms, " ms");
          if (typeof console.logTime === "function") {
            console.logTime(msg);
          } else {
            console.log(msg);
          }
          break;
        }
      case LogType.profile:
        // eslint-disable-next-line node/no-unsupported-features/node-builtins
        if (typeof console.profile === "function") {
          // eslint-disable-next-line node/no-unsupported-features/node-builtins
          console.profile.apply(console, _toConsumableArray(labeledArgs()));
        }
        break;
      case LogType.profileEnd:
        // eslint-disable-next-line node/no-unsupported-features/node-builtins
        if (typeof console.profileEnd === "function") {
          // eslint-disable-next-line node/no-unsupported-features/node-builtins
          console.profileEnd.apply(console, _toConsumableArray(labeledArgs()));
        }
        break;
      case LogType.clear:
        if (!debug && loglevel > LogLevel.log) return;
        // eslint-disable-next-line node/no-unsupported-features/node-builtins
        if (typeof console.clear === "function") {
          // eslint-disable-next-line node/no-unsupported-features/node-builtins
          console.clear();
        }
        break;
      case LogType.status:
        if (!debug && loglevel > LogLevel.info) return;
        if (typeof console.status === "function") {
          if (args.length === 0) {
            console.status();
          } else {
            console.status.apply(console, _toConsumableArray(labeledArgs()));
          }
        } else {
          if (args.length !== 0) {
            console.info.apply(console, _toConsumableArray(labeledArgs()));
          }
        }
        break;
      default:
        throw new Error("Unexpected LogType ".concat(type));
    }
  };
  return logger;
};

/***/ }),

/***/ "./node_modules/webpack/lib/logging/runtime.js":
/*!*****************************************************!*\
  !*** ./node_modules/webpack/lib/logging/runtime.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_21334__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/



function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
var SyncBailHook = __nested_webpack_require_21334__(/*! tapable/lib/SyncBailHook */ "./client-src/modules/logger/SyncBailHookFake.js");
var _require = __nested_webpack_require_21334__(/*! ./Logger */ "./node_modules/webpack/lib/logging/Logger.js"),
  Logger = _require.Logger;
var createConsoleLogger = __nested_webpack_require_21334__(/*! ./createConsoleLogger */ "./node_modules/webpack/lib/logging/createConsoleLogger.js");

/** @type {createConsoleLogger.LoggerOptions} */
var currentDefaultLoggerOptions = {
  level: "info",
  debug: false,
  console: console
};
var currentDefaultLogger = createConsoleLogger(currentDefaultLoggerOptions);

/**
 * @param {string} name name of the logger
 * @returns {Logger} a logger
 */
exports.getLogger = function (name) {
  return new Logger(function (type, args) {
    if (exports.hooks.log.call(name, type, args) === undefined) {
      currentDefaultLogger(name, type, args);
    }
  }, function (childName) {
    return exports.getLogger("".concat(name, "/").concat(childName));
  });
};

/**
 * @param {createConsoleLogger.LoggerOptions} options new options, merge with old options
 * @returns {void}
 */
exports.configureDefaultLogger = function (options) {
  _extends(currentDefaultLoggerOptions, options);
  currentDefaultLogger = createConsoleLogger(currentDefaultLoggerOptions);
};
exports.hooks = {
  log: new SyncBailHook(["origin", "type", "args"])
};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nested_webpack_require_23461__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nested_webpack_require_23461__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__nested_webpack_require_23461__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__nested_webpack_require_23461__.o(definition, key) && !__nested_webpack_require_23461__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__nested_webpack_require_23461__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__nested_webpack_require_23461__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __nested_webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
!function() {
/*!********************************************!*\
  !*** ./client-src/modules/logger/index.js ***!
  \********************************************/
__nested_webpack_require_23461__.r(__nested_webpack_exports__);
/* harmony export */ __nested_webpack_require_23461__.d(__nested_webpack_exports__, {
/* harmony export */   "default": function() { return /* reexport default export from named module */ webpack_lib_logging_runtime_js__WEBPACK_IMPORTED_MODULE_0__; }
/* harmony export */ });
/* harmony import */ var webpack_lib_logging_runtime_js__WEBPACK_IMPORTED_MODULE_0__ = __nested_webpack_require_23461__(/*! webpack/lib/logging/runtime.js */ "./node_modules/webpack/lib/logging/runtime.js");

}();
var __webpack_export_target__ = exports;
for(var i in __nested_webpack_exports__) __webpack_export_target__[i] = __nested_webpack_exports__[i];
if(__nested_webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;

/***/ }),

/***/ "./node_modules/webpack-dev-server/client/overlay.js":
/*!***********************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/overlay.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createOverlay: () => (/* binding */ createOverlay),
/* harmony export */   formatProblem: () => (/* binding */ formatProblem)
/* harmony export */ });
/* harmony import */ var ansi_html_community__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ansi-html-community */ "./node_modules/ansi-html-community/index.js");
/* harmony import */ var ansi_html_community__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(ansi_html_community__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var html_entities__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! html-entities */ "./node_modules/html-entities/lib/index.js");
/* harmony import */ var html_entities__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(html_entities__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _overlay_runtime_error_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./overlay/runtime-error.js */ "./node_modules/webpack-dev-server/client/overlay/runtime-error.js");
/* harmony import */ var _overlay_state_machine_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./overlay/state-machine.js */ "./node_modules/webpack-dev-server/client/overlay/state-machine.js");
/* harmony import */ var _overlay_styles_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./overlay/styles.js */ "./node_modules/webpack-dev-server/client/overlay/styles.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
// The error overlay is inspired (and mostly copied) from Create React App (https://github.com/facebookincubator/create-react-app)
// They, in turn, got inspired by webpack-hot-middleware (https://github.com/glenjamin/webpack-hot-middleware).






var colors = {
  reset: ["transparent", "transparent"],
  black: "181818",
  red: "E36049",
  green: "B3CB74",
  yellow: "FFD080",
  blue: "7CAFC2",
  magenta: "7FACCA",
  cyan: "C3C2EF",
  lightgrey: "EBE7E3",
  darkgrey: "6D7891"
};
ansi_html_community__WEBPACK_IMPORTED_MODULE_0___default().setColors(colors);

/**
 * @param {string} type
 * @param {string  | { file?: string, moduleName?: string, loc?: string, message?: string; stack?: string[] }} item
 * @returns {{ header: string, body: string }}
 */
function formatProblem(type, item) {
  var header = type === "warning" ? "WARNING" : "ERROR";
  var body = "";
  if (typeof item === "string") {
    body += item;
  } else {
    var file = item.file || "";
    // eslint-disable-next-line no-nested-ternary
    var moduleName = item.moduleName ? item.moduleName.indexOf("!") !== -1 ? "".concat(item.moduleName.replace(/^(\s|\S)*!/, ""), " (").concat(item.moduleName, ")") : "".concat(item.moduleName) : "";
    var loc = item.loc;
    header += "".concat(moduleName || file ? " in ".concat(moduleName ? "".concat(moduleName).concat(file ? " (".concat(file, ")") : "") : file).concat(loc ? " ".concat(loc) : "") : "");
    body += item.message || "";
  }
  if (Array.isArray(item.stack)) {
    item.stack.forEach(function (stack) {
      if (typeof stack === "string") {
        body += "\r\n".concat(stack);
      }
    });
  }
  return {
    header: header,
    body: body
  };
}

/**
 * @typedef {Object} CreateOverlayOptions
 * @property {string | null} trustedTypesPolicyName
 * @property {boolean | (error: Error) => void} [catchRuntimeError]
 */

/**
 *
 * @param {CreateOverlayOptions} options
 */
var createOverlay = function createOverlay(options) {
  /** @type {HTMLIFrameElement | null | undefined} */
  var iframeContainerElement;
  /** @type {HTMLDivElement | null | undefined} */
  var containerElement;
  /** @type {HTMLDivElement | null | undefined} */
  var headerElement;
  /** @type {Array<(element: HTMLDivElement) => void>} */
  var onLoadQueue = [];
  /** @type {TrustedTypePolicy | undefined} */
  var overlayTrustedTypesPolicy;

  /**
   *
   * @param {HTMLElement} element
   * @param {CSSStyleDeclaration} style
   */
  function applyStyle(element, style) {
    Object.keys(style).forEach(function (prop) {
      element.style[prop] = style[prop];
    });
  }

  /**
   * @param {string | null} trustedTypesPolicyName
   */
  function createContainer(trustedTypesPolicyName) {
    // Enable Trusted Types if they are available in the current browser.
    if (window.trustedTypes) {
      overlayTrustedTypesPolicy = window.trustedTypes.createPolicy(trustedTypesPolicyName || "webpack-dev-server#overlay", {
        createHTML: function createHTML(value) {
          return value;
        }
      });
    }
    iframeContainerElement = document.createElement("iframe");
    iframeContainerElement.id = "webpack-dev-server-client-overlay";
    iframeContainerElement.src = "about:blank";
    applyStyle(iframeContainerElement, _overlay_styles_js__WEBPACK_IMPORTED_MODULE_3__.iframeStyle);
    iframeContainerElement.onload = function () {
      var contentElement = /** @type {Document} */
      /** @type {HTMLIFrameElement} */
      iframeContainerElement.contentDocument.createElement("div");
      containerElement = /** @type {Document} */
      /** @type {HTMLIFrameElement} */
      iframeContainerElement.contentDocument.createElement("div");
      contentElement.id = "webpack-dev-server-client-overlay-div";
      applyStyle(contentElement, _overlay_styles_js__WEBPACK_IMPORTED_MODULE_3__.containerStyle);
      headerElement = document.createElement("div");
      headerElement.innerText = "Compiled with problems:";
      applyStyle(headerElement, _overlay_styles_js__WEBPACK_IMPORTED_MODULE_3__.headerStyle);
      var closeButtonElement = document.createElement("button");
      applyStyle(closeButtonElement, _overlay_styles_js__WEBPACK_IMPORTED_MODULE_3__.dismissButtonStyle);
      closeButtonElement.innerText = "×";
      closeButtonElement.ariaLabel = "Dismiss";
      closeButtonElement.addEventListener("click", function () {
        // eslint-disable-next-line no-use-before-define
        overlayService.send({
          type: "DISMISS"
        });
      });
      contentElement.appendChild(headerElement);
      contentElement.appendChild(closeButtonElement);
      contentElement.appendChild(containerElement);

      /** @type {Document} */
      /** @type {HTMLIFrameElement} */
      iframeContainerElement.contentDocument.body.appendChild(contentElement);
      onLoadQueue.forEach(function (onLoad) {
        onLoad( /** @type {HTMLDivElement} */contentElement);
      });
      onLoadQueue = [];

      /** @type {HTMLIFrameElement} */
      iframeContainerElement.onload = null;
    };
    document.body.appendChild(iframeContainerElement);
  }

  /**
   * @param {(element: HTMLDivElement) => void} callback
   * @param {string | null} trustedTypesPolicyName
   */
  function ensureOverlayExists(callback, trustedTypesPolicyName) {
    if (containerElement) {
      containerElement.innerHTML = "";
      // Everything is ready, call the callback right away.
      callback(containerElement);
      return;
    }
    onLoadQueue.push(callback);
    if (iframeContainerElement) {
      return;
    }
    createContainer(trustedTypesPolicyName);
  }

  // Successful compilation.
  function hide() {
    if (!iframeContainerElement) {
      return;
    }

    // Clean up and reset internal state.
    document.body.removeChild(iframeContainerElement);
    iframeContainerElement = null;
    containerElement = null;
  }

  // Compilation with errors (e.g. syntax error or missing modules).
  /**
   * @param {string} type
   * @param {Array<string  | { moduleIdentifier?: string, moduleName?: string, loc?: string, message?: string }>} messages
   * @param {string | null} trustedTypesPolicyName
   * @param {'build' | 'runtime'} messageSource
   */
  function show(type, messages, trustedTypesPolicyName, messageSource) {
    ensureOverlayExists(function () {
      headerElement.innerText = messageSource === "runtime" ? "Uncaught runtime errors:" : "Compiled with problems:";
      messages.forEach(function (message) {
        var entryElement = document.createElement("div");
        var msgStyle = type === "warning" ? _overlay_styles_js__WEBPACK_IMPORTED_MODULE_3__.msgStyles.warning : _overlay_styles_js__WEBPACK_IMPORTED_MODULE_3__.msgStyles.error;
        applyStyle(entryElement, _objectSpread(_objectSpread({}, msgStyle), {}, {
          padding: "1rem 1rem 1.5rem 1rem"
        }));
        var typeElement = document.createElement("div");
        var _formatProblem = formatProblem(type, message),
          header = _formatProblem.header,
          body = _formatProblem.body;
        typeElement.innerText = header;
        applyStyle(typeElement, _overlay_styles_js__WEBPACK_IMPORTED_MODULE_3__.msgTypeStyle);
        if (message.moduleIdentifier) {
          applyStyle(typeElement, {
            cursor: "pointer"
          });
          // element.dataset not supported in IE
          typeElement.setAttribute("data-can-open", true);
          typeElement.addEventListener("click", function () {
            fetch("/webpack-dev-server/open-editor?fileName=".concat(message.moduleIdentifier));
          });
        }

        // Make it look similar to our terminal.
        var text = ansi_html_community__WEBPACK_IMPORTED_MODULE_0___default()((0,html_entities__WEBPACK_IMPORTED_MODULE_4__.encode)(body));
        var messageTextNode = document.createElement("div");
        applyStyle(messageTextNode, _overlay_styles_js__WEBPACK_IMPORTED_MODULE_3__.msgTextStyle);
        messageTextNode.innerHTML = overlayTrustedTypesPolicy ? overlayTrustedTypesPolicy.createHTML(text) : text;
        entryElement.appendChild(typeElement);
        entryElement.appendChild(messageTextNode);

        /** @type {HTMLDivElement} */
        containerElement.appendChild(entryElement);
      });
    }, trustedTypesPolicyName);
  }
  var overlayService = (0,_overlay_state_machine_js__WEBPACK_IMPORTED_MODULE_2__["default"])({
    showOverlay: function showOverlay(_ref) {
      var _ref$level = _ref.level,
        level = _ref$level === void 0 ? "error" : _ref$level,
        messages = _ref.messages,
        messageSource = _ref.messageSource;
      return show(level, messages, options.trustedTypesPolicyName, messageSource);
    },
    hideOverlay: hide
  });
  if (options.catchRuntimeError) {
    /**
     * @param {Error | undefined} error
     * @param {string} fallbackMessage
     */
    var handleError = function handleError(error, fallbackMessage) {
      var errorObject = error instanceof Error ? error : new Error(error || fallbackMessage);
      var shouldDisplay = typeof options.catchRuntimeError === "function" ? options.catchRuntimeError(errorObject) : true;
      if (shouldDisplay) {
        overlayService.send({
          type: "RUNTIME_ERROR",
          messages: [{
            message: errorObject.message,
            stack: (0,_overlay_runtime_error_js__WEBPACK_IMPORTED_MODULE_1__.parseErrorToStacks)(errorObject)
          }]
        });
      }
    };
    (0,_overlay_runtime_error_js__WEBPACK_IMPORTED_MODULE_1__.listenToRuntimeError)(function (errorEvent) {
      // error property may be empty in older browser like IE
      var error = errorEvent.error,
        message = errorEvent.message;
      if (!error && !message) {
        return;
      }
      handleError(error, message);
    });
    (0,_overlay_runtime_error_js__WEBPACK_IMPORTED_MODULE_1__.listenToUnhandledRejection)(function (promiseRejectionEvent) {
      var reason = promiseRejectionEvent.reason;
      handleError(reason, "Unknown promise rejection reason");
    });
  }
  return overlayService;
};


/***/ }),

/***/ "./node_modules/webpack-dev-server/client/overlay/fsm.js":
/*!***************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/overlay/fsm.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * @typedef {Object} StateDefinitions
 * @property {{[event: string]: { target: string; actions?: Array<string> }}} [on]
 */

/**
 * @typedef {Object} Options
 * @property {{[state: string]: StateDefinitions}} states
 * @property {object} context;
 * @property {string} initial
 */

/**
 * @typedef {Object} Implementation
 * @property {{[actionName: string]: (ctx: object, event: any) => object}} actions
 */

/**
 * A simplified `createMachine` from `@xstate/fsm` with the following differences:
 *
 *  - the returned machine is technically a "service". No `interpret(machine).start()` is needed.
 *  - the state definition only support `on` and target must be declared with { target: 'nextState', actions: [] } explicitly.
 *  - event passed to `send` must be an object with `type` property.
 *  - actions implementation will be [assign action](https://xstate.js.org/docs/guides/context.html#assign-action) if you return any value.
 *  Do not return anything if you just want to invoke side effect.
 *
 * The goal of this custom function is to avoid installing the entire `'xstate/fsm'` package, while enabling modeling using
 * state machine. You can copy the first parameter into the editor at https://stately.ai/viz to visualize the state machine.
 *
 * @param {Options} options
 * @param {Implementation} implementation
 */
function createMachine(_ref, _ref2) {
  var states = _ref.states,
    context = _ref.context,
    initial = _ref.initial;
  var actions = _ref2.actions;
  var currentState = initial;
  var currentContext = context;
  return {
    send: function send(event) {
      var currentStateOn = states[currentState].on;
      var transitionConfig = currentStateOn && currentStateOn[event.type];
      if (transitionConfig) {
        currentState = transitionConfig.target;
        if (transitionConfig.actions) {
          transitionConfig.actions.forEach(function (actName) {
            var actionImpl = actions[actName];
            var nextContextValue = actionImpl && actionImpl(currentContext, event);
            if (nextContextValue) {
              currentContext = _objectSpread(_objectSpread({}, currentContext), nextContextValue);
            }
          });
        }
      }
    }
  };
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (createMachine);

/***/ }),

/***/ "./node_modules/webpack-dev-server/client/overlay/runtime-error.js":
/*!*************************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/overlay/runtime-error.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   listenToRuntimeError: () => (/* binding */ listenToRuntimeError),
/* harmony export */   listenToUnhandledRejection: () => (/* binding */ listenToUnhandledRejection),
/* harmony export */   parseErrorToStacks: () => (/* binding */ parseErrorToStacks)
/* harmony export */ });
/**
 *
 * @param {Error} error
 */
function parseErrorToStacks(error) {
  if (!error || !(error instanceof Error)) {
    throw new Error("parseErrorToStacks expects Error object");
  }
  if (typeof error.stack === "string") {
    return error.stack.split("\n").filter(function (stack) {
      return stack !== "Error: ".concat(error.message);
    });
  }
}

/**
 * @callback ErrorCallback
 * @param {ErrorEvent} error
 * @returns {void}
 */

/**
 * @param {ErrorCallback} callback
 */
function listenToRuntimeError(callback) {
  window.addEventListener("error", callback);
  return function cleanup() {
    window.removeEventListener("error", callback);
  };
}

/**
 * @callback UnhandledRejectionCallback
 * @param {PromiseRejectionEvent} rejectionEvent
 * @returns {void}
 */

/**
 * @param {UnhandledRejectionCallback} callback
 */
function listenToUnhandledRejection(callback) {
  window.addEventListener("unhandledrejection", callback);
  return function cleanup() {
    window.removeEventListener("unhandledrejection", callback);
  };
}


/***/ }),

/***/ "./node_modules/webpack-dev-server/client/overlay/state-machine.js":
/*!*************************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/overlay/state-machine.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _fsm_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./fsm.js */ "./node_modules/webpack-dev-server/client/overlay/fsm.js");


/**
 * @typedef {Object} ShowOverlayData
 * @property {'warning' | 'error'} level
 * @property {Array<string  | { moduleIdentifier?: string, moduleName?: string, loc?: string, message?: string }>} messages
 * @property {'build' | 'runtime'} messageSource
 */

/**
 * @typedef {Object} CreateOverlayMachineOptions
 * @property {(data: ShowOverlayData) => void} showOverlay
 * @property {() => void} hideOverlay
 */

/**
 * @param {CreateOverlayMachineOptions} options
 */
var createOverlayMachine = function createOverlayMachine(options) {
  var hideOverlay = options.hideOverlay,
    showOverlay = options.showOverlay;
  var overlayMachine = (0,_fsm_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
    initial: "hidden",
    context: {
      level: "error",
      messages: [],
      messageSource: "build"
    },
    states: {
      hidden: {
        on: {
          BUILD_ERROR: {
            target: "displayBuildError",
            actions: ["setMessages", "showOverlay"]
          },
          RUNTIME_ERROR: {
            target: "displayRuntimeError",
            actions: ["setMessages", "showOverlay"]
          }
        }
      },
      displayBuildError: {
        on: {
          DISMISS: {
            target: "hidden",
            actions: ["dismissMessages", "hideOverlay"]
          },
          BUILD_ERROR: {
            target: "displayBuildError",
            actions: ["appendMessages", "showOverlay"]
          }
        }
      },
      displayRuntimeError: {
        on: {
          DISMISS: {
            target: "hidden",
            actions: ["dismissMessages", "hideOverlay"]
          },
          RUNTIME_ERROR: {
            target: "displayRuntimeError",
            actions: ["appendMessages", "showOverlay"]
          },
          BUILD_ERROR: {
            target: "displayBuildError",
            actions: ["setMessages", "showOverlay"]
          }
        }
      }
    }
  }, {
    actions: {
      dismissMessages: function dismissMessages() {
        return {
          messages: [],
          level: "error",
          messageSource: "build"
        };
      },
      appendMessages: function appendMessages(context, event) {
        return {
          messages: context.messages.concat(event.messages),
          level: event.level || context.level,
          messageSource: event.type === "RUNTIME_ERROR" ? "runtime" : "build"
        };
      },
      setMessages: function setMessages(context, event) {
        return {
          messages: event.messages,
          level: event.level || context.level,
          messageSource: event.type === "RUNTIME_ERROR" ? "runtime" : "build"
        };
      },
      hideOverlay: hideOverlay,
      showOverlay: showOverlay
    }
  });
  return overlayMachine;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (createOverlayMachine);

/***/ }),

/***/ "./node_modules/webpack-dev-server/client/overlay/styles.js":
/*!******************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/overlay/styles.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   containerStyle: () => (/* binding */ containerStyle),
/* harmony export */   dismissButtonStyle: () => (/* binding */ dismissButtonStyle),
/* harmony export */   headerStyle: () => (/* binding */ headerStyle),
/* harmony export */   iframeStyle: () => (/* binding */ iframeStyle),
/* harmony export */   msgStyles: () => (/* binding */ msgStyles),
/* harmony export */   msgTextStyle: () => (/* binding */ msgTextStyle),
/* harmony export */   msgTypeStyle: () => (/* binding */ msgTypeStyle)
/* harmony export */ });
// styles are inspired by `react-error-overlay`

var msgStyles = {
  error: {
    backgroundColor: "rgba(206, 17, 38, 0.1)",
    color: "#fccfcf"
  },
  warning: {
    backgroundColor: "rgba(251, 245, 180, 0.1)",
    color: "#fbf5b4"
  }
};
var iframeStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100vw",
  height: "100vh",
  border: "none",
  "z-index": 9999999999
};
var containerStyle = {
  position: "fixed",
  boxSizing: "border-box",
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  width: "100vw",
  height: "100vh",
  fontSize: "large",
  padding: "2rem 2rem 4rem 2rem",
  lineHeight: "1.2",
  whiteSpace: "pre-wrap",
  overflow: "auto",
  backgroundColor: "rgba(0, 0, 0, 0.9)",
  color: "white"
};
var headerStyle = {
  color: "#e83b46",
  fontSize: "2em",
  whiteSpace: "pre-wrap",
  fontFamily: "sans-serif",
  margin: "0 2rem 2rem 0",
  flex: "0 0 auto",
  maxHeight: "50%",
  overflow: "auto"
};
var dismissButtonStyle = {
  color: "#ffffff",
  lineHeight: "1rem",
  fontSize: "1.5rem",
  padding: "1rem",
  cursor: "pointer",
  position: "absolute",
  right: 0,
  top: 0,
  backgroundColor: "transparent",
  border: "none"
};
var msgTypeStyle = {
  color: "#e83b46",
  fontSize: "1.2em",
  marginBottom: "1rem",
  fontFamily: "sans-serif"
};
var msgTextStyle = {
  lineHeight: "1.5",
  fontSize: "1rem",
  fontFamily: "Menlo, Consolas, monospace"
};


/***/ }),

/***/ "./node_modules/webpack-dev-server/client/socket.js":
/*!**********************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/socket.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   client: () => (/* binding */ client),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _clients_WebSocketClient_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./clients/WebSocketClient.js */ "./node_modules/webpack-dev-server/client/clients/WebSocketClient.js");
/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/log.js */ "./node_modules/webpack-dev-server/client/utils/log.js");
/* provided dependency */ var __webpack_dev_server_client__ = __webpack_require__(/*! ./node_modules/webpack-dev-server/client/clients/WebSocketClient.js */ "./node_modules/webpack-dev-server/client/clients/WebSocketClient.js");
/* global __webpack_dev_server_client__ */




// this WebsocketClient is here as a default fallback, in case the client is not injected
/* eslint-disable camelcase */
var Client =
// eslint-disable-next-line no-nested-ternary
typeof __webpack_dev_server_client__ !== "undefined" ? typeof __webpack_dev_server_client__.default !== "undefined" ? __webpack_dev_server_client__.default : __webpack_dev_server_client__ : _clients_WebSocketClient_js__WEBPACK_IMPORTED_MODULE_0__["default"];
/* eslint-enable camelcase */

var retries = 0;
var maxRetries = 10;

// Initialized client is exported so external consumers can utilize the same instance
// It is mutable to enforce singleton
// eslint-disable-next-line import/no-mutable-exports
var client = null;

/**
 * @param {string} url
 * @param {{ [handler: string]: (data?: any, params?: any) => any }} handlers
 * @param {number} [reconnect]
 */
var socket = function initSocket(url, handlers, reconnect) {
  client = new Client(url);
  client.onOpen(function () {
    retries = 0;
    if (typeof reconnect !== "undefined") {
      maxRetries = reconnect;
    }
  });
  client.onClose(function () {
    if (retries === 0) {
      handlers.close();
    }

    // Try to reconnect.
    client = null;

    // After 10 retries stop trying, to prevent logspam.
    if (retries < maxRetries) {
      // Exponentially increase timeout to reconnect.
      // Respectfully copied from the package `got`.
      // eslint-disable-next-line no-restricted-properties
      var retryInMs = 1000 * Math.pow(2, retries) + Math.random() * 100;
      retries += 1;
      _utils_log_js__WEBPACK_IMPORTED_MODULE_1__.log.info("Trying to reconnect...");
      setTimeout(function () {
        socket(url, handlers, reconnect);
      }, retryInMs);
    }
  });
  client.onMessage(
  /**
   * @param {any} data
   */
  function (data) {
    var message = JSON.parse(data);
    if (handlers[message.type]) {
      handlers[message.type](message.data, message.params);
    }
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (socket);

/***/ }),

/***/ "./node_modules/webpack-dev-server/client/utils/createSocketURL.js":
/*!*************************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/utils/createSocketURL.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * @param {{ protocol?: string, auth?: string, hostname?: string, port?: string, pathname?: string, search?: string, hash?: string, slashes?: boolean }} objURL
 * @returns {string}
 */
function format(objURL) {
  var protocol = objURL.protocol || "";
  if (protocol && protocol.substr(-1) !== ":") {
    protocol += ":";
  }
  var auth = objURL.auth || "";
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ":");
    auth += "@";
  }
  var host = "";
  if (objURL.hostname) {
    host = auth + (objURL.hostname.indexOf(":") === -1 ? objURL.hostname : "[".concat(objURL.hostname, "]"));
    if (objURL.port) {
      host += ":".concat(objURL.port);
    }
  }
  var pathname = objURL.pathname || "";
  if (objURL.slashes) {
    host = "//".concat(host || "");
    if (pathname && pathname.charAt(0) !== "/") {
      pathname = "/".concat(pathname);
    }
  } else if (!host) {
    host = "";
  }
  var search = objURL.search || "";
  if (search && search.charAt(0) !== "?") {
    search = "?".concat(search);
  }
  var hash = objURL.hash || "";
  if (hash && hash.charAt(0) !== "#") {
    hash = "#".concat(hash);
  }
  pathname = pathname.replace(/[?#]/g,
  /**
   * @param {string} match
   * @returns {string}
   */
  function (match) {
    return encodeURIComponent(match);
  });
  search = search.replace("#", "%23");
  return "".concat(protocol).concat(host).concat(pathname).concat(search).concat(hash);
}

/**
 * @param {URL & { fromCurrentScript?: boolean }} parsedURL
 * @returns {string}
 */
function createSocketURL(parsedURL) {
  var hostname = parsedURL.hostname;

  // Node.js module parses it as `::`
  // `new URL(urlString, [baseURLString])` parses it as '[::]'
  var isInAddrAny = hostname === "0.0.0.0" || hostname === "::" || hostname === "[::]";

  // why do we need this check?
  // hostname n/a for file protocol (example, when using electron, ionic)
  // see: https://github.com/webpack/webpack-dev-server/pull/384
  if (isInAddrAny && self.location.hostname && self.location.protocol.indexOf("http") === 0) {
    hostname = self.location.hostname;
  }
  var socketURLProtocol = parsedURL.protocol || self.location.protocol;

  // When https is used in the app, secure web sockets are always necessary because the browser doesn't accept non-secure web sockets.
  if (socketURLProtocol === "auto:" || hostname && isInAddrAny && self.location.protocol === "https:") {
    socketURLProtocol = self.location.protocol;
  }
  socketURLProtocol = socketURLProtocol.replace(/^(?:http|.+-extension|file)/i, "ws");
  var socketURLAuth = "";

  // `new URL(urlString, [baseURLstring])` doesn't have `auth` property
  // Parse authentication credentials in case we need them
  if (parsedURL.username) {
    socketURLAuth = parsedURL.username;

    // Since HTTP basic authentication does not allow empty username,
    // we only include password if the username is not empty.
    if (parsedURL.password) {
      // Result: <username>:<password>
      socketURLAuth = socketURLAuth.concat(":", parsedURL.password);
    }
  }

  // In case the host is a raw IPv6 address, it can be enclosed in
  // the brackets as the brackets are needed in the final URL string.
  // Need to remove those as url.format blindly adds its own set of brackets
  // if the host string contains colons. That would lead to non-working
  // double brackets (e.g. [[::]]) host
  //
  // All of these web socket url params are optionally passed in through resourceQuery,
  // so we need to fall back to the default if they are not provided
  var socketURLHostname = (hostname || self.location.hostname || "localhost").replace(/^\[(.*)\]$/, "$1");
  var socketURLPort = parsedURL.port;
  if (!socketURLPort || socketURLPort === "0") {
    socketURLPort = self.location.port;
  }

  // If path is provided it'll be passed in via the resourceQuery as a
  // query param so it has to be parsed out of the querystring in order for the
  // client to open the socket to the correct location.
  var socketURLPathname = "/ws";
  if (parsedURL.pathname && !parsedURL.fromCurrentScript) {
    socketURLPathname = parsedURL.pathname;
  }
  return format({
    protocol: socketURLProtocol,
    auth: socketURLAuth,
    hostname: socketURLHostname,
    port: socketURLPort,
    pathname: socketURLPathname,
    slashes: true
  });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (createSocketURL);

/***/ }),

/***/ "./node_modules/webpack-dev-server/client/utils/getCurrentScriptSource.js":
/*!********************************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/utils/getCurrentScriptSource.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * @returns {string}
 */
function getCurrentScriptSource() {
  // `document.currentScript` is the most accurate way to find the current script,
  // but is not supported in all browsers.
  if (document.currentScript) {
    return document.currentScript.getAttribute("src");
  }

  // Fallback to getting all scripts running in the document.
  var scriptElements = document.scripts || [];
  var scriptElementsWithSrc = Array.prototype.filter.call(scriptElements, function (element) {
    return element.getAttribute("src");
  });
  if (scriptElementsWithSrc.length > 0) {
    var currentScript = scriptElementsWithSrc[scriptElementsWithSrc.length - 1];
    return currentScript.getAttribute("src");
  }

  // Fail as there was no script to use.
  throw new Error("[webpack-dev-server] Failed to get current script source.");
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getCurrentScriptSource);

/***/ }),

/***/ "./node_modules/webpack-dev-server/client/utils/log.js":
/*!*************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/utils/log.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   log: () => (/* binding */ log),
/* harmony export */   logEnabledFeatures: () => (/* binding */ logEnabledFeatures),
/* harmony export */   setLogLevel: () => (/* binding */ setLogLevel)
/* harmony export */ });
/* harmony import */ var _modules_logger_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../modules/logger/index.js */ "./node_modules/webpack-dev-server/client/modules/logger/index.js");
/* harmony import */ var _modules_logger_index_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_modules_logger_index_js__WEBPACK_IMPORTED_MODULE_0__);

var name = "webpack-dev-server";
// default level is set on the client side, so it does not need
// to be set by the CLI or API
var defaultLevel = "info";

// options new options, merge with old options
/**
 * @param {false | true | "none" | "error" | "warn" | "info" | "log" | "verbose"} level
 * @returns {void}
 */
function setLogLevel(level) {
  _modules_logger_index_js__WEBPACK_IMPORTED_MODULE_0___default().configureDefaultLogger({
    level: level
  });
}
setLogLevel(defaultLevel);
var log = _modules_logger_index_js__WEBPACK_IMPORTED_MODULE_0___default().getLogger(name);
var logEnabledFeatures = function logEnabledFeatures(features) {
  var enabledFeatures = Object.keys(features);
  if (!features || enabledFeatures.length === 0) {
    return;
  }
  var logString = "Server started:";

  // Server started: Hot Module Replacement enabled, Live Reloading enabled, Overlay disabled.
  for (var i = 0; i < enabledFeatures.length; i++) {
    var key = enabledFeatures[i];
    logString += " ".concat(key, " ").concat(features[key] ? "enabled" : "disabled", ",");
  }
  // replace last comma with a period
  logString = logString.slice(0, -1).concat(".");
  log.info(logString);
};


/***/ }),

/***/ "./node_modules/webpack-dev-server/client/utils/parseURL.js":
/*!******************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/utils/parseURL.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _getCurrentScriptSource_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./getCurrentScriptSource.js */ "./node_modules/webpack-dev-server/client/utils/getCurrentScriptSource.js");


/**
 * @param {string} resourceQuery
 * @returns {{ [key: string]: string | boolean }}
 */
function parseURL(resourceQuery) {
  /** @type {{ [key: string]: string }} */
  var options = {};
  if (typeof resourceQuery === "string" && resourceQuery !== "") {
    var searchParams = resourceQuery.slice(1).split("&");
    for (var i = 0; i < searchParams.length; i++) {
      var pair = searchParams[i].split("=");
      options[pair[0]] = decodeURIComponent(pair[1]);
    }
  } else {
    // Else, get the url from the <script> this file was called with.
    var scriptSource = (0,_getCurrentScriptSource_js__WEBPACK_IMPORTED_MODULE_0__["default"])();
    var scriptSourceURL;
    try {
      // The placeholder `baseURL` with `window.location.href`,
      // is to allow parsing of path-relative or protocol-relative URLs,
      // and will have no effect if `scriptSource` is a fully valid URL.
      scriptSourceURL = new URL(scriptSource, self.location.href);
    } catch (error) {
      // URL parsing failed, do nothing.
      // We will still proceed to see if we can recover using `resourceQuery`
    }
    if (scriptSourceURL) {
      options = scriptSourceURL;
      options.fromCurrentScript = true;
    }
  }
  return options;
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (parseURL);

/***/ }),

/***/ "./node_modules/webpack-dev-server/client/utils/reloadApp.js":
/*!*******************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/utils/reloadApp.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var webpack_hot_emitter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webpack/hot/emitter.js */ "./node_modules/webpack/hot/emitter.js");
/* harmony import */ var webpack_hot_emitter_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(webpack_hot_emitter_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _log_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./log.js */ "./node_modules/webpack-dev-server/client/utils/log.js");



/** @typedef {import("../index").Options} Options
/** @typedef {import("../index").Status} Status

/**
 * @param {Options} options
 * @param {Status} status
 */
function reloadApp(_ref, status) {
  var hot = _ref.hot,
    liveReload = _ref.liveReload;
  if (status.isUnloading) {
    return;
  }
  var currentHash = status.currentHash,
    previousHash = status.previousHash;
  var isInitial = currentHash.indexOf( /** @type {string} */previousHash) >= 0;
  if (isInitial) {
    return;
  }

  /**
   * @param {Window} rootWindow
   * @param {number} intervalId
   */
  function applyReload(rootWindow, intervalId) {
    clearInterval(intervalId);
    _log_js__WEBPACK_IMPORTED_MODULE_1__.log.info("App updated. Reloading...");
    rootWindow.location.reload();
  }
  var search = self.location.search.toLowerCase();
  var allowToHot = search.indexOf("webpack-dev-server-hot=false") === -1;
  var allowToLiveReload = search.indexOf("webpack-dev-server-live-reload=false") === -1;
  if (hot && allowToHot) {
    _log_js__WEBPACK_IMPORTED_MODULE_1__.log.info("App hot update...");
    webpack_hot_emitter_js__WEBPACK_IMPORTED_MODULE_0___default().emit("webpackHotUpdate", status.currentHash);
    if (typeof self !== "undefined" && self.window) {
      // broadcast update to window
      self.postMessage("webpackHotUpdate".concat(status.currentHash), "*");
    }
  }
  // allow refreshing the page only if liveReload isn't disabled
  else if (liveReload && allowToLiveReload) {
    var rootWindow = self;

    // use parent window for reload (in case we're in an iframe with no valid src)
    var intervalId = self.setInterval(function () {
      if (rootWindow.location.protocol !== "about:") {
        // reload immediately if protocol is valid
        applyReload(rootWindow, intervalId);
      } else {
        rootWindow = rootWindow.parent;
        if (rootWindow.parent === rootWindow) {
          // if parent equals current window we've reached the root which would continue forever, so trigger a reload anyways
          applyReload(rootWindow, intervalId);
        }
      }
    });
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (reloadApp);

/***/ }),

/***/ "./node_modules/webpack-dev-server/client/utils/sendMessage.js":
/*!*********************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/utils/sendMessage.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* global __resourceQuery WorkerGlobalScope */

// Send messages to the outside, so plugins can consume it.
/**
 * @param {string} type
 * @param {any} [data]
 */
function sendMsg(type, data) {
  if (typeof self !== "undefined" && (typeof WorkerGlobalScope === "undefined" || !(self instanceof WorkerGlobalScope))) {
    self.postMessage({
      type: "webpack".concat(type),
      data: data
    }, "*");
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (sendMsg);

/***/ }),

/***/ "./node_modules/webpack-dev-server/client/utils/stripAnsi.js":
/*!*******************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/utils/stripAnsi.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var ansiRegex = new RegExp(["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"].join("|"), "g");

/**
 *
 * Strip [ANSI escape codes](https://en.wikipedia.org/wiki/ANSI_escape_code) from a string.
 * Adapted from code originally released by Sindre Sorhus
 * Licensed the MIT License
 *
 * @param {string} string
 * @return {string}
 */
function stripAnsi(string) {
  if (typeof string !== "string") {
    throw new TypeError("Expected a `string`, got `".concat(typeof string, "`"));
  }
  return string.replace(ansiRegex, "");
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (stripAnsi);

/***/ }),

/***/ "./node_modules/webpack/hot/emitter.js":
/*!*********************************************!*\
  !*** ./node_modules/webpack/hot/emitter.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var EventEmitter = __webpack_require__(/*! events */ "./node_modules/events/events.js");
module.exports = new EventEmitter();


/***/ }),

/***/ "./node_modules/webpack/hot/log.js":
/*!*****************************************!*\
  !*** ./node_modules/webpack/hot/log.js ***!
  \*****************************************/
/***/ ((module) => {

/** @typedef {"info" | "warning" | "error"} LogLevel */

/** @type {LogLevel} */
var logLevel = "info";

function dummy() {}

/**
 * @param {LogLevel} level log level
 * @returns {boolean} true, if should log
 */
function shouldLog(level) {
	var shouldLog =
		(logLevel === "info" && level === "info") ||
		(["info", "warning"].indexOf(logLevel) >= 0 && level === "warning") ||
		(["info", "warning", "error"].indexOf(logLevel) >= 0 && level === "error");
	return shouldLog;
}

/**
 * @param {(msg?: string) => void} logFn log function
 * @returns {(level: LogLevel, msg?: string) => void} function that logs when log level is sufficient
 */
function logGroup(logFn) {
	return function (level, msg) {
		if (shouldLog(level)) {
			logFn(msg);
		}
	};
}

/**
 * @param {LogLevel} level log level
 * @param {string|Error} msg message
 */
module.exports = function (level, msg) {
	if (shouldLog(level)) {
		if (level === "info") {
			console.log(msg);
		} else if (level === "warning") {
			console.warn(msg);
		} else if (level === "error") {
			console.error(msg);
		}
	}
};

var group = console.group || dummy;
var groupCollapsed = console.groupCollapsed || dummy;
var groupEnd = console.groupEnd || dummy;

module.exports.group = logGroup(group);

module.exports.groupCollapsed = logGroup(groupCollapsed);

module.exports.groupEnd = logGroup(groupEnd);

/**
 * @param {LogLevel} level log level
 */
module.exports.setLogLevel = function (level) {
	logLevel = level;
};

/**
 * @param {Error} err error
 * @returns {string} formatted error
 */
module.exports.formatError = function (err) {
	var message = err.message;
	var stack = err.stack;
	if (!stack) {
		return message;
	} else if (stack.indexOf(message) < 0) {
		return message + "\n" + stack;
	} else {
		return stack;
	}
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/getFullHash */
/******/ 	(() => {
/******/ 		__webpack_require__.h = () => ("ff1f28fe630482838a42")
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var __webpack_exports__ = {};
/*!************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/index.js?protocol=ws%3A&hostname=0.0.0.0&port=8080&pathname=%2Fws&logging=info&overlay=true&reconnect=10&hot=false&live-reload=true ***!
  \************************************************************************************************************************************************************************************/
var __resourceQuery = "?protocol=ws%3A&hostname=0.0.0.0&port=8080&pathname=%2Fws&logging=info&overlay=true&reconnect=10&hot=false&live-reload=true";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var webpack_hot_log_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webpack/hot/log.js */ "./node_modules/webpack/hot/log.js");
/* harmony import */ var webpack_hot_log_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(webpack_hot_log_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_stripAnsi_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/stripAnsi.js */ "./node_modules/webpack-dev-server/client/utils/stripAnsi.js");
/* harmony import */ var _utils_parseURL_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils/parseURL.js */ "./node_modules/webpack-dev-server/client/utils/parseURL.js");
/* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./socket.js */ "./node_modules/webpack-dev-server/client/socket.js");
/* harmony import */ var _overlay_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./overlay.js */ "./node_modules/webpack-dev-server/client/overlay.js");
/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils/log.js */ "./node_modules/webpack-dev-server/client/utils/log.js");
/* harmony import */ var _utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./utils/sendMessage.js */ "./node_modules/webpack-dev-server/client/utils/sendMessage.js");
/* harmony import */ var _utils_reloadApp_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./utils/reloadApp.js */ "./node_modules/webpack-dev-server/client/utils/reloadApp.js");
/* harmony import */ var _utils_createSocketURL_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./utils/createSocketURL.js */ "./node_modules/webpack-dev-server/client/utils/createSocketURL.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/* global __resourceQuery, __webpack_hash__ */
/// <reference types="webpack/module" />










/**
 * @typedef {Object} OverlayOptions
 * @property {boolean | (error: Error) => boolean} [warnings]
 * @property {boolean | (error: Error) => boolean} [errors]
 * @property {boolean | (error: Error) => boolean} [runtimeErrors]
 * @property {string} [trustedTypesPolicyName]
 */

/**
 * @typedef {Object} Options
 * @property {boolean} hot
 * @property {boolean} liveReload
 * @property {boolean} progress
 * @property {boolean | OverlayOptions} overlay
 * @property {string} [logging]
 * @property {number} [reconnect]
 */

/**
 * @typedef {Object} Status
 * @property {boolean} isUnloading
 * @property {string} currentHash
 * @property {string} [previousHash]
 */

/**
 * @param {boolean | { warnings?: boolean | string; errors?: boolean | string; runtimeErrors?: boolean | string; }} overlayOptions
 */
var decodeOverlayOptions = function decodeOverlayOptions(overlayOptions) {
  if (typeof overlayOptions === "object") {
    ["warnings", "errors", "runtimeErrors"].forEach(function (property) {
      if (typeof overlayOptions[property] === "string") {
        var overlayFilterFunctionString = decodeURIComponent(overlayOptions[property]);

        // eslint-disable-next-line no-new-func
        var overlayFilterFunction = new Function("message", "var callback = ".concat(overlayFilterFunctionString, "\n        return callback(message)"));
        overlayOptions[property] = overlayFilterFunction;
      }
    });
  }
};

/**
 * @type {Status}
 */
var status = {
  isUnloading: false,
  // TODO Workaround for webpack v4, `__webpack_hash__` is not replaced without HotModuleReplacement
  // eslint-disable-next-line camelcase
  currentHash:  true ? __webpack_require__.h() : 0
};

/** @type {Options} */
var options = {
  hot: false,
  liveReload: false,
  progress: false,
  overlay: false
};
var parsedResourceQuery = (0,_utils_parseURL_js__WEBPACK_IMPORTED_MODULE_2__["default"])(__resourceQuery);
var enabledFeatures = {
  "Hot Module Replacement": false,
  "Live Reloading": false,
  Progress: false,
  Overlay: false
};
if (parsedResourceQuery.hot === "true") {
  options.hot = true;
  enabledFeatures["Hot Module Replacement"] = true;
}
if (parsedResourceQuery["live-reload"] === "true") {
  options.liveReload = true;
  enabledFeatures["Live Reloading"] = true;
}
if (parsedResourceQuery.progress === "true") {
  options.progress = true;
  enabledFeatures.Progress = true;
}
if (parsedResourceQuery.overlay) {
  try {
    options.overlay = JSON.parse(parsedResourceQuery.overlay);
  } catch (e) {
    _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.error("Error parsing overlay options from resource query:", e);
  }

  // Fill in default "true" params for partially-specified objects.
  if (typeof options.overlay === "object") {
    options.overlay = _objectSpread({
      errors: true,
      warnings: true,
      runtimeErrors: true
    }, options.overlay);
    decodeOverlayOptions(options.overlay);
  }
  enabledFeatures.Overlay = true;
}
if (parsedResourceQuery.logging) {
  options.logging = parsedResourceQuery.logging;
}
if (typeof parsedResourceQuery.reconnect !== "undefined") {
  options.reconnect = Number(parsedResourceQuery.reconnect);
}

/**
 * @param {string} level
 */
function setAllLogLevel(level) {
  // This is needed because the HMR logger operate separately from dev server logger
  webpack_hot_log_js__WEBPACK_IMPORTED_MODULE_0___default().setLogLevel(level === "verbose" || level === "log" ? "info" : level);
  (0,_utils_log_js__WEBPACK_IMPORTED_MODULE_5__.setLogLevel)(level);
}
if (options.logging) {
  setAllLogLevel(options.logging);
}
(0,_utils_log_js__WEBPACK_IMPORTED_MODULE_5__.logEnabledFeatures)(enabledFeatures);
self.addEventListener("beforeunload", function () {
  status.isUnloading = true;
});
var overlay = typeof window !== "undefined" ? (0,_overlay_js__WEBPACK_IMPORTED_MODULE_4__.createOverlay)(typeof options.overlay === "object" ? {
  trustedTypesPolicyName: options.overlay.trustedTypesPolicyName,
  catchRuntimeError: options.overlay.runtimeErrors
} : {
  trustedTypesPolicyName: false,
  catchRuntimeError: options.overlay
}) : {
  send: function send() {}
};
var onSocketMessage = {
  hot: function hot() {
    if (parsedResourceQuery.hot === "false") {
      return;
    }
    options.hot = true;
  },
  liveReload: function liveReload() {
    if (parsedResourceQuery["live-reload"] === "false") {
      return;
    }
    options.liveReload = true;
  },
  invalid: function invalid() {
    _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.info("App updated. Recompiling...");

    // Fixes #1042. overlay doesn't clear if errors are fixed but warnings remain.
    if (options.overlay) {
      overlay.send({
        type: "DISMISS"
      });
    }
    (0,_utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__["default"])("Invalid");
  },
  /**
   * @param {string} hash
   */
  hash: function hash(_hash) {
    status.previousHash = status.currentHash;
    status.currentHash = _hash;
  },
  logging: setAllLogLevel,
  /**
   * @param {boolean} value
   */
  overlay: function overlay(value) {
    if (typeof document === "undefined") {
      return;
    }
    options.overlay = value;
    decodeOverlayOptions(options.overlay);
  },
  /**
   * @param {number} value
   */
  reconnect: function reconnect(value) {
    if (parsedResourceQuery.reconnect === "false") {
      return;
    }
    options.reconnect = value;
  },
  /**
   * @param {boolean} value
   */
  progress: function progress(value) {
    options.progress = value;
  },
  /**
   * @param {{ pluginName?: string, percent: number, msg: string }} data
   */
  "progress-update": function progressUpdate(data) {
    if (options.progress) {
      _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.info("".concat(data.pluginName ? "[".concat(data.pluginName, "] ") : "").concat(data.percent, "% - ").concat(data.msg, "."));
    }
    (0,_utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__["default"])("Progress", data);
  },
  "still-ok": function stillOk() {
    _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.info("Nothing changed.");
    if (options.overlay) {
      overlay.send({
        type: "DISMISS"
      });
    }
    (0,_utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__["default"])("StillOk");
  },
  ok: function ok() {
    (0,_utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__["default"])("Ok");
    if (options.overlay) {
      overlay.send({
        type: "DISMISS"
      });
    }
    (0,_utils_reloadApp_js__WEBPACK_IMPORTED_MODULE_7__["default"])(options, status);
  },
  // TODO: remove in v5 in favor of 'static-changed'
  /**
   * @param {string} file
   */
  "content-changed": function contentChanged(file) {
    _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.info("".concat(file ? "\"".concat(file, "\"") : "Content", " from static directory was changed. Reloading..."));
    self.location.reload();
  },
  /**
   * @param {string} file
   */
  "static-changed": function staticChanged(file) {
    _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.info("".concat(file ? "\"".concat(file, "\"") : "Content", " from static directory was changed. Reloading..."));
    self.location.reload();
  },
  /**
   * @param {Error[]} warnings
   * @param {any} params
   */
  warnings: function warnings(_warnings, params) {
    _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.warn("Warnings while compiling.");
    var printableWarnings = _warnings.map(function (error) {
      var _formatProblem = (0,_overlay_js__WEBPACK_IMPORTED_MODULE_4__.formatProblem)("warning", error),
        header = _formatProblem.header,
        body = _formatProblem.body;
      return "".concat(header, "\n").concat((0,_utils_stripAnsi_js__WEBPACK_IMPORTED_MODULE_1__["default"])(body));
    });
    (0,_utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__["default"])("Warnings", printableWarnings);
    for (var i = 0; i < printableWarnings.length; i++) {
      _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.warn(printableWarnings[i]);
    }
    var overlayWarningsSetting = typeof options.overlay === "boolean" ? options.overlay : options.overlay && options.overlay.warnings;
    if (overlayWarningsSetting) {
      var warningsToDisplay = typeof overlayWarningsSetting === "function" ? _warnings.filter(overlayWarningsSetting) : _warnings;
      if (warningsToDisplay.length) {
        overlay.send({
          type: "BUILD_ERROR",
          level: "warning",
          messages: _warnings
        });
      }
    }
    if (params && params.preventReloading) {
      return;
    }
    (0,_utils_reloadApp_js__WEBPACK_IMPORTED_MODULE_7__["default"])(options, status);
  },
  /**
   * @param {Error[]} errors
   */
  errors: function errors(_errors) {
    _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.error("Errors while compiling. Reload prevented.");
    var printableErrors = _errors.map(function (error) {
      var _formatProblem2 = (0,_overlay_js__WEBPACK_IMPORTED_MODULE_4__.formatProblem)("error", error),
        header = _formatProblem2.header,
        body = _formatProblem2.body;
      return "".concat(header, "\n").concat((0,_utils_stripAnsi_js__WEBPACK_IMPORTED_MODULE_1__["default"])(body));
    });
    (0,_utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__["default"])("Errors", printableErrors);
    for (var i = 0; i < printableErrors.length; i++) {
      _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.error(printableErrors[i]);
    }
    var overlayErrorsSettings = typeof options.overlay === "boolean" ? options.overlay : options.overlay && options.overlay.errors;
    if (overlayErrorsSettings) {
      var errorsToDisplay = typeof overlayErrorsSettings === "function" ? _errors.filter(overlayErrorsSettings) : _errors;
      if (errorsToDisplay.length) {
        overlay.send({
          type: "BUILD_ERROR",
          level: "error",
          messages: _errors
        });
      }
    }
  },
  /**
   * @param {Error} error
   */
  error: function error(_error) {
    _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.error(_error);
  },
  close: function close() {
    _utils_log_js__WEBPACK_IMPORTED_MODULE_5__.log.info("Disconnected!");
    if (options.overlay) {
      overlay.send({
        type: "DISMISS"
      });
    }
    (0,_utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_6__["default"])("Close");
  }
};
var socketURL = (0,_utils_createSocketURL_js__WEBPACK_IMPORTED_MODULE_8__["default"])(parsedResourceQuery);
(0,_socket_js__WEBPACK_IMPORTED_MODULE_3__["default"])(socketURL, onSocketMessage, options.reconnect);
})();

// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!****************************!*\
  !*** ./modules/content.js ***!
  \****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _site_kick_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./site/kick.js */ "./modules/site/kick.js");
/* harmony import */ var _site_ip2_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./site/ip2.js */ "./modules/site/ip2.js");


window.location.hostname.includes('kick.com') ? setTimeout(_site_kick_js__WEBPACK_IMPORTED_MODULE_0__["default"].init(), 2000) : _site_ip2_js__WEBPACK_IMPORTED_MODULE_1__["default"].init();
})();

/******/ })()
;
//# sourceMappingURL=kick-chat-flusher.js.map