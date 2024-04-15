import { type AverageExamplar } from '../types/types'
import { maxKeyNumber } from '../config/default'

interface QueueNode {
  key: string | number
  value: AverageExamplar
}

class PriorityQueue {
  private readonly values: QueueNode[]

  constructor () {
    this.values = []
  }

  enqueue (key: string | number, value: AverageExamplar): void {
    const newNode = { key, value }
    let placed = false

    for (let i = 0; i < this.values.length; i++) {
      if (this.compareKeys(value, this.values[i].value)) {
        this.values.splice(i, 0, newNode)
        placed = true
        break
      }
    }

    if (!placed) {
      this.values.push(newNode)
    }

    this.ensureCapacity()
  }

  dequeue (): QueueNode | undefined {
    return this.values.shift()
  }

  remove (key: string | number): void {
    const index = this.values.findIndex(item => item.key === key)
    if (index !== -1) {
      this.values.splice(index, 1)
    }
  }

  update (key: string | number, newValue: AverageExamplar): void {
    this.remove(key)
    this.enqueue(key, newValue)
  }

  size (): number {
    return this.values.length
  }

  ensureCapacity (): void {
    if (this.values.length > maxKeyNumber) {
      const removedNode = this.dequeue()
      if (removedNode != null) {
        clearTimeout(removedNode.value.timeoutId)
      }
    }
  }

  private compareKeys (a: AverageExamplar, b: AverageExamplar): boolean {
    const aTtlLeft = this.calculateTtlLeft(a)
    const bTtlLeft = this.calculateTtlLeft(b)

    return a.timesUsed < b.timesUsed || (a.timesUsed === b.timesUsed && aTtlLeft < bTtlLeft)
  }

  private calculateTtlLeft (exemplar: AverageExamplar): number {
    return (exemplar.ttl != null) ? (exemplar.createdAt + exemplar.ttl - Date.now()) : Infinity
  }
}

export default PriorityQueue
