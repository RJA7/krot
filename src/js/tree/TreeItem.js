class TreeItem {
  constructor(modelId) {
    this.modelId = modelId;
    this.root = new PIXI.Container();
    this.root.interactive = true;
    this.root.hitArea = new PIXI.Rectangle(0, 0, 4000, 20);

    this.nameText = new PIXI.Text('', {fontSize: 13, fill: '#ffffff', fontFamily: 'CONSOLAS'});
    this.root.addChild(this.nameText);

    this.root.on('pointerdown', this.handleClick, this);
  }

  handleClick() {
    if (app.data.modelId !== this.modelId) {
      setTimeout(() => app.setData({modelId: this.modelId}), 1);
    }
  }

  render(x, y, model, prevModel = {}) {
    this.root.y = y;
    this.nameText.x = x;
    this.nameText.text = model.name || model.type.toLowerCase();
  }

  destroy() {
    this.root.destroy({children: true});
    this.root = null;
  }
}

module.exports = TreeItem;
