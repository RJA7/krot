class Pool {
  constructor(create) {
    this.create = create;
    this.map = {};
    this.usedMap = {};
    this.dirty = false;
  }

  get(key, createParams) {
    let object = this.map[key];

    if (!object) {
      object = this.create(createParams);
      this.map[key] = object;
    }

    this.usedMap[key] = true;
    this.dirty = true;

    return object;
  }

  removeUnused() {
    if (!this.dirty) return;

    Object.keys(this.map).forEach((key) => {
      if (this.usedMap[key]) return;

      this.map[key].destroy();
      delete this.map[key];
    });

    this.dirty = false;
    this.usedMap = {};
  }
}

module.exports = Pool;
