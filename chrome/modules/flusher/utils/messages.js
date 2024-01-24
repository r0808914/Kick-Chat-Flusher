import { visibilityChange } from "./utils.js";

class FlusherMessages {
   constructor() {
      if (FlusherMessages.instance) return FlusherMessages.instance;
      console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Create MessageProvider');
      this.socket = null;
      this.nativeChatObserver = null;
      this.boundHandleChatMessageEvent = this.handleChatMessageEvent.bind(this);
      FlusherMessages.instance = this;
   }

   createChannel(iframe) {
      const src = iframe.getAttribute('src');
      if (src && src.includes('kick.com')) {
         const channelName = new URL(src).pathname.slice(1);
         fetch(`https://kick.com/api/v1/channels/${channelName}`)
            .then(response => response.json())
            .then(data => {
               const chatroomId = data && data.chatroom && data.chatroom.id;
               createChat(iframe, chatroomId)
                  .then(flusher => subscribeChannel(flusher, iframe))
                  .catch(error => console.error('Error creating chat:', error));
            })
            .catch(error => console.error('Error fetching data:', error));
      }
   }

   subscribeChannel(flusher, iframe) {
      const id = flusher.getAttribute('flusher-chatroom');
      const channel = socket.subscribe(`chatrooms.${id}.v2`);
      channel.unbind_global();

      channel.bind_global(function (eventName, data) {
         document.body.contains(iframe) ? onMessage(id, data) : disposeChannel(id);
         function onMessage(id, data) {
            if (!flushers[id].chatEnabled || data === null || loading) return;
            messageQueue.push(data);
            processMessageQueue();
         }
      });
   }

   disposeChannel(id) {
      if (external) return;
      socket.unsubscribe(`chatrooms.${id}.v2`);
      console.log(`dispose ${flushers[id].channelName}.${id}`);
   }


   addPusher() {
      const pusherScript = document.createElement('script');
      pusherScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pusher/8.3.0/pusher.min.js';
      pusherScript.integrity = 'sha512-tXL5mrkSoP49uQf2jO0LbvzMyFgki//znmq0wYXGq94gVF6TU0QlrSbwGuPpKTeN1mIjReeqKZ4/NJPjHN1d2Q==';
      pusherScript.crossOrigin = 'anonymous';
      pusherScript.referrerPolicy = 'no-referrer';
      document.head.appendChild(pusherScript);

      document.head.appendChild(this.getFont());
   }

   setupPusher() {
      if (this.socket !== null) return;
      this.socket = new Pusher('eb1d5f283081a78b932c', {
         cluster: 'us2',
         protocol: 'wss',
         encrypted: true,
      });
   }

   parseRequest(response) {
      console.log(response);
      if (isVod) {
         if (!flusherSettings?.chatEnabled || flusherSettings.loading) return;
         if (flusherSettings?.flusher) {
            response.data.messages.forEach(function (message) {
               messageQueue.push(message);
            });
            processMessageQueue();
         } else {
            setTimeout(function () {
               if (response.data.messages.length > 0) {
                  /* check if needed */
                  messageQueue.push(response.data.messages[0]);
               }
               initializeChat();
               processMessageQueue();
            }, 1000);
         }
      } else {
         /* response.data.messages.forEach(function (message) {
            messageQueue.push(message);
         });
         initializeChat(); */
      }
   }

   subscribeChannel(flusher, iframe) {
      const id = flusher.getAttribute('flusher-chatroom');
      const channel = socket.subscribe(`chatrooms.${id}.v2`);
      channel.unbind_global();

      channel.bind_global(function (eventName, data) {
         document.body.contains(iframe) ? onMessage(id, data) : disposeChannel(id);
         function onMessage(id, data) {
            if (!flusherSettings.flushers[id].chatEnabled || data === null || flusherSettings.loading) return;
            messageQueue.push(data);
            processMessageQueue();
         }
      });
   }

   disposeChannel(id) {
      if (flusherSettings.external) return;
      socket.unsubscribe(`chatrooms.${id}.v2`);
      console.log(`dispose ${flusherSettings.flushers[id].channelName}.${id}`);
   }

   handleChatMessageEvent(data) {
      try {
         if (flusherSettings.isVod || !flusherSettings.chatEnabled || flusherSettings.loading || !flusherSettings.flushState) return;
         if (flusherSettings.flusher) {
            data.data.chatroom_id = 0;
            messageQueue.push(data.data);
            processMessageQueue();
            return;
         }
      } catch (error) {
         if (!flusherSettings) initializeChat();
      }
   }

   interceptChatRequests() {
      let open = window.XMLHttpRequest.prototype.open;
      window.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
         if (url.includes("/api/v2/channels/") && url.includes("/messages")) {
            this.addEventListener("load", function () {
               let self = this;
               const response = JSON.parse(self.responseText);
               if (response.data && response.data.messages) {
                  parseRequest(response);
               }
            }, false);
         }

         open.apply(this, arguments);
      };
   }

   interceptNative(flusher) {
      console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Intercept Native Chat');
      const nativeChat = document.querySelector('.overflow-y-scroll.py-3');
      setTimeout(() => {
         nativeChat.childNodes.forEach(childNode => {
            const clonedNode = childNode.cloneNode(true);
            flusher.appendChild(clonedNode);
         });
      }, 150);

      function cloneAndAppend(node) {
         setTimeout(() => {
            const clonedNode = node.cloneNode(true);
            if (node.getAttribute('data-chat-entry') === 'history_breaker') return;
            const lastItem = flusher.firstChild;
            if (lastItem) {
               flusher.insertBefore(clonedNode, flusher.firstChild);
            } else {
               flusher.append(clonedNode);
            }
            if (flusher.children.length > flusherSettings.maxRows) {
               /* flusherSettings.displayedMessages.delete(messageKey); */
               flusher.removeChild(flusher.lastChild);
            }
         }, 150);
      }

      this.nativeChatObserver = new MutationObserver(mutations => {
         mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
               mutation.addedNodes.forEach(addedNode => {
                  cloneAndAppend(addedNode);
               });
            }
         });
      });

      const observerConfig = { childList: true, subtree: false };
      this.nativeChatObserver.observe(nativeChat, observerConfig);
   }

   bindRequests(flusherSettings, flusher) {
      console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Bind Requests');
      if (!flusherSettings.isVod && !flusherSettings.flushState) this.interceptNative(flusher);

      if (!this.socket) {
         visibilityChange();
         if (flusherSettings.external) this.interceptChatRequests(flusherSettings);

         /* messages over pusher */
         if (!this.socket && !flusherSettings.external) {
          /*   this.socket = window.Echo.connector.pusher; */
          this.waitForPusher().then((pusher) => {
            // Now you can use 'pusher' safely
            console.log('Pusher is ready:', pusher);
            this.socket.connection.bind("message", this.boundHandleChatMessageEvent);

            // Your code that depends on 'pusher' goes here
          });
         }
      }
   }

 waitForPusher() {
      return new Promise((resolve) => {
        function checkPusher() {
          if (window.Echo && window.Echo.connector && window.Echo.connector.pusher) {
            resolve(window.Echo.connector.pusher);
          } else {
            console.log('failed');
            // Retry after a short delay
            setTimeout(checkPusher, 500);
          }
        }
    
        // Start the initial check
        checkPusher();
      });
    }
}

const FlusherMessageProvider = new FlusherMessages();
export { FlusherMessageProvider };