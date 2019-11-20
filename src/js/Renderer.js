const {Controller} = require('./Controller');
const clientModule = require('krot-pixi');
const WebFont = require('webfontloader');
const PIXI = require('pixi.js');
const Pool = require('./Pool');
const path = require('path');
const fs = require('fs');

window.PIXI = PIXI;
clientModule.init(PIXI);

module.exports = class Renderer {
  constructor() {
    this.pixiApp = new PIXI.Application();
    document.body.appendChild(this.pixiApp.view);
    this.pixiApp.renderer.backgroundColor = 0x2B2B2B;

    this.ground = new PIXI.Container();
    this.pixiApp.stage.addChild(this.ground);

    this.debugGraphics = new PIXI.Graphics();
    this.ground.addChild(this.debugGraphics);

    this.drag = {dx: 0, dy: 0};
    this.data = null;
    this.controller = null;
    this.fonts = [];
    this.pool = new Pool(this.createView.bind(this));

    this.pixiApp.renderer.plugins.interaction.on('mousedown', this.handleMouseDown, this);
    this.pixiApp.renderer.plugins.interaction.on('mouseup', this.handleMouseUp, this);
    this.pixiApp.view.addEventListener('wheel', this.handleWheelRotate.bind(this));
    this.pixiApp.ticker.add(this.update, this);
  }

  async load(config) {
    const promises = [];
    const loader = PIXI.Loader.shared;
    PIXI.utils.destroyTextureCache();
    loader.reset();
    loader.defaultQueryString = String(Date.now());

    this.fonts = [...config.standardFonts, ...config.googleFonts];

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

    promises.push(new Promise(resolve => loader.load(resolve)));

    await Promise.all(promises);
  }

  handleMouseDown(e) {
    this.drag.dx = this.ground.x - e.data.global.x;
    this.drag.dy = this.ground.y - e.data.global.y;
    this.pixiApp.ticker.add(this.dragUpdate, this);
  }

  handleMouseUp() {
    this.pixiApp.ticker.remove(this.dragUpdate, this);
  }

  handleWheelRotate(e) {
    const multiplier = 1 - (e.wheelDeltaY > 0 ? -1 : 1) * 0.04;
    const x = this.pixiApp.renderer.plugins.interaction.mouse.global.x;
    const y = this.pixiApp.renderer.plugins.interaction.mouse.global.y;
    this.ground.x = x + (this.ground.x - x) * multiplier;
    this.ground.y = y + (this.ground.y - y) * multiplier;
    this.ground.scale.x *= multiplier;
    this.ground.scale.y *= multiplier;
  }

  handleResize() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    app.view.style.width = `${window.innerWidth}px`;
    app.view.style.height = `${window.innerHeight}px`;
  }

  dragUpdate() {
    this.ground.x = this.pixiApp.renderer.plugins.interaction.mouse.global.x + this.drag.dx;
    this.ground.y = this.pixiApp.renderer.plugins.interaction.mouse.global.y + this.drag.dy;
  }

  align() {
    this.ground.scale.set(1);
    this.ground.x = (window.innerWidth - this.ground.width) / 2;
    this.ground.y = (window.innerHeight - this.ground.height) / 2;
  }

  createView(type) {
    return clientModule.handlerMap[type]();
  }

  update() {
    if (krot.data !== this.data) {
      krot.data.list.forEach((model, i) => {
        const prevModel = this.data.list[i];
        const view = this.pool.get(model.id, model.type);

        if (model !== prevModel) {
          const component = krot.components[model.type];
          component.render(view, model, prevModel);
        }
      });

      if (krot.data.modelId !== this.data.modelId) {
        this.controller && this.controller.destroy();
        const model = krot.getModel();

        if (model) {
          const component = krot.components.find((c) => c.type === model.type);
          this.controller = new Controller(component);
        }
      }

      this.data = krot.data;
    }
  }
};
