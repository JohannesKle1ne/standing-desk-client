<template>
  <div style="display: flex; flex-direction: column; gap: 10px; margin: 10px">
    <h3>Instructions</h3>
    <div style="color: white; display: flex; flex-direction: column; gap: 4px; font-size: 14px">
      <span v-for="(i, index) in instructions">{{
        (index > 1 ? `${index - 1}.` : '') + ' ' + i
      }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const instructions = ref([
  'I looks like you are not connected to the controller',
  'Do the follwong steps:',
  'Plug the controller to power supply',
  'wait for 2-4 minutes until it is booted',
  'if the controller can connect to your wifi, the desk icon will turn green',
  'if not, connect your computer to the wifi "DeskController"',
  'Enter the password "1234567890"'
])
</script>

<style></style>
