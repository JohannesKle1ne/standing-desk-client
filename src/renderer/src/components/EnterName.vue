<template>
  <div class="flex justify-center items-center w-full">
    <h3>Please enter your full name</h3>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const instructions = ref([
  'I looks like you are not connected to the mqtt broker.',
  'Are you connected to the internet?'
])
</script>

<style></style>
