<template>
  <ul
    v-show="visible"
    class="context-menu"
    :style="{ top: y + 'px', left: x + 'px' }"
  >
    <li @click="handleAction('copy')">
      <el-icon><CopyDocument /></el-icon>
      {{ t('contextMenu.copy') }}
    </li>
    <li @click="handleAction('cut')">
      <el-icon><DocumentCopy /></el-icon>
      {{ t('contextMenu.cut') }}
    </li>
    <li @click="handleAction('paste')">
      <el-icon><DocumentAdd /></el-icon>
      {{ t('contextMenu.paste') }}
    </li>
  </ul>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { CopyDocument, DocumentCopy, DocumentAdd } from '@element-plus/icons-vue';

const { t } = useI18n();
const visible = ref(false);
const x = ref(0);
const y = ref(0);

const emit = defineEmits(['action']);

const show = (event) => {
  event.preventDefault();
  // 計算選單位置
  let menuX = event.clientX;
  let menuY = event.clientY;
  
  // 確保選單不會超出視窗範圍
  if (menuX + 160 > window.innerWidth) {
    menuX = window.innerWidth - 170;
  }
  if (menuY + 120 > window.innerHeight) {
    menuY = window.innerHeight - 130;
  }
  
  x.value = menuX;
  y.value = menuY;
  visible.value = true;
  
  // 添加一次性點擊事件監聽器來關閉選單
  document.addEventListener('click', hide, { once: true });
};

const hide = () => {
  visible.value = false;
};

const handleAction = (action) => {
  emit('action', action);
  hide();
};

defineExpose({
  show,
  hide
});
</script>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 9999;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 4px 0;
  margin: 0;
  list-style: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  min-width: 160px;
}

.context-menu li {
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-regular);
  font-size: 14px;
  transition: all 0.2s;
}

.context-menu li:hover {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.context-menu .el-icon {
  font-size: 16px;
}
</style> 