import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import type { AuthRequest } from '../middleware/auth'
import { authRequired } from '../middleware/auth'

const router = Router()

type DbRole = 'CANDIDATE' | 'EMPLOYER' | 'ADMIN'
type ApiRole = 'candidat' | 'recruteur' | 'admin'

function toDbRole(input: string): DbRole {
  const role = input.trim().toUpperCase()
  if (role === 'CANDIDAT' || role === 'CANDIDATE') return 'CANDIDATE'
  if (role === 'RECRUTEUR' || role === 'RECRUITER' || role === 'EMPLOYER') return 'EMPLOYER'
  if (role === 'ADMIN') return 'ADMIN'
  throw new Error('Invalid role')
}

function toApiRole(role: DbRole): ApiRole {
  if (role === 'CANDIDATE') return 'candidat'
  if (role === 'EMPLOYER') return 'recruteur'
  return 'admin'
}

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string().optional().default('candidat'),
  companyName: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

function signToken(userId: string, role: DbRole) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET missing')
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn']
  return jwt.sign({ sub: userId, role }, secret, { expiresIn })
}

function cookieOptions() {
  const isProd = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProd,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
}

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  let role: DbRole
  try {
    role = toDbRole(parsed.data.role)
  } catch {
    res.status(400).json({ error: 'Role must be candidat, recruteur or admin.' })
    return
  }

  const { name, email, password, companyName } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    res.status(409).json({ error: 'Email already registered' })
    return
  }

  const hash = await bcrypt.hash(password, 10)

  const user = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: { name, email, password: hash, role },
    })

    if (role === 'CANDIDATE') {
      await tx.candidate.create({
        data: { userId: u.id, skills: [], bio: '' },
      })
    }

    if (role === 'EMPLOYER') {
      await tx.employer.create({
        data: {
          userId: u.id,
          companyName: companyName?.trim() || `${name}'s Company`,
          description: '',
          location: '',
        },
      })
    }

    return u
  })

  const token = signToken(user.id, user.role)
  res.cookie('token', token, cookieOptions())

  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roleLabel: toApiRole(user.role),
      avatarUrl: user.avatarUrl ?? null,
    },
  })
})

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const token = signToken(user.id, user.role)
  res.cookie('token', token, cookieOptions())

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roleLabel: toApiRole(user.role),
      avatarUrl: user.avatarUrl ?? null,
    },
  })
})

router.post('/logout', (_req, res) => {
  res.clearCookie('token', { path: '/' })
  res.json({ ok: true })
})

router.get('/me', authRequired, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, createdAt: true },
  })
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.json({ user: { ...user, role: user.role, roleLabel: toApiRole(user.role) } })
})

export default router
