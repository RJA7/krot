const defineProperty = Object.defineProperty;

Object.defineProperty = function (object, prop, descriptor) {
  descriptor.configurable = true;
  defineProperty.call(Object, object, prop, descriptor);
};

const {remote} = require('electron');
const {Watcher} = require('./Watcher');
const App = require('./plugins/pixi/App');
const Krot = require('./Krot');
const Menu = require('./Menu');

window.watcher = new Watcher();
window.app = new App();
window.krot = new Krot();

const menu = new Menu();
menu.set();

app.handleResize();
window.addEventListener('resize', () => app.handleResize());

window.addEventListener('mouseup', (e) => {
  krot.snapshot();
}, true);

window.onbeforeunload = (e) => {
  if (!krot.hasChanges()) return;
  window.onbeforeunload = () => void 0;

  e.returnValue = false;

  const options = {
    buttons: ['Yes', 'No'],
    message: 'Save current file?',
  };

  remote.dialog.showMessageBox(remote.getCurrentWindow(), options)
    .then((answer) => {
      const close = () => remote.getCurrentWindow().close();
      answer.response === 0 ? krot.save(close) : close();
    });
};
