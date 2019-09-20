const { ipcRenderer, remote } = require('electron');
const { createApp } = require('./main');
const path = require('path');

const configFileName = 'krot.config.js';

function isLive() {
  return app && app.krot;
}

function handleResize() {
  if (!isLive()) return;

  app.renderer.resize(window.innerWidth, window.innerHeight);
  app.view.style.width = `${window.innerWidth}px`;
  app.view.style.height = `${window.innerHeight}px`;
}

['save', 'saveAs', 'undo', 'redo', 'moveDown', 'moveUp', 'clone', 'destroy', 'container', 'sprite', 'text']
  .forEach((eventName) => {
    ipcRenderer.on(eventName, (event, data) => {
      if (!isLive()) return;
      app.krot[eventName](/*data.msg*/);
    });
  });

ipcRenderer.on('new', async (event, data) => {
  isLive() && await new Promise((resolve) => app.krot.requestSave(resolve));
  const window = remote.getCurrentWindow();
  const options = { filters: [{ extensions: ['js'], name: '' }] };

  const filePath = await new Promise((resolve) => {
    remote.dialog.showSaveDialog(window, options, resolve);
  });

  if (!filePath) return;

  await createApp(getConfig(filePath));
  app.krot.new();
  handleResize();
});

ipcRenderer.on('open', async (event, data) => {
  isLive() && await new Promise((resolve) => app.krot.requestSave(resolve));
  const window = remote.getCurrentWindow();
  const options = { filters: [{ extensions: ['js'], name: '' }] };

  const filePath = await new Promise((resolve) => {
    remote.dialog.showOpenDialog(window, options, (filePaths) => resolve(filePaths[0]));
  });

  if (!filePath) return;

  await createApp(getConfig(filePath));

  try {
    app.krot.open(filePath);
  } catch (e) {
    alert('Wrong file format');
  }

  handleResize();
});

window.addEventListener('blur', () => {
  if (!isLive()) return;
  app.krot.snapshot();
}, true);

window.addEventListener('click', (e) => {
  if (!isLive()) return;

  const classes = ['function', 'slider'];

  if (e.target.type === 'checkbox' || classes.find(name => e.target.classList.contains(name))) {
    app.krot.snapshot();
  }
}, true);

window.onbeforeunload = (e) => {
  if (!isLive() || !app.krot.handler.isChanged()) return;
  window.onbeforeunload = () => void 0;

  e.returnValue = false;

  const options = {
    buttons: ['Yes', 'No'],
    message: 'Save current file?',
  };

  remote.dialog.showMessageBox(remote.getCurrentWindow(), options, (response) => {
    const close = () => remote.getCurrentWindow().close();
    response === 0 ? this.handler.save(close) : close();
  });
};

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
    alert(`File ${configFileName} not found in any parent directory`);
  }

  const base = pathArray.join('/');
  config = config || {};

  ['imagesDirs', 'atlasesDirs', 'fontsDirs', 'googleFonts', 'standardFonts'].forEach((key) => {
    config[key] = config[key] || [];
  });

  ['imagesDirs', 'atlasesDirs', 'fontsDirs'].forEach((key) => {
    config[key] = config[key].map((dir) => path.resolve(base, dir));
  });

  return config;
}

window.addEventListener('resize', handleResize);
