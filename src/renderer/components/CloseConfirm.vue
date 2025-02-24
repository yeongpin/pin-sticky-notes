<template>
  <el-dialog
    :title="t('confirm.close.title')"
    v-model="visible"
    width="300px"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="close-confirm-dialog"
    align-center
  >
    <span>{{ t('confirm.close.message') }}</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleMinimize">
          {{ t('confirm.close.minimize') }}
        </el-button>
        <el-button type="danger" @click="handleExit">
          {{ t('confirm.close.exit') }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Close, Minus } from '@element-plus/icons-vue';

const { t } = useI18n();
const visible = ref(false);

const emit = defineEmits(['minimize', 'exit']);

const handleMinimize = () => {
  visible.value = false;
  emit('minimize');
};

const handleExit = async () => {
  try {
    visible.value = false;
    emit('exit');
  } catch (error) {
    console.error('Error during exit:', error);
  }
};

const show = () => {
  visible.value = true;
};

defineExpose({ show });
</script>

<style>
.close-confirm-dialog {
  border-radius: 8px;
}

:deep(.el-dialog) {
  margin-top: 25vh !important;
}

:deep(.el-dialog__body) {
  text-align: center;
  padding: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 8px;
}
</style> 