const {remote} = require('electron');
const {Menu} = remote;
const path = require('path');
const _ = require('lodash');
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
      [['ctrl+s', 'command+s'], () => krot.save()],
      [['ctrl+shift+s', 'command+shift+s'], () => krot.saveAs()],
      [['ctrl+z', 'command+z'], () => krot.undo()],
      [['ctrl+shift+z', 'command+shift+z'], () => krot.redo()],
      [['ctrl+d', 'command+d'], () => krot.moveDown()],
      [['ctrl+shift+d', 'command+shift+d'], () => krot.moveUp()],
      [['ctrl+c', 'command+c'], () => krot.clone()],
    ].forEach(([shortcut, handler]) => {
      Mousetrap.bind(shortcut, handler, 'keydown');
    });
  }

  set(config) {
    let template = [
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
          {type: 'separator'},
          {role: 'quit'},
        ],
      },

      {
        label: 'Dev tools',
        role: 'toggledevtools',
      },
    ];

    if (config) {
      template = [
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
                krot.save();
              },
            },
            {
              label: 'Save as',
              click: () => {
                krot.saveAs();
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
                krot.undo();
              },
            },
            {
              label: 'Redo',
              click: () => {
                krot.redo();
              },
            },
            {type: 'separator'},
            {
              label: 'Move down',
              click: () => {
                krot.moveDown();
              },
            },
            {
              label: 'Move up',
              click: () => {
                krot.moveUp();
              },
            },
            {type: 'separator'},
            {
              label: 'Clone',
              click: () => {
                krot.clone();
              },
            },
            {
              label: 'Destroy',
              click: () => {
                krot.destroy();
              },
            },
          ],
        },

        {
          label: 'Object',
          submenu: Object.keys(config.components).map((key) => {
            return {
              label: key,
              click: () => {
                krot.create(key);
              },
            };
          }),
        },

        {
          label: 'Dev tools',
          role: 'toggledevtools',
        },
      ];
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  async new() {
    await new Promise((resolve) => krot.requestSave(resolve));
    const window = remote.getCurrentWindow();
    const answer = await remote.dialog.showSaveDialog(window, fileOptions);

    if (!answer.filePath) return;

    await this.load(answer.filePath);
    krot.new();
    krot.filePath = answer.filePath;
  }

  async open() {
    await new Promise((resolve) => krot.requestSave(resolve));
    const window = remote.getCurrentWindow();
    const answer = await remote.dialog.showOpenDialog(window, fileOptions);
    const filePath = answer.filePaths[0];

    if (!filePath) return;

    await this.load(filePath);

    try {
      krot.open(filePath);
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

    config.components = _.merge(
      _.cloneDeep(app.getStandardComponents()),
      config.components || {},
    );

    return config;
  }

  async load(filePath) {
    const config = this.getConfig(filePath);
    this.set(config);
    krot.config = config;
    watcher.watch(config);
    await app.load(config);
  }
}

module.exports = MenuHandler;
