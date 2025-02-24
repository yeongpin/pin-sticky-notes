<template>
  <ul
    v-show="visible"
    class="context-menu"
    :style="{ top: y + 'px', left: x + 'px' }"
  >
    <li @click="handleAction('moveUp')" :class="{ disabled: isFirst }">
      <el-icon><ArrowUp /></el-icon>
      {{ t('contextMenu.moveUp') }}
    </li>
    <li @click="handleAction('moveDown')" :class="{ disabled: isLast }">
      <el-icon><ArrowDown /></el-icon>
      {{ t('contextMenu.moveDown') }}
    </li>
    <li class="divider"></li>
    <li @click="handleAction('star')">
      <el-icon><Star /></el-icon>
      {{ note?.starred ? t('contextMenu.unstar') : t('contextMenu.star') }}
    </li>
    <li class="divider"></li>
    <li @click="handleAction('rename')">
      <el-icon><Edit /></el-icon>
      {{ t('contextMenu.rename') }}
    </li>
    <li class="color-menu">
      <div class="color-title">
        <el-icon><ChromeFilled /></el-icon>
        {{ t('contextMenu.color') }}
      </div>
      <div class="color-list">
        <div
          v-for="color in colors"
          :key="color.value"
          class="color-item"
          :style="{ backgroundColor: color.value }"
          @click="handleAction('color', color.value)"
        ></div>
      </div>
    </li>
    <li class="divider"></li>
    <li class="danger" @click="handleAction('delete')">
      <el-icon><Delete /></el-icon>
      {{ t('contextMenu.delete') }}
    </li>
  </ul>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  ArrowUp,
  ArrowDown,
  Star,
  Edit,
  ChromeFilled,
  Delete
} from '@element-plus/icons-vue';

const { t } = useI18n();
const props = defineProps({
  note: {
    type: Object,
    default: null
  },
  index: {
    type: Number,
    default: -1
  },
  total: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['action']);

const visible = ref(false);
const x = ref(0);
const y = ref(0);

const isFirst = computed(() => props.index === 0);
const isLast = computed(() => props.index === props.total - 1);

const colors = [
  { value: '#fff7b1' }, // 默認黃色
  { value: '#b4f0b4' }, // 綠色
  { value: '#ffd2d2' }, // 紅色
  { value: '#d4e4ff' }, // 藍色
  { value: '#ffd9ec' }, // 粉色
  { value: '#e6e6e6' }  // 灰色
];

const show = (event) => {
  event.preventDefault();
  
  // 獲取視窗尺寸和滾動位置
  const windowHeight = window.innerHeight;
  const menuHeight = 280; // 預估選單高度
  
  // 計算選單位置
  let menuX = event.clientX;
  let menuY = event.clientY;
  
  // 確保選單不會超出右邊界
  if (menuX + 160 > window.innerWidth) { // 160px 是選單寬度
    menuX = window.innerWidth - 170;
  }
  
  // 確保選單不會超出底部
  if (menuY + menuHeight > windowHeight) {
    menuY = windowHeight - menuHeight - 10; // 10px 作為底部間距
  }
  
  // 確保選單不會超出頂部
  if (menuY < 0) {
    menuY = 10; // 10px 作為頂部間距
  }
  
  x.value = menuX;
  y.value = menuY;
  visible.value = true;

  // 點擊其他地方時關閉選單
  const closeMenu = () => {
    visible.value = false;
    document.removeEventListener('click', closeMenu);
  };
  document.addEventListener('click', closeMenu);
};

const handleAction = (action, value) => {
  if ((action === 'moveUp' && isFirst.value) || 
      (action === 'moveDown' && isLast.value)) {
    return;
  }
  emit('action', { action, value, note: props.note });
  visible.value = false;
};

defineExpose({ show });
</script>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 9999; /* 提高層級確保顯示在最上層 */
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 4px 0;
  min-width: 160px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  list-style: none;
  max-height: calc(100vh - 20px); /* 限制最大高度 */
  overflow-y: auto; /* 如果內容過多則顯示滾動條 */
}

.context-menu li {
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: var(--el-text-color-primary);
  position: relative;
}

.context-menu li:hover {
  background: var(--el-fill-color-light);
}

.context-menu li.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.context-menu li.danger {
  color: var(--el-color-danger);
}

.context-menu .divider {
  height: 1px;
  margin: 4px 0;
  background: var(--el-border-color-light);
  padding: 0;
  cursor: default;
}

.context-menu .divider:hover {
  background: var(--el-border-color-light);
}

.color-menu {
  flex-direction: column;
  gap: 8px;
  padding-bottom: 12px;
}

.color-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  padding: 0 16px;
  margin-top: 8px;
}

.color-item {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color);
  cursor: pointer;
  transition: transform 0.2s;
}

.color-item:hover {
  transform: scale(1.2);
}

/* 移除舊的顏色選擇器樣式 */
.color-picker {
  display: none;
}
</style> 