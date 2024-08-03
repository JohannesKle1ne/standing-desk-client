<template>
  <circle-progress :percent="40" />

  <!--  // Default Gradient
  <circle-progress :is-gradient="true" />

  // Customize Gradient
  <circle-progress
    :is-gradient="true"
    :gradient="{
      angle: 90,
      startColor: '#ff0000',
      stopColor: '#ffff00'
    }"
  />

  // Default Shadow
  <circle-progress :is-bg-shadow="true" />

  // Customize Shadow
  <circle-progress
    :is-bg-shadow="true"
    :bg-shadow="{
      inset: true,
      vertical: 2,
      horizontal: 2,
      blur: 4,
      opacity: 0.4,
      color: '#000000'
    }"
    empty-color="#f7f7f7"
    :border-width="6"
    :border-bg-width="30"
  /> -->
</template>

<script setup>
import { ref, computed, onMounted, defineProps } from 'vue'
import 'vue3-circle-progress/dist/circle-progress.css'
import CircleProgress from 'vue3-circle-progress'
const props = defineProps({
  standingGoal: Number,
  currentMinutes: Number
})

onMounted(() => {
  console.log(props.standingGoal, props.currentMinutes)
})
</script>

<style></style>
