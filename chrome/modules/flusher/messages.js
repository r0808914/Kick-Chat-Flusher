import { processMessageQueue, processElementQueue } from "../queue/queue.js";

export class FlusherMessages {
   constructor() {
      /* if (FlusherMessages.instance) return FlusherMessages.instance; */
      console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Create MessageProvider');
      this.socket = null;
      this.nativeChatObserver = null;
      this.channels = new Set();
      this.boundHandleChatMessageEvent = this.handleChatMessageEvent.bind(this);
      /* FlusherMessages.instance = this; */
   }

   subscribeChannel(flusher) {
      const id = flusher.container.getAttribute('flusher-chatroom');
      if (this.channels.has(id)) {
         console.log(`\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Channel ${id} is already subscribed.`);
         return;
      }

      const subscriptionMessage = { event: 'pusher:subscribe', data: { auth: '', channel: `chatrooms.${id}.v2` } };

      if (!this.socket) {
         this.setupWebSocket(flusher, subscriptionMessage, id);
         return;
      }

      console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Subscribe Channel: ' + id);
      this.socket.send(JSON.stringify(subscriptionMessage));
      this.channels.add(id);

      /* get history */
      this.getHistory(flusher);
   }

   async getHistory(flusher){
      const apiUrl = `https://kick.com/api/v2/channels/${flusher.props.hostId}/messages`;

      try {
         const response = await fetch(apiUrl);

         if (!response.ok) {
            throw new Error(`Failed to fetch messages. Status: ${response.status}`);
         }

         const data = await response.json();

         if (data && data.data && data.data.messages) {
            console.log(`\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m History has ${data.data.messages.length} messages`);
            data.data.messages.forEach((message) => {
               flusher.props.messageQueue.push(message);
               processMessageQueue(flusher);
            });
         } else {
            console.log('No messages found in the response.');
         }
      } catch (error) {
         console.error('Error fetching messages:', error.message);
      }
   }

   setupWebSocket(flusher) {
      const id = flusher.container.getAttribute('flusher-chatroom');
      console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Setup WebSocket');
    
      /* document.head.appendChild(this.getFont()); place somewhere else */
    
      if (this.socket) return;

      const webSocketUrl = 'wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.6.0&flash=false';
    
      this.socket = new WebSocket(webSocketUrl);
    
      // Use an arrow function for onmessage to preserve the 'this' context
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        document.body.contains(flusher.video) ? this.onMessage(id, data, flusher) : this.disposeChannel(id);
      };
    
      this.socket.addEventListener('open', (event) => {
        console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m WebSocket connection opened:', event);
        this.subscribeChannel(flusher);
      });
    
      this.socket.addEventListener('close', (event) => {
        console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m WebSocket connection closed:', event);
        this.channels.clear();
      });
    
      this.socket.addEventListener('error', (event) => {
        console.error('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m WebSocket error:', event);
      });
    }
    
    onMessage(id, data, flusher) {
      if (!flusher.states.chatEnabled || data === null || flusher.props.loading) return;
      flusher.props.messageQueue.push(data);
      processMessageQueue(flusher);
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

   disposeChannel() {
      if (this.socket) {
         this.socket.close();
         this.socket = null;
         return;
       }
      console.log(`dispose ${flusher.props.channelName}`);
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
         nativeChat.childNodes.forEach(addedNode => addMessage(addedNode));
      }, 150);

      this.nativeChatObserver = new MutationObserver(mutations => {
         mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
               mutation.addedNodes.forEach(addedNode => setTimeout(() => addMessage(addedNode), 150))
            }
         });
      });

      const observerConfig = { childList: true, subtree: false };
      this.nativeChatObserver.observe(nativeChat, observerConfig);

      function addMessage(node) {
         const clonedNode = node.cloneNode(true);
         /* hide history_breaker */
         if (node.nodeName !== "DIV" || node.getAttribute('data-chat-entry') === 'history_breaker') return;

         /* detect spam */
         if (flusher.states.spamState !== 1)
            if (detectSpam(clonedNode)) return;

         /* hide if no message */
         /* if (!clonedNode.dataset?.chatEntry) return; */

         /* hide reply */
         if (!flusher.states.reply) {
            const chatEntry = clonedNode.querySelector('.chat-entry');
            if (chatEntry && chatEntry.childElementCount > 1) {
               chatEntry.firstElementChild.style.display = 'none';
            }
         }

         flusher.props.elementQueue.push(clonedNode);
         processElementQueue(flusher);

         function detectSpam(node) {
            let uniqueString = '';
            const userId = node.querySelector('[data-chat-entry-user-id]')?.getAttribute('data-chat-entry-user-id');
            uniqueString += userId + '-';

            const divTextContent = node.querySelector('.chat-entry-content')?.textContent;
            uniqueString += divTextContent + '-';

            const emoteElements = node.querySelectorAll('[data-emote-name]');
            emoteElements.forEach((emoteElement) => {
               const emoteValue = emoteElement.getAttribute('data-emote-name');
               uniqueString += emoteValue;
            });

            const exist = flusher.props.displayedMessages.find(obj => {
               return obj.key === uniqueString
            })

            if (exist) return true;

            /* reduce repeating words */
            node.querySelectorAll('span:nth-child(3) span').forEach(function (element) {
               if (element.textContent.trim().length > 0) {
                  const regexSentence = /(\b.+?\b)\1+/g;
                  const sentence = element.textContent.replace(regexSentence, '$1');
                  const regexChar = /(.)(\1{10,})/g;
                  element.textContent = sentence.replace(regexChar, '$1$1$1$1$1$1$1$1$1$1');
               }
            });

            const entryId = node?.getAttribute('data-chat-entry');
            flusher.props.displayedMessages.push({ id: entryId, key: uniqueString });
            return false;
         }
      }
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