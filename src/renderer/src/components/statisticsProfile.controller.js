import profile from './profile/profile'

export function getLastProfile(userId) {
  return profile
    .find((p) => p.id === userId)
    ?.data?.reduce(
      (latest, current) => {
        return current.timestamp > latest.timestamp ? current : latest
      },
      { timestamp: 0 }
    )
}
