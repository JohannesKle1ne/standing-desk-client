<template>
  <circle-progress
    :percent="props.percent"
    :border-width="30"
    :border-bg-width="30"
    :fill-color="'rgba(255, 159, 64, 0.6)'"
    :empty-color="'rgba(47, 50, 65, 0.05)'"
    class="mx-1"
    :size="80"
  />

  <!--   // Default Gradient
  <circle-progress :is-gradient="true" /> -->

  <!--   <circle-progress
    :is-gradient="true"
    :gradient="{
      angle: 90,
      startColor: '#ff0000',
      stopColor: '#ffff00'
    }"
  /> -->

  <!--   <circle-progress :is-bg-shadow="true" />

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
import { getGoalProgress } from './api'

const props = defineProps({
  percent: Number
})

onMounted(async () => {
  console.log('mounted', props.percent)
})
</script>

<style></style>
