const TreeItem = require('./TreeItem');
const Pool = require('../Pool');

class Tree {
  constructor() {
    this.root = new PIXI.Container();

    this.mask = new PIXI.Graphics();
    this.root.addChild(this.mask);
    this.root.mask = this.mask;

    this.bg = new PIXI.Graphics();
    this.bg.beginFill(0x1A1A1A, 1);
    this.bg.drawRect(0, 0, 4000, 4000);
    this.root.addChild(this.bg);

    this.selector = new PIXI.Graphics();
    this.selector.y = -999;
    this.selector.beginFill(0x0D293E, 1);
    this.selector.drawRect(0, 0, 4000, 20);
    this.root.addChild(this.selector);

    this.itemsContainer = new PIXI.Container();
    this.root.addChild(this.itemsContainer);

    this.sizeControl = new PIXI.Graphics();
    this.sizeControl.beginFill(0x323232, 1);
    this.sizeControl.drawRect(0, 0, 4, 4000);
    this.sizeControl.interactive = true;
    this.sizeControl.buttonMode = true;
    this.root.addChild(this.sizeControl);

    this.sizeControl.on('pointerdown', (e) => {
      e.stopPropagation();
      this.isChangeSizeActive = true;
    });
    this.sizeControl.on('pointermove', this.handleChangeSizeMove, this);

    this.pool = new Pool(this.createItem.bind(this));

    this.isChangeSizeActive = false;
    window.addEventListener('mouseup', () => this.isChangeSizeActive = false);
  }

  createItem(modelId) {
    const item = new TreeItem(modelId);
    this.itemsContainer.addChild(item.root);

    return item;
  }

  handleChangeSizeMove(e) {
    if (!this.isChangeSizeActive) return;

    e.stopPropagation();
    const point = this.root.toLocal(e.data.global);
    const width = Math.max(4, Math.min(500, point.x));
    app.data.treeWidth !== width && app.setData({treeWidth: width}, true);
  }

  render(data, prevData) {
    this.selector.y = -999;

    for (let i = 0; i < data.list.length; i++) {
      const model = data.list[i];
      const prevModel = prevData.list[i];
      const item = this.pool.get(model.id, model.id);
      const x = model.parent ? this.pool.get(model.parent).nameText.x + 10 : 10;
      const y = 10 + i * 18;

      if (model !== prevModel) {
        item.render(x, y, model, prevModel);
      }

      if (item.modelId === app.data.modelId) {
        this.selector.y = y - 2;
      }
    }

    this.pool.removeUnused();

    if (data.treeWidth !== prevData.treeWidth) {
      this.mask.clear();
      this.mask.beginFill(0x0, 1);
      this.mask.drawRect(0, 0, data.treeWidth, 4000);

      this.sizeControl.x = data.treeWidth - this.sizeControl.width;
    }
  }
}

module.exports = Tree;
