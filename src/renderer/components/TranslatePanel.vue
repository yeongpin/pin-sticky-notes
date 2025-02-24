<template>
  <div class="translate-panel" :class="{ 'is-visible': visible }">
    <div class="translate-container">
      <div class="translate-header">
        <el-select 
          v-model="fromLang" 
          size="small" 
          style="width: 120px"
          @change="handleTranslate"
        >
          <el-option
            v-for="lang in fromLanguages"
            :key="lang.value"
            :label="lang.label"
            :value="lang.value"
          />
        </el-select>

        <el-icon class="exchange-icon"><Right /></el-icon>

        <el-select 
          v-model="toLang" 
          size="small" 
          style="width: 120px"
          @change="handleTranslate"
        >
          <el-option
            v-for="lang in toLanguages"
            :key="lang.value"
            :label="lang.label"
            :value="lang.value"
          />
        </el-select>
      </div>

      <div class="input-area">
        <el-input
          v-model="sourceText"
          type="textarea"
          :rows="8"
          resize="none"
          :placeholder="t('translate.enterText')"
          @input="handleInput"
        />
      </div>

      <div class="translate-actions">
        <el-button type="primary" size="small" @click="handleTranslate">
          {{ t('translate.translate') }}
        </el-button>
      </div>

      <div class="input-area">
        <el-input
          v-model="translatedText"
          type="textarea"
          :rows="8"
          resize="none"
          readonly
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Right } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const { t } = useI18n();
const fromLang = ref('auto');
const toLang = ref('en');
const sourceText = ref('');
const translatedText = ref('');
let translateTimeout = null;

// 使用 computed 來創建語言選項
const fromLanguages = computed(() => [
  { label: t('translate.auto'), value: 'auto' },
  { label: t('translate.english'), value: 'en' },
  { label: t('translate.chineset'), value: 'zh_TW' },
  { label: t('translate.chineses'), value: 'zh_CN' },
  { label: t('translate.japanese'), value: 'ja' },
  { label: t('translate.korean'), value: 'ko' },
  { label: t('translate.french'), value: 'fr' },
  { label: t('translate.german'), value: 'de' },
  { label: t('translate.spanish'), value: 'es' },
  { label: t('translate.italian'), value: 'it' },
  { label: t('translate.portuguese'), value: 'pt' },
  { label: t('translate.russian'), value: 'ru' },
  { label: t('translate.arabic'), value: 'ar' },
  { label: t('translate.turkish'), value: 'tr' },
  { label: t('translate.dutch'), value: 'nl' },
  { label: t('translate.hindi'), value: 'hi' },
  { label: t('translate.polish'), value: 'pl' },
  { label: t('translate.romanian'), value: 'ro' },
  { label: t('translate.hungarian'), value: 'hu' },
  { label: t('translate.czech'), value: 'cs' },
  { label: t('translate.swedish'), value: 'sv' },
  { label: t('translate.norwegian'), value: 'no' },
  { label: t('translate.danish'), value: 'da' },
  { label: t('translate.finnish'), value: 'fi' },
  { label: t('translate.greek'), value: 'el' },
  { label: t('translate.bulgarian'), value: 'bg' },
  { label: t('translate.croatian'), value: 'hr' },
  { label: t('translate.lithuanian'), value: 'lt' },
  { label: t('translate.latvian'), value: 'lv' },
  { label: t('translate.macedonian'), value: 'mk' },
  { label: t('translate.malay'), value: 'ms' },
  { label: t('translate.maltese'), value: 'mt' }
]);

const toLanguages = computed(() => [
  { label: t('translate.english'), value: 'en' },
  { label: t('translate.chineset'), value: 'zh_TW' },
  { label: t('translate.chineses'), value: 'zh_CN' },
  { label: t('translate.japanese'), value: 'ja' },
  { label: t('translate.korean'), value: 'ko' },
  { label: t('translate.french'), value: 'fr' },
  { label: t('translate.german'), value: 'de' },
  { label: t('translate.spanish'), value: 'es' },
  { label: t('translate.italian'), value: 'it' },
  { label: t('translate.portuguese'), value: 'pt' },
  { label: t('translate.russian'), value: 'ru' },
  { label: t('translate.arabic'), value: 'ar' },
  { label: t('translate.turkish'), value: 'tr' },
  { label: t('translate.dutch'), value: 'nl' },
  { label: t('translate.hindi'), value: 'hi' },
  { label: t('translate.polish'), value: 'pl' },
  { label: t('translate.romanian'), value: 'ro' },
  { label: t('translate.hungarian'), value: 'hu' },
  { label: t('translate.czech'), value: 'cs' },
  { label: t('translate.swedish'), value: 'sv' },
  { label: t('translate.norwegian'), value: 'no' },
  { label: t('translate.danish'), value: 'da' },
  { label: t('translate.finnish'), value: 'fi' },
  { label: t('translate.greek'), value: 'el' },
  { label: t('translate.bulgarian'), value: 'bg' },
  { label: t('translate.croatian'), value: 'hr' },
  { label: t('translate.lithuanian'), value: 'lt' },
  { label: t('translate.latvian'), value: 'lv' },
  { label: t('translate.macedonian'), value: 'mk' },
  { label: t('translate.malay'), value: 'ms' },
  { label: t('translate.maltese'), value: 'mt' }
]);

// 處理輸入防抖
const handleInput = () => {
  if (translateTimeout) {
    clearTimeout(translateTimeout);
  }
  translateTimeout = setTimeout(() => {
    if (sourceText.value.trim()) {
      handleTranslate();
    }
  }, 1000);
};

async function handleTranslate() {
  if (!sourceText.value.trim()) {
    translatedText.value = '';
    return;
  }

  try {
    const result = await window.electronAPI.translateText({
      text: sourceText.value,
      fromLang: fromLang.value === 'auto' ? '' : fromLang.value,
      toLang: toLang.value
    });
    translatedText.value = result;
  } catch (error) {
    console.error('Translation error:', error);
    ElMessage.error(t('translate.error'));
  }
}

// 監聽語言變化
watch([fromLang, toLang], () => {
  if (sourceText.value.trim()) {
    handleTranslate();
  }
});
</script>

<style scoped>
.translate-panel {
  position: fixed;
  top: 32px;
  right: -320px;
  width: 320px;
  height: calc(100vh - 32px);
  background: var(--el-bg-color);
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 1000;
  border-left: 1px solid var(--el-border-color-light);
}

.translate-panel.is-visible {
  right: 0;
}

.translate-container {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.translate-container::-webkit-scrollbar {
  width: 6px;
}

.translate-container::-webkit-scrollbar-thumb {
  background: var(--el-border-color-darker);
  border-radius: 3px;
}

.translate-container::-webkit-scrollbar-track {
  background: var(--el-fill-color-lighter);
}

.translate-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.exchange-icon {
  font-size: 16px;
  color: var(--el-text-color-secondary);
}

.input-area {
  margin-bottom: 16px;
}

.input-area :deep(.el-textarea__inner) {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  line-height: 1.5;
}

.translate-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}
</style> 