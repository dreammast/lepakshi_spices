import { type Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, message?: string) {
  res.status(200).json({ success: true, data, message });
}

export function sendCreated<T>(res: Response, data: T, message?: string) {
  res.status(201).json({ success: true, data, message });
}
