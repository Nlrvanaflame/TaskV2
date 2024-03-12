import { type AverageExamplar } from './types/types'
import { maxKeyNumber, store } from './config/default'

function deleteLeastUsed (
  store: Map<string | number, AverageExamplar>,
  maxKeyNumber: number,
  keysToDelete: string[],
  validKeys: Array<{ key: string, ttlLeft: number, timesUsed: number }>): void {
  if (Object.keys(store).length >= maxKeyNumber) {
    validKeys.sort((a, b) => {
      if (a.timesUsed === b.timesUsed) {
        return a.ttlLeft - b.ttlLeft
      }
      return a.timesUsed - b.timesUsed
    })
    keysToDelete.push(validKeys[0].key)
  }
}

export function removeOldAndExpiredKeys (
  store: Map<string | number, AverageExamplar>,
  maxKeyNumber: number
): void {
  const keysToDelete: string[] = []
  const validKeys: Array<{ key: string, ttlLeft: number, timesUsed: number }> = []

  for (const [key, value] of Object.entries(store)) {
    const ttlLeft = (value.ttl != null) ? (value.createdAt + value.ttl - Date.now()) : Infinity
    if (ttlLeft <= 0) {
      keysToDelete.push(key)
    } else validKeys.push({ key, ttlLeft, timesUsed: value.timesUsed })
  }

  deleteLeastUsed(store, maxKeyNumber, keysToDelete, validKeys)
}

export function clearStore (): void {
  removeOldAndExpiredKeys(store, maxKeyNumber)
  setTimeout(clearStore, 60000)
}
