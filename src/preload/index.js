const { contextBridge, ipcRenderer } = require('electron');

// 確保所有方法都正確暴露
contextBridge.exposeInMainWorld('electron', {
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
  minimize: () => ipcRenderer.send('minimize-window'),
  quit: () => ipcRenderer.send('quit-app'),
  
  // 打開文件對話框
  openFileDialog: (options) => ipcRenderer.invoke('dialog:openFile', options),
  
  // 打開文件夾對話框
  openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),
  
  // 讀取文件內容
  readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),
  
  // 讀取文件夾內容
  readFolder: (folderPath) => ipcRenderer.invoke('folder:read', folderPath),
  
  // 保存文件
  saveFile: (params) => ipcRenderer.invoke('file:save', params),
  
  // 另存為
  saveFileAs: (params) => ipcRenderer.invoke('file:saveAs', params)
});

contextBridge.exposeInMainWorld('electronAPI', {
  // ... 其他 API ...
  
  // 添加翻譯 API
  translateText: (params) => ipcRenderer.invoke('translate-text', params)
}); 