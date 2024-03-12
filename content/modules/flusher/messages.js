import { processMessageQueue, processElementQueue } from "../queue/queue.js";
import { logToConsole } from "../utils/utils.js";

export class FlusherMessages {
  constructor() {
    logToConsole("Create MessageProvider");
    this.socket = null;
    this.nativeChatObserver = null;
    this.channels = new Set();
  }

  subscribeChannel(flusher) {
    const id = flusher.props.chatroomId;
    if (!id) return;
    if (this.channels.has(id)) {
      logToConsole(`Channel ${id} is already subscribed.`);
      return;
    }

    const subscriptionMessage = {
      event: "pusher:subscribe",
      data: { auth: "", channel: `chatrooms.${id}.v2` },
    };

    if (!this.socket) {
      this.setupWebSocket(flusher, subscriptionMessage, id);
      return;
    }

    logToConsole(`Subscribe Channel:  ${id}`);

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
        logToConsole(`History has ${data.data.messages.length} messages`);

        data.data.messages.forEach((message) => {
          flusher.props.messageQueue.push(message);
        });
        processMessageQueue(flusher);
      } else {
        logToConsole("No messages found in the response.");
      }
    } catch (error) {
      console.error("Error fetching messages:", error.message);
    }
  }

  setupWebSocket(flusher) {
    logToConsole("Setup WebSocket");

    if (this.socket) return;

    const webSocketUrl =
      "wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.6.0&flash=false";

    this.socket = new WebSocket(webSocketUrl);

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      document.body.contains(flusher.video)
        ? this.onMessage(data, flusher)
        : this.disposeChannel();
    };

    this.socket.addEventListener("open", (event) => {
      logToConsole(`WebSocket connection opened ${flusher.props.channelName}`);
      this.subscribeChannel(flusher);
    });

    this.socket.addEventListener("close", (event) => {
      logToConsole(`WebSocket connection closed ${flusher.props.channelName}`);
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
    logToConsole(`Intercept Native Chat`);

    const AeroKick = document.body.classList.contains("aerokick-customization");
    if (AeroKick) logToConsole(`detected: AeroKick for Chat`);

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

    const b = typeof browser !== "undefined" ? browser : chrome;
    const defaultAvatar = b.runtime.getURL("lib/kick/user-profile-pic.png");

    if (!flusher.states.flushState)
      setTimeout(() => {
        logToConsole(`Parse existing`);
        nativeChat.childNodes.forEach((addedNode) => {
          checkDupe(addedNode, AeroKick);
        });
      }, 500);

    this.nativeChatObserver = new MutationObserver((mutations) => {
      const nodesList = flusher.props.isVod ? mutations.reverse() : mutations;
      nodesList.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((addedNode) => {
            checkDupe(addedNode, AeroKick);
          });
        }
      });
    });

    const observerConfig = { childList: true, subtree: false };
    this.nativeChatObserver.observe(nativeChat, observerConfig);

    function checkDupe(addedNode, AeroKick) {
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

      if (id || id === "") {
        if (!flusher.states.spamState || flusher.states.flushState) {
          let uniqueString = "";
          const userId =
            AeroKick && flusher.props.isAeroKick
              ? addedNode
                  .querySelector("button")
                  .getAttribute("data-radial-username")
              : addedNode
                  .querySelector("[data-chat-entry-user-id]")
                  ?.getAttribute("data-chat-entry-user-id");
          uniqueString += userId + "-";

          const divTextContent =
            AeroKick && flusher.props.isAeroKick
              ? addedNode.querySelector("span.bk-inline").textContent
              : addedNode.querySelector(".chat-entry-content")?.textContent;
          uniqueString += divTextContent + "-";

          if (AeroKick && flusher.props.isAeroKick) {
            const emoteElements = addedNode.querySelectorAll("img");
            emoteElements.forEach((emoteElement) => {
              const emoteValue = emoteElement.getAttribute("alt");
              uniqueString += emoteValue;
            });
          } else {
            const emoteElements =
              addedNode.querySelectorAll("[data-emote-name]");
            emoteElements.forEach((emoteElement) => {
              const emoteValue = emoteElement.getAttribute("data-emote-name");
              uniqueString += emoteValue;
            });
          }

          const exist = flusher.props.displayedMessages.find((obj) => {
            return obj.key === uniqueString;
          });

          if (exist) return;

          flusher.props.displayedMessages.push({ id: id, key: uniqueString });
        }
      }

      setTimeout(() => addMessage(addedNode, id, defaultAvatar, AeroKick), 150);
    }

    function addMessage(node, id, defaultAvatar, AeroKick) {
      const clonedNode = node.cloneNode(true);

      if (AeroKick) {
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

      /* function getRandomColor() {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
               color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
         }

         const randomColor = getRandomColor();
         node.style.border = `2px solid ${randomColor}`;
         clonedNode.style.border = `2px solid ${randomColor}`; */

      if (id || id === "") {
        if (
          (!flusher.states.spamState || flusher.states.flushState) &&
          !flusher.props.isVod
        ) {
          clonedNode
            .querySelectorAll("span:nth-child(3) span")
            .forEach(function (element) {
              if (element.textContent.trim().length > 0) {
                const regexSentence = /(\b.+?\b)\1+/g;
                const sentence = element.textContent.replace(
                  regexSentence,
                  "$1"
                );
                const regexChar = /(.)(\1{10,})/g;
                element.textContent = sentence.replace(
                  regexChar,
                  "$1$1$1$1$1$1$1$1$1$1"
                );
              }
            });
        }

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

      flusher.props.elementQueue.push(clonedNode);
      processElementQueue(flusher);
    }

    function waitForChat(parent) {
      logToConsole(`Looking for Native Chat`);

      if (!parent) parent = document.body;

      const chatEntry =
        parent.querySelector(".rounded-md.bk-block") ||
        parent.querySelector("[data-chat-entry]");
      if (chatEntry) {
        logToConsole(`Native Chat found`);
        return chatEntry.parentElement;
      }

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
                  logToConsole(`Native Chat found`);
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
    logToConsole(`Bind Requests`);

    if (!flusher) return;

    if (!flusher.props.external && !this.nativeChatObserver)
      this.interceptNative(flusher);

    setTimeout(
      async () => {
        if (!flusher) return;

        if (!flusher.props.chatroomId && !flusher.props.isVod) {
          try {
            const response = await fetch(
              `https://kick.com/api/v1/channels/${flusher.props.channelName}`
            );
            const data = await response.json();

            flusher.props.chatroomId =
              data && data.chatroom && data.chatroom.id;
            logToConsole(
              `chatroomId: ${flusher.props.chatroomId} ${flusher.props.channelName}`
            );

            flusher.props.hostId = data.id;

            if (flusher.props.external) {
              logToConsole(`${data.subscriber_badges.length} Badges`);
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
    logToConsole(`Unbind Requests`);
    this.disposeChannel(flusher);
    if (!flusher?.props?.external) {
      logToConsole(`Dispose Native Chat`);
      if (this.nativeChatObserver) this.nativeChatObserver.disconnect();
      this.nativeChatObserver = null;
    }
  }
}
