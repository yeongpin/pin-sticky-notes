const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, nativeImage, dialog } = require('electron');
const path = require('path');
const { createWindow } = require('./windowManager');
const { registerShortcuts } = require('./shortcuts');
const { t } = require('./translations');
const { handleTranslate } = require('./translate');
const fs = require('fs').promises;

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

  // 處理打開文件對話框
  ipcMain.handle('dialog:openFile', async (event, options) => {
    if (options.properties?.includes('openDirectory')) {
      // 如果是選擇目錄，直接返回選擇結果
      return dialog.showOpenDialog(options);
    }
    
    // 原有的文件打開邏輯保持不變
    const result = await dialog.showOpenDialog(options);
    if (result.canceled) return { canceled: true, files: [] };
    
    // 讀取所有選中文件的內容
    const files = await Promise.all(
      result.filePaths.map(async (filePath) => {
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const stats = await fs.stat(filePath);
          return {
            content,
            path: filePath,
            name: path.basename(filePath),
            lastModified: stats.mtime
          };
        } catch (error) {
          console.error(`Failed to read file: ${filePath}`, error);
          return null;
        }
      })
    );
    
    return {
      canceled: false,
      files: files.filter(Boolean)
    };
  });

  // 處理打開文件夾對話框
  ipcMain.handle('dialog:openFolder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    
    if (result.canceled) return { canceled: true, path: null };
    
    try {
      const folderPath = result.filePaths[0];
      const files = await fs.readdir(folderPath, { withFileTypes: true });
      
      const textFiles = await Promise.all(
        files
          .filter(file => file.isFile() && /\.(txt|md)$/.test(file.name))
          .map(async (file) => {
            const filePath = path.join(folderPath, file.name);
            const content = await fs.readFile(filePath, 'utf-8');
            const stats = await fs.stat(filePath);
            
            return {
              content,
              path: filePath,
              name: file.name,
              lastModified: stats.mtime
            };
          })
      );
      
      return {
        canceled: false,
        path: folderPath,
        files: textFiles
      };
    } catch (error) {
      console.error('Folder operation error:', error);
      throw error;
    }
  });

  // 讀取文件內容
  ipcMain.handle('file:read', async (event, filePath) => {
    console.log('=== Main process file:read start ===');
    try {
      console.log('Received path:', {
        filePath,
        type: typeof filePath,
        length: filePath?.length
      });
      
      if (!filePath || typeof filePath !== 'string') {
        console.error('Invalid file path:', filePath);
        throw new Error('File path cannot be empty or must be a string');
      }
      
      // 處理路徑中的反斜線
      const normalizedPath = path.normalize(filePath.replace(/\\\\/g, '\\'));
      console.log('Normalized path:', normalizedPath);
      
      try {
        // 檢查文件是否存在
        await fs.access(normalizedPath);
        console.log('File exists');
        
        // 讀取文件
        const content = await fs.readFile(normalizedPath, 'utf-8');
        const stats = await fs.stat(normalizedPath);
        const name = path.basename(normalizedPath);
        
        const result = {
          content,
          path: normalizedPath,
          name,
          lastModified: stats.mtime
        };
        
        console.log('=== Main process file:read end ===');
        return result;
      } catch (error) {
        console.error('File operation error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Main process error:', error);
      throw error;
    }
  });

  // 讀取文件夾內容
  ipcMain.handle('folder:read', async (event, folderPath) => {
    try {
      const files = await fs.readdir(folderPath, { withFileTypes: true });
      const textFiles = files
        .filter(file => file.isFile() && /\.(txt|md)$/.test(file.name))
        .map(file => ({
          name: file.name,
          path: path.join(folderPath, file.name)
        }));
      return textFiles;
    } catch (error) {
      console.error('Error reading folder:', error);
      throw error;
    }
  });

  // 添加保存文件處理器
  ipcMain.handle('file:save', async (event, { path: filePath, content }) => {
    console.log('=== Main process file:save start ===');
    try {
      if (!filePath || typeof filePath !== 'string') {
        throw new Error('Invalid file path');
      }

      const resolvedPath = path.resolve(filePath);
      console.log('Resolved path:', resolvedPath);

      try {
        // 寫入文件（不需要檢查文件是否存在，因為可能是新文件）
        await fs.writeFile(resolvedPath, content, 'utf-8');
        
        // 獲取更新後的文件信息
        const stats = await fs.stat(resolvedPath);
        console.log('=== Main process file:save end ===');
        
        return {
          success: true,
          lastModified: stats.mtime
        };
      } catch (error) {
        console.error('File operation error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Save file error:', error);
      throw error;
    }
  });

  // 添加另存為處理器
  ipcMain.handle('file:saveAs', async (event, { title, buttonLabel, defaultPath, content }) => {
    try {
      // 先選擇保存位置
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title,
        buttonLabel
      });

      if (result.canceled) {
        return { success: false };
      }

      // 構建完整的文件路徑
      const folderPath = result.filePaths[0];
      const fileName = `${defaultPath}.txt`;
      const filePath = path.join(folderPath, fileName);

      // 保存文件
      await fs.writeFile(filePath, content, 'utf-8');
      
      // 獲取文件信息
      const stats = await fs.stat(filePath);
      
      return {
        success: true,
        path: filePath,
        lastModified: stats.mtime
      };
    } catch (error) {
      console.error('SaveAs error:', error);
      throw error;
    }
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