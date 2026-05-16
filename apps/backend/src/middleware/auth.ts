import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/auth'
import type { JwtPayload, UserRole } from '../types'

export interface AuthRequest extends Request {
  user?: JwtPayload
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required' })
  }

  try {
    req.user = verifyToken(authHeader.split(' ')[1])
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' })
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' })
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' })
    }
    next()
  }
}

export function requireCompany(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user?.companyId) {
    return res.status(403).json({ success: false, error: 'Company account required' })
  }
  next()
}
