const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { createWindow } = require('./windowManager');
const { registerShortcuts } = require('./shortcuts');
const { t } = require('./translations');
const { handleTranslate } = require('./translate');

// 防止垃圾回收
let mainWindow;
let tray = null;

// 添加一個標誌來控制是否強制退出
let forceQuit = false;

// 註冊所有 IPC 處理程序
function registerIpcHandlers() {
  // 處理窗口控制事件
  ipcMain.handle('toggle-always-on-top', () => {
    const isAlwaysOnTop = mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(!isAlwaysOnTop);
    return !isAlwaysOnTop;
  });

  ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
  });

  // 修改退出邏輯
  ipcMain.on('quit-app', () => {
    forceQuit = true;
    if (tray) {
      tray.destroy();
    }
    app.quit();
    if (process.platform !== 'darwin') {
      app.exit(0);
    }
  });

  // 添加翻譯 IPC 處理器
  ipcMain.handle('translate-text', async (event, { text, fromLang, toLang }) => {
    return await handleTranslate(text, fromLang, toLang);
  });
}

function createTray() {
  // 使用 path.join 來正確處理路徑
  const iconPath = path.join(__dirname, '../../src/assets/pin-note.png');
  const icon = nativeImage.createFromPath(iconPath);
  
  try {
    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
      { 
        label: t('tray.show'),
        click: () => mainWindow.show()
      },
      { type: 'separator' },
      { 
        label: t('tray.exit'),
        click: () => {
          forceQuit = true;
          if (tray) {
            tray.destroy();
          }
          app.quit();
          if (process.platform !== 'darwin') {
            app.exit(0);
          }
        }
      }
    ]);
    
    tray.setToolTip(t('titleBar.title'));
    tray.setContextMenu(contextMenu);
    
    tray.on('click', () => {
      mainWindow.show();
    });
  } catch (error) {
    console.error('Error creating tray:', error);
    // 使用默認值作為後備
    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
      { 
        label: 'Show',
        click: () => mainWindow.show()
      },
      { type: 'separator' },
      { 
        label: 'Exit',
        click: () => {
          forceQuit = true;
          if (tray) {
            tray.destroy();
          }
          app.quit();
          if (process.platform !== 'darwin') {
            app.exit(0);
          }
        }
      }
    ]);
    
    tray.setToolTip('Sticky Notes');
    tray.setContextMenu(contextMenu);
    
    tray.on('click', () => {
      mainWindow.show();
    });
  }
}

function initialize() {
  app.whenReady().then(() => {
    mainWindow = createWindow();
    registerShortcuts(mainWindow);
    registerIpcHandlers();
    createTray();

    mainWindow.on('close', (event) => {
      if (!forceQuit) {
        event.preventDefault();
        mainWindow.hide();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (forceQuit) {
      app.quit();
    }
  });

  app.on('before-quit', () => {
    forceQuit = true;
    if (tray) {
      tray.destroy();
    }
  });

  app.on('activate', () => {
    mainWindow.show();
  });
}

initialize(); 