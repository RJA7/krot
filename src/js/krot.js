const { NineSlicePlaneController } = require('./controllers/nineslice-controller');
const { ContainerController } = require('./controllers/container-controller');
const { GraphicsController } = require('./controllers/graphics-controller');
const { SpriteController } = require('./controllers/sprite-controller');
const { TextController } = require('./controllers/text-controller');
const { populate, init } = require('krot-pixi');
const { makeUniqueName } = require('./utils');
const { defaultRawUi } = require('./config');
const { template } = require('./template');
const { History } = require('./history');
const { remote } = require('electron');
const { Ground } = require('./ground');
const { GUI } = require('dat.gui');
const PIXI = require('pixi.js');
const fs = require('fs');

init(PIXI);

class Krot {
  constructor() {
    this.createGui();
    const getParams = () => [new GUI({ width: 400 }), () => this.getHash(), this.ground.debugGraphics];
    this.spriteController = new SpriteController(...getParams());
    this.containerController = new ContainerController(...getParams());
    this.textController = new TextController(...getParams());
    this.nineSlicePlaneController = new NineSlicePlaneController(...getParams());
    this.graphicsController = new GraphicsController(...getParams());
    this.controllers = [this.containerController, this.spriteController, this.textController, this.nineSlicePlaneController, this.graphicsController];
    this.history = new History();
    this.selectedObject = null;
    this.hash = {};
    this.filePath = '';
    this.savedJson = '';

    this.controllers.forEach(c => c.onTreeChange.add(() => this.refreshTreeAndHash()));
  }

  isChanged() {
    return this.savedJson !== JSON.stringify(this.getRawUi());
  }

  new() {
    this.setRawUi(defaultRawUi);
    this.filePath = '';
    this.savedJson = JSON.stringify(defaultRawUi);
    this.ground.align();
    this.history.clear();
    this.history.put(this.getRawUi());
  }

  open(filePath) {
    const { rawUi } = require(filePath);
    this.setRawUi(rawUi);
    this.filePath = filePath;
    this.ground.align();
    this.history.clear();
    this.history.put(this.getRawUi());
  }

  requestSave(cb) {
    if (this.isChanged() && confirm('Save current file?')) {
      return this.save(cb);
    }

    cb();
  }

  save(cb) {
    if (!this.filePath) {
      return this.saveAs(cb);
    }

    const classHash = {};
    const hash = {};

    const writeClasses = (classes, name) => classes.forEach(className => {
      classHash[className] = classHash[className] || [];
      classHash[className].push(name);
    });

    const data = this.getRawUi(writeClasses, hash);
    const fields = data.list.map(raw => raw.name);
    const classFields = Object.keys(classHash).filter(name => classHash[name].length !== 0);
    const file = template({ data, fields, classFields });

    fs.writeFile(this.filePath, file, () => {
      this.savedJson = JSON.stringify(data);
      cb && cb();
    });
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
    const rawUi = this.history.undo();
    rawUi && this.setRawUi(rawUi);
  }

  redo() {
    const rawUi = this.history.redo();
    rawUi && this.setRawUi(rawUi);
  }

  moveDown() {
    if (!this.selectedObject || this.selectedObject === this.ground.tree) return;

    const children = this.selectedObject.parent.children;
    const index = children.indexOf(this.selectedObject);

    if (index === -1 || index === 0) return;

    children[index] = children[index - 1];
    children[index - 1] = this.selectedObject;
    this.refreshTreeAndHash();
    this.history.put(this.getRawUi());
  }

  moveUp() {
    if (!this.selectedObject || this.selectedObject === this.ground.tree) return;

    const children = this.selectedObject.parent.children;
    const index = children.indexOf(this.selectedObject);

    if (index === -1 || index === children.length - 1) return;

    children[index] = children[index + 1];
    children[index + 1] = this.selectedObject;
    this.refreshTreeAndHash();
    this.history.put(this.getRawUi());
  }

  destroy() {
    if (!this.selectedObject || this.selectedObject === this.ground.tree) return;

    if (!confirm(`Destroy ${this.selectedObject.name} and its children?`)) return;

    this.selectedObject.destroy();
    this.refreshTreeAndHash();
    this.selectedObject.controller.hide();
    this.selectedObject = null;
    this.history.put(this.getRawUi());
  }

  clone() {
    if (!this.selectedObject || this.selectedObject === this.ground.tree) return;

    const rawUi = this.getRawUi();
    const stack = [this.selectedObject];
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
      const index = rawUi.list.findIndex(v => v.name === object.name);
      const item = rawUi.list[index];
      const copy = JSON.parse(JSON.stringify(item));
      copy.name = makeCopyName(item.name);
      copy.parent = originNameCopyNameMap[item.parent] || this.selectedObject.parent.name;
      originNameCopyNameMap[item.name] = copy.name;
      this.hash[copy.name] = copy;
      rawUi.list.splice(index + 1, 0, copy);

      stack.push(...object.children);
    }

    this.setRawUi(rawUi);
    this.history.put(rawUi);
  }

  getHash() {
    return this.hash;
  }

  setRawUi(rawUi) {
    const layout = {};

    populate(layout, rawUi);

    this.ground.clean();
    this.ground.setTree(layout[rawUi.list[0].name]);

    rawUi.list.forEach((raw) => {
      const object = layout[raw.name];
      object.controller = this[`${raw.type.charAt(0).toLocaleLowerCase()}${raw.type.slice(1)}Controller`];
      object.class = raw.class;

      if (object.controller === this.graphicsController) {
        object.rectProps = raw.rectProps;
      }
    });

    this.widthController.setValue(rawUi.width);
    this.heightController.setValue(rawUi.height);

    this.refreshTreeAndHash();

    if (this.selectedObject) {
      const controller = this.selectedObject.controller;
      this.selectedObject = this.hash[this.selectedObject.name];
      this.selectedObject ? controller.setObject(this.selectedObject) : controller.hide();
    }
  }

  getRawUi(writeClasses = () => '', hash = {}) {
    const data = {
      width: this.ground.width,
      height: this.ground.height,
      list: [],
    };

    const stack = [this.ground.tree];

    while (stack.length) {
      const object = stack.shift();
      hash[object.name] = object.controller.getSaveObject(object);
      data.list.push(hash[object.name]);
      stack.push(...object.children);

      const classes = object.class.split(/\s+/).filter(v => v);
      writeClasses(classes, object.name);
    }

    return data;
  }

  snapshot() {
    this.history.putIfChanged(this.getRawUi());
  }

  createGui() {
    const ground = new Ground();
    const gui = new GUI();

    const viewGui = gui.addFolder('View');
    const widthController = viewGui.add(ground, 'width', 0);
    const heightController = viewGui.add(ground, 'height', 0);

    [widthController, heightController]
      .forEach(controller => controller.step(10));

    this.widthController = widthController;
    this.heightController = heightController;
    this.treeGui = gui.addFolder('Tree');
    this.ground = ground;
    this.gui = gui;
  }

  container() {
    const container = new PIXI.Container();
    container.controller = this.containerController;
    this.add(container, 'container');
  }

  sprite() {
    const sprite = new PIXI.Sprite();
    sprite.controller = this.spriteController;
    this.add(sprite, 'sprite');
  }

  text() {
    const text = new PIXI.Text('New Text');
    text.controller = this.textController;
    this.add(text, 'text');
  }

  nineSlice() {
    const canvas = document.createElement('canvas');
    const nineSlice = new PIXI.NineSlicePlane(PIXI.Texture.from(canvas));
    nineSlice.controller = this.nineSlicePlaneController;
    this.add(nineSlice, 'nineSlice');
  }

  graphics() {
    const graphics = new PIXI.Graphics();
    graphics.controller = this.graphicsController;
    graphics.rectProps = '0,0,100,100,0x000000,0.6';
    graphics.beginFill(0x000000, 0.6);
    graphics.drawRect(0, 0, 100, 100);
    this.add(graphics, 'graphics');
  }

  // Methods
  add(object, prefix) {
    object.name = makeUniqueName(prefix, this.hash);
    object.class = '';
    (this.selectedObject || this.ground.tree).addChild(object);

    this.refreshTreeAndHash();
    this.selectObject(object);
    this.history.put(this.getRawUi());
  }

  selectObject(object) {
    this.controllers.forEach(c => c.hide());
    this.selectedObject = object;
    object.controller.setObject(object);
    object.controller.show();
  }

  refreshTreeAndHash() {
    this.gui.removeFolder(this.treeGui);
    this.treeGui = this.gui.addFolder('Tree');
    this.treeGui.domElement.classList.add('full-width-property');
    this.treeGui.open();
    this.hash = {};

    const traverse = (object, prefix) => {
      this.hash[object.name] = object;
      const name = `${prefix}${object.name}`;
      this.treeGui.add({ [name]: () => this.selectObject(object) }, name);
      object.children.forEach(child => traverse(child, `⠀${prefix}`));
    };

    traverse(this.ground.tree, '');
  }
}

module.exports = Krot;
