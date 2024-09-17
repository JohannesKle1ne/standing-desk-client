import moment from 'moment-timezone'

const roundToMinute = (timestamp) => {
  const seconds = Math.floor(timestamp / 1000)
  const minutes = Math.floor(seconds / 60)
  return minutes * 60 * 1000
}

const getDeskUp = (height) => {
  return height > 900
}

export function getMinuteObjects(initData) {
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

export function addPiConnectsToData(data, piConnects) {
  const testPiConnects = piConnects.filter((c) => c.connected === false)
  data = data.reduce((acc, r, index) => {
    let piConnects = testPiConnects.filter((c) => Number(c.timestamp) > Number(r.timestamp))
    const next = data[index + 1]
    if (next != null) {
      piConnects = piConnects.filter((c) => Number(c.timestamp) < Number(next.timestamp))
      console.log(Number(next.timestamp))
    } else {
      piConnects = []
    }
    // console.log('new piconnects that are added: ', piConnects)
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
  console.log('push last')
  // This ensures that there are none for the rest of the day. Technically, the timestamp should be at the very end of the day, but using Date.now() also works.
  data.push({
    presenceDetected: false,
    deskHeight: data.at(-1)?.deskHeight,
    timestamp: Number(data.at(-1)?.timestamp) + 1
  })
  return data
}

export function roundToHour(timestamp) {
  const millisecondsPerHour = 60 * 60 * 1000
  const roundedTimestamp = Math.floor(timestamp / millisecondsPerHour) * millisecondsPerHour
  return roundedTimestamp
}

// Function to round a timestamp to the start of the day in Berlin timezone // test
export function roundToDay(timestamp) {
  const berlinTime = moment.tz(timestamp, 'Europe/Berlin')
  const startOfDay = berlinTime.startOf('day')
  return startOfDay.valueOf()
}

// Function to get the start of today in Berlin timezone
export function getStartOfToday() {
  const berlinTime = moment.tz('Europe/Berlin')
  const startOfDay = berlinTime.startOf('day')
  return startOfDay.valueOf()
}
