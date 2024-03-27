import { type Request } from 'express'

export interface AverageExamplar {
  id: string
  name: string
  proffesion: string
  ttl?: number
  createdAt: number
  timesUsed: number
  timeoutId?: NodeJS.Timeout
}

export interface AddExemplar {
  key: string
  name: string
  proffesion: string
  ttl?: number
  timeoutId?: NodeJS.Timeout
}
export interface UpdateExemplar {
  name: string
  proffesion: string
  ttl?: number
}

export interface GetExamplar {
  key: string
}

export interface CustomRequest<T> extends Request {
  body: T
}
