const roundToWeek = (timestamp) => {
  const now = new Date(timestamp)
  const dayOfWeek = now.getDay() // Sunday - Saturday : 0 - 6
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1) // Adjust for local time offset
  startOfWeek.setHours(0, 0, 0, 0) // Set time to 00:00:00.000
  return startOfWeek.getTime()
}

export function getStartOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

export function getDayIntervals() {
  let intervals = []
  const millisecondsPerDay = 86400000
  const today = getStartOfToday()

  for (let i = 10; i >= 0; i--) {
    const intervalStart = today - i * millisecondsPerDay
    intervals.push({
      day: intervalStart
    })
  }
  return intervals
}

export function getStartOfWeek() {
  const currentTimestamp = Date.now() // Get the current timestamp in milliseconds
  return roundToWeek(currentTimestamp) //
}

// Function to get week intervals with data
export function getWeekIntervals() {
  let intervals = []
  const millisecondsPerWeek = 604800000 // 7 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
  const startOfWeek = getStartOfWeek()
  /*   console.log('startOfWeek: ' + startOfWeek) */

  for (let i = 10; i >= 0; i--) {
    const intervalStart = startOfWeek - i * millisecondsPerWeek
    intervals.push({
      week: intervalStart
    })
  }
  return intervals
}
