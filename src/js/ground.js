const {defaultRawUi} = require('./config');

class Ground {
  constructor() {
    const view = new PIXI.Container();
    app.stage.addChild(view);

    const border = new PIXI.Graphics();
    view.addChild(border);

    const debugGraphics = new PIXI.Graphics();
    view.addChild(debugGraphics);

    this.borderWidth = defaultRawUi.width;
    this.borderHeight = defaultRawUi.height;
    this.border = border;
    this.view = view;
    this.tree = null;
    this.debugGraphics = debugGraphics;

    app.stage.interactive = true;

    app.stage.on('pointerdown', () => {
      const dx = view.x - PIXI.interaction.x;
      const dy = view.y - PIXI.interaction.y;

      view.update = () => {
        view.x = PIXI.interaction.x + dx;
        view.y = PIXI.interaction.y + dy;
        this.clampView();
      };
    });

    app.stage.on('pointerup', () => view.update = () => '');

    app.view.addEventListener('wheel', e => {
      const multiplier = 1 - (e.deltaY > 0 ? 1 : -1) * 0.04;
      view.x = PIXI.interaction.x + (view.x - PIXI.interaction.x) * multiplier;
      view.y = PIXI.interaction.y + (view.y - PIXI.interaction.y) * multiplier;
      view.scale.x *= multiplier;
      view.scale.y *= multiplier;
      this.clampView();
    });
  }

  clampView() {
    this.view.x = Math.max(-this.borderWidth, Math.min(app.screen.width, this.view.x));
    this.view.y = Math.max(-this.borderHeight, Math.min(app.screen.height, this.view.y));
  }

  set width(v) {
    this.borderWidth = v;
    this.redrawBorder();
  }

  get width() {
    return this.borderWidth;
  }

  set height(v) {
    this.borderHeight = v;
    this.redrawBorder();
  }

  get height() {
    return this.borderHeight;
  }

  redrawBorder() {
    this.border.clear();
    this.border.lineStyle(2, 0x00ff00, 1);
    this.border.drawRect(0, 0, this.borderWidth, this.borderHeight);
  }

  clean() {
    this.tree && this.tree.destroy();
  }

  setTree(tree) {
    this.tree = tree;
    this.view.addChildAt(tree, 0);
  }

  align() {
    const sc = Math.min(2, window.innerWidth / this.borderWidth, window.innerHeight / this.borderHeight) * 0.9;
    this.view.scale.set(sc);
    this.view.x = (window.innerWidth - this.borderWidth * sc) / 2;
    this.view.y = (window.innerHeight - this.borderHeight * sc) / 2;
  }
}

module.exports = {Ground};
