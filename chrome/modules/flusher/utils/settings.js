export class FlusherSettings {
   constructor() {
     this.flusher = null;
     this.messageQueue = [];
     this.elementQueue = [];
     this.timeoutIds = [];
     this.toggledClass = 'toggled-on';
     this.spamStates = ['Auto', 'ON', 'OFF'];
     this.backgroundStates = ['SMALL', 'LARGE', 'OFF'];
     this.positionStates = ['TOP LEFT', 'LEFT', 'BOTTOM LEFT', 'TOP RIGHT', 'RIGHT', 'BOTTOM RIGHT'];
     this.sizeStates = ['SMALL', 'NORMAL', 'LARGE'];
     this.clickOutsideHandlerFunction = null;
     this.loading = false;
     this.external = false;
     /* this.displayedMessages = {}; */
     this.isVod = false;
     this.scrolling = false;
     this.isFullscreen = false;
     this.intervalScroll = null;
     this.domain = null;
     this.nativeChatObserver = null;
     this.isProcessingElements = false;
     this.isProcessingMessages = false;
   }
 }
