const path = require('path');
const configMap = require(path.resolve(process.cwd(), 'js'));
const { populate, init } = require('../../krot-pixi');
const { Controller } = require('./Controller');
const { makeUniqueName } = require('./utils');
const { defaultRaw } = require('./config');
const { template } = require('./template');
const { History } = require('./History');
const { remote } = require('electron');
const { View } = require('./view');
const { GUI } = require('dat.gui');
const PIXI = require('pixi.js');
const _ = require('lodash');
const fs = require('fs');

init(PIXI);

class Krot {
  constructor() {
    const view = new View();
    const gui = new GUI();

    this.treeGui = gui.addFolder('Tree');
    this.view = view;
    this.gui = gui;
    this.history = new History();
    this.controller = null;
    this.hash = {};
    this.classesHash = {};
    this.filePath = '';

    app.ticker.add(() => {
      this.view.debugGraphics.clear();

      if (this.controller) {
        const config = configMap[this.controller.object.constructor.name];
        config.debug && config.debug(this.controller.object, this.view.debugGraphics);
      }
    });
  }

  new() {
    this.setRaw(defaultRaw);
    this.filePath = '';
    this.view.align();
    this.history.clear();
    this.history.put(this.getRaw());
  }

  open(filePath) {
    const { raw } = require(filePath);
    this.setRaw(raw);
    this.filePath = filePath;
    this.view.align();
    this.history.clear();
    this.history.put(this.getRaw());
  }

  save(cb) {
    if (!this.filePath) {
      return this.saveAs(cb);
    }

    const data = this.getRaw();
    const fields = data.list.map(raw => raw.name);
    const classFields = Object.keys(this.classesHash);
    const file = template({ data, fields, classFields });

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
    if (!this.controller || this.controller.object === this.view.tree) return;

    const object = this.controller.object;
    const siblings = object.parent.children;
    const index = siblings.indexOf(object);

    if (index === -1 || index === 0) return;

    siblings[index] = siblings[index - 1];
    siblings[index - 1] = object;
    this.refreshTreeAndHash();
    this.history.put(this.getRaw());
  }

  moveUp() {
    if (!this.controller || this.controller.object === this.view.tree) return;

    const object = this.controller.object;
    const siblings = object.parent.children;
    const index = siblings.indexOf(object);

    if (index === -1 || index === siblings.length - 1) return;

    siblings[index] = siblings[index + 1];
    siblings[index + 1] = object;
    this.refreshTreeAndHash();
    this.history.put(this.getRaw());
  }

  clone() {
    if (!this.controller || this.controller.object === this.view.tree) return;

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
    if (!this.controller || this.controller.object === this.view.tree) return;

    this.controller.object.destroy();
    this.controller.destroy();
    this.controller = null;
    this.refreshTreeAndHash();
    this.history.put(this.getRaw());
  }

  create(typeName) {
    const config = configMap[typeName];
    const object = config.Create(PIXI);
    object.raw = {};

    object.name = makeUniqueName(
      `${object.constructor.name.charAt(0).toLocaleLowerCase()}${object.constructor.name.slice(1)}`,
      this.hash,
    );

    if (this.controller) {
      this.controller.object.addChild(object);
      this.controller.destroy();
      this.controller = null;
    } else {
      this.view.tree.addChild(object);
    }

    this.refreshTreeAndHash();
    this.controller = new Controller(object);
  }

  requestSave(cb) {
    confirm('Save current file?') ? this.save(cb) : cb();
  }

  setRaw(raw) {
    const layout = {};
    populate(layout, raw);
    raw.list.forEach((item) => layout[item.name].raw = raw);
    this.view.setTree(layout[raw.list[0].name]);

    this.refreshTreeAndHash();
    this.controller && this.controller.destroy();
  }

  getRaw() {
    const data = {
      list: [],
    };

    const stack = [this.view.tree];

    while (stack.length) {
      const object = stack.shift();
      data.list.push(this.getSaveObject(object));
      stack.push(...object.children);
    }

    return data;
  }

  snapshot() {
    this.history.putIfChanged(this.getRaw());
  }

  refreshTreeAndHash() {
    this.gui.removeFolder(this.treeGui);
    this.treeGui = this.gui.addFolder('Tree');
    this.treeGui.domElement.classList.add('full-width-property');
    this.treeGui.open();
    this.hash = {};
    this.classesHash = {};

    const traverse = (object, prefix) => {
      object.raw = this.getSaveObject(object);
      this.hash[object.raw.name] = object;
      const name = `${prefix}${object.name}`;

      object.raw.class.split(/\s+/).filter(v => v).forEach((className) => {
        this.classesHash[className] = this.classesHash[className] || [];
        this.classesHash[className].push(object);
      });

      this.treeGui.add({
        [name]: () => {
          this.controller && this.controller.destroy();
          this.controller = new Controller(object);
        },
      }, name);

      object.children.forEach(child => traverse(child, `⠀${prefix}`));
    };

    traverse(this.view.tree, '');

    if (this.controller) {
      const object = this.controller.object;
      this.controller.destroy();
      this.controller = new Controller(object);
    }
  }

  getSaveObject(object) {
    const config = configMap[object.constructor.name];

    return config.getFields(object).reduce((acc, config) => {
      _.set(acc, config.prop, config.descriptor ? config.descriptor.get() : _.get(object, config.prop));
      return acc;
    }, { Create: config.Create });
  }
}

module.exports = Krot;
