const roundToMinute = (timestamp) => {
  const seconds = Math.floor(timestamp / 1000)
  const minutes = Math.floor(seconds / 60)
  return minutes * 60 * 1000
}

const roundToHour = (timestamp) => {
  const millisecondsPerHour = 60 * 60 * 1000
  const roundedTimestamp = Math.floor(timestamp / millisecondsPerHour) * millisecondsPerHour
  return roundedTimestamp
}

const roundToDay = (timestamp) => {
  const now = new Date(timestamp)
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

const roundToWeek = (timestamp) => {
  const now = new Date(timestamp)
  const dayOfWeek = now.getDay() // Sunday - Saturday : 0 - 6
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1) // Adjust for local time offset
  startOfWeek.setHours(0, 0, 0, 0) // Set time to 00:00:00.000
  return startOfWeek.getTime()
}

const getDeskUp = (height) => height > 900

export function getStartOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

export function getDayIntervals(initData) {
  let intervals = []
  const millisecondsPerDay = 86400000
  const today = getStartOfToday()

  for (let i = 10; i >= 0; i--) {
    const intervalStart = today - i * millisecondsPerDay
    const intervalEnd = intervalStart + millisecondsPerDay
    intervals.push({
      day: intervalStart,
      data: initData.filter(
        (state) => state.timestamp > intervalStart && state.timestamp < intervalEnd
      )
    })
  }
  return intervals
}

export function getStartOfWeek() {
  const currentTimestamp = Date.now() // Get the current timestamp in milliseconds
  return roundToWeek(currentTimestamp) //
}

// Function to get week intervals with data
export function getWeekIntervals(initData) {
  let intervals = []
  const millisecondsPerWeek = 604800000 // 7 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
  const startOfWeek = getStartOfWeek()
  console.log('startOfWeek: ' + startOfWeek)

  for (let i = 10; i >= 0; i--) {
    const intervalStart = startOfWeek - i * millisecondsPerWeek
    const intervalEnd = intervalStart + millisecondsPerWeek
    intervals.push({
      week: intervalStart,
      data: initData.filter(
        (state) => state.timestamp > intervalStart && state.timestamp < intervalEnd
      )
    })
  }
  return intervals
}

/* function collapseMinutes(initData) {
  return initData.reduce((acc, d) => {
    const rounded = roundToMinute(d.timestamp)
    const minuteObject = acc.find((d) => d.minute === rounded)
    if (minuteObject) {
      minuteObject.deskUp = minuteObject.deskUp || getDeskUp(d.deskHeight)
      minuteObject.present = minuteObject.present || getDeskUp(d.present)
    }
  }, [])
} */

function getMinuteObjects(initData) {
  return initData.reduce((acc, d, index) => {
    const start = d.timestamp
    const end = initData[index + 1]?.timestamp || d.timestamp
    const startMinute = roundToMinute(start)
    const endMinute = roundToMinute(end)
    const minutes = []
    let iteratingMinute = startMinute
    while (iteratingMinute <= endMinute) {
      const foundMinute = acc.find((m) => m.minute === iteratingMinute)
      if (foundMinute) {
        foundMinute.deskUp = foundMinute.deskUp || getDeskUp(d.deskHeight)
        foundMinute.present = foundMinute.present || d.presenceDetected
      } else {
        minutes.push({
          minute: iteratingMinute,
          deskUp: getDeskUp(d.deskHeight),
          present: d.presenceDetected
        })
      }
      iteratingMinute = iteratingMinute + 60000
    }
    return [...acc, ...minutes]
  }, [])
}

export function getChartDataForWeek(initData, timestampStart) {
  const minuteObjects = getMinuteObjects(initData)
  console.log(minuteObjects.length)
  console.log(minuteObjects.filter((m) => m.present).length)
  console.log(
    minuteObjects.map((m) => {
      // Convert timestamp to Date object
      let date = new Date(m.minute)

      // Extract and format the date components
      let year = date.getFullYear()
      let month = ('0' + (date.getMonth() + 1)).slice(-2) // Months are zero-based
      let day = ('0' + date.getDate()).slice(-2)
      let hours = ('0' + date.getHours()).slice(-2)
      let minutes = ('0' + date.getMinutes()).slice(-2)
      let seconds = ('0' + date.getSeconds()).slice(-2)

      // Create a readable format
      return { ...m, minute: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}` }
    })
  )

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
  console.log(groupedByDay)

  const startOfWeek = timestampStart
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

  console.log(daysOfWeek)

  const withEmptyDays = daysOfWeek.map((d) => {
    const found = groupedByDay.find((day) => day.day === d.day)
    return found || d
  })

  const formattedDays = withEmptyDays.map((g) => {
    const date = new Date(g.day)
    const day = ('0' + date.getDate()).slice(-2) // Get day and ensure two-digit format
    const month = ('0' + (date.getMonth() + 1)).slice(-2) // Get month and ensure two-digit format
    const formattedDate = `${day}.${month}`

    return {
      ...g,
      time: formattedDate
    }
  })

  return formattedDays
}

export function getChartDataForDay(initData, timestampStart) {
  const minuteObjects = getMinuteObjects(initData)

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

  console.log(groupedByHour)

  const startOfDay = timestampStart
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

  console.log(hoursOfDay)

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
    const date = new Date(g.hour)
    const hours = date.getHours()
    return {
      ...g,
      time: `${hours}:00`
    }
  })

  console.log(formattedHours)

  return formattedHours
}
