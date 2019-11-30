const {moveNode, getNodeEndIndex} = require('./utils');
const {jsTemplate, tsTemplate} = require('./template');
const MetaController = require('./MetaController');
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

    this.config = {
      imagesDirs: [],
      atlasesDirs: [],
      fontsDirs: [],
      googleFonts: [],
      standardFonts: [],
      imports: `import * as PIXI from 'pixi.js';`,
    };

    this.token = '/* 4@4!8|raw|8!4@ */';
    this.data = this.createData();
    this.data.treeWidth = 0;

    this.watcher = new Watcher();
    this.history = new History();
    this.filePath = '';
    this.onDataChange = new Signal();
    this.components = components.map((Component) => new Component());
    this.renderer = new Renderer(this.data);
    this.menu = new Menu();

    new MetaController();

    window.addEventListener('mousedown', () => this.putHistoryIfChanged());

    // window.onbeforeunload = async (e) => { // todo uncomment
    //   e.returnValue = false;
    //   const cancelled = await this.requestSave();
    //
    //   if (!cancelled) {
    //     window.onbeforeunload = () => void 0;
    //     remote.getCurrentWindow().close();
    //   }
    // };
  }

  createData() {
    return {
      list: [],
      modelId: '',
      minorComponent: null,
      minorComponentData: null,
      controlStep: 1.0,
      width: 640,
      height: 960,
      debug: false,
      treeWidth: 200,
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

  putHistory() {
    this.history.put(this.data);
  }

  putHistoryIfChanged() {
    !_.isEqual(this.data, this.history.getItem()) && app.putHistory();
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

    const data = this.createData();

    const rootModel = this.components.find((c) => c.type === 'Container').createModel();
    rootModel.id = uuid();
    rootModel.type = 'Container';
    rootModel.name = 'root';

    data.modelId = rootModel.id;
    data.list.push(rootModel);

    this.setData(data);
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
    const modelIndex = this.getModelIndex();

    if (modelIndex < 1) return;

    const model = this.data.list[modelIndex];
    const list = moveNode(this.data.list, model.id, stepZ);
    list && this.setData({list});
  }

  clone() {
    const modelIndex = this.getModelIndex();

    if (modelIndex < 1) return;

    const list = [...this.data.list];
    const model = list[modelIndex];
    const endIndex = getNodeEndIndex(this.data.list, modelIndex);
    const items = _.cloneDeep(this.data.list.slice(modelIndex, endIndex));
    const map = {[model.parent]: model.parent};

    items.forEach((item) => {
      const newId = uuid();
      map[item.id] = newId;
      item.id = newId;
      item.parent = map[item.parent];
    });

    list.splice(endIndex, 0, ...items);
    this.setData({list, modelId: items[0].id});
  }

  destroy() {
    const modelIndex = this.getModelIndex();

    if (modelIndex < 1) return;

    const endIndex = getNodeEndIndex(this.data.list, modelIndex);

    this.setData({
      list: this.data.list.filter((m, i) => i < modelIndex || i >= endIndex),
      modelId: this.data.list[0].id,
    });
  }

  create(type) {
    const parentIndex = this.getModelIndex();

    if (parentIndex === -1) return;

    const parentModel = this.data.list[parentIndex];
    const parentEndIndex = getNodeEndIndex(this.data.list, parentIndex);
    const model = this.components.find((c) => c.type === type).createModel();
    model.id = uuid();
    model.type = type;
    model.parent = parentModel.id;

    this.setData({
      list: [...this.data.list.slice(0, parentEndIndex), model, ...this.data.list.slice(parentEndIndex)],
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
    // check for name copies
  }
}

new App();
