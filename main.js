process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';

const electron = require('electron');
const {app, BrowserWindow, Menu} = electron;
const path = require('path');
const url = require('url');

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.maximize();

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'src/index.html'),
    protocol: 'file:',
    slashes: true,
  }));

  mainWindow.on('closed', () => mainWindow = null);
  Menu.setApplicationMenu(null);
  // mainWindow.webContents.openDevTools();
};


app.on('ready', createWindow);
app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit());
app.on('activate', () => mainWindow === null && createWindow());
