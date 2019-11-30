const {remote} = require('electron');
const {Menu} = remote;
const path = require('path');
const Mousetrap = require('mousetrap');

const configFileName = 'krot.config.js';

const fileOptions = {
  filters: [
    {extensions: ['ts'], name: ''},
    {extensions: ['js'], name: ''},
  ],
};

class MenuHandler {
  constructor() {
    [
      [['ctrl+n', 'command+n'], () => this.new()],
      [['ctrl+o', 'command+o'], () => this.open()],
      [['ctrl+s', 'command+s'], () => app.save()],
      [['ctrl+shift+s', 'command+shift+s'], () => app.saveAs()],
      [['ctrl+z', 'command+z'], () => app.undo()],
      [['ctrl+shift+z', 'command+shift+z'], () => app.redo()],
      [['ctrl+d', 'command+d'], () => app.move(-1)],
      [['ctrl+shift+d', 'command+shift+d'], () => app.move(1)],
      [['ctrl+c', 'command+c'], () => app.clone()],
      [['del'], () => app.destroy()],
    ].forEach(([shortcut, handler]) => {
      Mousetrap.bind(shortcut, (e) => {
        e.preventDefault();
        handler();
      }, 'keydown');
    });

    this.set();
  }

  set() {
    const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New',
            click: () => {
              this.new();
            },
          },
          {
            label: 'Open',
            click: () => {
              this.open();
            },
          },
          {
            label: 'Save',
            click: () => {
              app.save();
            },
          },
          {
            label: 'Save as',
            click: () => {
              app.saveAs();
            },
          },
          {type: 'separator'},
          {role: 'quit'},
        ],
      },

      {
        label: 'Edit',
        submenu: [
          {
            label: 'Undo',
            click: () => {
              app.undo();
            },
          },
          {
            label: 'Redo',
            click: () => {
              app.redo();
            },
          },
          {type: 'separator'},
          {
            label: 'Move down',
            click: () => {
              app.move(1);
            },
          },
          {
            label: 'Move up',
            click: () => {
              app.move(-1);
            },
          },
          {type: 'separator'},
          {
            label: 'Clone',
            click: () => {
              app.clone();
            },
          },
          {
            label: 'Destroy',
            click: () => {
              app.destroy();
            },
          },
        ],
      },

      {
        label: 'Object',
        submenu: app.components.map((component) => {
          return {
            label: component.type,
            click: () => {
              app.create(component.type);
            },
          };
        }),
      },

      {
        label: 'Dev tools',
        role: 'toggledevtools',
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  async new() {
    const cancelled = await app.requestSave();

    if (cancelled) return;

    const window = remote.getCurrentWindow();
    const answer = await remote.dialog.showSaveDialog(window, fileOptions);

    if (!answer.filePath) return;

    await this.load(answer.filePath);
    app.new(answer.filePath);
  }

  async open() {
    const cancelled = await app.requestSave();

    if (cancelled) return;

    const window = remote.getCurrentWindow();
    const answer = await remote.dialog.showOpenDialog(window, fileOptions);
    const filePath = answer.filePaths[0];

    if (!filePath) return;

    await this.load(filePath);

    try {
      app.open(filePath);
    } catch (e) {
      console.log(e);
      alert('Wrong file format');
    }
  }

  getConfig(filePath) {
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

  async load(filePath) {
    const config = this.getConfig(filePath);
    app.config = config;
    app.watcher.watch(config, filePath);
    await app.renderer.load(config);
  }
}

module.exports = MenuHandler;
