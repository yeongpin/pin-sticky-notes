<template>
  <div class="title-bar">
    <div class="title-bar-left">
     <el-icon class="logo"><Memo /></el-icon>
     <span class="app-title">{{ t('app.appName') }} v{{ t('app.appVersion') }}</span>
      <span class="title">{{ title }}</span>
    </div>
    <div class="title-bar-right">
      <div class="window-controls">
        <el-tooltip
          :content="t('titleBar.noteList')"
          placement="bottom"
          :hide-after="200"
          :show-after="200"
        >
          <div class="button" @click="$emit('toggle-note-list')">
            <el-icon><Document /></el-icon>
          </div>
        </el-tooltip>
        <el-tooltip
          :content="t('titleBar.translate')"
          placement="bottom"
          :hide-after="200"
          :show-after="200"
        >
          <div class="button" @click="toggleTranslate">
            <el-icon><ChatLineSquare /></el-icon>
          </div>
        </el-tooltip>
        <el-tooltip
          :content="t('titleBar.settings')"
          placement="bottom"
          :hide-after="200"
          :show-after="200"
        >
          <el-dropdown trigger="click" :teleported="true" popper-class="toolbar-dropdown">
            <div class="button">
              <el-icon><Setting /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="lang in languages"
                  :key="lang.value"
                  :class="{ 'is-active': currentLang === lang.value }"
                  @click="handleLanguageChange(lang.value)"
                >
                  {{ lang.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
        <el-tooltip
          :content="t('titleBar.pin')"
          placement="bottom"
          :hide-after="200"
          :show-after="200"
        >
          <div class="button" @click="togglePin" :class="{ active: isPinned }">
            <el-icon>
              <component :is="isPinned ? 'TurnOff' : 'Open'" />
            </el-icon>
          </div>
        </el-tooltip>
        <el-tooltip
          :content="t('titleBar.minimize')"
          placement="bottom"
          :hide-after="200"
          :show-after="200"
        >
          <div class="button minimize" @click="minimize">
            <el-icon><Minus /></el-icon>
          </div>
        </el-tooltip>
        <el-tooltip
          :content="t('titleBar.close')"
          placement="bottom"
          :hide-after="200"
          :show-after="200"
        >
          <div class="button close" @click="handleClose">
            <el-icon><Close /></el-icon>
          </div>
        </el-tooltip>
      </div>
    </div>
    <CloseConfirm ref="closeConfirmRef" @minimize="onMinimize" @exit="onExit" />
  </div>
  <TranslatePanel :visible="showTranslate" />
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { 
  Memo, 
  TurnOff, 
  Open, 
  Minus, 
  Close,
  Setting,
  Document
} from '@element-plus/icons-vue';
import CloseConfirm from './CloseConfirm.vue';
import TranslatePanel from './TranslatePanel.vue';

const { t, locale } = useI18n();
const currentLang = ref(localStorage.getItem('language') || 'zh-TW');
const isPinned = ref(true);
const closeConfirmRef = ref(null);
const showTranslate = ref(false);

const languages = [
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'en', label: 'English' }
];

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  isVisible: {
    type: Boolean,
    default: true
  }
});

const defineEmits = defineEmits(['toggle-note-list']);

const handleLanguageChange = (value) => {
  currentLang.value = value;
  locale.value = value;
  localStorage.setItem('language', value);
};

const togglePin = async () => {
  try {
    const newState = await window.electron.toggleAlwaysOnTop();
    isPinned.value = newState;
  } catch (error) {
    console.error('Error toggling pin state:', error);
  }
};

const minimize = () => {
  try {
    window.electron.minimize();
  } catch (error) {
    console.error('Error minimizing window:', error);
  }
};

const handleClose = () => {
  try {
    closeConfirmRef.value.show();
  } catch (error) {
    console.error('Error showing close dialog:', error);
  }
};

const onMinimize = () => {
  try {
    window.electron.minimize();
  } catch (error) {
    console.error('Error minimizing window:', error);
  }
};

const onExit = () => {
  try {
    window.electron.quit();
  } catch (error) {
    console.error('Error quitting app:', error);
  }
};

const toggleTranslate = () => {
  showTranslate.value = !showTranslate.value;
};
</script>

<style scoped>
.title-bar {
  -webkit-app-region: drag;
  height: 32px;
  background: var(--el-bg-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 0 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.title-bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  font-size: 18px;
  color: var(--el-color-primary);
}

.app-title {
  font-size: 14px;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title {
  margin-left: 8px;
  font-size: 14px;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.title-bar-right {
  -webkit-app-region: no-drag;
  display: flex;
  align-items: center;
}

.window-controls {
  display: flex;
  height: 32px;
  align-items: center;
  gap: 4px;
}

.button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--el-text-color-regular);
  transition: all 0.2s ease;
}

.button:hover {
  background-color: var(--el-fill-color-light);
}

.button.active {
  color: var(--el-color-success);
}

.button.close:hover {
  background-color: #f56c6c;
  color: white;
}

.button .el-icon {
  font-size: 16px;
}

:deep(.toolbar-dropdown) {
  background-color: var(--el-bg-color) !important;
  border: 1px solid var(--el-border-color-light) !important;
  border-radius: 4px;
  margin-top: 4px !important;
}

:deep(.el-dropdown-menu__item) {
  line-height: 32px !important;
  padding: 0 16px !important;
  font-size: 13px;
}

:deep(.el-dropdown-menu__item.is-active) {
  color: var(--el-color-primary) !important;
  background-color: var(--el-color-primary-light-9) !important;
}

:deep(.el-dropdown-menu__item:hover),
:deep(.el-dropdown-menu__item:focus) {
  background-color: var(--el-fill-color-light) !important;
}

:deep(.el-tooltip__popper) {
  padding: 4px 8px !important;
  min-height: 24px !important;
  line-height: 16px !important;
  font-size: 12px !important;
}
</style> 