<template>
  <span>
    <button
      class="rounded-button mr-2"
      :style="{ opacity: isDesk ? 1 : 0.8 }"
      @click="emits('showDesk')"
    >
      Desk
    </button>
    <button
      class="rounded-button mr-2"
      :style="{ opacity: isStatistics ? 1 : 0.8 }"
      @click="emits('showStatistics')"
    >
      Statistics
    </button>
    <button
      class="rounded-button"
      :style="{ opacity: isSettings ? 1 : 0.8 }"
      @click="emits('showSettings')"
    >
      Settings
    </button></span
  >
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import { PAGE } from './definitions.js'

const emits = defineEmits(['showDesk', 'showStatistics', 'showSettings'])
const props = defineProps({
  currentPage: Number
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
</script>

<style></style>
