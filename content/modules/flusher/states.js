export class FlusherStates {
  constructor() {
    this.backgroundStates = ['SMALL', 'LARGE', 'OFF'];
    this.backgroundState = 0;

    this.positionStates = ['TOP LEFT', 'LEFT', 'BOTTOM LEFT', 'TOP RIGHT', 'RIGHT', 'BOTTOM RIGHT'];
    this.positionState = 4;

    this.sizeStates = ['SMALL', 'NORMAL', 'LARGE'];
    this.sizeState = 0;

    this.chatEnabled = true;
    this.flushState = false;

    this.shadow = true;
    this.slide = true;
    this.reply = true;
    this.timeState = false;

    this.spamState = false;
    this.fontState = 1;

    this.keybinds = { "overlay": "ALT + C", "flush": "ALT + G", "menu": "ALT + M", "spam": "ALT + S" };

    this.bans = true;
    this.deleted = true;
  }
}
