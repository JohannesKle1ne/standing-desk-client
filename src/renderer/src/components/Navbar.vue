<template>
  <span class="flex">
    <!--    <img @click="emits('showDesk')" src="@renderer/assets/icon.ico" alt="Desk Icon" class="icon" /> 
 -->
    <button
      class="navbar-button"
      :style="{
        color: !isDesk ? 'white' : '#2f3241',
        'background-color': !isDesk ? '#2f3241' : 'white'
      }"
      @click="handleDeskClick"
    >
      Desk
    </button>
    <button
      class="navbar-button"
      :style="{
        color: !isStatistics ? 'white' : '#2f3241',
        'background-color': !isStatistics ? '#2f3241' : 'white'
      }"
      @click="handleStatsClick"
    >
      Statistics
    </button>
    <button
      class="navbar-button"
      :style="{
        color: !isSettings ? 'white' : '#2f3241',
        'background-color': !isSettings ? '#2f3241' : 'white'
      }"
      @click="handleSettingsClick"
    >
      Settings
    </button>
    <button
      class="navbar-button"
      :style="{
        color: !isUser ? 'white' : '#2f3241',
        'background-color': !isUser ? '#2f3241' : 'white'
      }"
      @click="handleUserClick"
    >
      User
    </button></span
  >
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { addLog } from './api.js'
import { PAGE } from './definitions.js'

const emits = defineEmits(['showDesk', 'showStatistics', 'showSettings', 'showUser'])
const props = defineProps({
  currentPage: Number,
  userId: String
})

const isDesk = computed(() => {
  return props.currentPage === PAGE.DESK_CONTROLS
})
const isStatistics = computed(() => {
  return props.currentPage === PAGE.STATISTICS
})
const isSettings = computed(() => {
  return props.currentPage === PAGE.SETTINGS
})
const isUser = computed(() => {
  return props.currentPage === PAGE.USER
})

const handleDeskClick = () => {
  emits('showDesk')
  addLog(props.userId, 'showDesk')
}
const handleStatsClick = () => {
  emits('showStatistics')
  addLog(props.userId, 'showStatistics')
}
const handleSettingsClick = () => {
  emits('showSettings')
  addLog(props.userId, 'showSettings')
}
const handleUserClick = () => {
  emits('showUser')
  addLog(props.userId, 'showUser')
}
</script>

<style>
.navbar-button {
  display: inline-block;
  padding: 6px 10px; /* Adjust the padding as needed */
  border: none;
  /*   border-radius: 20px; /* Adjust the border-radius for rounded corners */
  /* Set your desired text color */
  color: #2f3241;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  background-color: white;
}

.icon {
  color: #2f3241;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  background-color: white;
  margin-left: 5px;
  margin-right: 10px;
  width: 30px;
  height: 30px;
}
</style>
