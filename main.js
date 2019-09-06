const electron = require('electron');
const {app, BrowserWindow, Menu} = electron;
const path = require('path');
const url = require('url');

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow();
  mainWindow.maximize();

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'src/index.html'),
    protocol: 'file:',
    slashes: true,
  }));

  mainWindow.on('closed', () => mainWindow = null);

  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl + N',
          click: () => {
            mainWindow.webContents.send('new');
          },
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl + O',
          click: () => {
            mainWindow.webContents.send('open');
          },
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl + S',
          click: () => {
            mainWindow.webContents.send('save');
          },
        },
        {
          label: 'Save as',
          accelerator: 'CmdOrCtrl + Shift + S',
          click: () => {
            mainWindow.webContents.send('saveAs');
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
          accelerator: 'CmdOrCtrl + Z',
          click: () => {
            mainWindow.webContents.send('undo');
          },
        },
        {
          label: 'Redo',
          accelerator: 'CmdOrCtrl + Shift + Z',
          click: () => {
            mainWindow.webContents.send('redo');
          },
        },
        {type: 'separator'},
        {
          label: 'Move down',
          accelerator: 'CmdOrCtrl + D',
          click: () => {
            mainWindow.webContents.send('moveDown');
          },
        },
        {
          label: 'Move up',
          accelerator: 'CmdOrCtrl + Shift + D',
          click: () => {
            mainWindow.webContents.send('moveUp');
          },
        },
        {type: 'separator'},
        {
          label: 'Clone',
          click: () => {
            mainWindow.webContents.send('clone');
          },
        },
        {
          label: 'Destroy',
          click: () => {
            mainWindow.webContents.send('destroy');
          },
        },
      ],
    },

    {
      label: 'Object',
      submenu: [
        {
          label: "Group",
          click: () => {
            mainWindow.webContents.send("group");
          },
        },
        {
          label: 'Sprite',
          click: () => {
            mainWindow.webContents.send('sprite');
          },
        },
        {
          label: 'Text',
          click: () => {
            mainWindow.webContents.send('text');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);
app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit());
app.on('activate', () => mainWindow === null && createWindow());
