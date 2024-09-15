import states from './state/state'

export function getStatesInRange(userId, startTime, endTime) {
  const user = states.find((p) => p.id === userId)
  if (user == null) return

  const foundStates = user.data
  const exclude = user.exclude
  if (foundStates) {
    return foundStates.filter(
      (s) =>
        s.timestamp >= startTime &&
        s.timestamp <= endTime &&
        !exclude.some((e) => e.from <= s.timestamp && e.to >= s.timestamp)
    )
  }
}
