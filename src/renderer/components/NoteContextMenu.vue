<template>
  <div class="context-menu" v-show="visible" :style="position">
    <div class="menu-item" @click="handleAction('copy')" v-if="hasSelection">
      <el-icon><CopyDocument /></el-icon>
      {{ t('contextMenu.copy') }}
    </div>
    <div class="menu-item" @click="handleAction('cut')" v-if="hasSelection">
      <el-icon><DocumentCopy /></el-icon>
      {{ t('contextMenu.cut') }}
    </div>
    <div class="menu-item" @click="handleAction('paste')">
      <el-icon><Document /></el-icon>
      {{ t('contextMenu.paste') }}
    </div>
    <!-- 添加分隔線 -->
    <div class="divider"></div>
    <!-- 添加撤銷和重做選項 -->
    <div class="menu-item" @click="handleAction('undo')" :class="{ disabled: !canUndo }">
      <el-icon><RefreshLeft /></el-icon>
      {{ t('contextMenu.undo') }}
    </div>
    <div class="menu-item" @click="handleAction('redo')" :class="{ disabled: !canRedo }">
      <el-icon><RefreshRight /></el-icon>
      {{ t('contextMenu.redo') }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { CopyDocument, Document, DocumentCopy, RefreshLeft, RefreshRight } from '@element-plus/icons-vue';

const { t } = useI18n();

const props = defineProps({
  undoStack: {
    type: Array,
    default: () => []
  },
  redoStack: {
    type: Array,
    default: () => []
  }
});

const visible = ref(false);
const position = ref({ top: '0px', left: '0px' });
const hasSelection = ref(false);
const canUndo = computed(() => props.undoStack.length > 0);
const canRedo = computed(() => props.redoStack.length > 0);

const emit = defineEmits(['action']);

const show = (event) => {
  event.preventDefault();
  
  // 檢查是否有選中的文本
  const selection = window.getSelection();
  hasSelection.value = selection.toString().length > 0;
  
  // 設置選單位置
  position.value = {
    top: `${event.clientY}px`,
    left: `${event.clientX}px`
  };
  
  visible.value = true;
  
  // 點擊其他地方時關閉選單
  const closeMenu = (e) => {
    if (!e.target.closest('.context-menu')) {
      visible.value = false;
      document.removeEventListener('click', closeMenu);
    }
  };
  document.addEventListener('click', closeMenu);
};

const handleAction = (action) => {
  if ((action === 'undo' && !canUndo.value) || 
      (action === 'redo' && !canRedo.value)) {
    return;
  }
  emit('action', action);
  visible.value = false;
};

defineExpose({
  show
});
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 4px 0;
  min-width: 120px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.menu-item {
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--el-text-color-regular);
}

.menu-item:hover {
  background: var(--el-fill-color-light);
  color: var(--el-color-primary);
}

.menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-item.disabled:hover {
  background: none;
  color: var(--el-text-color-regular);
}

.divider {
  height: 1px;
  background: var(--el-border-color-light);
  margin: 4px 0;
}

.el-icon {
  font-size: 16px;
}
</style> 