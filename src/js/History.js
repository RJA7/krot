module.exports = class History {
  constructor() {
    this.items = [];
    this.pointer = -1;
  }

  reset() {
    this.items = [];
    this.pointer = -1;
  }

  put(data) {
    this.pointer += 1;
    this.items[this.pointer] = data;
    this.items.length = this.pointer + 1;
  }

  getItem() {
    return this.items[this.pointer];
  }

  stepBack() {
    if (this.pointer < 1) return;
    this.pointer -= 1;
  }

  stepForward() {
    if (this.pointer === this.items.length - 1) return;
    this.pointer += 1;
  }
};
