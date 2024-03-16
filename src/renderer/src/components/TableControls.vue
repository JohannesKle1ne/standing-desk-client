<template>
  <div>
    <h1>Table Controls</h1>
    <div style="display: flex; justify-content: space-between; align-items: center; width: 80%">
      <button v-for="b in buttons" @click="b.onClick" class="rounded-button">{{ b.title }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emits = defineEmits(['buttonClicked'])

const buttons = ref([
  { title: 'Preset 1', onClick: () => emits('buttonClicked', 'preset1') },
  { title: 'Preset 2', onClick: () => emits('buttonClicked', 'preset2') },
  { title: 'Preset 3', onClick: () => emits('buttonClicked', 'preset3') },
  { title: 'Preset 4', onClick: () => emits('buttonClicked', 'preset4') },
  { title: 'Up', onClick: () => emits('buttonClicked', 'up') },
  { title: 'Down', onClick: () => emits('buttonClicked', 'down') }
])
</script>
