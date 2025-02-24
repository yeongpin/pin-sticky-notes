<template>
  <div 
    class="zoom-control" 
    :class="{ 'is-visible': isVisible }"
    @mouseenter="showControl"
    @mouseleave="startHideTimer"
  >
    <el-tooltip 
      :content="t('zoom.reduce')" 
      placement="top"
      :hide-after="0"
      ref="reduceTooltipRef"
    >
      <el-button
        circle
        size="small"
        :disabled="zoom <= minZoom"
        @click="handleZoomClick(-10)"
      >
        <el-icon><Minus /></el-icon>
      </el-button>
    </el-tooltip>

    <span class="zoom-text">{{ zoom }}%</span>

    <el-tooltip 
      :content="t('zoom.enlarge')" 
      placement="top"
      :hide-after="0"
      ref="enlargeTooltipRef"
    >
      <el-button
        circle
        size="small"
        :disabled="zoom >= maxZoom"
        @click="handleZoomClick(10)"
      >
        <el-icon><Plus /></el-icon>
      </el-button>
    </el-tooltip>

    <el-tooltip 
      :content="t('zoom.reset')" 
      placement="top"
      :hide-after="0"
      ref="resetTooltipRef"
    >
      <el-button
        circle
        size="small"
        :disabled="zoom === 100"
        @click="handleResetClick"
      >
        <el-icon><RefreshRight /></el-icon>
      </el-button>
    </el-tooltip>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { Plus, Minus, RefreshRight } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  modelValue: {
    type: Number,
    default: 100
  }
});

const emit = defineEmits(['update:modelValue']);

const zoom = ref(props.modelValue);
const isVisible = ref(false);
const minZoom = 50;
const maxZoom = 200;

let hideTimeout;
let mouseMoveTimeout;

// 添加 tooltip refs
const reduceTooltipRef = ref(null);
const enlargeTooltipRef = ref(null);
const resetTooltipRef = ref(null);

const showControl = () => {
  isVisible.value = true;
  if (hideTimeout) clearTimeout(hideTimeout);
};

const startHideTimer = () => {
  if (hideTimeout) clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => {
    isVisible.value = false;
  }, 200);
};

const handleMouseMove = () => {
  showControl();
  if (mouseMoveTimeout) clearTimeout(mouseMoveTimeout);
  mouseMoveTimeout = setTimeout(() => {
    if (!isVisible.value) return;
    startHideTimer();
  }, 200);
};

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove);
});

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove);
  if (hideTimeout) clearTimeout(hideTimeout);
  if (mouseMoveTimeout) clearTimeout(mouseMoveTimeout);
});

const handleZoomClick = (delta) => {
  updateZoom(delta);
  // 隱藏相應的 tooltip
  if (delta < 0) {
    reduceTooltipRef.value?.hide();
  } else {
    enlargeTooltipRef.value?.hide();
  }
};

const handleResetClick = () => {
  resetZoom();
  resetTooltipRef.value?.hide();
};

const updateZoom = (delta) => {
  const newZoom = Math.min(Math.max(zoom.value + delta, minZoom), maxZoom);
  zoom.value = newZoom;
  emit('update:modelValue', newZoom);
  showControl();
};

const resetZoom = () => {
  zoom.value = 100;
  emit('update:modelValue', 100);
  showControl();
};

watch(() => props.modelValue, (newVal) => {
  zoom.value = newVal;
});
</script>

<style scoped>
.zoom-control {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--el-bg-color);
  padding: 6px;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  z-index: 100;
  pointer-events: auto;
}

.zoom-control.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.zoom-text {
  font-size: 12px;
  color: var(--el-text-color-regular);
  min-width: 46px;
  text-align: center;
  user-select: none;
}

:deep(.el-button) {
  padding: 6px !important;
}

:deep(.el-button .el-icon) {
  font-size: 14px;
}
</style> 