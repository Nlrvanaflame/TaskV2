import { type AverageExamplar } from './types/types'
import { maxKeyNumber, store, unlimitedTtlStore } from './config/default'

function deleteLeastUsed (
  store: Map<string | number, AverageExamplar>,
  unlimitedTtlStore: Map<string | number, AverageExamplar>,
  maxKeyNumber: number,
  keysToDelete: string[],
  validKeys: Array<{ key: string, ttlLeft: number, timesUsed: number }>): void {
  /* Here we sort the array of valid keys we have populated beforehand and push the first key to the array for deletion
    */
  if (store.size + unlimitedTtlStore.size >= maxKeyNumber) {
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
  unlimitedTtlStore: Map<string | number, AverageExamplar>,
  maxKeyNumber: number
): void {
  const keysToDelete: string[] = []
  const validKeys: Array<{ key: string, ttlLeft: number, timesUsed: number }> = []

  /* Checks for any expired keys and adds them to the array for deletion, also populates the valid keys array
    */
  store.forEach((value, key) => {
    const ttlLeft = (value.ttl != null) ? (value.createdAt + value.ttl - Date.now()) : Infinity
    if (ttlLeft <= 0) {
      keysToDelete.push(key.toString())
    } else {
      validKeys.push({ key: key.toString(), ttlLeft, timesUsed: value.timesUsed })
    }
  })

  deleteLeastUsed(store, unlimitedTtlStore, maxKeyNumber, keysToDelete, validKeys)
  keysToDelete.forEach(key => {
    clearTimeout(store.get(key)?.timeoutId)
    store.delete(key)
  })
}

export function clearStore (): void {
  removeOldAndExpiredKeys(store, unlimitedTtlStore, maxKeyNumber)
  setInterval(clearStore, 60000)
}
