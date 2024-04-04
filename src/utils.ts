import { type AverageExamplar } from './types/types'
import { maxKeyNumber } from './config/default'

function deleteLeastUsed (
  store: Map<string | number, AverageExamplar>,
  maxKeyNumber: number,
  keysToDelete: string[],
  validKeys: Array<{ key: string, ttlLeft: number, timesUsed: number }>,
  numberOfKeysToDelete: number): void {
  if (store.size >= maxKeyNumber) {
    while (keysToDelete.length < numberOfKeysToDelete && validKeys.length > 0) {
      let leastUsedIndex = 0

      for (let key = 1; key < validKeys.length; key++) {
        const current = validKeys[key]
        const leastUsed = validKeys[leastUsedIndex]

        if (current.timesUsed < leastUsed.timesUsed ||
            (current.timesUsed === leastUsed.timesUsed && current.ttlLeft < leastUsed.ttlLeft)) {
          leastUsedIndex = key
        }
      }

      keysToDelete.push(validKeys[leastUsedIndex].key)

      validKeys.splice(leastUsedIndex, 1)
    }
  }
}

export function removeOldAndExpiredKeys (
  store: Map<string | number, AverageExamplar>,
  maxKeyNumber: number,
  numberOfKeysToDelete: number
): void {
  const keysToDelete: string[] = []
  const validKeys: Array<{ key: string, ttlLeft: number, timesUsed: number }> = []

  store.forEach((value, key) => {
    const ttlLeft = (value.ttl != null) ? (value.createdAt + value.ttl - Date.now()) : Infinity
    if (ttlLeft <= 0) {
      keysToDelete.push(key.toString())
    } else {
      validKeys.push({ key: key.toString(), ttlLeft, timesUsed: value.timesUsed })
    }
  })

  deleteLeastUsed(store, maxKeyNumber, keysToDelete, validKeys, numberOfKeysToDelete)
  keysToDelete.forEach(key => {
    clearTimeout(store.get(key)?.timeoutId)
    store.delete(key)
  })
}

export function clearStore (
  store: Map<string | number, AverageExamplar>,
  numberOfKeysToDelete: number
): void {
  removeOldAndExpiredKeys(store, maxKeyNumber, numberOfKeysToDelete)
  setTimeout(() => {
    clearStore(store, numberOfKeysToDelete)
  }, 60000)
}
