import { processMessageQueue, processElementQueue, createUserBanMessage } from "../queue/queue.js";
import { reset } from "../utils/resize.js";
import { logToConsole } from "../utils/utils.js";
import { scrollChat } from "../utils/resize.js";

export class FlusherMessages {
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
      data: { auth: "", channel: `chatrooms.${id}.v2` },
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
        data.data.messages.forEach((message) => {
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

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      document.body.contains(this.flusher.video)
        ? this.onMessage(data)
        : this.disposeChannel();
    };

    this.socket.addEventListener("open", (event) => {
      this.subscribeChannel();
    });

    this.socket.addEventListener("close", (event) => {
      if (this.dispose) {
        logToConsole(`WebSocket Connection Closed: ${this.flusher.props.channelName} (${this.flusher.props.chatroomId})`);
        this.channels.clear();
      } else {
        setTimeout(() => {
          logToConsole(`WebSocket Connection Closed By Host: ${this.flusher.props.channelName} (${this.flusher.props.chatroomId})`);
          this.setupWebSocket();
        }, 5000);
      }
    });

    this.socket.addEventListener("error", (event) => {
      console.error("WebSocket error:", event);
    });
  }

  onMessage(data) {
    if (!this.flusher.states.chatEnabled || data === null || this.flusher.props.loading)
      return;
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

    const vodObserver = this.flusher.props.isVod
      ? document.getElementById('channel-chatroom')?.querySelector('div.overflow-hidden').parentElement
      : null;

    const handleMutations = (mutations, observer) => {
      if (mutations[0].type === "childList" && mutations[0].removedNodes.length > 0) {
        if (!document.querySelector('#chatroom-messages') || (window.currentUrl !== window.location.href)) {
          reset(this.flusher);
          observer.disconnect();
        }
      }
    };

    if (this.pageObserver) this.pageObserver.disconnect();

    this.pageObserver = new MutationObserver((mutations) => handleMutations(mutations, this.pageObserver));
    this.pageObserver.observe(pageParent, { childList: true, subtree: false });

    if (vodObserver) {
      if (this.vodObserver) this.vodObserver.disconnect();
      this.vodObserver = new MutationObserver((mutations) => handleMutations(mutations, this.vodObserver));
      this.vodObserver.observe(vodObserver, { childList: true, subtree: false });
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
    console.log(pinElement);
    if (!pinElement) return;
    const innerText = pinElement.innerText.replace(/\s+/g, ' ').trim();
    logToConsole(innerText);
    const currentPinnedId = pinId;
    let pinElementObject = pinElement.cloneNode(true);
    pinElementObject.removeAttribute('style');
    let isMessage = pinElementObject.querySelector('button.inline.font-bold');
    if (isMessage) {
      console.log('is message');
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
      console.log('is not message');
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
    console.log('set pinned');
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
    if (!this.flusher.states.flushState)
      setTimeout(() => {
        this.flusher.nativeChat.childNodes.forEach((addedNode) => {
          this.prepareMessage(addedNode, false);
        });
      }, 500);
  }

  observeNativechatMessages() {
    if (this.nativeChatObserver) this.nativeChatObserver.disconnect();
    this.nativeChatObserver = new MutationObserver((mutations) => {

      if (this.isScrolling) return;

      this.interval(mutations.length);

      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          this.prepareMessage(mutation.addedNodes[0], false);
        }
      });
    });

    const observerConfig = { childList: true, subtree: false };
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

    const interval = Math.round((currentMutationTime - this.lastMutationTime) + (window.flusherInterval * 0.5));
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

      this.scrollObserver.observe(targetElement, { childList: true });
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

    const userId =
      this.AeroKick && this.flusher.props.isAeroKick
        ? clonedNode
          .querySelector("button")
          .getAttribute("data-radial-username")
        : clonedNode.querySelector('button[title]')?.getAttribute('title');

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

        elements.forEach((element) => {
          var classes = element.classList;
          var classesToRemove = Array.from(classes).filter((className) =>
            className.includes("bk-top-")
          );

          classesToRemove.forEach((className) => {
            element.classList.remove(className);
          });
        });
      }

      const avatar = clonedNode.querySelector('img[alt="avatar"]');

      if (avatar) {
        avatar
          .closest("button")
          .classList.remove(
            "bk-ease-in-out",
            "bk-duration-100",
            "bk-transition-colors",
            "bk-translate-y-px"
          );
        avatar.style.animation = "none";

        const username = clonedNode.querySelector(".bk-text-transparent");
        if (username)
          username.style.color = username.style.backgroundColor ?? "white";

        avatar.onerror = function () {
          this.style.display = "none";
          this.onerror = null;
          this.src = defaultAvatar;
          this.style.display = "block";
        };
      }
    }

    if (this.id || this.id === "") {
      if (
        (this.flusher.states.spamState || this.flusher.states.flushState) &&
        !this.flusher.props.isVod
      ) {

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
                text.replace(regex, (match, group) => group + '(' + (match.length / group.length) + ')');

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
                          if (emojiCount2 > 2) {
                          }

                          /* Check if emoji + text spam */
                          else if (!textDupe2 && emojiCount2 === 1) {
                            const nextElement = elements[i + 1];
                            if (nextElement && /[\p{Emoji}]/gu.test(nextElement)) {
                              if (nextElement === lastText2) {
                              }
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

                /* Check if emoji + text spam */
                else if (!textDupe && emojiCount === 1) {
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
      const userId =
        this.AeroKick && this.flusher.props.isAeroKick
          ? clonedNode
            .querySelector("button")
            .getAttribute("data-radial-username")
          : clonedNode.querySelector('button[title]')?.getAttribute('title');

      if (!userId) {
        /* console.log('event', clonedNode); */
        return false;
      }

      if (this.flusher.props.isKickTools) {
        if (clonedNode.style.opacity ?? 1 < 1) {
          const isUserBanned = this.flusher.props.bannedUsers.some(user => user.id === userId);
          if (isUserBanned) { console.log(userId + ' allowed'); } else {
            return true;
          }
        }
      }

      if (this.flusher.states.spamState || this.flusher.states.flushState) {
        let emoteElements;
        let uniqueString = "";

        const divTextContent =
          this.AeroKick && this.flusher.props.isAeroKick
            ? clonedNode.querySelector("span.bk-inline").textContent
            : clonedNode.querySelector('span.font-normal')?.textContent

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
            emoteElements.forEach((emoteElement) => {
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
            emoteElements.forEach((emoteElement) => {
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

        const exist = this.flusher.props.displayedMessages.find((obj) => {
          return obj.key === uniqueString;
        });

        if (exist) return true;

        this.flusher.props.displayedMessages.push({ id: this.id, key: uniqueString });

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

    const observerConfig = { childList: true, subtree: true };
    observer.observe(parentNode, observerConfig);

    this.flusher.props.messageObservers.set(id, observer);
  }

  async bindRequests(flusher) {
    this.dispose = false;
    if (!flusher) return;
    this.flusher = flusher;

    if (!this.flusher.props.external) this.interceptNative();

    this.flusher.props.bindTimeout = setTimeout(
      async () => {
        if (!this.flusher) return;

        if (!this.flusher.props.chatroomId && !this.flusher.props.isVod) {
          try {
            const channelName = this.flusher.props.channelName.toLowerCase().replace(/\s/g, '');
            const response = await fetch(
              `https://kick.com/api/v1/channels/${channelName}`
            );
            const data = await response.json();

            this.flusher.props.chatroomId =
              data && data.chatroom && data.chatroom.id;

            this.flusher.props.hostId = data.id;

            if (this.flusher.props.external) {
              this.flusher.props.badgeCache.push(this.flusher.data.subscriber_badges);
            }
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        }

        if (!this.socket && !this.flusher.props.isVod)
          this.subscribeChannel();
      },
      this.flusher.props.external ? 0 : 5000
    );
  }

  unbindRequests() {
    this.disposeChannel();
    if (!this.flusher?.props?.external || this.flusher.states.flushState) {
      if (this.nativeChatObserver) {
        this.nativeChatObserver.disconnect();
        this.nativeChatObserver = null;
      } if (this.scrollObserver) {
        this.scrollObserver.disconnect();
        this.scrollObserver = null;
      } if (this.pageObserver) {
        this.pageObserver.disconnect();
        this.pageObserver = null;
      } if (this.vodObserver) {
        this.vodObserver.disconnect();
        this.vodObserver = null;
      } if (this.pinnedObserver) {
        this.pinnedObserver.disconnect();
        this.pinnedObserver = null;
      } if (this.checkPinnedTimeouts) {
        for (const id in this.checkPinnedTimeouts) {
          clearTimeout(this.checkPinnedTimeouts[id]);
          delete this.pinnedTimeouts[id];
        }
      } if (this.pinnedMessageOld) {
        this.pinnedMessageOld = null;
      } if (this.pinnedObserverTimeout) clearTimeout(this.pinnedObserverTimeout);
      if (this.pinnedTimeouts) {
        for (const id in this.pinnedTimeouts) {
          clearTimeout(this.pinnedTimeouts[id]);
          delete this.pinnedTimeouts[id];
        }
      } if (this.pinnedObservers) {
        for (const id in this.pinnedObservers) {
          this.pinnedObservers[id].disconnect();
          delete this.pinnedObservers[id];
        }
      } if (this.taskInterval) {
        clearInterval(this.taskInterval);
        this.taskInterval = null;
      } if (this.flusher?.props?.bindTimeout) {
        clearTimeout(this.flusher.props.bindTimeout);
        this.flusher.props.bindTimeout = null;
      } if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
    }
  }
}
