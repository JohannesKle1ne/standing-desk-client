<template>
  <div style="width: 500; height: 500"><canvas id="barChart"></canvas></div>
</template>

<script setup>
import Chart from 'chart.js/auto'
import { svgs } from './svg'
import { ref, computed, onMounted } from 'vue'
import { data } from './testData'
const emits = defineEmits(['buttonClicked'])
const props = defineProps({
  height: String
})

const roundToMinute = (timestamp) => {
  const seconds = Math.floor(timestamp / 1000)
  const minutes = Math.floor(seconds / 60)
  return minutes * 60 * 1000
}

onMounted(async () => {
  console.log(data)
  const groups = data.reduce((acc, d) => {
    const minute = roundToMinute(d.timestamp)
    const group = acc.find((d) => d.minute === minute)
    if (group) {
      group.deskUps.push(d.deskUp)
      group.presents.push(d.present)
      return acc
    } else {
      return [...acc, { minute: minute, deskUps: [d.deskUp], presents: [d.present] }]
    }
  }, [])

  const formatted = groups.map((g) => {
    const date = new Date(g.minute)

    // Get hours and minutes
    const hours = date.getHours()
    let minutes = date.getMinutes()

    const deskUps = g.deskUps.filter((d) => d).length
    const deskDowns = g.deskUps.filter((d) => !d).length
    const deskUp = deskUps > deskDowns

    const isPresent = g.presents.filter((d) => d).length
    const notPresent = g.presents.filter((d) => !d).length
    const present = isPresent > notPresent

    console.log(minutes)
    if (minutes.toString().length <= 1) {
      minutes = '0' + minutes
    }
    return {
      time: `${hours}:${minutes}`,
      deskUp: deskUp ? 1 : 0.1,
      present: present ? 1 : 0.1
    }
  })

  console.log(formatted)

  const foramttedCopy = JSON.parse(JSON.stringify(formatted))

  const accumulated = formatted.map((g, index) => {
    const sliced = foramttedCopy
      .slice(0, index + 1)
      .filter((g) => g.present === 1 && g.deskUp === 1)
    return { ...g, accumulated: sliced.length }
  })

  const chartData = accumulated

  new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: chartData.map((row) => row.time),
      datasets: [
        {
          label: 'Desk up minutes',
          data: chartData.map((row) => row.accumulated)
        },
        {
          label: 'Desk up',
          data: chartData.map((row) => row.deskUp)
        },
        {
          label: 'Presence',
          data: chartData.map((row) => row.present)
        }
      ]
    }
  })
})
</script>

<style></style>
