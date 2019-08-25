const {createControllerBuilder} = require('./builder');
const {Signal} = require('signals.js');

class ContainerController {
  constructor(gui, getTreeHash, debugGraphics) {
    this.gui = gui;
    this.getTreeHash = getTreeHash;
    this.debugGraphics = debugGraphics;
    this.generalFolder = gui.addFolder('General');
    this.object = {name: '', parent: {name: ''}};
    this.onTreeChange = new Signal();
    this.folders = [this.generalFolder];
    this.__visible = false;

    app.ticker.add(this.update, this);

    const generalControllers = [
      {prop: 'name', defaults: ''},
      {prop: 'class', defaults: ''},
      {prop: 'x', defaults: 0, round: true},
      {prop: 'y', defaults: 0, round: true},
      {prop: 'scale.x', defaults: 1, step: 0.01},
      {prop: 'scale.y', defaults: 1, step: 0.01},
      {prop: 'angle', defaults: 0, round: true},
      {prop: 'alpha', min: 0, max: 1, defaults: 1, step: 0.01},
      {prop: 'visible', defaults: true},
      {prop: 'parent', args: [[]], defaults: ''},
      {prop: 'pivot.x', defaults: 0, step: 1, round: true},
      {prop: 'pivot.y', defaults: 0, step: 1, round: true},
    ].map(createControllerBuilder(this, this.generalFolder));

    this.parentController = generalControllers.find(c => c.property === 'parent');

    gui.hide();
  }

  setObject(object) {
    this.object = object;
    this.refreshParents();
    this.generalFolder.open();
    this.folders.forEach(folder => folder.updateDisplay());
  }

  show() {
    this.__visible = true;
    this.gui.show();
  }

  hide() {
    this.__visible = false;
    this.debugGraphics.clear();
    this.gui.hide();
  }

  refreshParents() {
    const hash = Object.assign({}, this.getTreeHash());

    const filter = (object) => {
      delete hash[object.name];
      object.children.forEach(filter);
    };

    filter(this.object);
    this.parentController.remove();
    this.parentController = this.generalFolder.add(this, 'parent', Object.keys(hash));
  }

  set name(v) {
    if (!v || this.getTreeHash()[v]) return; // todo classes have same scope with names
    this.object.name = v;
    this.onTreeChange.dispatch();
  }

  get name() {
    return this.object.name;
  }

  set parent(v) {
    const parent = this.getTreeHash()[v];
    parent.addChild(this.object);
    this.onTreeChange.dispatch();
    this.refreshParents();
  }

  get parent() {
    return this.object.parent.name;
  }

  getSaveObject(object) {
    return {
      name: object.name,
      type: 'Container',
      class: object.class,
      x: object.x,
      y: object.y,
      scale: {x: object.scale.x, y: object.scale.y},
      angle: object.angle,
      alpha: object.alpha,
      visible: object.visible,
      parent: this.getTreeHash()[object.parent.name] ? object.parent.name : '',
      pivot: {x: object.pivot.x, y: object.pivot.y},
    };
  }

  update() {
    if (!this.__visible) return;

    const pos = this.debugGraphics.toLocal(new PIXI.Point(), this.object);
    this.debugGraphics.clear();

    [
      {style: [0x000000, 1], diameter: 6},
      {style: [0xffffff, 1], diameter: 3},
    ].forEach(({style, diameter}) => {
      this.debugGraphics.beginFill(...style);
      this.debugGraphics.drawCircle(pos.x, pos.y, diameter);
    });
  }
}

module.exports = {ContainerController};
