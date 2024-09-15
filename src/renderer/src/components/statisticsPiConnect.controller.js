import piConnects from './piConnect/piConnect'

export function getAll(userId) {
  const user = piConnects.find((p) => p.id === userId)
  if (user == null) return
  const foundConnects = user.data
  const exclude = user.exclude
  if (foundConnects) {
    return foundConnects.filter(
      (s) => !exclude.some((e) => e.from <= s.timestamp && e.to >= s.timestamp)
    )
  }
}
