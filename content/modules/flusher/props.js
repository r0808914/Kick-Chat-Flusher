export class FlusherProps {
  constructor() {
    this.chatroomId = null;
    this.clickOutsideHandlerFunction = null;
    this.domain = null;
    this.displayedMessages = [];
    this.elementQueue = [];
    this.external = false;
    this.isFullscreen = false;
    this.isProcessingElements = false;
    this.isProcessingMessages = false;
    this.isVod = false;
    this.loading = false;
    this.messageQueue = [];
    this.badgeCache = [];
    this.lastPositionPerRow = [];
    this.rowQueue = [];
    this.timeoutIds = [];
    this.bannedUsers = [];
    this.video = null;
    this.lastRow = 0;
    this.maxRows = 99;
    this.isKickTools = false;
    this.messageObservers = new Map();
  }
}