<template>
  <div class="mt-2 w-full p-4 h-[95vh] overflow-auto custom-scrollbar">
    <div class="items-center inline-flex">
      <button
        class="statistics-button mr-1"
        :style="{
          opacity: chartMode !== 'day' ? '0.7' : '1',
          'font-weight': chartMode !== 'day' ? '' : 'bold',
          'border-width': chartMode !== 'day' ? '0px' : '1px'
        }"
        @click="showDay"
      >
        Day
      </button>
      <button
        class="statistics-button"
        :style="{
          opacity: chartMode !== 'week' ? '0.7' : '1',
          'font-weight': chartMode !== 'week' ? '' : 'bold',
          'border-width': chartMode !== 'week' ? '0px' : '1px'
        }"
        @click="showWeek"
      >
        Week
      </button>
      <div class="ml-2 flex gap-2.5 items-center justify-center w-full">
        <span @click="goBack()" class="day-button no-select" v-html="svgs.chevronLeft"></span>
        <span class="w-[100px] text-center text-[#2f3241] text-[16px] no-select font-bold">{{
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

    <div
      :class="[
        `rounded-lg p-4 bg-white mt-2`,
        chartMode === 'week' ? 'w-[95%]' : 'w-[350px]',
        chartMode === 'week' ? 'flex flex-col' : '',
        chartMode === 'week' ? '' : 'justify-between'
      ]"
      style="box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15)"
    >
      <div class="flex justify-between">
        <div class="text-[#2f3241]">
          <div
            v-if="chartMode !== 'week'"
            :class="[`flex items-end`, chartMode === 'week' ? 'flex-col' : '']"
          >
            <div>Daily goal</div>
            <div class="text-4xl ml-2">{{ goalResponse?.goalOfDay }}</div>
          </div>
          <div v-else>Goals</div>
          <div class="flex items-end">
            <div v-if="chartMode === 'day'" class="mt-4">Standing minutes</div>
            <div
              v-if="chartMode === 'day'"
              :style="{ color: 'rgba(255, 159, 64, 0.6)' }"
              class="text-4xl ml-2"
            >
              {{ goalResponse?.standingMinutesOfDay }}
            </div>
          </div>
        </div>

        <circle-progress
          v-if="goalResponse && chartMode === 'day'"
          :percent="getCirclePercent(goalResponse)"
          :border-width="18"
          :border-bg-width="18"
          :fill-color="'rgba(255, 159, 64, 0.6)'"
          :empty-color="'rgba(47, 50, 65, 0.05)'"
          class="mx-1"
          :size="100"
        />
      </div>

      <div class="flex mt-4 justify-between grow" v-if="chartMode === 'week'">
        <div v-for="(r, index) in weekGoalResponses" class="flex flex-col items-center">
          <circle-progress
            :percent="getCirclePercent(r)"
            :border-width="10"
            :border-bg-width="10"
            :fill-color="'rgba(255, 159, 64, 0.6)'"
            :empty-color="'rgba(47, 50, 65, 0.05)'"
            class="mx-3"
            :size="60"
          />
          <div :style="{ color: 'rgba(255, 159, 64, 0.6)' }" class="text-xl mt-2">
            {{ r?.standingMinutesOfDay }}
          </div>
          <div>{{ weekdays[index] }}</div>
        </div>
      </div>
    </div>
    <div class="w-[95%] rounded-lg shadow-lg p-4 bg-white mt-2">
      <div class="text-[#2f3241]">Progress</div>
      <canvas id="barChart"></canvas>
    </div>
  </div>
</template>

<script setup>
import { svgs } from './svg'
import 'vue3-circle-progress/dist/circle-progress.css'
import CircleProgress from 'vue3-circle-progress'
import Chart from 'chart.js/auto'
import { ref, computed, onMounted } from 'vue'
import { getStatisticsOfDay, getStatisticsOfWeek, getGoalProgress } from './api'
import { getDayIntervals, getWeekIntervals, getStartOfToday, getStartOfWeek } from './chartData.js'

const emits = defineEmits(['buttonClicked'])
const props = defineProps({
  user: Object
})

const currentDisplayTime = ref()
const goalResponse = ref()
const weekGoalResponses = ref()
const weekdays = ref(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])

const getCirclePercent = (goalResponse) => {
  const percent = (goalResponse.standingMinutesOfDay / goalResponse.goalOfDay) * 100
  if (percent === 0) return 0.01
  if (percent > 100) return 100
  return percent
}

let barChart
let dayIntervals
let weekIntervals
const millisecondsPerDay = 86400000
const millisecondsPerWeek = 604800000 // 7 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds

const chartMode = ref()
const userInfo = ref()

onMounted(async () => {
  userInfo.value = props.user
  console.log(props.user)
  dayIntervals = getDayIntervals()
  weekIntervals = getWeekIntervals()
  showDay()
})

const showWeek = () => {
  chartMode.value = 'week'
  currentDisplayTime.value = getStartOfWeek()
  console.log(currentDisplayTime.value)
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

const getWeekGoalResponses = async (userId, startOfWeek) => {
  // Define the number of milliseconds in a day
  const millisecondsPerDay = 24 * 60 * 60 * 1000

  // Create an array to hold the start of each weekday as Unix timestamps
  const percents = []

  // Loop through each day of the week
  for (let i = 0; i < 7; i++) {
    const timestamp = startOfWeek + i * millisecondsPerDay

    const date = new Date(timestamp)
    date.setHours(0, 0, 0, 0)

    const newGoalResponse = await getGoalProgress(userId, date.getTime())
    percents.push(newGoalResponse)
  }
  return percents
}

const updateChart = async () => {
  let chartData
  if (chartMode.value === 'day') {
    console.log('send', userInfo.value.id, currentDisplayTime.value)
    chartData = await getStatisticsOfDay(userInfo.value.id, currentDisplayTime.value)
    console.log('received', chartData)
    console.log('send goal', userInfo.value.id, currentDisplayTime.value)
    goalResponse.value = await getGoalProgress(userInfo.value.id, currentDisplayTime.value)
    console.log('received', goalResponse.value)
  }
  if (chartMode.value === 'week') {
    chartData = await getStatisticsOfWeek(userInfo.value.id, currentDisplayTime.value)
    weekGoalResponses.value = await getWeekGoalResponses(
      userInfo.value.id,
      currentDisplayTime.value
    )
    console.log(weekGoalResponses.value)
  }

  barChart?.destroy?.()

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
          label: 'Sitting minutes',
          data: chartData.map((row) => row.sittingCounter)
        },
        {
          label: 'Standing minutes',
          data: chartData.map((row) => row.standingCounter)
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
      categoryPercentage: 0.6, // Adjust this value to increase the space between groups
      scales: {
        x: {
          grid: {
            display: false // Hide grid lines for x-axis
          }
        }
      }

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
  border: 1px solid #2f3241;
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
