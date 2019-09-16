const {ipcRenderer} = require('electron');
const WebFont = require('webfontloader');
const {fonts} = require('./config');
const Krot = require('./krot');
const PIXI = require('pixi.js');
const db = require('electron-db');
const path = require('path');
const fs = require('fs');

const app = new PIXI.Application();
app.renderer.backgroundColor = 0x888888;
document.body.appendChild(app.view);

window.app = app;
window.PIXI = PIXI;

function handleResize() {
  app.renderer.resize(window.innerWidth, window.innerHeight);
  app.view.style.width = `${window.innerWidth}px`;
  app.view.style.height = `${window.innerHeight}px`;
}

handleResize();
window.addEventListener('resize', handleResize);

db.getRows('settings', process.cwd(), {}, async (success, result) => {
  const promises = [];
  const settings = result[0];
  const loader = PIXI.Loader.shared;

  settings.imagesDirs.forEach((dir) => {
    fs.readdirSync(dir).forEach((fileName) => {
      loader.add(fileName.split('.').shift(), `${dir}${path.sep}${fileName}`);
    });
  });

  settings.atlasesDirs.forEach((dir) => {
    fs.readdirSync(dir).forEach((fileName) => {
      if (!fileName.endsWith('.json')) return;
      loader.add(fileName.split('.').shift(), `${dir}${path.sep}${fileName}`);
    });
  });

  settings.fontsDirs.forEach((dir) => {
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

  settings.googleFonts.length && promises.push(new Promise(resolve => {
    WebFont.load({
      active: resolve,
      inactive: resolve,
      google: {
        families: settings.googleFonts,
      },
    });
  }));

  fonts.push(...settings.standardFonts, ...settings.googleFonts);
  promises.push(new Promise(resolve => loader.load(resolve)));

  await Promise.all(promises);

  const krot = new Krot();

  ['new', 'open', 'save', 'saveAs', 'undo', 'redo', 'moveDown', 'moveUp', 'clone', 'destroy', 'container', 'sprite', 'text']
    .forEach((eventName) => {
      ipcRenderer.on(eventName, (event, data) => {
        krot[eventName](/*data.msg*/);
      });
    });
});
