import { AverageExamplar } from "./types/types";



export function removeOldKeys(store: Record<string | number , AverageExamplar> ,  maxKeyNumber:number) {
    if (Object.keys(store).length >= maxKeyNumber) {
        let lowestTtlKey = null;
        let lowestTtlValue = Infinity;
  
        for (const [key, value] of Object.entries(store)) {
          const ttlLeft = value.ttl + value.createdAt - Date.now();
          if (ttlLeft < lowestTtlValue) {
            lowestTtlValue = ttlLeft;
            lowestTtlKey = key;
          }
        }
  
        if (lowestTtlKey !== null) {
          delete store[lowestTtlKey];
        }
      }

}