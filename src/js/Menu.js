const { remote } = require('electron');
const { Menu } = remote;
const path = require('path');

const configFileName = 'krot.config.js';

class MenuHandler {
  set(config) {
    let template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New',
            accelerator: 'CmdOrCtrl + N',
            click: () => {
              this.new();
            },
          },
          {
            label: 'Open',
            accelerator: 'CmdOrCtrl + O',
            click: () => {
              this.open();
            },
          },
          { type: 'separator' },
          { role: 'quit' },
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
              accelerator: 'CmdOrCtrl + N',
              click: () => {
                this.new();
              },
            },
            {
              label: 'Open',
              accelerator: 'CmdOrCtrl + O',
              click: () => {
                this.open();
              },
            },
            {
              label: 'Save',
              accelerator: 'CmdOrCtrl + S',
              click: () => {
                krot.save();
              },
            },
            {
              label: 'Save as',
              accelerator: 'CmdOrCtrl + Shift + S',
              click: () => {
                krot.saveAs();
              },
            },
            { type: 'separator' },
            { role: 'quit' },
          ],
        },

        {
          label: 'Edit',
          submenu: [
            {
              label: 'Undo',
              accelerator: 'CmdOrCtrl + Z',
              click: () => {
                krot.undo();
              },
            },
            {
              label: 'Redo',
              accelerator: 'CmdOrCtrl + Shift + Z',
              click: () => {
                krot.redo();
              },
            },
            { type: 'separator' },
            {
              label: 'Move down',
              accelerator: 'CmdOrCtrl + D',
              click: () => {
                krot.moveDown();
              },
            },
            {
              label: 'Move up',
              accelerator: 'CmdOrCtrl + Shift + D',
              click: () => {
                krot.moveUp();
              },
            },
            { type: 'separator' },
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
          submenu: Object.keys(config.controllers).map((key) => {
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
    const options = { filters: [{ extensions: ['js'], name: '' }] };

    const filePath = await new Promise((resolve) => {
      remote.dialog.showSaveDialog(window, options, resolve);
    });

    if (!filePath) return;

    await this.load(filePath);
    krot.new();
    krot.filePath = filePath;
  }

  async open() {
    await new Promise((resolve) => krot.requestSave(resolve));
    const window = remote.getCurrentWindow();
    const options = { filters: [{ extensions: ['js'], name: '' }] };

    const filePath = await new Promise((resolve) => {
      remote.dialog.showOpenDialog(window, options, (filePaths) => resolve(filePaths && filePaths[0]));
    });

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

    config.controllers = Object.assign(
      {},
      app.getStandardControllers(),
      config.controllers || {},
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
