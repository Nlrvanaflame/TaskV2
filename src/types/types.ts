import { Request, Response, Router } from "express";

export interface AverageExamplar {
  id: string;
  name: string;
  proffesion: string;
  ttl: number;
  createdAt: number;
}

export interface AddExemplar {
  key: string;
  name: string;
  proffesion: string;
  ttl: number;
}
export interface UpdateExemplar {
  name: string
  proffesion: string
  ttl: number
}

export interface GetItem {
  key: string;
}

export interface CustomRequest<T> extends Request {
  body: T;
}

