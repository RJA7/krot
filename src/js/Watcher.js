const fs = require('fs');

module.exports = class Watcher {
  constructor() {
    this.watchers = [];
    this.timeoutId = -1;
  }

  watch(config) {
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
              watcher.on('change', () => this.scheduleReload(config));
              this.watchers.push(watcher);
            });
          });
        });
      });
  }

  scheduleReload(config) {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.reload(config), 100);
  }

  async reload(config) {
    await app.renderer.load(config);
    app.setData(app.data, true);
  }

  clear() {
    this.watchers.forEach((watcher) => watcher.close());
    this.watchers = [];
  }
};
