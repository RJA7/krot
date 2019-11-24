const {jsTemplate, tsTemplate} = require('./template');
const components = require('./components');
const Renderer = require('./Renderer');
const Watcher = require('./Watcher');
const History = require('./History');
const {Signal} = require('signals.js');
const {remote} = require('electron');
const uuid = require('uuid/v4');
const Menu = require('./Menu');
const fs = require('fs');

const fileOptions = {
  filters: [
    {extensions: ['ts'], name: ''},
    {extensions: ['js'], name: ''},
  ],
};

class App {
  constructor() {
    window.app = this;

    this.watcher = new Watcher();
    this.token = '/* 4@4!8|raw|8!4@ */';
    this.history = new History();
    this.filePath = '';
    this.onDataChange = new Signal();

    this.components = components.map((Component) => new Component());
    this.data = {list: [], modelId: '', minorComponent: null, minorComponentData: null};
    this.renderer = new Renderer(this.data);

    this.config = {
      imagesDirs: [],
      atlasesDirs: [],
      fontsDirs: [],
      googleFonts: [],
      standardFonts: [],
      imports: `import * as PIXI from 'pixi.js';`,
    };

    window.onbeforeunload = async (e) => {
      e.returnValue = false;
      const cancelled = await this.requestSave();
      !cancelled && remote.getCurrentWindow().close();
    };
  }

  createData() {
    const rootModel = this.components.find((c) => c.type === 'Container').getInitialModel();
    rootModel.id = uuid();
    rootModel.type = 'Container';
    rootModel.name = 'root';

    return {
      list: [rootModel],
      modelId: rootModel.id,
      minorComponent: null,
      minorComponentData: null,
    };
  }

  setData(patch, skipHistory) {
    const prevData = this.data;
    this.data = {...this.data, ...patch};
    !skipHistory && this.history.put(this.data);
    this.onDataChange.dispatch(this.data, prevData);
  }

  updateItem(patch, skipHistory) {
    const id = this.data.modelId;
    this.setData({list: this.data.list.map((m) => m.id === id ? {...m, ...patch} : m)}, skipHistory);
  }

  getModel(id = this.data.modelId) {
    return this.data.list.find((m) => m.id === id);
  }

  getModelIndex(id = this.data.modelId) {
    return this.data.list.findIndex((m) => m.id === id);
  }

  async new(filePath) {
    this.filePath = filePath;
    this.history.reset();
    this.setData(this.createData());
  }

  open(filePath) {
    const file = fs.readFileSync(filePath, 'utf-8');
    const parts = file.split(this.token);
    const data = eval(`(${parts[1]})`);
    this.history.reset();
    this.setData(data);
    this.filePath = filePath;
  }

  async save() {
    if (!this.filePath) {
      await this.saveAs();
      return;
    }

    const errors = this.validate();

    if (errors) {
      alert(errors[0]);
      return;
    }

    const template = this.filePath.endsWith('.js') ? jsTemplate : tsTemplate;
    const file = template(this.data);

    return new Promise((fulfill) => fs.writeFile(this.filePath, file, fulfill));
  }

  async saveAs() {
    const answer = await remote.dialog.showSaveDialog(remote.getCurrentWindow(), fileOptions);

    if (!answer.filePath) return;

    this.filePath = answer.filePath;
    await this.save();
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
    const parentIndex = this.getModelIndex();

    if (parentIndex === -1) return;

    const parentModel = this.data.list[parentIndex];
    const model = this.components.find((c) => c.type === type).getInitialModel();
    model.id = uuid();
    model.type = type;
    model.parent = parentModel.id;

    const lastChildIndex = this.data.list.map((m) => m.parent).lastIndexOf(parentModel.id);
    const index = (lastChildIndex === -1 ? parentIndex : lastChildIndex) + 1;

    this.setData({
      list: [...this.data.list.slice(0, index), model, ...this.data.list.slice(index)],
      modelId: model.id,
    });
  }

  async requestSave() {
    if (!this.hasChanges()) return;

    const options = {buttons: ['Yes', 'No', 'Cancel'], message: 'Save current file?'};
    const answer = await remote.dialog.showMessageBox(remote.getCurrentWindow(), options);
    answer.response === 0 && await this.save();

    return answer.response === 2;
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

new App();
new Menu();
