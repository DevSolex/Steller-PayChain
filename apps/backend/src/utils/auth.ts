import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from './config'
import type { JwtPayload } from '../types'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as jwt.SignOptions)
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload
}

export function respond<T>(data?: T, message?: string) {
  return { success: true, data, message }
}

export function respondError(error: string, status = 400) {
  return { success: false, error, status }
}
