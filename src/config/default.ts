import type { AverageExamplar } from '../types/types'

export const maxKeyNumber = 5

export const store = new Map<string | number, AverageExamplar>()
export const unlimitedTtlStore = new Map<string | number, AverageExamplar>()
