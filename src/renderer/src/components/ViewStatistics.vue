<template>
  <div style="width: 500px"><canvas id="barChart"></canvas></div>
  <div style="display: flex; gap: 10px; align-items: center; width: 100%">
    <span @click="goBack()" class="day-button" v-html="svgs.chevronLeft"></span>
    <span class="w-[100px] text-center">{{ formatDateFromTimestamp(currentDay) }}</span>
    <span @click="goForward()" class="day-button" v-html="svgs.chevronRight"></span>
  </div>
</template>

<script setup>
import { svgs } from './svg'

import Chart from 'chart.js/auto'
import { ref, computed, onMounted } from 'vue'
import { data } from './testData.js'
import { getStatistics } from './api'
import { getChartData, getDayIntervals, getStartOfToday } from './chartData.js'

const emits = defineEmits(['buttonClicked'])
const props = defineProps({
  height: String
})

const currentDay = ref()
let barChart
let dayIntervals
const millisecondsPerDay = 86400000

onMounted(() => {
  currentDay.value = getStartOfToday()
  updateChart()
})

const goForward = () => {
  if (dayIntervals?.find((i) => i.day === currentDay.value + millisecondsPerDay)) {
    currentDay.value += millisecondsPerDay
    updateChart()
  }
}

const goBack = () => {
  if (dayIntervals?.find((i) => i.day === currentDay.value - millisecondsPerDay)) {
    currentDay.value -= millisecondsPerDay
    updateChart()
  }
}

const updateChart = async () => {
  const userInfo = await window.electronAPI.getUserInfo()
  const responseData = await getStatistics('83898cf2-188b-493f-b6f0-4b15725be10d')

  dayIntervals = getDayIntervals(responseData)

  const chartData = getChartData(dayIntervals.find((i) => i.day === currentDay.value).data)

  if (barChart?.destroy) {
    barChart.destroy()
  }
  barChart = new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: chartData.map((row) => row.time),
      datasets: [
        /*  {
          label: 'Desk Up minutes',
          data: chartData.map((row) => row.deskUpCounter)
        }, */
        /*         {
          label: 'Presence minutes',
          data: chartData.map((row) => row.presentCounter)
        } */
        {
          label: 'Standing minutes',
          data: chartData.map((row) => row.standingCounter)
        }
      ]
    }
  })
}

function formatDateFromTimestamp(timestamp) {
  if (timestamp === getStartOfToday()) {
    return 'Today'
  }
  // Convert the Unix timestamp to a JavaScript `Date` object
  const date = new Date(timestamp)

  // Array of weekday names
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Extract the weekday name
  const weekday = weekdays[date.getDay()]

  // Extract the day of the month
  const day = date.getDate()

  // Extract the month (months are zero-indexed, so add 1)
  const month = date.getMonth() + 1

  // Format the day and month to two digits
  const formattedDay = String(day).padStart(2, '0')
  const formattedMonth = String(month).padStart(2, '0')

  // Return the formatted string
  return `${weekday} ${formattedDay}.${formattedMonth}`
}
</script>

<style>
.day-button {
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
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
