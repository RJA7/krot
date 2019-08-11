const {defaultRawUi} = require('./config');

class History {
  constructor() {
    this.data = {
      pointer: -1,
      list: [],
    };

    this.init();
  }

  init() {
    let data;

    try {
      data = JSON.parse(localStorage.getItem('data'));
    } catch (e) {
      // noop
    }

    if (data && 'pointer' in data && data.list && data.list.length) {
      this.data = data;
    } else {
      this.clear();
    }
  }

  clear() {
    this.data.pointer = 0;
    this.data.list = [defaultRawUi];
  }

  save() {
    localStorage.setItem('data', JSON.stringify(this.data));
  }

  isChanged(rawUi) {
    const current = this.data.list[this.data.pointer];
    return JSON.stringify(rawUi) !== JSON.stringify(current);
  }

  putIfChanged(rawUi) {
    this.isChanged(rawUi) && this.put(rawUi);
  }

  put(rawUi) {
    this.data.list.length = this.data.pointer + 1;
    this.data.list.push(rawUi);
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

module.exports = {History};
