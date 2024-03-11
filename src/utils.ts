/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-dynamic-delete */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type AverageExamplar } from './types/types'

export function removeOldAndExpiredKeys (
  store: Record<string | number, AverageExamplar>,
  maxKeyNumber: number
) {
  const keysToDelete = []
  const validKeys = []

  for (const [key, value] of Object.entries(store)) {
    const ttlLeft = value.ttl ? (value.createdAt + value.ttl - Date.now()) : Infinity
    if (ttlLeft <= 0) {
      keysToDelete.push(key)
    } else validKeys.push({ key, ttlLeft, timesUsed: value.timesUsed })
  }

  if (Object.keys(store).length >= maxKeyNumber) {
    validKeys.sort((a, b) => {
      if (a.timesUsed === b.timesUsed) {
        return a.ttlLeft - b.ttlLeft
      }
      return a.timesUsed - b.timesUsed
    })
    keysToDelete.push(validKeys[0].key)
  }

  keysToDelete.forEach(key => delete store[key])
}

export function clearStore () {
  // function
  setTimeout(clearStore, 60000)
}
