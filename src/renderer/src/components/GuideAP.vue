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
  'It looks like you are not connected to the controller',
  'Do the following steps:',
  'Plug the controller into the power supply',
  'Wait for 2-4 minutes until it is booted',
  'If the controller can connect to your WiFi, the desk icon will turn green',
  'If not, connect your computer to the WiFi "DeskController"',
  'Enter the password "1234567890"'
])
</script>

<style></style>
