const {NineSliceController} = require('./controllers/nine-slice-controller');
const {SpriteController} = require('./controllers/sprite-controller');
const {ContainerController} = require('./controllers/container-controller');
const {TextController} = require('./controllers/text-controller');
const {defaultRawUi} = require('./config');
const {populate} = require('../../module');
const {Handler} = require('./handler');
const {GUI} = require('dat.gui');
const {Ground} = require('./ground');
const {History} = require('./history');
const {makeUniqueName} = require('./utils');
const WebFont = require('webfontloader'); // todo
const PIXI = require('pixi.js');

class Krot {
  constructor() {
    this.createGui();
    const getParams = () => [new GUI({width: 300}), () => this.getHash(), this.ground.debugGraphics];
    this.spriteController = new SpriteController(...getParams());
    this.containerController = new ContainerController(...getParams());
    this.textController = new TextController(...getParams());
    this.nineSliceController = new NineSliceController(...getParams());
    this.controllers = [this.containerController, this.spriteController, this.textController, this.nineSliceController];
    this.history = new History();
    this.selectedObject = null;
    this.hash = {};

    window.addEventListener('blur', () => this.history.save());
    window.addEventListener('beforeunload', () => this.history.save());
    window.addEventListener('blur', () => this.history.putIfChanged(this.handler.getRawUi()), true);

    window.addEventListener('click', (e) => {
      const classes = ['function', 'slider'];

      if (e.target.type === 'checkbox' || classes.find(name => e.target.classList.contains(name))) {
        this.history.putIfChanged(this.handler.getRawUi());
      }
    }, true);

    this.controllers.forEach(c => c.onTreeChange.add(() => this.refreshTreeAndHash()));
    this.setRawUi(this.history.getItem());
    this.ground.align();
  }

  new() {
    if (confirm('Save current file?')) {
      return this.handler.save();
    }

    this.history.clear();
    this.setRawUi();
    this.ground.align();
  }

  open() {
    if (confirm('Save current file?')) {
      return this.handler.save();
    }

    this.history.clear();
    this.handler.open();
    this.ground.align();
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
    this.selectedObject.parent.moveDown(this.selectedObject);
    this.refreshTreeAndHash();
  }

  moveUp() {
    if (!this.selectedObject || this.selectedObject === this.ground.tree) return;
    this.selectedObject.parent.moveUp(this.selectedObject);
    this.refreshTreeAndHash();
  }

  destroy() {
    if (!this.selectedObject || this.selectedObject === this.ground.tree) return;

    if (!confirm(`Destroy ${this.selectedObject.name} and its children?`)) return;

    this.selectedObject.destroy();
    this.refreshTreeAndHash();
    this.selectedObject.controller.gui.hide();
  }

  clone() {
    if (!this.selectedObject || this.selectedObject === this.ground.tree) return;

    const rawUi = this.handler.getRawUi();
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

  setRawUi(rawUi = defaultRawUi) {
    const layout = {};

    populate(layout, rawUi);

    this.ground.clean();
    this.ground.setTree(layout[rawUi.list[0].name]);

    rawUi.list.forEach((raw) => {
      const object = layout[raw.name];
      object.controller = this[`${raw.type.charAt(0).toLowerCase()}${raw.type.slice(1)}Controller`];
      object.class = raw.class;
    });

    this.nameController.setValue(rawUi.name);
    this.widthController.setValue(rawUi.width);
    this.heightController.setValue(rawUi.height);

    this.refreshTreeAndHash();

    if (this.selectedObject) {
      const controller = this.selectedObject.controller;
      this.selectedObject = this.hash[this.selectedObject.name];
      this.selectedObject ? controller.setObject(this.selectedObject) : controller.hide();
    }
  }

  createGui() {
    const ground = new Ground();
    const handler = new Handler((rawUi) => this.setRawUi(rawUi), ground);
    const gui = new GUI();

    const fileGui = gui.addFolder('File');
    fileGui.add(this, 'new');
    fileGui.add(this, 'open');
    fileGui.add(handler, 'save');

    const editGui = gui.addFolder('Edit');
    editGui.add(this, 'undo');
    editGui.add(this, 'redo');
    editGui.add(this, 'clone');
    editGui.add(this, 'moveDown');
    editGui.add(this, 'moveUp');
    editGui.add(this, 'destroy');

    const viewGui = gui.addFolder('View');
    const nameController = viewGui.add(handler, 'name');
    const widthController = viewGui.add(ground, 'width', 0);
    const heightController = viewGui.add(ground, 'height', 0);

    const objectGui = gui.addFolder('Object');
    objectGui.add(this, 'container');
    objectGui.add(this, 'sprite');
    objectGui.add(this, 'text');
    objectGui.add(this, 'nineSlice');

    [fileGui, objectGui]
      .forEach(gui => gui.domElement.classList.add('full-width-property'));

    [widthController, heightController]
      .forEach(controller => controller.step(10));

    this.nameController = nameController;
    this.widthController = widthController;
    this.heightController = heightController;
    this.treeGui = gui.addFolder('Tree');
    this.handler = handler;
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
    sprite.textureName = '__missing';
    this.add(sprite, 'sprite');
  }

  text() {
    const text = new PIXI.Text('New Text');
    text.controller = this.textController;
    text.font = 'Arial';
    text.fill = 'rgba(255,255,255,1)';
    text.stroke = 'rgba(0,0,0,1)';
    text.strokeThickness = 2;
    text.shadowBlur = 5;
    text.shadowColor = 'rgba(0,0,0,1)';
    text.shadowStroke = true;
    text.shadowFill = true;
    this.add(text, 'text');
  }

  nineSlice() {
    // const nineSlice = new NineSlice();
    // nineSlice.controller = this.nineSliceController;
    // nineSlice.textureName = '__missing';
    // this.add(nineSlice, 'nineSlice');
  }

  // Methods
  add(object, prefix) {
    object.name = makeUniqueName(prefix, this.hash);
    object.class = '';
    (this.selectedObject || this.ground.tree).addChild(object);

    this.refreshTreeAndHash();
    this.selectObject(object);
    this.history.put(this.handler.getRawUi());
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
      this.treeGui.add({[name]: () => this.selectObject(object)}, name);
      object.children.forEach(child => traverse(child, `⠀${prefix}`));
    };

    traverse(this.ground.tree, '');
  }
}

// const spritesheetsContext = require.context('../../BuildSource/assets/spritesheets');
// const imagesContext = require.context('../../BuildSource/assets/images');
// const imgContext = require.context('../../BuildSource/assets/img');
//
// WebFont.load({
//   fontinactive: (familyName) => console.warn(`Cannot load ${familyName} font.`),
//   active: () => createGame(),
//   inactive: () => createGame(),
//   timeout: 1000,
//   custom: {
//     families: fonts,
//     urls: ['style.css'],
//   },
// });

const app = new PIXI.Application();
app.renderer.backgroundColor = 0x888888;
document.body.appendChild(app.view);

window.app = app;
window.PIXI = PIXI;

function handleResize() {
  app.renderer.resize(window.innerWidth, window.innerHeight);
  app.view.style.width = `${window.innerWidth}px`;
  app.view.style.height = `${window.innerHeight}px`;
}

handleResize();
window.addEventListener('resize', handleResize);

new Krot();
