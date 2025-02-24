<template>
  <div class="sticky-note" :style="{ backgroundColor: currentNote?.color }">
    <TitleBar 
      :title="currentNote?.title || t('note.untitled')"
      :is-visible="isVisible"
      @toggle-note-list="showNoteList = !showNoteList" 
    />
    <div class="content-wrapper">
      <NoteList 
        v-if="showNoteList"
        :notes="noteStore.sortedNotes.value"
        @select="loadNote"
        @create="createNewNote"
        @update="updateNote"
        @delete="deleteNote"
        @reorder="noteStore.reorderNotes"
      />
      <div class="textarea-wrapper">
        <textarea
          ref="textareaRef"
          v-model="noteContent"
          :placeholder="t('note.placeholder')"
          @input="autoSave"
          @contextmenu="showNoteContextMenu"
          @wheel.ctrl.prevent="handleZoom"
          :style="{ fontSize: `${14 * zoom / 100}px` }"
          spellcheck="false"
        ></textarea>
        <ZoomControl v-model="zoom" />
      </div>
    </div>
    <NoteContextMenu
      ref="noteContextMenuRef"
      @action="handleNoteContextMenuAction"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { nanoid } from 'nanoid';
import TitleBar from './TitleBar.vue';
import NoteList from './NoteList.vue';
import noteStore from '../store/noteStore';
import NoteContextMenu from './NoteContextMenu.vue';
import { useNotification } from '../store/notificationStore';
import { ElMessage } from 'element-plus';
import ZoomControl from './ZoomControl.vue';

const { t } = useI18n();
const noteContent = ref('');
const noteColor = ref('#fff7b1');
const showNoteList = ref(false);
const isVisible = ref(true);
const currentNoteId = ref(null);

const noteContextMenuRef = ref(null);

// 添加 textarea ref
const textareaRef = ref(null);

// 添加縮放相關的狀態
const zoom = ref(100);

// 當前筆記
const currentNote = computed(() => {
  return noteStore.notes.value.find(note => note.id === currentNoteId.value);
});

// 自動保存
const autoSave = () => {
  if (!currentNoteId.value) {
    // 只在創建新筆記時設置標題
    const newNote = noteStore.createNote({
      title: noteContent.value.split('\n')[0] || t('note.untitled'),
      content: noteContent.value
    });
    currentNoteId.value = newNote.id;
  } else {
    // 已存在的筆記只更新內容
    noteStore.updateNote(currentNoteId.value, {
      content: noteContent.value
    });
  }
};

// 更新筆記
const updateNote = (updatedNote) => {
  const index = noteStore.notes.value.findIndex(note => note.id === updatedNote.id);
  if (index > -1) {
    noteStore.updateNote(updatedNote.id, updatedNote);
    
    // 強制更新列表
    nextTick(() => {
      noteStore.notes.value = [...noteStore.notes.value];
    });
  }
};

// 刪除筆記
const deleteNote = (noteId) => {
  noteStore.deleteNote(noteId);
  if (currentNoteId.value === noteId) {
    currentNoteId.value = null;
    noteContent.value = '';
  }
};

// 重新排序筆記
const reorderNotes = (newOrder) => {
  console.log('Current notes:', noteStore.notes.value.map(n => n.title));
  console.log('New order:', newOrder.map(n => n.title));
  
  // 確保保留所有原有屬性
  const updatedNotes = newOrder.map(note => {
    const originalNote = noteStore.notes.value.find(n => n.id === note.id);
    return {
      ...originalNote,
      ...note,
      order: noteStore.notes.value.indexOf(note) // 保持原有順序屬性
    };
  });
  
  // 更新列表
  noteStore.reorderNotes(updatedNotes);
  
  // 強制更新視圖
  nextTick(() => {
    // 創建新的數組引用以觸發響應式更新
    noteStore.notes.value = [...noteStore.notes.value];
  });
};

// 加載筆記
const loadNote = (noteId) => {
  const note = noteStore.notes.value.find(n => n.id === noteId);
  if (note) {
    currentNoteId.value = note.id;
    noteContent.value = note.content;
    // 記錄最後打開的筆記
    noteStore.setLastOpenedNote(note.id);
  }
};

// 創建新筆記
const createNewNote = () => {
  const noteCount = noteStore.notes.value.length + 1;
  const newNote = noteStore.createNote({
    title: `${t('note.untitled')} - ${noteCount}`,
    content: '',
    color: noteColor
  });
  
  currentNoteId.value = newNote.id;
  noteContent.value = '';
  noteStore.setLastOpenedNote(newNote.id);
  notification.success('notification.note.created');
};

// 監聽窗口可見性變化
watch(() => isVisible.value, (newValue) => {
  if (newValue) {
    // 窗口顯示時自動保存
    autoSave();
  }
});

const showNoteContextMenu = (event) => {
  noteContextMenuRef.value.show(event);
};

const handleNoteContextMenuAction = async (action) => {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;

  switch (action) {
    case 'copy':
      if (end > start) {
        const selectedText = value.substring(start, end);
        await navigator.clipboard.writeText(selectedText);
        notification.success('notification.note.copied');
      }
      break;
    case 'cut':
      if (end > start) {
        const selectedText = value.substring(start, end);
        await navigator.clipboard.writeText(selectedText);
        noteContent.value = value.slice(0, start) + value.slice(end);
        nextTick(() => {
          textarea.setSelectionRange(start, start);
        });
        autoSave();
        notification.success('notification.note.cut');
      }
      break;
    case 'paste':
      try {
        const clipText = await navigator.clipboard.readText();
        const beforeCursor = value.slice(0, start);
        const afterCursor = value.slice(end);
        const newCursorPos = start + clipText.length;
        
        noteContent.value = beforeCursor + clipText + afterCursor;
        
        nextTick(() => {
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          textarea.focus();
        });
        autoSave();
        notification.success('notification.note.pasted');
      } catch (error) {
        console.error('Paste error:', error);
        ElMessage.error(t('error.paste'));
      }
      break;
  }
};

// 處理滾輪縮放
const handleZoom = (event) => {
  const delta = event.deltaY > 0 ? -10 : 10;
  const newZoom = Math.min(Math.max(zoom.value + delta, 50), 200);
  zoom.value = newZoom;
};

// 初始化
onMounted(() => {
  // 從本地存儲加載筆記
  noteStore.loadFromStorage();

  // 加載最後打開的筆記
  const lastNote = noteStore.getLastOpenedNote();
  if (lastNote) {
    currentNoteId.value = lastNote.id;
    noteContent.value = lastNote.content;
  }

  // 監聽窗口可見性變化
  document.addEventListener('visibilitychange', () => {
    isVisible.value = !document.hidden;
  });
});
</script>

<style scoped>
.sticky-note {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.content-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.textarea-wrapper {
  flex: 1;
  display: flex;
  position: relative;
}

textarea {
  flex: 1;
  border: none;
  resize: none;
  padding: 16px;
  background: transparent;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  transition: font-size 0.3s ease;
}

textarea:focus {
  outline: none;
}
</style> 