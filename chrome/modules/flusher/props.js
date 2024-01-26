export class FlusherProps {
  constructor() {
    this.chatroomId = null;
    this.clickOutsideHandlerFunction = null;
    this.domain = null;
    this.displayedMessages = new Set();
    this.elementQueue = [];
    this.external = false;
    this.intervalScroll = null;
    this.isFullscreen = false;
    this.isProcessingElements = false;
    this.isProcessingMessages = false;
    this.isVod = false;
    this.loading = false;
    this.messageQueue = [];
    this.lastPositionPerRow = [];
    this.rowQueue = [];
    this.scrolling = false;
    this.timeoutIds = [];
    this.video = null;
    this.lastRow = 0;
    this.maxRows = 99;
  }
}