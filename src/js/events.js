const { ipcRenderer, remote } = require('electron');
const path = require('path');

const configFileName = 'krot.config.js';

['save', 'saveAs', 'undo', 'redo', 'moveDown', 'moveUp', 'clone', 'destroy', 'create']
  .forEach((eventName) => {
    ipcRenderer.on(eventName, (event, data) => {
      krot[eventName](data);
    });
  });

ipcRenderer.on('new', async (event, data) => {
  await new Promise((resolve) => krot.requestSave(resolve));
  const window = remote.getCurrentWindow();
  const options = { filters: [{ extensions: ['js'], name: '' }] };

  const filePath = await new Promise((resolve) => {
    remote.dialog.showSaveDialog(window, options, resolve);
  });

  if (!filePath) return;

  await load(filePath);
  krot.new();
  krot.filePath = filePath;
});

ipcRenderer.on('open', async (event, data) => {
  await new Promise((resolve) => krot.requestSave(resolve));
  const window = remote.getCurrentWindow();
  const options = { filters: [{ extensions: ['js'], name: '' }] };

  const filePath = await new Promise((resolve) => {
    remote.dialog.showOpenDialog(window, options, (filePaths) => resolve(filePaths && filePaths[0]));
  });

  if (!filePath) return;

  await load(filePath);

  try {
    krot.open(filePath);
  } catch (e) {
    console.log(e);
    alert('Wrong file format');
  }
});

window.addEventListener('click', (e) => {
  const classes = ['function', 'slider'];

  if (e.target.type === 'checkbox' || classes.find(name => e.target.classList.contains(name))) {
    krot.snapshot();
  }
}, true);

window.onbeforeunload = (e) => {
  if (!krot.hasChanges()) return;
  window.onbeforeunload = () => void 0;

  e.returnValue = false;

  const options = {
    buttons: ['Yes', 'No'],
    message: 'Save current file?',
  };

  remote.dialog.showMessageBox(remote.getCurrentWindow(), options, (response) => {
    const close = () => remote.getCurrentWindow().close();
    response === 0 ? krot.save(close) : close();
  });
};

function getConfig(filePath) {
  const pathArray = filePath.split(path.sep);
  let config;

  while (pathArray.length) {
    try {
      config = require(`${pathArray.join('/')}/${configFileName}`)(app);
      break;
    } catch (e) {
      // noop
    }

    pathArray.pop();
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

async function load(filePath) {
  const config = getConfig(filePath);
  watcher.watch(config);
  await app.load(config);
}
