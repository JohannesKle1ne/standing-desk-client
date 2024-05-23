const roundToMinute = (timestamp) => {
  const seconds = Math.floor(timestamp / 1000)
  const minutes = Math.floor(seconds / 60)
  return minutes * 60 * 1000
}

const roundToHour = (timestamp) => {
  const seconds = Math.floor(timestamp / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  return hours * 60 * 60 * 1000
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

export function getChartData(initData) {
  console.log(initData)
  const groups = initData.reduce((acc, d) => {
    const minute = roundToMinute(d.timestamp)
    const group = acc.find((d) => d.minute === minute)
    if (group) {
      group.deskUps.push(getDeskUp(d.deskHeight))
      group.presents.push(d.presenceDetected)
      return acc
    } else {
      return [
        ...acc,
        { minute: minute, deskUps: [getDeskUp(d.deskHeight)], presents: [d.presenceDetected] }
      ]
    }
  }, [])

  console.log(groups)

  const formatted = groups.map((g) => {
    const date = new Date(g.minute)

    // Get hours and minutes
    const hours = date.getHours()
    /*     let minutes = date.getMinutes() */

    const deskUps = g.deskUps.filter((d) => d).length
    const deskDowns = g.deskUps.filter((d) => !d).length
    const deskUp = deskUps > deskDowns

    const isPresent = g.presents.filter((d) => d).length
    const notPresent = g.presents.filter((d) => !d).length
    const present = isPresent > notPresent

    /*     if (minutes.toString().length <= 1) {
      minutes = '0' + minutes
    } */
    return {
      timestamp: g.minute,
      deskUp: deskUp,
      present: present
    }
  })

  console.log(formatted)

  const groupedByHour = formatted.reduce((acc, d) => {
    const hour = roundToHour(d.timestamp)
    const group = acc.find((d) => d.hour === hour)
    const addDeskUp = d.deskUp ? 1 : 0
    const addPresent = d.present ? 1 : 0
    const addStanding = d.deskUp && d.present ? 1 : 0
    if (group) {
      group.deskUpCounter += addDeskUp
      group.presentCounter += addPresent
      group.standingCounter += addStanding
      return acc
    } else {
      return [
        ...acc,
        {
          hour: hour,
          deskUpCounter: addDeskUp,
          presentCounter: addPresent,
          standingCounter: addStanding
        }
      ]
    }
  }, [])

  console.log(groupedByHour)

  const formattedHours = groupedByHour.map((g) => {
    const date = new Date(g.hour)

    // Get hours and minutes
    const hours = date.getHours()
    // let minutes = date.getMinutes()

    /*  const deskUps = g.deskUps.filter((d) => d).length
    const deskDowns = g.deskUps.filter((d) => !d).length
    const deskUp = deskUps > deskDowns

    const isPresent = g.presents.filter((d) => d).length
    const notPresent = g.presents.filter((d) => !d).length
    const present = isPresent > notPresent */
    /*
    if (minutes.toString().length <= 1) {
      minutes = '0' + minutes
    } */
    return {
      ...g,
      time: `${hours}:00 - ${hours + 1}:00`
    }
  })

  console.log(formattedHours)

  /*  const foramttedCopy = JSON.parse(JSON.stringify(formatted))

  const accumulated = formatted.map((g, index) => {
    const sliced = foramttedCopy
      .slice(0, index + 1)
      .filter((g) => g.present === 1 && g.deskUp === 1)
    return { ...g, accumulated: sliced.length }
  }) */

  return formattedHours
}
