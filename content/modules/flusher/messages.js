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

    logToConsole(`WebSocket Connection Opened: ${flusher.props.channelName} (${id})`);

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
        processMessageQueue();
      }
    } catch (error) {
      console.error("Error Fetching Messages:", error.message);
    }
  }

  setupWebSocket() {
    if (this.socket) return;

    const webSocketUrl = "wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.6.0&flash=false";

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
      logToConsole(`WebSocket Connection Closed: ${flusher.props.channelName} (${flusher.props.chatroomId})`);
      this.channels.clear();
    });

    this.socket.addEventListener("error", (event) => {
      console.error("WebSocket error:", event);
    });
  }

  onMessage(data) {
    if (!this.flusher.states.chatEnabled || data === null || this.flusher.props.loading)
      return;
    this.flusher.props.messageQueue.push(data);
    processMessageQueue();
  }

  disposeChannel() {
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
    });

    function waitForChat(AeroKick) {
      let parent = AeroKick ? ".chat-container .bk-overflow-y-auto" : "#chatroom-messages";
      let parentElement = document.querySelector(parent);

      if (parentElement) {
        const chatEntry =
          parentElement.querySelector(".rounded-md.bk-block") ??
          parentElement.querySelector(".group.relative");

        if (chatEntry) {
          return Promise.resolve(chatEntry.closest('.no-scrollbar.relative'));
        }
      }

      return new Promise((resolve, reject) => {
        const config = { attributes: true, childList: true, subtree: true };
        let foundChat = false;
        let observer;
        const checkParentInterval = setInterval(() => {
          parentElement = document.querySelector(
            AeroKick ? ".chat-container .bk-overflow-y-auto" : "#chatroom-messages"
          );

          if (parentElement) {
            clearInterval(checkParentInterval);
            startObserver();
          }
        }, 1000);

        const startObserver = () => {
          const mutationCallback = function (mutationsList) {
            for (const mutation of mutationsList) {
              if (mutation.type === "childList") {
                mutation.addedNodes.forEach((node) => {
                  if (
                    node.nodeType === 1 &&
                    (node.classList.contains("bk-block.rounded-md") ||
                      node.querySelector(".group.relative"))
                  ) {
                    if (foundChat) return;
                    foundChat = true;
                    cleanup();
                    resolve(node.closest('.no-scrollbar.relative'));
                  }
                });
              }
            }
          };

          observer = new MutationObserver(mutationCallback);
          observer.observe(parentElement, config);
        };

        const intervalId = setInterval(() => {
          foundChat = false;
          parentElement = document.querySelector(
            AeroKick ? ".chat-container .bk-overflow-y-auto" : "#chatroom-messages"
          );
        }, 1000);

        const cleanup = () => {
          if (observer) observer.disconnect();
          clearInterval(checkParentInterval);
          clearInterval(intervalId);
        };
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
    let pinnedNative = document.getElementById('chatroom-messages')?.parentElement?.firstElementChild;
    let pinnedFlusher = this.flusher?.container?.querySelector(".flusher-pinned");

    if (!pinnedNative || !pinnedFlusher) return;

    if (pinnedNative.querySelector('.z-absolute.w-full')?.firstChild) {
      this.addPinned(pinnedNative.querySelector('.z-absolute.w-full'), pinnedFlusher)
    }

    if (this.pinnedObserver) this.pinnedObserver.disconnect();
    this.pinnedObserver = new MutationObserver((mutations) => {
      if (mutations[0].type === "childList" && mutations[0].removedNodes.length > 0) {
        this.removePinned(pinnedFlusher);
      } else if (mutations[0].type === "attributes") {
        this.updatePinned(pinnedNative.querySelector('.z-absolute.w-full'), pinnedFlusher);
      } else if (mutations[0].type === "characterData") {
        this.updatePinned(pinnedNative.querySelector('.z-absolute.w-full'), pinnedFlusher);
      } else {
        this.addPinned(pinnedNative.querySelector('.z-absolute.w-full'), pinnedFlusher)
      }
    });

    this.pinnedObserver.observe(pinnedNative.querySelector('.relative.flex'), {
      childList: true, subtree: true, attributes: true, characterData: true
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

    if (isPin) pinElementObject.querySelectorAll('.line-clamp-2').forEach(element => {
      element.classList.remove('line-clamp-2');
    });

    let hideBtn = pinElementObject.querySelector('button.box-border.flex');

    if (hideBtn) {
      hideBtn.parentElement.classList.add('flusher-close-btn');
      hideBtn.onclick = () => {
        this.ignoredIds.push(this.pinnedId.toString());
        this.removePinned(pinnedFlusher);
      };
    }

    pinnedFlusher.firstChild
      ? pinnedFlusher.firstChild.replaceWith(pinElementObject)
      : pinnedFlusher.append(pinElementObject);

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

      this.interval(mutations.length);

      if (this.isScrolling) return;

      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          this.prepareMessage(mutation.addedNodes[0], false);
        }
      });
    });

    const observerConfig = { childList: true, subtree: false };
    this.nativeChatObserver.observe(this.flusher.nativeChat, observerConfig);
  }

  interval(count) {
    const currentMutationTime = new Date().getTime();

    if (count == 1) {
      this.lastMutationTime = currentMutationTime;
      window.flusherInterval = 1000;
      return;
    }

    const interval = Math.round((currentMutationTime - this.lastMutationTime) + (window.flusherInterval / 1.5));
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
            if (mutation.addedNodes.length > 0) {
              this.isScrolling = true;
            }

            if (targetElement.children.length === 0) {
              this.isScrolling = false;
            }
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
      if (!button) {
        /* console.log(
          "Kick Chat this.flusher - Button does not exist in the added node:",
          addedNode
        ); */
        return;
      }
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

    const observerConfig = { childList: true, subtree: true };
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

        /* if (!this.socket && !this.flusher.props.isVod)
          this.subscribeChannel(); */
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
      if (this.taskInterval) {
        clearInterval(this.taskInterval);
        this.taskInterval = null;
      }
      if (this.flusher?.props?.bindTimeout) {
        clearTimeout(this.flusher.props.bindTimeout);
        this.flusher.props.bindTimeout = null;
      }
    }
  }
}
