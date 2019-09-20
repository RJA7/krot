const { ipcRenderer, remote } = require('electron');
const WebFont = require('webfontloader');
const { fonts } = require('./config');
const Krot = require('./krot');
const PIXI = require('pixi.js');
const db = require('electron-db');
const path = require('path');
const fs = require('fs');

const configFileName = 'krot.config.js';

window.app = null;
window.PIXI = PIXI;

const createApp = async (config) => {
  if (app) {
    document.body.removeChild(app.view);
    app.destroy();
    app.krot.gui.destroy();
    app.krot.controllers.forEach((controller) => controller.gui.destroy());
  }

  window.app = new PIXI.Application();
  app.renderer.backgroundColor = 0x888888;
  document.body.appendChild(app.view);

  return new Promise(async (resolve) => {
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
    handleResize();
    resolve();
  });
};

['save', 'saveAs', 'undo', 'redo', 'moveDown', 'moveUp', 'clone', 'destroy', 'container', 'sprite', 'text'].forEach((eventName) => {
  ipcRenderer.on(eventName, (event, data) => {
    app.krot[eventName](/*data.msg*/);
  });
});

ipcRenderer.on('new', (event, data) => {
  const cb = async () => {
    await createApp();
    app.krot.new();
  };

  app ? app.krot.requestSave(cb) : cb();
});

ipcRenderer.on('open', (event, data) => {
  const cb = () => {
    remote.dialog.showOpenDialog(
      remote.getCurrentWindow(),
      { filters: [{ extensions: ['js'], name: '' }] },
      async (filePaths) => {
        const filePath = filePaths[0];

        if (!filePath) return;

        try {
          await createApp(getConfig(filePath));
          app.krot.open(filePath);
        } catch (e) {
          // noop
        }
      },
    );
  };

  app ? app.krot.requestSave(cb) : cb();
});

function getConfig(filePath) {
  const pathArray = filePath.split(path.sep);
  let config;

  while (pathArray.length) {
    pathArray.pop();

    try {
      config = require(`${pathArray.join('/')}/${configFileName}`)(PIXI);
      break;
    } catch (e) {
      // noop
    }
  }

  if (!config) {
    // TODO Show config no found message
  }

  const base = pathArray.join('/');
  config = config || {};

  ['imagesDirs', 'atlasesDirs', 'fontsDirs', 'googleFonts', 'standardFonts'].forEach((key) => {
    config[key] = config[key] || [];
    config[key] = config[key].map((dir) => path.resolve(base, dir));
  });

  return config;
}

function handleResize() {
  if (!app) return;

  app.renderer.resize(window.innerWidth, window.innerHeight);
  app.view.style.width = `${window.innerWidth}px`;
  app.view.style.height = `${window.innerHeight}px`;
}

window.addEventListener('resize', handleResize);
