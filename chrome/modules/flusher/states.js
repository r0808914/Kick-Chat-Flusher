export class FlusherStates {
  constructor() {
    this.backgroundStates = ['SMALL', 'LARGE', 'OFF'];
    this.positionStates = ['TOP LEFT', 'LEFT', 'BOTTOM LEFT', 'TOP RIGHT', 'RIGHT', 'BOTTOM RIGHT'];
    this.sizeStates = ['SMALL', 'NORMAL', 'LARGE'];
    this.backgroundState = 2;
    this.positionState = 0;
    this.sizeState = 1;
    this.fontState = 2;
    this.reply = true;
    this.flushState = false;
    this.chatEnabled = true;
    this.spamState = true;
    this.timeState = false;
  }
}
