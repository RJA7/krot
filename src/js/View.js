class View {
  constructor() {
    const view = new PIXI.Container();
    app.stage.addChild(view);

    const debugGraphics = new PIXI.Graphics();
    view.addChild(debugGraphics);

    this.view = view;
    this.tree = null;
    this.drag = { dx: 0, dy: 0 };
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

  setTree(tree) {
    this.tree && this.tree.destroy();
    this.tree = tree;
    this.view.addChildAt(tree, 0);
  }

  align() {
    this.view.scale.set(1);
    this.view.x = window.innerWidth / 2;
    this.view.y = window.innerHeight / 2;
  }
}

module.exports = { View };
