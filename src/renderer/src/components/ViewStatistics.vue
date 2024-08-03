<template>
  <div class="mt-2 w-full p-2">
    <div>
      <button
        class="statistics-button mr-1"
        :style="{
          opacity: chartMode !== 'day' ? '0.7' : '1',
          'font-weight': chartMode !== 'day' ? '' : 'bold'
        }"
        @click="showDay"
      >
        Day
      </button>
      <button
        class="statistics-button"
        :style="{
          opacity: chartMode !== 'week' ? '0.7' : '1',
          'font-weight': chartMode !== 'week' ? '' : 'bold'
        }"
        @click="showWeek"
      >
        Week
      </button>
    </div>

    <div class="w-[95%]"><canvas id="barChart"></canvas></div>
    <div class="mt-2 flex gap-2.5 items-center justify-center w-full">
      <span @click="goBack()" class="day-button no-select" v-html="svgs.chevronLeft"></span>
      <span class="w-[100px] text-center text-[#2f3241] no-select">{{
        formatDateFromTimestamp(currentDisplayTime)
      }}</span>
      <span @click="goForward()" class="day-button no-select" v-html="svgs.chevronRight"></span>
      <!--  <div class="flex">
        <span @click="goForward()" class="back-to-today-button" v-html="svgs.chevronRight"></span>
        <span @click="goForward()" class="back-to-today-button" v-html="svgs.chevronRight"></span>
      </div> -->
    </div>

    <div class="flex gap-2.5 items-center justify-center w-full">
      <div
        v-if="chartMode === 'day' && currentDisplayTime !== getStartOfToday()"
        @click="goBackToToday"
        class="bg-opacity-20 rounded-xl py-1 px-2 ml-2 text-[#2f3241] flex items-center cursor-pointer opacity-50 no-select"
      >
        Back to today
        <!--  <span class="back-to-today-button ml-1" v-html="svgs.fastForward"></span> -->
      </div>
      <div
        v-if="chartMode === 'week' && currentDisplayTime !== getStartOfWeek()"
        @click="goBackToThisWeek"
        class="bg-opacity-20 rounded-xl py-1 px-2 ml-2 text-[#2f3241] flex items-center cursor-pointer opacity-50 no-select"
      >
        Back to this week
        <!--  <span class="back-to-today-button ml-1" v-html="svgs.fastForward"></span> -->
      </div>
    </div>
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
  showDay()
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

const goBackToToday = () => {
  const start = getStartOfToday()
  const delta = start - currentDisplayTime.value
  const divided = delta / millisecondsPerDay
  go((a, b) => a + divided * b)
}

const goBackToThisWeek = () => {
  const start = getStartOfWeek()
  const delta = start - currentDisplayTime.value
  const divided = delta / millisecondsPerWeek
  go((a, b) => a + divided * b)
}

const goForward = () => {
  go((a, b) => a + b)
}

const goBack = () => {
  go((a, b) => a - b)
}

const addPiConnectsToData = (data, piConnects) => {
  const testPiConnects = piConnects.filter((c) => c.connected === false)
  console.log(data)
  data = data.reduce((acc, r, index) => {
    let piConnects = testPiConnects.filter((c) => c.timestamp > r.timestamp)
    const next = data[index + 1]
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
  data.push({
    presenceDetected: false,
    deskHeight: data.at(-1),
    timestamp: Date.now()
  })
  return data
}

const updateChart = async () => {
  const userInfo = await window.electronAPI.getUserInfo()
  const piConnects = await getPiConnects(userInfo.id)
  const states = await getStates(userInfo.id)
  console.log(piConnects)
  console.log(states)
  let responseData = addPiConnectsToData(states, piConnects)

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
  if (timestamp === getStartOfWeek()) {
    return 'This week'
  }

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

.back-to-today-button {
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
  width: 15px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.statistics-button {
  display: inline-block;
  padding: 4px 8px; /* Adjust the padding as needed */
  border: none;
  /*   border-radius: 20px; /* Adjust the border-radius for rounded corners */
  /* Set your desired text color */
  color: #2f3241;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  background-color: white;
  transition:
    background-color 0.3s ease,
    transform 0.1s ease;
}

.no-select {
  user-select: none; /* Standard syntax */
  -webkit-user-select: none; /* For Chrome, Safari, and Opera */
  -moz-user-select: none; /* For Firefox */
  -ms-user-select: none; /* For Internet Explorer/Edge */
}
</style>
