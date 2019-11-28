const fs = require('fs');

module.exports = class Watcher {
  constructor() {
    this.watchers = [];
    this.timeoutId = -1;
  }

  watch(config, filePath) {
    this.clear();

    Object.keys(config)
      .filter((key) => key.endsWith('Dirs'))
      .map((key) => config[key])
      .forEach((dirs) => {
        dirs.forEach((dir) => {
          fs.readdir(dir, (err, fileNames) => {
            if (err) {
              console.log(err);
              return;
            }

            fileNames.forEach((fileName) => {
              const watcher = fs.watch(`${dir}/${fileName}`);
              watcher.on('change', () => this.scheduleReload(filePath));
              this.watchers.push(watcher);
            });
          });
        });
      });
  }

  scheduleReload(filePath) {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => app.menu.load(filePath), 100);
  }

  clear() {
    this.watchers.forEach((watcher) => watcher.close());
    this.watchers = [];
  }
};
