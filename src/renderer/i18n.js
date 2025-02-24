import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import zhTW from './locales/zh-tw.json';

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'zh-TW',
  fallbackLocale: 'en',
  messages: {
    'en': en,
    'zh-TW': zhTW
  }
});

export default i18n; 