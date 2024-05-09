import { processMessageQueue, processElementQueue, createUserBanMessage } from "../queue/queue.js";
import { logToConsole } from "../utils/utils.js";

export class FlusherMessages {
  constructor() {
    this.socket = null;
    this.nativeChatObserver = null;
    this.channels = new Set();
  }

  subscribeChannel(flusher) {
    const id = flusher.props.chatroomId;
    if (!id || this.channels.has(id)) return;

    const subscriptionMessage = {
      event: "pusher:subscribe",
      data: { auth: "", channel: `chatrooms.${id}.v2` },
    };

    if (!this.socket) {
      this.setupWebSocket(flusher, subscriptionMessage, id);
      return;
    }

    logToConsole(`WebSocket Connection Opened: ${flusher.props.channelName} (${id})`);

    this.socket.send(JSON.stringify(subscriptionMessage));
    this.channels.add(id);

    if (flusher.props.external) this.getHistory(flusher);
  }

  async getHistory(flusher) {
    const apiUrl = `https://kick.com/api/v2/channels/${flusher.props.hostId}/messages`;

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch messages. Status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.data && data.data.messages) {
        data.data.messages.forEach((message) => {
          flusher.props.messageQueue.push(message);
        });
        processMessageQueue(flusher);
      }
    } catch (error) {
      console.error("Error Fetching Messages:", error.message);
    }
  }

  setupWebSocket(flusher) {
    if (this.socket) return;

    const webSocketUrl = "wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.6.0&flash=false";

    this.socket = new WebSocket(webSocketUrl);

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      document.body.contains(flusher.video)
        ? this.onMessage(data, flusher)
        : this.disposeChannel();
    };

    this.socket.addEventListener("open", (event) => {
      this.subscribeChannel(flusher);
    });

    this.socket.addEventListener("close", (event) => {
      logToConsole(`WebSocket Connection Closed: ${flusher.props.channelName} (${flusher.props.chatroomId})`);
      this.channels.clear();
    });

    this.socket.addEventListener("error", (event) => {
      console.error("WebSocket error:", event);
    });
  }

  onMessage(data, flusher) {
    if (!flusher.states.chatEnabled || data === null || flusher.props.loading)
      return;
    flusher.props.messageQueue.push(data);
    processMessageQueue(flusher);
  }

  disposeChannel() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      return;
    }
  }

  async interceptNative(flusher) {
    const self = this;
    self.flusher = flusher;

    const AeroKick = document.body.classList.contains("aerokick-customization");
    if (AeroKick) logToConsole(`AeroKick Detected`);

    const nativeChat = await waitForChat(
      flusher.props.isVod
        ? document.querySelector("#chatroom-replay")
        : document.querySelector(
          AeroKick
            ? ".chat-container .bk-overflow-y-auto"
            : ".overflow-y-scroll.py-3"
        ),
      AeroKick
    );

    flusher.props.nativeChat = nativeChat;

    const b = typeof browser !== "undefined" ? browser : chrome;
    const defaultAvatar = b.runtime.getURL("lib/kick/user-profile-pic.png");

    if (!flusher.states.flushState)
      setTimeout(() => {
        nativeChat.childNodes.forEach((addedNode) => {
          prepareMessage(addedNode, false);
        });
      }, 500);

    this.nativeChatObserver = new MutationObserver((mutations) => {
      mutations.reverse().forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((addedNode) => {
            prepareMessage(addedNode, false);
          });
        }
      });
    });

    const observerConfig = { childList: true, subtree: false };
    this.nativeChatObserver.observe(nativeChat, observerConfig);

    function prepareMessage(addedNode, update) {
      if (!addedNode || addedNode.nodeName !== "DIV") return;

      if (AeroKick && !flusher.props.isVod) {
        const button = addedNode.querySelector("button");
        if (!button) {
          console.log(
            "Kick Chat Flusher - Button does not exist in the added node:",
            addedNode
          );
          return;
        }
      }

      const id =
        AeroKick && flusher.props.isAeroKick
          ? addedNode.querySelector("button").getAttribute("data-radial-id")
          : addedNode.getAttribute("data-chat-entry");
      if (
        id === "history_breaker" ||
        (flusher.states.flushState && (!id || id === ""))
      )
        return;

      const clonedNode = addedNode.cloneNode(true);

      if (self.flusher.props.isAeroKick) {
        clonedNode.style.fontSize = null;
        clonedNode.style.marginTop = null;
        clonedNode.classList.remove("relative", "bk-pl-1.5");

        if (flusher.states.flushState) {
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

      if (id || id === "") {
        if (
          (!flusher.states.spamState || flusher.states.flushState) &&
          !flusher.props.isVod
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
                  text = text.replace(/\s+/g, ' ');

                  /* Remove duplicate consecutive characters */
                  /* text = text.replace(/([\s\S])(\1{2,})/gu, '$1$1$1'); */
                  text = text.replace(/([\p{Emoji}]|[\p{L}])(\1{2,})/gu, '$1$1$1');

                  let regex;

                  /* Remove duplicate sentences */
                  /* 
                  text = text.replace(regex, "$1"); */
                  /* text = splitAndFilterStringByEmoji(text); */

                  // Regular expression to match repeating sequences
                  regex = /(.+?)\1{2,}/g;
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

        if (checkDupe() && !update) return;

        if (!flusher.states.reply || flusher.states.flushState) {
          if (AeroKick) {
            const chatEntry = clonedNode.querySelector(".bk-text-sm");
            if (chatEntry) chatEntry.style.display = "none";
          } else {
            const chatEntry = clonedNode.querySelector(".chat-entry");
            if (chatEntry && chatEntry.childElementCount > 1) {
              chatEntry.firstElementChild.style.display = "none";
            }
          }
        }

        if (
          flusher.props.isVod &&
          (flusher.states.flushState || !flusher.states.timeState)
        ) {
          const chatEntryDiv = clonedNode.querySelector(".chat-entry div");
          if (chatEntryDiv && chatEntryDiv.firstElementChild) {
            chatEntryDiv.firstElementChild.style.display = "none";
          }
        }
      }

      clonedNode.classList.remove("mt-0.5");

      if (!update) {
        addMessage();
      } else {
        return clonedNode;
      }

      function checkDupe() {
        if (id || id === "") {

          const userId =
            AeroKick && flusher.props.isAeroKick
              ? clonedNode
                .querySelector("button")
                .getAttribute("data-radial-username")
              : clonedNode
                .querySelector("[data-chat-entry-user-id]")
                ?.getAttribute("data-chat-entry-user-id");

          if (self.flusher.props.isKickTools) {
            if (clonedNode.style.opacity ?? 1 < 1) {
              const isUserBanned = self.flusher.props.bannedUsers.some(user => user.id === userId);
              if (isUserBanned) { console.log(userId + ' allowed'); } else {
                return true;
              }
            }
          }

          if (!flusher.states.spamState || flusher.states.flushState) {
            let emoteElements;
            let uniqueString = "";

            const divTextContent =
              AeroKick && flusher.props.isAeroKick
                ? clonedNode.querySelector("span.bk-inline").textContent
                : clonedNode.querySelector(".chat-entry-content")?.textContent;

            /* set text content */
            if (divTextContent) {
              uniqueString += divTextContent + " ";

              /* Remove duplicate consecutive characters */
              uniqueString = uniqueString.replace(/([\p{Emoji}]|[\p{L}])(\1{2,})/gu, '$1');

            }

            /* set emotes */
            if (AeroKick) {
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
              emoteElements = clonedNode.querySelectorAll("[data-emote-name]");
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

            const exist = flusher.props.displayedMessages.find((obj) => {
              return obj.key === uniqueString;
            });

            if (exist) return true;

            flusher.props.displayedMessages.push({ id: id, key: uniqueString });

            return false;
          }
        }
        return false;
      }

      function addMessage() {
        flusher.props.elementQueue.push(clonedNode);
        processElementQueue(flusher);

        if (id && !flusher.states.flushState) observeNestedChildren(addedNode, id, clonedNode);

        function observeNestedChildren(parentNode, id, clonedNode) {
          const observer = new MutationObserver(() => {
            if (clonedNode) {
              if (flusher.states.deleted && parentNode.querySelector('.chat-entry-content-deleted')) {
                clonedNode.classList.add('flusher-deleted');
              } else {
                clonedNode.replaceWith(prepareMessage(parentNode, true));
              }
            }
          });

          const observerConfig = { childList: true, subtree: true };
          observer.observe(parentNode, observerConfig);

          flusher.props.messageObservers.set(id, observer);
        }
      }
    }

    function waitForChat(parent) {
      if (!parent) parent = document.body;

      const chatEntry =
        parent.querySelector(".rounded-md.bk-block") ??
        parent.querySelector("[data-chat-entry]");
      if (chatEntry) return chatEntry.parentElement;

      return new Promise((resolve) => {
        const config = { attributes: true, childList: true, subtree: true };
        let found = false;

        const mutationCallback = function (mutationsList, observer) {
          for (const mutation of mutationsList) {
            if (mutation.type === "childList") {
              mutation.addedNodes.forEach((node) => {
                if (
                  node.nodeType === 1 &&
                  (node.classList.contains("bk-block.rounded-md") ||
                    node.hasAttribute("data-chat-entry"))
                ) {
                  if (found) return;
                  observer.disconnect();
                  resolve(node.parentNode);
                  found = true;
                }
              });
            }
          }
        };

        const observer = new MutationObserver(mutationCallback);
        observer.observe(parent, config);
      });
    }
  }

  async bindRequests(flusher) {
    if (!flusher) return;

    if (!flusher.props.external && !this.nativeChatObserver)
      this.interceptNative(flusher);

    flusher.props.bindTimeout = setTimeout(
      async () => {
        if (!flusher) return;

        if (!flusher.props.chatroomId && !flusher.props.isVod) {
          try {
            const channelName = flusher.props.channelName.toLowerCase().replace(/\s/g, '');
            const response = await fetch(
              `https://kick.com/api/v1/channels/${channelName}`
            );
            const data = await response.json();

            flusher.props.chatroomId =
              data && data.chatroom && data.chatroom.id;

            flusher.props.hostId = data.id;

            if (flusher.props.external) {
              flusher.props.badgeCache.push(...data.subscriber_badges);
            }
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        }

        if (!this.socket && !flusher.props.isVod)
          this.subscribeChannel(flusher);
      },
      flusher.props.external ? 0 : 5000
    );
  }

  unbindRequests(flusher) {
    this.disposeChannel(flusher);
    if (!flusher?.props?.external) {
      if (this.nativeChatObserver) this.nativeChatObserver.disconnect();
      this.nativeChatObserver = null;
      clearTimeout(flusher.props.bindTimeout);
    }
  }
}
