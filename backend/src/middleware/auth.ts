import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export type AuthRequest = Request & {
  userId?: string
  userRole?: 'CANDIDATE' | 'EMPLOYER' | 'ADMIN'
}

function readToken(req: Request): string | undefined {
  const c = req.cookies as { token?: string } | undefined
  if (c?.token) return c.token
  const h = req.headers.authorization
  if (h?.startsWith('Bearer ')) return h.slice(7)
  return undefined
}

export function authRequired(req: AuthRequest, res: Response, next: NextFunction) {
  const token = readToken(req)
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET missing')
    const payload = jwt.verify(token, secret) as { sub: string; role: AuthRequest['userRole'] }
    req.userId = payload.sub
    req.userRole = payload.role
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = readToken(req)
  if (!token) return next()
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) return next()
    const payload = jwt.verify(token, secret) as { sub: string; role: AuthRequest['userRole'] }
    req.userId = payload.sub
    req.userRole = payload.role
  } catch {
    /* ignore */
  }
  next()
}

export function requireRole(...roles: NonNullable<AuthRequest['userRole']>[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    next()
  }
}
