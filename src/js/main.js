const { remote } = require('electron');
const { Watcher } = require('./Watcher');
const path = require('path');
const config = require(path.resolve(process.cwd(), 'plugins/config.json'));
const App = require(path.resolve(process.cwd(), `plugins/${config.plugin}/App`));
const Krot = require('./Krot');
const Menu = require('./Menu');

window.watcher = new Watcher();
window.app = new App();
window.krot = new Krot();

const menu = new Menu();
menu.set();

window.addEventListener('resize', () => app.handleResize());

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
