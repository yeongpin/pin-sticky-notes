const fetch = require('node-fetch'); // 需要先安裝: npm install node-fetch

// 語言代碼映射
const languageMap = {
  'zh_TW': 'zh-TW',
  'en': 'en',
  '': 'auto' // 自動檢測
};

async function handleTranslate(text, fromLang, toLang) {
  try {
    const sourceLang = languageMap[fromLang] || fromLang;
    const targetLang = languageMap[toLang] || toLang;

    // 將文本分成單詞/短語進行翻譯
    const words = text.split(/(\s+)/);
    const translatedParts = await Promise.all(
      words.map(async (word) => {
        if (!word.trim()) return word; // 保留空格

        const url = new URL('https://translate.googleapis.com/translate_a/single');
        const params = new URLSearchParams({
          client: 'gtx',
          sl: sourceLang,
          tl: targetLang,
          dt: 't',
          q: word
        });

        const response = await fetch(`${url}?${params}`, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data || !Array.isArray(data[0])) {
          throw new Error('Invalid response format');
        }

        return data[0]
          .filter(item => item && item[0])
          .map(item => item[0])
          .join('');
      })
    );

    // 合併翻譯結果
    return translatedParts.join('');
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

module.exports = {
  handleTranslate
}; 