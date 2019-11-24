const {Controller} = require('./Controller');
const WebFont = require('webfontloader');
const Pool = require('./Pool');
const path = require('path');
const fs = require('fs');

module.exports = class Renderer {
  constructor(prevData) {
    this.pixiApp = new PIXI.Application();
    document.body.appendChild(this.pixiApp.view);
    this.pixiApp.renderer.backgroundColor = 0x2B2B2B;
    this.mouse = this.pixiApp.renderer.plugins.interaction.mouse;

    this.ground = new PIXI.Container();
    this.pixiApp.stage.addChild(this.ground);

    this.debugGraphics = new PIXI.Graphics();
    this.ground.addChild(this.debugGraphics);

    this.drag = {dx: 0, dy: 0};
    this.prevData = prevData;
    this.controller = null;
    this.fonts = [];
    this.pool = new Pool(this.createView.bind(this));

    this.pixiApp.renderer.plugins.interaction.on('mousedown', this.handleMouseDown, this);
    this.pixiApp.renderer.plugins.interaction.on('mouseup', this.handleMouseUp, this);
    this.pixiApp.view.addEventListener('wheel', this.handleWheelRotate.bind(this));
    this.pixiApp.ticker.add(this.update, this);

    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  createNoTextureCanvas() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 64;
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#0e9019';
    ctx.lineWidth = 4;

    ctx.fillRect(0, 0, 64, 64);
    ctx.strokeRect(0, 0, 64, 64);

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(64, 64);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(64, 0);
    ctx.lineTo(0, 64);
    ctx.stroke();

    return canvas;
  }

  async load(config) {
    const promises = [];
    const loader = PIXI.Loader.shared;
    PIXI.utils.destroyTextureCache();
    loader.reset();
    loader.defaultQueryString = String(Date.now());

    this.noTexture = PIXI.Texture.from(this.createNoTextureCanvas());
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
    const x = this.mouse.global.x;
    const y = this.mouse.global.y;
    this.ground.x = x + (this.ground.x - x) * multiplier;
    this.ground.y = y + (this.ground.y - y) * multiplier;
    this.ground.scale.x *= multiplier;
    this.ground.scale.y *= multiplier;
  }

  handleResize() {
    this.pixiApp.renderer.resize(window.innerWidth, window.innerHeight);
    this.pixiApp.view.style.width = `${window.innerWidth}px`;
    this.pixiApp.view.style.height = `${window.innerHeight}px`;
  }

  dragUpdate() {
    this.ground.x = this.mouse.global.x + this.drag.dx;
    this.ground.y = this.mouse.global.y + this.drag.dy;
  }

  align() {
    this.ground.scale.set(1);
    this.ground.x = (window.innerWidth - this.ground.width) / 2;
    this.ground.y = (window.innerHeight - this.ground.height) / 2;
  }

  createView(type) {
    const component = app.components.find((c) => c.type === type);
    return component.createView();
  }

  update() {
    if (app.data !== this.prevData) {
      app.data.list.forEach((model, i) => {
        const prevModel = this.prevData.list[i];
        const view = this.pool.get(model.id, model.type);

        if (model !== prevModel) {
          const component = app.components.find((c) => c.type === model.type);
          component.render(view, model, prevModel);

          if (!prevModel || model.parent !== prevModel.parent) {
            const parent = this.pool.get(model.parent);
            parent.addChild(view);
          }
        }
      });

      if (
        app.data.modelId !== this.prevData.modelId ||
        app.data.minorComponent !== this.prevData.minorComponent ||
        app.data.minorComponentData !== this.prevData.minorComponentData
      ) {
        this.controller && this.controller.destroy();

        const model = app.getModel();
        const component = app.data.minorComponent ||
          model && app.components.find((c) => c.type === model.type);

        if (component) {
          this.controller = new Controller(component);
        }
      }

      this.prevData = app.data;
      this.pool.removeUnused();
    }
  }
};
