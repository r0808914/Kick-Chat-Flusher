import { visibilityChange } from "../utils/utils.js";
import { processMessageQueue, processElementQueue } from "../queue/queue.js";

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
            if (!flusher.chatEnabled || data === null || loading) return;
            messageQueue.push(data);
            processMessageQueue();
         }
      });
   }

   disposeChannel(id) {
      if (external) return;
      socket.unsubscribe(`chatrooms.${id}.v2`);
      console.log(`dispose ${flusher.channelName}.${id}`);
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
         if (!props?.chatEnabled || props.loading) return;
         if (props?.flusher) {
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
            if (!props.flusher.chatEnabled || data === null || props.loading) return;
            messageQueue.push(data);
            processMessageQueue();
         }
      });
   }

   disposeChannel(id) {
      if (props.external) return;
      socket.unsubscribe(`chatrooms.${id}.v2`);
      console.log(`dispose ${props.flusher.channelName}.${id}`);
   }

   handleChatMessageEvent(data) {
      try {
         if (props.isVod || !props.chatEnabled || props.loading || !props.flushState) return;
         if (props.flusher) {
            data.data.chatroom_id = 0;
            messageQueue.push(data.data);
            processMessageQueue();
            return;
         }
      } catch (error) {
         if (!props) initializeChat();
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
            flusher.props.elementQueue.push(clonedNode);
            processElementQueue(flusher);
         });
      }, 100);

      this.nativeChatObserver = new MutationObserver(mutations => {
         mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
               mutation.addedNodes.forEach(addedNode => {
                  const clonedNode = addedNode.cloneNode(true);
                  flusher.props.elementQueue.push(clonedNode);
                  processElementQueue(flusher);
               });
            }
         });
      });

      const observerConfig = { childList: true, subtree: false };
      this.nativeChatObserver.observe(nativeChat, observerConfig);
   }

   bindRequests(flusher) {
      console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Bind Requests');
      if (!flusher.props.external) this.interceptNative(flusher);

      if (!this.socket && flusher.props.external) {
         /* visibilityChange(); */
         if (flusher.props.external) this.interceptChatRequests();

         /* messages over pusher */
         if (!this.socket && !flusher.props.external) {
            /*   this.socket = window.Echo.connector.pusher; */

            this.socket.connection.bind("message", this.boundHandleChatMessageEvent);
            // Your code that depends on 'pusher' goes here
         }
      }
   }

   unbindRequests(flusher) {
      console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Unbind Requests');
      console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Dispose Native Chat');
      if (this.nativeChatObserver) this.nativeChatObserver.disconnect();
      this.nativeChatObserver = null;
   }
}

const FlusherMessageProvider = new FlusherMessages();
export { FlusherMessageProvider };