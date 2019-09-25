const clientModule = require('krot-pixi');
const WebFont = require('webfontloader');
const path = require('path');
const fs = require('fs');
const PIXI = require('pixi.js');

window.PIXI = PIXI;

class App extends PIXI.Application {
  constructor() {
    super();

    document.body.appendChild(this.view);
    clientModule.init(PIXI);
    this.clientModule = clientModule;
    this.renderer.backgroundColor = 0x2B2B2B;
    this.fonts = [];
    this.ground = new PIXI.Container();
    this.stage.addChild(this.ground);
    this.debugGraphics = new PIXI.Graphics();
    this.ground.addChild(this.debugGraphics);
    this.tree = null;
    this.drag = { dx: 0, dy: 0 };

    this.renderer.plugins.interaction.on('mousedown', (e) => {
      this.drag.dx = this.ground.x - e.data.global.x;
      this.drag.dy = this.ground.y - e.data.global.y;
      this.ticker.add(this.dragUpdate, this);
    });

    this.renderer.plugins.interaction.on('mouseup', () => this.ticker.remove(this.dragUpdate, this));

    this.view.addEventListener('wheel', (e) => {
      const multiplier = 1 - (e.wheelDeltaY > 0 ? -1 : 1) * 0.04;
      const x = this.renderer.plugins.interaction.mouse.global.x;
      const y = this.renderer.plugins.interaction.mouse.global.y;
      this.ground.x = x + (this.ground.x - x) * multiplier;
      this.ground.y = y + (this.ground.y - y) * multiplier;
      this.ground.scale.x *= multiplier;
      this.ground.scale.y *= multiplier;
    });

    this.ticker.add(() => {
      this.debugGraphics.clear();
      krot.controller && krot.controller.debug(this.debugGraphics);
    });
  }

  async load(config) {
    const promises = [];
    const loader = PIXI.Loader.shared;
    PIXI.utils.destroyTextureCache();
    loader.reset();

    if (krot.controller) {
      krot.controller.destroy();
      krot.controller = null;
    }

    config.imagesDirs.forEach((dir) => {
      fs.readdirSync(dir).forEach((fileName) => {
        loader.add(fileName.split('.').shift(), `${dir}${path.sep}${fileName}`);
      });
    });

    config.atlasesDirs.forEach((dir) => {
      fs.readdirSync(dir).forEach((fileName) => {
        if (!fileName.endsWith('.json')) return;
        loader.add(fileName.split('.').shift(), `${dir}${path.sep}${fileName}`);
      });
    });

    config.fontsDirs.forEach((dir) => {
      fs.readdirSync(dir).forEach((fileName) => {
        const [name] = fileName.split('.');
        const fontFace = new FontFace(name, `url(${dir}${path.sep}${fileName})`.replace(/\\/g, '/'));

        promises.push(
          fontFace.load().then((loadedFace) => {
            document.fonts.add(loadedFace);
            this.fonts.push(name);
          }),
        );
      });
    });

    config.googleFonts.length && promises.push(new Promise(resolve => {
      WebFont.load({
        active: resolve,
        inactive: resolve,
        google: {
          families: config.googleFonts,
        },
      });
    }));

    this.fonts.push(...config.standardFonts, ...config.googleFonts);
    promises.push(new Promise(resolve => loader.load(resolve)));

    await Promise.all(promises);
  }

  getTree() {
    return this.tree;
  }

  setTree(tree) {
    this.tree && this.tree.destroy();
    this.tree = tree;
    this.ground.addChildAt(tree, 0);
  }

  dragUpdate() {
    this.ground.x = this.renderer.plugins.interaction.mouse.global.x + this.drag.dx;
    this.ground.y = this.renderer.plugins.interaction.mouse.global.y + this.drag.dy;
  }

  align() {
    this.ground.scale.set(1);
    this.ground.x = window.innerWidth / 2;
    this.ground.y = window.innerHeight / 2;
  }

  handleResize() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    app.view.style.width = `${window.innerWidth}px`;
    app.view.style.height = `${window.innerHeight}px`;
  }

  add(object, parent = this.tree) {
    parent.addChild(object);
  }

  moveDown(object) {
    const siblings = object.parent.children;
    const index = siblings.indexOf(object);

    if (index === -1 || index === 0) return;

    siblings[index] = siblings[index - 1];
    siblings[index - 1] = object;
  }

  moveUp(object) {
    const siblings = object.parent.children;
    const index = siblings.indexOf(object);

    if (index === -1 || index === siblings.length - 1) return;

    siblings[index] = siblings[index + 1];
    siblings[index + 1] = object;
  }
}

module.exports = App;
