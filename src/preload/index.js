const { contextBridge, ipcRenderer } = require('electron');

// 確保所有方法都正確暴露
contextBridge.exposeInMainWorld('electron', {
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
  minimize: () => ipcRenderer.send('minimize-window'),
  quit: () => ipcRenderer.send('quit-app')
});

contextBridge.exposeInMainWorld('electronAPI', {
  // ... 其他 API ...
  
  // 添加翻譯 API
  translateText: (params) => ipcRenderer.invoke('translate-text', params)
}); 