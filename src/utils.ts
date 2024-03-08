import { type AverageExamplar } from './types/types'

export function removeOldAndExpiredKeys (
  store: Record<string | number, AverageExamplar>,
  maxKeyNumber: number
) {
  const validKeys = []

  for (const [key, value] of Object.entries(store)) {
    const ttlLeft = value.ttl ? (value.createdAt + value.ttl - Date.now()) : Infinity
    if (ttlLeft <= 0) delete store[key]
    validKeys.push({ key, ttlLeft, timesUsed: store[key].timesUsed })
  }

  if (Object.keys(store).length >= maxKeyNumber) {
    validKeys.sort((a, b) => {
      if (a.timesUsed === b.timesUsed) {
        return a.ttlLeft - b.ttlLeft
      }
      return a.timesUsed - b.timesUsed
    })
    delete store[validKeys[0].key]
  }
}
