<template>
  <div style="display: flex; flex-direction: column; gap: 10px; margin: 10px">
    <h3>Table Controls</h3>
    <div style="display: flex; gap: 10px; align-items: center; width: 100%">
      <span v-for="b in buttons">
        <span v-if="b.svg" @click="b.onClick" class="control-button" v-html="b.svg"></span>
        <span v-else @click="b.onClick" class="control-button" style="font-size: 18px">{{
          b.title
        }}</span></span
      >
    </div>
    <h3>Height</h3>
    <div style="color: white; font-size: 50px; line-height: 1">{{ formattedHeight }}</div>
    <div style="width: 800px; height: 600px"><canvas id="lineChart"></canvas></div>
  </div>
</template>

<script setup>
import { svgs } from './svg'
import { ref, computed, watch } from 'vue'
import Chart from 'chart.js/auto'

let lineChart = null

const emits = defineEmits(['buttonClicked'])
const props = defineProps({
  height: String,
  deskUpdates: Array
})

const cutData = (arr, defaultValue) => {
  const newArray = arr.slice(-60) // Slice the last 10 entries
  const paddingLength = Math.max(0, 60 - arr.length) // Calculate how many "0"s to pad

  // Fill the beginning of the new array with "0"s if needed
  if (paddingLength > 0) {
    const paddingArray = Array(paddingLength).fill(defaultValue)
    newArray.unshift(...paddingArray)
  }
  return newArray
}

watch(
  () => props.deskUpdates,
  (newValue) => {
    if (lineChart == null) {
      lineChart = new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Presence detected',
              data: [],
              fill: false,
              borderColor: '#FFB5C2',
              tension: 0.1
            },
            {
              label: 'Desk position',
              data: [],
              fill: false,
              borderColor: '#8e6e53',
              tension: 0.1
            }
          ]
        },
        options: {
          animation: {
            duration: 0
          },
          scales: {
            y: {
              min: -0.2, // Set minimum value of y-axis
              max: 1.2 // Set maximum value of y-axis
            }
          }
        }
      })
    }
    lineChart.data.labels = cutData(
      newValue.map((row) => {
        const date = new Date(row.timestamp)
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        const seconds = date.getSeconds().toString().padStart(2, '0')

        // Format the time
        return `${hours}:${minutes}:${seconds}`
      }),
      '00:00:00'
    )
    const presenceDataSet = lineChart.data.datasets.find((ds) => ds.label === 'Presence detected')
    presenceDataSet.data = cutData(
      newValue.map((row) => (row.present ? 1 : 0)),
      0
    )
    const deskDataSet = lineChart.data.datasets.find((ds) => ds.label === 'Desk position')
    deskDataSet.data = cutData(
      newValue.map((row) => (row.deskUp ? 1 : 0)),
      0
    )

    lineChart.update()
  },
  { deep: true }
)

const formattedHeight = computed(() => {
  if (!props.height) return ''
  let formattedHeight = props.height / 10
  if (formattedHeight === Math.floor(formattedHeight)) {
    formattedHeight = formattedHeight.toString() + '.0'
  }
  return formattedHeight
})

const buttons = ref([
  { svg: svgs.chevronUp, onClick: () => emits('buttonClicked', 'up') },
  { svg: svgs.chevronDown, onClick: () => emits('buttonClicked', 'down') },
  { title: '1', onClick: () => emits('buttonClicked', 'preset1') },
  { title: '2', onClick: () => emits('buttonClicked', 'preset2') },
  { title: '3', onClick: () => emits('buttonClicked', 'preset3') },
  { title: '4', onClick: () => emits('buttonClicked', 'preset4') }
])
</script>

<style>
.control-button {
  display: inline-block;
  border: none;
  border-radius: 2px; /* Adjust the border-radius for rounded corners */
  /* Set your desired text color */
  color: #2f3241;
  font-weight: bold;
  font-size: 12px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.1s ease;
  background-color: white;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.control-button svg {
  width: 30px;
  height: 30px;
}
</style>
