<template>
  <div class="app-container">
    <StickyNote />
  </div>
</template>

<script setup>
import StickyNote from './components/StickyNote.vue';
</script>

<style>
.app-container {
  height: 100vh;
  background: transparent;
}

/* 滾動條整體部分 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

/* 滾動條軌道 */
::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

/* 滾動條滑塊 */
::-webkit-scrollbar-thumb {
  background: rgba(144, 147, 153, 0.3);
  border-radius: 3px;
  transition: background 0.2s;
}

/* 滾動條滑塊懸停效果 */
::-webkit-scrollbar-thumb:hover {
  background: rgba(144, 147, 153, 0.5);
}

/* 滾動條兩端按鈕 */
::-webkit-scrollbar-button {
  display: none;
}

/* 滾動條角落 */
::-webkit-scrollbar-corner {
  background: transparent;
}
</style> 