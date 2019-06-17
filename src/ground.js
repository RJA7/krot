import { defaultRawUi } from "./config";

export class Ground {
  constructor() {
    const view = game.add.group();
    const border = game.add.graphics(0, 0, view);

    const debugGraphics = game.make.graphics();
    view.add(debugGraphics);

    this.borderWidth = defaultRawUi.width;
    this.borderHeight = defaultRawUi.height;
    this.border = border;
    this.view = view;
    this.tree = null;
    this.debugGraphics = debugGraphics;

    game.input.onDown.add(() => {
      const dx = view.x - game.input.x;
      const dy = view.y - game.input.y;

      view.update = () => {
        view.x = game.input.x + dx;
        view.y = game.input.y + dy;
        this.clampView();
      };
    });

    game.input.onUp.add(() => view.update = () => "");

    game.renderer.view.addEventListener("wheel", e => {
      const multiplier = 1 - Phaser.Math.sign(e.deltaY) * 0.04;
      view.x = game.input.x + (view.x - game.input.x) * multiplier;
      view.y = game.input.y + (view.y - game.input.y) * multiplier;
      view.scale.x *= multiplier;
      view.scale.y *= multiplier;
      this.clampView();
    });
  }

  clampView() {
    this.view.x = Phaser.Math.clamp(this.view.x, -this.borderWidth, game.width);
    this.view.y = Phaser.Math.clamp(this.view.y, -this.borderHeight, game.height);
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
    this.view.addAt(tree, 0);
  }

  align() {
    const sc = Math.min(2, window.innerWidth / this.borderWidth, window.innerHeight / this.borderHeight) * 0.9;
    this.view.scale.set(sc);
    this.view.x = (window.innerWidth - this.borderWidth * sc) / 2;
    this.view.y = (window.innerHeight - this.borderHeight * sc) / 2;
  }
}
