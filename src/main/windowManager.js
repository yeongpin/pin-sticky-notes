const { BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 600,
    minWidth: 520,
    minHeight: 400,
    frame: false,
    backgroundColor: '#fff7b1',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js')
    }
  });

  // 開發環境使用本地服務器，生產環境使用打包後的文件
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:2512');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'));
  }

  return mainWindow;
}

module.exports = {
  createWindow
}; 