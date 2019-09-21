const WebFont = require('webfontloader');
const { fonts } = require('./config');
const Krot = require('./krot');
const PIXI = require('pixi.js');
const path = require('path');
const fs = require('fs');

window.app = null;
window.PIXI = PIXI;

const createApp = async (config) => {
  if (app) {
    document.body.removeChild(app.view);
    PIXI.Loader.shared.reset();
    app.destroy();
    app.krot.gui.destroy();
    app.krot.controllers.forEach((controller) => controller.gui.destroy());
  }

  window.app = new PIXI.Application();
  app.renderer.backgroundColor = 0x888888;
  document.body.appendChild(app.view);

  const promises = [];
  const loader = PIXI.Loader.shared;

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
          fonts.push(name);
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

  fonts.push(...config.standardFonts, ...config.googleFonts);
  promises.push(new Promise(resolve => loader.load(resolve)));

  await Promise.all(promises);

  app.krot = new Krot();
};

module.exports = { createApp };
require('./events');
