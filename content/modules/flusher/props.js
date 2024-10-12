export class FlusherProps {
  constructor() {
    // General configuration and state
    this.chatroomId = null;
    this.domain = null;
    this.video = null;
    this.videoSize = null;
    this.isVod = false;
    this.isKickTools = false;
    this.external = false;
    this.loading = false;

    // Processing states
    this.isProcessingElements = false;
    this.isProcessingMessages = false;

    // Message-related properties
    this.displayedMessages = [];
    this.messageQueue = [];
    this.badgeCache = [];
    this.messageObservers = new Map();

    // Row and positioning related properties
    this.lastPositionPerRow = [];
    this.rowQueue = [];
    this.lastRow = 0;
    this.maxRows = 99;

    // Element queue and timeouts
    this.elementQueue = [];
    this.timeoutIds = [];

    // User and interaction related
    this.bannedUsers = [];
    this.clickOutsideHandlerFunction = null;

    // Keyboard input and keybinds
    this.keydownListener = null;
    this.keydownSetListener = null;
    this.isCaptureKeybind = false;
  }
}