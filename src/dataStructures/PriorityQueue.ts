import { maxKeyNumber } from '../config/default'
import { type AverageExamplar } from '../types/types'

class PriorityQueue {
  private readonly heap: AverageExamplar[]
  private readonly onRemove: (key: string | number) => void

  constructor (onRemove: (key: string | number) => void) {
    this.heap = []
    this.onRemove = onRemove
  }

  enqueue (node: AverageExamplar): void {
    this.heap.push(node)
    node.heapIndex = this.heap.length - 1
    this.heapifyUp(node.heapIndex)
  }

  dequeue (): AverageExamplar | undefined {
    if (this.heap.length === 0) return undefined
    const result = this.heap[0]
    const last = this.heap.pop()
    if (this.heap.length > 0 && last != null) {
      this.heap[0] = last
      last.heapIndex = 0
      this.heapifyDown(0)
    }
    this.onRemove(result.key)
    return result
  }

  update (node: AverageExamplar): void {
    const index = node.heapIndex
    if (index !== undefined && index < this.heap.length) {
      this.heapifyUp(index)
      this.heapifyDown(index)
    }
  }

  remove (heapIndex: number): void {
    if (heapIndex === undefined || heapIndex < 0 || heapIndex >= this.heap.length) { return undefined }

    this.swap(heapIndex, this.heap.length - 1)
    this.heap.pop()
    if (heapIndex < this.heap.length && this.heap.length > 0) {
      this.heapifyDown(heapIndex)
      this.heapifyUp(heapIndex)
    }
  }

  private heapifyUp (index: number): void {
    let currentIndex = index
    while (currentIndex > 0) {
      const parentIdx = this.parent(currentIndex)
      if (this.compare(this.heap[currentIndex], this.heap[parentIdx]) < 0) {
        this.swap(currentIndex, parentIdx)
        currentIndex = parentIdx
      } else {
        break
      }
    }
  }

  private heapifyDown (index: number): void {
    let currentIndex = index
    const last = this.heap.length - 1
    while (true) {
      let smallest = currentIndex
      const leftIdx = this.leftChild(currentIndex)
      const rightIdx = this.rightChild(currentIndex)
      if (leftIdx <= last && this.compare(this.heap[leftIdx], this.heap[smallest]) < 0) {
        smallest = leftIdx
      }
      if (rightIdx <= last && this.compare(this.heap[rightIdx], this.heap[smallest]) < 0) {
        smallest = rightIdx
      }
      if (smallest === currentIndex) {
        break
      }
      this.swap(currentIndex, smallest)
      currentIndex = smallest
    }
  }

  private swap (i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]]
    this.heap[i].heapIndex = i
    this.heap[j].heapIndex = j
  }

  private compare (a: AverageExamplar, b: AverageExamplar): number {
    if (a.timesUsed !== b.timesUsed) return a.timesUsed - b.timesUsed
    return a.createdAt - b.createdAt
  }

  ensureCapacity (): void {
    while (this.heap.length > maxKeyNumber) {
      this.dequeue()
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
