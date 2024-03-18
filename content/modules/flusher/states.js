export class FlusherStates {
  constructor() {
    this.backgroundStates = ['SMALL', 'LARGE', 'OFF'];
    this.positionStates = ['TOP LEFT', 'LEFT', 'BOTTOM LEFT', 'TOP RIGHT', 'RIGHT', 'BOTTOM RIGHT'];
    this.sizeStates = ['SMALL', 'NORMAL', 'LARGE'];
    this.backgroundState = 2;
    this.positionState = 4;
    this.sizeState = 1;
    this.fontState = 1;
    this.reply = false;
    this.slide = true;
    this.flushState = false;
    this.chatEnabled = true;
    this.shadow = true;
    this.spamState = false;
    this.timeState = false;
  }
}
