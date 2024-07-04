<template>
  <span>
    <button
      class="rounded-button mr-2"
      :style="chartMode !== 'day' && { opacity: 0.8 }"
      @click="showDay"
    >
      Day
    </button>
    <button
      class="rounded-button"
      :style="chartMode !== 'week' && { opacity: 0.8 }"
      @click="showWeek"
    >
      Week
    </button></span
  >

  <div style="width: 600px"><canvas id="barChart"></canvas></div>
  <div style="display: flex; gap: 10px; align-items: center; width: 100%">
    <span @click="goBack()" class="day-button" v-html="svgs.chevronLeft"></span>
    <span class="w-[100px] text-center">{{ formatDateFromTimestamp(currentDisplayTime) }}</span>
    <span @click="goForward()" class="day-button" v-html="svgs.chevronRight"></span>
    <!--   <button @click="updateChart" class="ml-8 text-white">Refresh</button> -->
  </div>
</template>

<script setup>
import { svgs } from './svg'

import Chart from 'chart.js/auto'
import { ref, computed, onMounted } from 'vue'
import { data } from './testData.js'
import { testPiConnectData } from './testPiConnects'
import { getStates, getPiConnects } from './api'
import {
  getChartDataForDay,
  getChartDataForWeek,
  getDayIntervals,
  getWeekIntervals,
  getStartOfToday,
  getStartOfWeek
} from './chartData.js'

const emits = defineEmits(['buttonClicked'])
const props = defineProps({
  height: String
})

const currentDisplayTime = ref()
let barChart
let dayIntervals
let weekIntervals
const millisecondsPerDay = 86400000
const millisecondsPerWeek = 604800000 // 7 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds

const chartMode = ref()

onMounted(() => {
  showWeek()
})

const showWeek = () => {
  chartMode.value = 'week'
  currentDisplayTime.value = getStartOfWeek()
  updateChart()
}

const showDay = () => {
  chartMode.value = 'day'
  currentDisplayTime.value = getStartOfToday()
  updateChart()
}

const go = (operation) => {
  if (chartMode.value === 'day') {
    if (
      dayIntervals?.find((i) => i.day === operation(currentDisplayTime.value, millisecondsPerDay))
    ) {
      currentDisplayTime.value = operation(currentDisplayTime.value, millisecondsPerDay)
      updateChart()
    }
  } else {
    console.log(weekIntervals)
    console.log(operation(currentDisplayTime.value, millisecondsPerWeek))
    if (
      weekIntervals?.find(
        (i) => i.week === operation(currentDisplayTime.value, millisecondsPerWeek)
      )
    ) {
      currentDisplayTime.value = operation(currentDisplayTime.value, millisecondsPerWeek)
      updateChart()
    }
  }
}

const goForward = () => {
  go((a, b) => a + b)
}

const goBack = () => {
  go((a, b) => a - b)
}

const updateChart = async () => {
  const userInfo = await window.electronAPI.getUserInfo()
  const piConnects = await getPiConnects(userInfo.id)
  const states = await getStates(userInfo.id)
  console.log(piConnects)
  console.log(states)
  let responseData = states
  const testPiConnects = piConnects.filter((c) => c.connected === false)
  console.log(responseData)
  responseData = responseData.reduce((acc, r, index) => {
    let piConnects = testPiConnects.filter((c) => c.timestamp > r.timestamp)
    const next = responseData[index + 1]
    if (next != null) {
      piConnects = piConnects.filter((c) => c.timestamp < next.timestamp)
    }
    return [
      ...acc,
      r,
      ...piConnects.map((c) => ({
        presenceDetected: false,
        deskHeight: r.deskHeight,
        timestamp: c.timestamp
      }))
    ]
  }, [])
  responseData.push({
    presenceDetected: false,
    deskHeight: responseData.at(-1),
    timestamp: Date.now()
  })
  console.log(responseData)

  let chartData
  if (chartMode.value === 'day') {
    dayIntervals = getDayIntervals(responseData)
    chartData = getChartDataForDay(
      dayIntervals.find((i) => i.day === currentDisplayTime.value).data,
      currentDisplayTime.value
    )
  }
  if (chartMode.value === 'week') {
    weekIntervals = getWeekIntervals(responseData)
    console.log('weekIntervals: ', weekIntervals)
    console.log(currentDisplayTime.value)
    chartData = getChartDataForWeek(
      weekIntervals.find((i) => i.week === currentDisplayTime.value).data,
      currentDisplayTime.value
    )
  }

  if (barChart?.destroy) {
    barChart.destroy()
  }

  barChart = new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: chartData.map((row) => row.time),
      datasets: [
        /*    {
          label: 'Desk Up minutes',
          data: chartData.map((row) => row.deskUpCounter)
        }, */
        {
          label: 'Total work minutes',
          data: chartData.map((row) => row.presentCounter)
        },
        {
          label: 'Standing minutes',
          data: chartData.map((row) => row.standingCounter)
        },
        {
          label: 'Sitting minutes',
          data: chartData.map((row) => row.sittingCounter)
        }
      ]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || ''
              const value = context.parsed.y || ''
              return ` ${label}: ${value} (${(value / 60).toFixed(1)} hours)`
            }
          }
        }
      },
      barPercentage: 0.9, // Adjust this value to set the width of the bars
      categoryPercentage: 0.6 // Adjust this value to increase the space between groups
      /* scales: {
        x: {
          ticks: {
            padding: 20 // Adjust this value to add space between the bars and the x-axis labels
          }
        },
        y: {
          ticks: {
            padding: 20 // Adjust this value to add space between the bars and the y-axis labels
          }
        }
      } */
    }
  })
}
function formatDateFromTimestamp(timestamp) {
  if (chartMode.value === 'day') {
    return formatDateFromTimestampDay(timestamp)
  }
  if (chartMode.value === 'week') {
    return formatDateFromTimestampWeek(timestamp)
  }
}

function formatDateFromTimestampWeek(timestamp) {
  /*   if (timestamp === getStartOfWeek()) {
    return 'This Week'
  } */

  return `${formatTimestamp(timestamp)} - ${formatTimestamp(timestamp + millisecondsPerWeek - millisecondsPerDay)}`
}

function formatTimestamp(timestamp) {
  // Convert the Unix timestamp to a JavaScript `Date` object
  const dateStart = new Date(timestamp)

  // Extract the day of the month
  const dayStart = dateStart.getDate()

  // Extract the month (months are zero-indexed, so add 1)
  const monthStart = dateStart.getMonth() + 1

  // Format the day and month to two digits
  const formattedDayStart = String(dayStart).padStart(2, '0')
  const formattedMonth = String(monthStart).padStart(2, '0')

  // Return the formatted string
  return `${formattedDayStart}.${formattedMonth}`
}

function formatDateFromTimestampDay(timestamp) {
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
