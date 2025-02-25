import { ref, computed } from 'vue';
import { nanoid } from 'nanoid';

const notes = ref([]);
const lastOpenedNoteId = ref(null);

// 保存到本地存儲的函數
const saveToStorage = () => {
  localStorage.setItem('notes', JSON.stringify(notes.value));
  if (lastOpenedNoteId.value) {
    localStorage.setItem('lastOpenedNoteId', lastOpenedNoteId.value);
  }
};

// 按星標和時間排序
const sortedNotes = computed(() => {
  // 先將筆記分為星標和非星標兩組
  const starredNotes = notes.value.filter(note => note.starred);
  const unstarredNotes = notes.value.filter(note => !note.starred);

  // 分別對兩組按最後修改時間排序
  const sortByTime = (a, b) => b.lastModified - a.lastModified;
  
  const sortedStarred = starredNotes.sort(sortByTime);
  const sortedUnstarred = unstarredNotes.sort(sortByTime);

  // 合併兩組筆記
  return [...sortedStarred, ...sortedUnstarred];
});

const noteStore = {
  // 狀態
  notes,
  sortedNotes,
  lastOpenedNoteId,
  
  // 方法
  createNote: ({ title, content = '', color = '#fff7b1', path = null, lastModified = null }) => {
    const note = {
      id: nanoid(),
      title,
      content,
      color,
      path,
      createTime: Date.now(),
      lastModified: lastModified?.getTime() || Date.now(),
      starred: false
    };
    
    notes.value = [...notes.value, note];
    saveToStorage();
    return note;
  },

  updateNote(id, updates) {
    const index = notes.value.findIndex(note => note.id === id);
    if (index > -1) {
      const updatedNote = {
        ...notes.value[index],
        ...updates,
        lastModified: Date.now()
      };
      notes.value = [
        ...notes.value.slice(0, index),
        updatedNote,
        ...notes.value.slice(index + 1)
      ];
      saveToStorage();
    }
  },

  deleteNote(id) {
    notes.value = notes.value.filter(note => note.id !== id);
    saveToStorage();
    this.sortedNotes.value = [...this.sortedNotes.value];
  },

  reorderNotes(newOrder) {
    console.log('Before reorder:', {
      notes: notes.value.map(n => ({
        title: n.title,
        starred: n.starred,
        lastModified: n.lastModified
      }))
    });

    // 分別處理星標和非星標筆記
    const starredNotes = newOrder.filter(note => note.starred);
    const unstarredNotes = newOrder.filter(note => !note.starred);

    // 更新每組內的順序
    const updatedNotes = [
      ...starredNotes.map((note, index) => ({
        ...note,
        lastModified: Date.now() - index // 確保順序保持不變
      })),
      ...unstarredNotes.map((note, index) => ({
        ...note,
        lastModified: Date.now() - (starredNotes.length + index) // 確保在非星標組內順序正確
      }))
    ];

    console.log('After reorder:', {
      notes: updatedNotes.map(n => ({
        title: n.title,
        starred: n.starred,
        lastModified: n.lastModified
      }))
    });

    notes.value = updatedNotes;
    saveToStorage();
  },

  // 計算 zOrder
  calculateZOrder(index, isStarred) {
    // 星標筆記的 zOrder 從 10000 開始
    // 非星標筆記的 zOrder 從 0 開始
    // 這樣確保星標筆記總是在上面
    const baseOrder = isStarred ? 10000 : 0;
    return baseOrder + index;
  },

  toggleStar(id) {
    const note = notes.value.find(note => note.id === id);
    if (note) {
      note.starred = !note.starred;
      note.lastModified = Date.now();
      saveToStorage();
    }
  },

  // 記錄最後打開的筆記
  setLastOpenedNote(id) {
    lastOpenedNoteId.value = id;
    localStorage.setItem('lastOpenedNoteId', id);
  },

  // 獲取最後打開的筆記
  getLastOpenedNote() {
    const id = localStorage.getItem('lastOpenedNoteId');
    if (id && notes.value.find(note => note.id === id)) {
      return notes.value.find(note => note.id === id);
    }
    // 如果找不到最後打開的筆記，返回最新的筆記
    return this.sortedNotes.value[0];
  },

  loadFromStorage() {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      notes.value = JSON.parse(savedNotes);
    }
    const savedLastOpenedId = localStorage.getItem('lastOpenedNoteId');
    if (savedLastOpenedId) {
      lastOpenedNoteId.value = savedLastOpenedId;
    }
  }
};

// 初始化時加載數據
noteStore.loadFromStorage();

export default noteStore; 