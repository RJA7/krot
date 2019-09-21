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
    this.drag = {dx: 0, dy: 0};
    this.debugGraphics = debugGraphics;

    app.renderer.plugins.interaction.on('mousedown', (e) => {
      this.drag.dx = view.x - e.data.global.x;
      this.drag.dy = view.y - e.data.global.y;
      app.ticker.add(this.dragUpdate, this);
    });

    app.renderer.plugins.interaction.on('mouseup', () => app.ticker.remove(this.dragUpdate, this));

    app.view.addEventListener('wheel', e => {
      const multiplier = 1 - (e.wheelDeltaY > 0 ? -1 : 1) * 0.04;
      const x = app.renderer.plugins.interaction.mouse.global.x;
      const y = app.renderer.plugins.interaction.mouse.global.y;
      view.x = x + (view.x - x) * multiplier;
      view.y = y + (view.y - y) * multiplier;
      view.scale.x *= multiplier;
      view.scale.y *= multiplier;
    });
  }

  dragUpdate() {
    this.view.x = app.renderer.plugins.interaction.mouse.global.x + this.drag.dx;
    this.view.y = app.renderer.plugins.interaction.mouse.global.y + this.drag.dy;
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
