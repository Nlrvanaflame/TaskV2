import { maxKeyNumber } from '../config/default'
import { type AverageExamplar } from '../types/types'

interface QueueNode {
  key: string | number
  value: AverageExamplar
}

class PriorityQueue {
  private readonly heap: QueueNode[]
  private readonly onRemove: (key: string | number) => void

  constructor (onRemove: (key: string | number) => void) {
    this.heap = []
    this.onRemove = onRemove
  }

  enqueue (key: string | number, value: AverageExamplar): void {
    const newNode = { key, value }
    this.heap.push(newNode)
    this.heapifyUp(this.heap.length - 1)
    this.ensureCapacity()
  }

  dequeue (): QueueNode | undefined {
    if (this.heap.length === 0) return undefined
    const result = this.heap[0]
    const last = this.heap.pop()
    if (this.heap.length > 0 && last !== undefined) {
      this.heap[0] = last
      this.heapifyDown(0)
    }
    this.onRemove(result.key)
    return result
  }

  update (key: string | number, newValue: AverageExamplar): boolean {
    const index = this.heap.findIndex(node => node.key === key)
    if (index === -1) return false

    this.heap[index].value = newValue
    this.heapifyUp(index)
    this.heapifyDown(index)
    return true
  }

  remove (key: string | number): boolean {
    const index = this.heap.findIndex(node => node.key === key)
    if (index === -1) return false

    const last = this.heap.pop()
    if (index < this.heap.length && last !== undefined) {
      this.heap[index] = last
      this.heapifyUp(index)
      this.heapifyDown(index)
    }
    return true
  }

  private heapifyUp (index: number): void {
    while (index > 0) {
      const parentIdx = this.parent(index)
      if (this.compare(this.heap[index], this.heap[parentIdx])) {
        break
      }
      [this.heap[index], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[index]]
      index = parentIdx
    }
  }

  private heapifyDown (index: number): void {
    while (true) {
      const leftIdx = this.leftChild(index)
      const rightIdx = this.rightChild(index)
      let smallest = index
      if (leftIdx < this.heap.length && this.compare(this.heap[leftIdx], this.heap[smallest])) {
        smallest = leftIdx
      }
      if (rightIdx < this.heap.length && this.compare(this.heap[rightIdx], this.heap[smallest])) {
        smallest = rightIdx
      }
      if (smallest === index) {
        break
      }
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]]
      index = smallest
    }
  }

  private compare (a: QueueNode, b: QueueNode): boolean {
    const aTtlLeft = this.calculateTtlLeft(a.value)
    const bTtlLeft = this.calculateTtlLeft(b.value)
    return a.value.timesUsed < b.value.timesUsed || (a.value.timesUsed === b.value.timesUsed && aTtlLeft > bTtlLeft)
  }

  private calculateTtlLeft (exemplar: AverageExamplar): number {
    return exemplar.ttl != null ? exemplar.createdAt + exemplar.ttl - Date.now() : Infinity
  }

  ensureCapacity (): void {
    while (this.heap.length > maxKeyNumber) {
      const removedNode = this.dequeue()
      if (removedNode !== undefined) { console.log(`Removed item key: ${removedNode.key}`) }
    }
  }

  private parent (index: number): number {
    return Math.floor((index - 1) / 2)
  }

  private leftChild (index: number): number {
    return 2 * index + 1
  }

  private rightChild (index: number): number {
    return 2 * index + 2
  }
}

export default PriorityQueue
