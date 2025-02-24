const { globalShortcut } = require('electron');

function registerShortcuts(window) {
  // 註冊快捷鍵 Ctrl+Shift+Space
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    if (window.isVisible()) {
      window.hide();
    } else {
      window.show();
    }
  });
}

module.exports = {
  registerShortcuts
}; 