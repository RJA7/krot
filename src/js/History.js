const { defaultRaw } = require('./config');

class History {
  constructor() {
    this.data = {
      pointer: -1,
      list: [],
    };
  }

  clear() {
    this.data.pointer = 0;
    this.data.list = [defaultRaw];
  }

  isChanged(raw) {
    const current = this.data.list[this.data.pointer];
    return JSON.stringify(raw) !== JSON.stringify(current);
  }

  putIfChanged(raw) {
    this.isChanged(raw) && this.put(raw);
  }

  put(raw) {
    this.data.list.length = this.data.pointer + 1;
    this.data.list.push(raw);
    this.data.list.length > 100 && this.data.list.shift();
    this.data.pointer = this.data.list.length - 1;
  }

  getItem() {
    return this.data.list[this.data.pointer];
  }

  undo() {
    if (this.data.pointer === 0) {
      return null;
    }

    this.data.pointer -= 1;

    return this.getItem();
  }

  redo() {
    if (this.data.pointer === this.data.list.length - 1) {
      return null;
    }

    this.data.pointer += 1;

    return this.getItem();
  }
}

module.exports = { History };
