const path = require('path');
const config = require(path.resolve(process.cwd(), 'plugins/config.json'));
const App = require(path.resolve(process.cwd(), `plugins/${config.plugin}/App`));
const Krot = require('./Krot');

window.app = new App();
window.krot = new Krot();
require('./events');

window.addEventListener('resize', () => app.handleResize());
