const { Controller } = require('./Controller');
const { makeUniqueName } = require('./utils');
const { defaultRaw } = require('./config');
const { template } = require('./template');
const { History } = require('./History');
const { remote } = require('electron');
const { GUI } = require('dat.gui');
const path = require('path');
const _ = require('lodash');
const fs = require('fs');

class Krot {
  constructor() {
    const gui = new GUI();

    this.treeGui = gui.addFolder('Tree');
    this.gui = gui;
    this.history = new History();
    this.controller = null;
    this.hash = {};
    this.filePath = '';
    this.config = null; // Client app config
  }

  new() {
    this.setRaw(defaultRaw);
    this.filePath = '';
    this.history.clear();
    this.history.put(this.getRaw());
    app.align();
  }

  open(filePath) {
    const { raw } = require(filePath);
    this.setRaw(raw);
    this.filePath = filePath;
    this.history.clear();
    this.history.put(this.getRaw());
    app.align();
  }

  save(cb) {
    if (!this.filePath) {
      return this.saveAs(cb);
    }

    const data = this.getRaw();
    const fields = data.list.map(raw => raw.name);
    const file = template({ data, fields });

    fs.writeFile(this.filePath, file, () => cb && cb());
  }

  saveAs(cb) {
    remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
      filters: [{
        extensions: ['js'],
        name: '',
      }],
    }, (filePath) => {
      if (!filePath) return;
      this.filePath = filePath;
      this.save(cb);
    });
  }

  undo() {
    const raw = this.history.undo();
    raw && this.setRaw(raw);
  }

  redo() {
    const raw = this.history.redo();
    raw && this.setRaw(raw);
  }

  moveDown() {
    if (!this.controller || this.controller.object === app.getTree()) return;

    app.moveDown(this.controller.object);
    this.refreshTreeAndHash();
    this.history.put(this.getRaw());
  }

  moveUp() {
    if (!this.controller || this.controller.object === app.getTree()) return;

    app.moveUp(this.controller.object);
    this.refreshTreeAndHash();
    this.history.put(this.getRaw());
  }

  clone() {
    if (!this.controller || this.controller.object === app.getTree()) return;

    const raw = this.getRaw();
    const stack = [this.controller.object];
    const originNameCopyNameMap = {};

    const makeCopyName = name => {
      const _index = name.lastIndexOf('_');

      if (_index === -1 || isNaN(Number(name.slice(_index + 1)))) {
        return makeUniqueName(name, this.hash);
      }

      return makeUniqueName(name.slice(0, _index), this.hash);
    };

    while (stack.length) {
      const object = stack.pop();
      const index = raw.list.findIndex(v => v.name === object.name);
      const item = raw.list[index];
      const copy = JSON.parse(JSON.stringify(item));
      copy.name = makeCopyName(item.name);
      copy.parent = originNameCopyNameMap[item.parent] || this.controller.object.parent.name;
      originNameCopyNameMap[item.name] = copy.name;
      this.hash[copy.name] = copy;
      raw.list.splice(index + 1, 0, copy);

      stack.push(...object.children);
    }

    this.setRaw(raw);
    this.history.put(raw);
  }

  destroy() {
    if (!this.controller || this.controller.object === app.getTree()) return;

    this.controller.object.destroy();
    this.controller.destroy();
    this.controller = null;
    this.refreshTreeAndHash();
    this.history.put(this.getRaw());
  }

  create(typeName) {
    const object = app.getClientModule().handlerMap[typeName]();
    object.raw = {};

    object.name = makeUniqueName(
      `${object.constructor.name.charAt(0).toLocaleLowerCase()}${object.constructor.name.slice(1)}`,
      this.hash,
    );

    if (this.controller) {
      app.add(object, this.controller.object);
      this.controller.destroy();
      this.controller = null;
    } else {
      app.add(object);
    }

    this.refreshTreeAndHash();
    this.controller = new Controller(object);
    this.history.put(this.getRaw());
  }

  requestSave(cb) {
    this.hasChanges() && confirm('Save current file?') ? this.save(cb) : cb();
  }

  hasChanges() {
    try {
      const { raw } = require(this.filePath);
      return JSON.stringify(this.getRaw()) !== JSON.stringify(raw);
    } catch (e) {
      //
    }

    return false;
  }

  setRaw(raw) {
    const layout = {};
    app.getClientModule().populate(layout, raw);
    raw.list.forEach((item) => layout[item.name].raw = raw);
    app.setTree(layout[raw.list[0].name]);

    this.refreshTreeAndHash();
    this.controller && this.controller.destroy();
    this.controller = null;
  }

  getRaw() {
    const data = {
      list: [],
    };

    const stack = [app.getTree()];

    while (stack.length) {
      const object = stack.shift();
      data.list.push(this.getSaveObject(object));
      stack.push(...object.children);
    }

    return data;
  }

  snapshot() {
    this.filePath && this.history.putIfChanged(this.getRaw());
  }

  refreshTreeAndHash() {
    this.gui.removeFolder(this.treeGui);
    this.treeGui = this.gui.addFolder('Tree');
    this.treeGui.domElement.classList.add('full-width-property');
    this.treeGui.open();
    this.hash = {};

    const traverse = (object, prefix) => {
      object.raw = this.getSaveObject(object);
      this.hash[object.raw.name] = object;
      const name = `${prefix}${object.name}`;

      this.treeGui.add({
        [name]: () => {
          this.controller && this.controller.destroy();
          this.controller = new Controller(object);
        },
      }, name);

      object.children.forEach(child => traverse(child, `⠀${prefix}`));
    };

    traverse(app.getTree(), '');

    if (this.controller && !this.hash[this.controller.object.raw.name]) {
      this.controller.destroy();
      this.controller = null;
    }
  }

  getSaveObject(object) {
    const settings = this.config.controllers[object.constructor.name];

    return settings.getFields(object).reduce((acc, config) => {
      _.set(acc, config.prop, config.descriptor ? config.descriptor.get() : _.get(object, config.prop));
      return acc;
    }, { type: object.constructor.name });
  }
}

module.exports = Krot;
