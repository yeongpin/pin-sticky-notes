<template>
  <div class="note-list">
    <div class="note-list-header">
      <h3>{{ t('noteList.title') }}</h3>
      <el-button type="primary" size="small" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        {{ t('noteList.new') }}
      </el-button>
    </div>
    <div class="notes">
      <draggable 
        v-model="dragList"
        :group="{ name: 'notes' }"
        item-key="id"
        handle=".drag-handle"
        @end="handleDragEnd"
      >
        <template #item="{ element: note, index }">
          <div 
            class="note-item" 
            :data-note-id="note.id"
            :style="{ backgroundColor: note.color }"
            @click="$emit('select', note.id)"
            @contextmenu.stop="showContextMenu($event, note, index)"
          >
            <div class="note-item-header">
              <el-icon class="drag-handle" @mousedown.stop><DArrowRight /></el-icon>
              <div class="note-title">
                <div v-if="editingId !== note.id">{{ note.title }}</div>
                <el-input
                  v-else
                  v-model="editingTitle"
                  size="small"
                  @blur="handleTitleSave(note)"
                  @keyup.enter="handleTitleSave(note)"
                  v-focus
                  @click.stop
                  @mousedown.stop
                />
              </div>
              <div class="note-actions" @click.stop>
                <el-icon @click.stop="startEditing(note)">
                  <Edit />
                </el-icon>
                <el-popconfirm
                  :title="t('noteList.deleteConfirm')"
                  @confirm="handleDelete(note.id)"
                  width="250px"
                >
                  <template #reference>
                    <el-icon class="delete-icon">
                      <Delete />
                    </el-icon>
                  </template>
                </el-popconfirm>
              </div>
              <el-icon 
                :class="['star-icon', { 'is-starred': note.starred }]"
                @click.stop="toggleStar(note)"
              >
                <Star />
              </el-icon>
            </div>
            <div class="note-date">
              {{ formatDate(note.lastModified) }}
            </div>
          </div>
        </template>
      </draggable>
    </div>
    <NoteListContextMenu
      ref="contextMenuRef"
      :note="selectedNote"
      :index="selectedIndex"
      :total="dragList.length"
      @action="handleContextMenuAction"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { Plus, Star, Edit, Delete, DArrowRight } from '@element-plus/icons-vue';
import draggable from 'vuedraggable';
import NoteListContextMenu from './NoteListContextMenu.vue';
import noteStore from '../store/noteStore';
import { useNotification } from '../store/notificationStore';

const { t } = useI18n();
const props = defineProps({
  notes: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['select', 'create', 'update', 'delete', 'reorder']);

const editingId = ref(null);
const editingTitle = ref('');

// 用於拖拽的本地數組
const dragList = ref([]);

// 監聽筆記列表的變化
watch(() => noteStore.sortedNotes.value, (newNotes) => {
  dragList.value = [...newNotes];
}, { immediate: true, deep: true });

// 處理拖拽結束
const handleDragEnd = (evt) => {
  if (!evt.moved) return;
  noteStore.reorderNotes(dragList.value);
};

const startEditing = (note) => {
  editingId.value = note.id;
  editingTitle.value = note.title;
};

const handleTitleSave = (note) => {
  if (editingTitle.value.trim() && editingTitle.value !== note.title) {
    noteStore.updateNote(note.id, {
      title: editingTitle.value.trim()
    });
  }
  editingId.value = null;
};

const toggleStar = (note) => {
  noteStore.toggleStar(note.id);
  notification.success(note.starred ? 'notification.note.starred' : 'notification.note.unstarred');
};

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

// 自動聚焦指令
const vFocus = {
  mounted: (el) => el.querySelector('input').focus()
};

// 右鍵選單相關
const contextMenuRef = ref(null);
const selectedNote = ref(null);
const selectedIndex = ref(-1);

const notification = useNotification();

const showContextMenu = (event, note, index) => {
  selectedNote.value = note;
  selectedIndex.value = index;
  contextMenuRef.value.show(event);
};

const handleContextMenuAction = ({ action, value, note }) => {
  switch (action) {
    case 'moveUp':
      if (selectedIndex.value > 0) {
        const newList = [...dragList.value];
        const prevNote = newList[selectedIndex.value - 1];
        
        // 檢查星標狀態
        if (prevNote.starred !== note.starred) {
          return; // 不允許跨越星標邊界
        }
        
        [newList[selectedIndex.value - 1], newList[selectedIndex.value]] = 
        [newList[selectedIndex.value], newList[selectedIndex.value - 1]];
        
        noteStore.reorderNotes(newList);
      }
      break;
      
    case 'moveDown':
      if (selectedIndex.value < dragList.value.length - 1) {
        const newList = [...dragList.value];
        const nextNote = newList[selectedIndex.value + 1];
        
        if (nextNote.starred !== note.starred) {
          return;
        }
        
        [newList[selectedIndex.value], newList[selectedIndex.value + 1]] = 
        [newList[selectedIndex.value + 1], newList[selectedIndex.value]];
        
        noteStore.reorderNotes(newList);
      }
      break;
      
    case 'star':
      noteStore.toggleStar(note.id);
      notification.success(note.starred ? 'notification.note.starred' : 'notification.note.unstarred');
      break;
      
    case 'rename':
      startEditing(note);
      break;
      
    case 'color':
      noteStore.updateNote(note.id, { color: value });
      notification.success('notification.note.colorChanged');
      break;
      
    case 'delete':
      noteStore.deleteNote(note.id);
      notification.success('notification.note.deleted');
      break;
  }
};

// 處理創建新筆記
const handleCreate = () => {
  emit('create');
  // 強制更新列表
  nextTick(() => {
    dragList.value = [...noteStore.sortedNotes.value];
  });
};

// 處理刪除筆記
const handleDelete = (noteId) => {
  noteStore.deleteNote(noteId);
  // 強制更新列表
  nextTick(() => {
    dragList.value = [...noteStore.sortedNotes.value];
  });
  notification.success('notification.note.deleted');
};
</script>

<style scoped>
.note-list {
  width: 250px;
  border-right: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
  user-select: none;
  transition: transform 0.3s ease;
  transform: translateX(0);
}

/* 當列表隱藏時的樣式 */
.note-list[v-show="false"] {
  transform: translateX(-100%);
}

.note-list-header {
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.note-list-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.notes {
  flex: 1;
  overflow-y: auto;
  padding: 12px; /* 增加整體內邊距 */
}

.note-item {
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: transparent;
  margin-bottom: 3px;
  position: relative;
  user-select: none;
}

/* 最後一個筆記不需要底部間距 */
.note-item:last-child {
  margin-bottom: 0;
}

.note-item:hover {
  filter: brightness(0.95);
}

.note-item:active {
  transform: scale(0.98);
}

.note-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

/* 需要響應點擊的元素重新啟用事件 */
.drag-handle,
.note-actions,
.star-icon,
.el-input {
  pointer-events: auto;
}

.note-actions {
  display: flex;
  gap: 8px; /* 增加間距 */
  opacity: 0; /* 默認隱藏 */
  transition: opacity 0.2s;
  position: relative;
  z-index: 1;
  pointer-events: auto;
}

/* hover 時顯示操作按鈕 */
.note-item:hover .note-actions {
  opacity: 1;
}

/* 操作按鈕的圖標樣式 */
.note-actions .el-icon {
  font-size: 16px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

/* 操作按鈕 hover 效果 */
.note-actions .el-icon:hover {
  color: var(--el-color-primary);
  transform: scale(1.1);
}

/* 刪除按鈕特殊樣式 */
.note-actions .el-icon.delete-icon:hover {
  color: var(--el-color-danger);
}

.note-title {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

/* 添加標題文字溢出處理 */
.note-title > div {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 編輯框樣式保持不變 */
.note-title :deep(input) {
  user-select: text;
  cursor: text;
}

.star-icon {
  cursor: pointer;
  color: var(--el-text-color-secondary);
  opacity: 0.5; /* 未星標時的透明度 */
  transition: all 0.2s;
}

.star-icon.is-starred {
  color: var(--el-color-warning) !important;
  opacity: 1 !important; /* 已星標時始終完全顯示 */
}

.note-item:hover .star-icon {
  opacity: 1;
}

.note-date {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.el-input__wrapper) {
  padding: 0 8px;
}

/* 添加拖拽時的樣式 */
.sortable-ghost {
  opacity: 0.5;
  background: var(--el-color-primary-light-9);
  margin-bottom: 8px;
}

.sortable-drag {
  opacity: 0.8;
  background: var(--el-color-primary-light-8);
  margin-bottom: 8px;
}
</style> 