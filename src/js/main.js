const {ipcRenderer} = require('electron');
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

db.getRows('settings', process.cwd(), {}, (success, result) => {
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

  loader.load(() => {
    const krot = new Krot();

    ['new', 'open', 'save', 'saveAs', 'undo', 'redo', 'moveDown', 'moveUp', 'clone', 'destroy', 'container', 'sprite', 'text']
      .forEach((eventName) => {
        ipcRenderer.on(eventName, (event, data) => {
          krot[eventName](/*data.msg*/);
        });
      });
  });
});
