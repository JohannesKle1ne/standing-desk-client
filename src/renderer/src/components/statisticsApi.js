import {
  getMinuteObjects,
  addPiConnectsToData,
  roundToHour,
  roundToDay,
  getStartOfToday
} from './statisticsUtils'

import { getAll } from './statisticsPiConnect.controller.js'
import { getStatesInRange } from './statisticsState.controller.js'
import { getLastProfile } from './statisticsProfile.controller.js'

import moment from 'moment-timezone'

export async function readDay(userId, startOfDay) {
  console.log('readDay started')
  const chartData = await getChartDataForDay(userId, Number(startOfDay))
  console.log(chartData)
  return chartData
}

export async function minuteObjectsOfToday(userId) {
  const millisecondsPerDay = 86400000
  const startOfDay = getStartOfToday()
  const endOfToday = startOfDay + millisecondsPerDay
  const statesOfToday = await getStatesInRange(userId, startOfDay, endOfToday)
  const piConnects = await getAll(userId)

  const newStates = addPiConnectsToData(statesOfToday, piConnects)
  return getMinuteObjects(newStates)
}

async function getChartDataForDay(userId, startOfDay) {
  console.log('calc getChartDataForDay')
  const millisecondsPerDay = 86400000

  const endOfToday = startOfDay + millisecondsPerDay
  const statesOfToday = await getStatesInRange(userId, startOfDay, endOfToday)
  if (statesOfToday == null) return
  const allPiConnects = await getAll(userId)
  const piConnects = allPiConnects.filter(
    (c) => Number(c.timestamp) > Number(startOfDay) && Number(c.timestamp) < Number(endOfToday)
  )
  console.log('piconnects: ', piConnects)

  const newStates = addPiConnectsToData(statesOfToday, piConnects)
  console.log('new states: ', newStates)
  const minuteObjects = getMinuteObjects(newStates)

  console.log(minuteObjects.at(-1))

  const groupedByHour = minuteObjects.reduce((acc, d) => {
    const hour = roundToHour(d.minute)
    const group = acc.find((d) => d.hour === hour)
    const addDeskUp = d.deskUp ? 1 : 0
    const addPresent = d.present ? 1 : 0
    const addStanding = d.deskUp && d.present ? 1 : 0
    const addSitting = !d.deskUp && d.present ? 1 : 0
    if (group) {
      group.deskUpCounter += addDeskUp
      group.presentCounter += addPresent
      group.standingCounter += addStanding
      group.sittingCounter += addSitting
      return acc
    } else {
      return [
        ...acc,
        {
          hour: hour,
          deskUpCounter: addDeskUp,
          presentCounter: addPresent,
          standingCounter: addStanding,
          sittingCounter: addSitting
        }
      ]
    }
  }, [])

  /*   console.log(groupedByHour) */

  let hoursOfDay = []
  const millisecondsPerHour = 60 * 60 * 1000
  for (let i = 0; i < 24; i++) {
    hoursOfDay.push({
      hour: startOfDay + i * millisecondsPerHour,
      deskUpCounter: 0,
      presentCounter: 0,
      standingCounter: 0,
      sittingCounter: 0
    })
  }

  /*   console.log(hoursOfDay) */

  const withEmptyDays = hoursOfDay.map((h) => {
    const found = groupedByHour.find((hour) => hour.hour === h.hour)
    return found || h
  })

  const cutValue = 4
  const firstThreeHours = withEmptyDays.slice(0, cutValue)
  if (firstThreeHours.every((h) => h.presentCounter === 0)) {
    withEmptyDays.splice(0, cutValue)
  }

  const lastThreeHours = withEmptyDays.slice(-cutValue)
  if (lastThreeHours.every((h) => h.presentCounter === 0)) {
    withEmptyDays.splice(withEmptyDays.length - cutValue, cutValue)
  }

  const formattedHours = withEmptyDays.map((g) => {
    // Parse the date in Berlin timezone
    const date = moment.tz(g.hour, 'Europe/Berlin')
    const hours = date.format('H') // Get hours in 24-hour format without leading zero
    return {
      ...g,
      time: `${hours}:00`
    }
  })

  /*   console.log(formattedHours) */

  return formattedHours
}

export async function readWeek(userId, startOfWeek) {
  console.log('readWeek started')
  console.log(userId, startOfWeek)
  const chartData = await getChartDataForWeek(userId, Number(startOfWeek))
  console.log(chartData)
  return chartData
}

async function getChartDataForWeek(userId, startOfWeek) {
  console.log('calc getChartDataForWeek')
  const millisecondsPerWeek = 604800000 // 7 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds

  const endOfWeek = startOfWeek + millisecondsPerWeek
  const statesOfWeek = await getStatesInRange(userId, startOfWeek, endOfWeek)
  if (statesOfWeek == null) return

  /*   console.log(startOfWeek, endOfWeek);
  console.log(statesOfWeek); */
  const piConnects = await getAll(userId)
  const newStates = addPiConnectsToData(statesOfWeek, piConnects)
  const minuteObjects = getMinuteObjects(newStates)
  /*   console.log(minuteObjects);
   */

  const groupedByDay = minuteObjects.reduce((acc, d) => {
    const day = roundToDay(d.minute)

    const group = acc.find((d) => d.day === day)
    const addDeskUp = d.deskUp ? 1 : 0
    const addPresent = d.present ? 1 : 0
    const addStanding = d.deskUp && d.present ? 1 : 0
    const addSitting = !d.deskUp && d.present ? 1 : 0
    if (group) {
      group.deskUpCounter += addDeskUp
      group.presentCounter += addPresent
      group.standingCounter += addStanding
      group.sittingCounter += addSitting
      return acc
    } else {
      return [
        ...acc,
        {
          day,
          deskUpCounter: addDeskUp,
          presentCounter: addPresent,
          standingCounter: addStanding,
          sittingCounter: addSitting
        }
      ]
    }
  }, [])
  /*   console.log(groupedByDay)
   */
  let daysOfWeek = []
  const millisecondsPerDay = 86400000
  for (let i = 0; i < 7; i++) {
    daysOfWeek.push({
      day: startOfWeek + i * millisecondsPerDay,
      deskUpCounter: 0,
      presentCounter: 0,
      standingCounter: 0,
      sittingCounter: 0
    })
  }

  /*   console.log(daysOfWeek)
   */
  const withEmptyDays = daysOfWeek.map((d) => {
    const found = groupedByDay.find((day) => day.day === d.day)
    return found || d
  })

  const formattedDays = withEmptyDays.map((g) => {
    console.log(getStartOfToday(), g.day)
    if (getStartOfToday() === g.day) {
      return {
        ...g,
        time: 'Today'
      }
    }
    const date = moment.tz(g.day, 'Europe/Berlin') // Parse the date in Berlin timezone
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const weekday = weekdays[date.day()] // Get the day of the week
    const day = date.format('DD') // Get day in two-digit format
    const month = date.format('MM') // Get month in two-digit format
    const formattedDate = `${weekday} ${day}.${month}`
    return {
      ...g,
      time: formattedDate
    }
  })

  return formattedDays
}

export async function readGoal(userId, startOfDay) {
  console.log('readGoal started')
  console.log(userId, startOfDay)

  const lastProfile = await getLastProfile(userId)
  console.log(lastProfile)
  if (lastProfile?.dailyGoal == null) {
    return
  }

  const millisecondsPerDay = 86400000

  const endOfToday = startOfDay + millisecondsPerDay
  const statesOfToday = await getStatesInRange(userId, startOfDay, endOfToday)
  console.log(statesOfToday)
  const piConnects = await getAll(userId)
  const newStates = addPiConnectsToData(statesOfToday, piConnects)
  console.log(newStates)
  const minutes = getMinuteObjects(newStates)
  console.log('minutes', minutes)
  const standingMinutes = minutes.filter((m) => m.deskUp && m.present).length
  console.log(minutes.filter((m) => m.deskUp && m.present))
  console.log({
    standingMinutesOfDay: standingMinutes,
    goalOfDay: lastProfile.dailyGoal
  })
  return {
    standingMinutesOfDay: standingMinutes,
    goalOfDay: lastProfile.dailyGoal
  }
}
