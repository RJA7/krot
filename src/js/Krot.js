const {jsTemplate, tsTemplate} = require('./template');
const components = require('./components');
const Renderer = require('./Renderer');
const {History} = require('./History');
const {remote} = require('electron');
const {GUI} = require('dat.gui');
const uuid = require('uuid/v4');
const _ = require('lodash');
const fs = require('fs');

const fileOptions = {
  filters: [
    {extensions: ['ts'], name: ''},
    {extensions: ['js'], name: ''},
  ],
};

class Krot {
  constructor() {
    const gui = new GUI();

    this.token = '/* @!|raw|!@ */';
    this.treeGui = gui.addFolder('Tree');
    this.gui = gui;
    this.history = new History();
    this.controller = null;
    this.filePath = '';

    this.components = components.map((Component) => new Component());
    this.renderer = new Renderer();

    this.config = {
      imagesDirs: [],
      atlasesDirs: [],
      fontsDirs: [],
      googleFonts: [],
      standardFonts: [],
      imports: `import * as PIXI from 'pixi.js';`,
    };

    this.data = {list: []};
  }

  setData(patch, skipHistory) {
    this.data = {...this.data, ...patch};
    !skipHistory && this.history.put(this.data);
  }

  updateItem(patch, skipHistory) {
    const id = this.data.modelId;
    this.setData({list: this.data.list.map((m) => m.id === id ? {...m, ...patch} : m)}, skipHistory);
  }

  getModel(id = this.data.modelId) {
    return krot.data.list.find((m) => m.id === id);
  }

  getModelIndex(id = this.data.modelId) {
    return krot.data.list.findIndex((m) => m.id === id);
  }

  async new() {
    await new Promise((fulfill) => this.requestSave(fulfill));
    this.filePath = '';
    this.history.reset();

    const rootModel = this.components.find((c) => c.type === 'Container').getInitialModel();
    rootModel.id = uuid();
    rootModel.type = 'Container';
    rootModel.name = 'root';

    this.setData({
      modelId: '',
      list: [rootModel],
    });
  }

  open(filePath) {
    const file = fs.readFileSync(filePath, 'utf-8');
    const data = eval(`(${file.split(this.token)[1]})`);
    this.history.reset();
    this.setData(data);
    this.filePath = filePath;
  }

  save(cb) {
    if (!this.filePath) {
      return this.saveAs(cb);
    }

    const errors = this.validate();

    if (errors) {
      alert(errors[0]);
      cb && cb();

      return;
    }

    const template = this.filePath.endsWith('.js') ? jsTemplate : tsTemplate;
    const file = template(this.data);
    fs.writeFile(this.filePath, file, () => cb && cb());
  }

  async saveAs(cb) {
    const answer = await remote.dialog.showSaveDialog(remote.getCurrentWindow(), fileOptions);

    if (!answer.filePath) return;

    this.filePath = answer.filePath;
    this.save(cb);
  }

  undo() {
    this.history.stepBack();
    const item = this.history.getItem();
    item && this.setData(item, true);
  }

  redo() {
    this.history.stepForward();
    const item = this.history.getItem();
    item && this.setData(item, true);
  }

  moveDown() {
    this.move(1);
  }

  moveUp() {
    this.move(-1);
  }

  move(stepZ) {
    const srcIndex = this.getModelIndex();

    if (srcIndex === -1) return;

    const model = this.data.list[srcIndex];
    const parentIds = this.data.list.map((m) => m.parent);
    const minIndex = parentIds.indexOf(model.parent);
    const maxIndex = parentIds.lastIndexOf(model.parent) + 1;
    const dstIndex = srcIndex + stepZ;

    if (dstIndex < minIndex || dstIndex > maxIndex) return;

    const list = [...this.data.list];
    list[srcIndex] = this.data.list[dstIndex];
    list[dstIndex] = this.data.list[srcIndex];
    this.setData({list});
  }

  clone() {

  }

  destroy() {
    const index = this.getModelIndex();

    if (index === -1 || index === 0) return;

    this.setData({
      list: this.data.list.filter((m, i) => i !== index),
      modelId: this.data.list[0].id,
    });
  }

  create(type) {
    const parentModel = this.getModel();

    if (!parentModel) return;

    const model = this.components.find((c) => c.type === type).getInitialModel();
    model.id = uuid();
    model.type = type;
    model.parent = parentModel.id;

    const lastChildIndex = this.data.list.map((m) => m.parent).lastIndexOf(parentModel.id);

    this.setData({
      list: this.data.list.splice(lastChildIndex + 1, 0, model),
      modelId: model.id,
    });
  }

  async requestSave(cb) {
    if (!this.hasChanges()) return;

    const options = {buttons: ['Yes', 'No'], message: 'Save current file?'};
    const answer = await remote.dialog.showMessageBox(remote.getCurrentWindow(), options);
    answer.response === 0 ? this.save(cb) : cb();
  }

  hasChanges() {
    if (this.filePath) {
      const template = this.filePath.endsWith('.js') ? jsTemplate : tsTemplate;
      let file;

      try {
        file = fs.readFileSync(this.filePath, 'utf-8');
      } catch (e) {
        console.log(e);
        return true;
      }

      return file === template(this.data);
    }

    return this.history.pointer !== -1;
  }

  validate() {

  }
}

module.exports = Krot;
