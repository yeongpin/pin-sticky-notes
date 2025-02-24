const path = require('path');
const fs = require('fs');

// 加載翻譯文件
const loadTranslations = () => {
  const locale = process.env.LANG || 'en';
  let translations;

  try {
    // 嘗試加載對應語言的翻譯
    const filePath = path.join(__dirname, '../renderer/locales', 
      locale.startsWith('zh') ? 'zh-tw.json' : 'en.json');
    translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    // 如果失敗，使用英文作為後備
    const filePath = path.join(__dirname, '../renderer/locales/en.json');
    translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return translations;
};

// 翻譯函數
const t = (key) => {
  const translations = loadTranslations();
  const keys = key.split('.');
  let result = translations;

  for (const k of keys) {
    if (result && result[k]) {
      result = result[k];
    } else {
      // 如果找不到翻譯，返回原始 key
      return key;
    }
  }

  return result;
};

module.exports = {
  t
}; 