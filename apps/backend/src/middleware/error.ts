import { Request, Response, NextFunction } from 'express'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('[Error]', err.message)

  // Prisma unique constraint
  if (err.message.includes('Unique constraint')) {
    return res.status(409).json({ success: false, error: 'Resource already exists' })
  }

  // Prisma not found
  if (err.message.includes('Record to update not found')) {
    return res.status(404).json({ success: false, error: 'Resource not found' })
  }

  res.status(500).json({ success: false, error: 'Internal server error' })
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ success: false, error: 'Route not found' })
}
