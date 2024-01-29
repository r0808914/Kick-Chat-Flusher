export class FlusherStates {
  constructor() {
    this.spamStates = ['AUTO', 'ON', 'OFF'];
    this.backgroundStates = ['SMALL', 'LARGE', 'OFF'];
    this.positionStates = ['TOP LEFT', 'LEFT', 'BOTTOM LEFT', 'TOP RIGHT', 'RIGHT', 'BOTTOM RIGHT'];
    this.sizeStates = ['SMALL', 'NORMAL', 'LARGE'];
    this.spamState = 1;
    this.backgroundState = 2;
    this.positionState = 0;
    this.sizeState = 1;
    this.reply = true;
    this.flushState = false;
    this.chatEnabled = true;
  }
}
