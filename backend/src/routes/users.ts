import fs from 'fs'
import path from 'path'
import { Router } from 'express'
import multer from 'multer'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import type { AuthRequest } from '../middleware/auth'
import { authRequired, requireRole } from '../middleware/auth'

const router = Router()

const uploadDir = process.env.UPLOAD_DIR || './uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
    const safe = `avatar-${Date.now()}${ext.replace(/[^.a-z0-9]/gi, '')}`
    cb(null, safe)
  },
})

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype)
    if (!ok) {
      cb(new Error('Formats acceptés: JPEG, PNG, WebP, GIF'))
      return
    }
    cb(null, true)
  },
})

type ApiRole = 'candidat' | 'recruteur' | 'admin'

function toApiRole(role: 'CANDIDATE' | 'EMPLOYER' | 'ADMIN'): ApiRole {
  if (role === 'CANDIDATE') return 'candidat'
  if (role === 'EMPLOYER') return 'recruteur'
  return 'admin'
}

router.get('/me', authRequired, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    include: { candidate: true, employer: true },
  })
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  res.json({
    user: {
      id: user.id,
      nom: user.name,
      email: user.email,
      role: toApiRole(user.role),
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    },
    profil:
      user.role === 'CANDIDATE'
        ? {
            cv_path: user.candidate?.cvUrl ?? null,
            bio: user.candidate?.bio ?? '',
            competences: user.candidate?.skills ?? [],
            score: user.candidate?.score ?? 0,
          }
        : {
            companyName: user.employer?.companyName ?? '',
            description: user.employer?.description ?? '',
            location: user.employer?.location ?? '',
          },
  })
})

const updateMeSchema = z.object({
  nom: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  profil: z
    .object({
      bio: z.string().max(2000).optional(),
      competences: z.array(z.string().min(1)).optional(),
      cv_path: z.string().optional(),
      companyName: z.string().optional(),
      description: z.string().optional(),
      location: z.string().optional(),
    })
    .optional(),
})

router.put('/me', authRequired, async (req: AuthRequest, res) => {
  const parsed = updateMeSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const { nom, email, profil } = parsed.data

  if (email) {
    const existing = await prisma.user.findFirst({
      where: { email, id: { not: req.userId! } },
      select: { id: true },
    })
    if (existing) {
      res.status(409).json({ error: 'Email already used by another account' })
      return
    }
  }

  await prisma.user.update({
    where: { id: req.userId! },
    data: {
      name: nom,
      email,
    },
  })

  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { role: true },
  })

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  if (user.role === 'CANDIDATE' && profil) {
    await prisma.candidate.update({
      where: { userId: req.userId! },
      data: {
        bio: profil.bio,
        skills: profil.competences,
        cvUrl: profil.cv_path,
      },
    })
  }

  if (user.role === 'EMPLOYER' && profil) {
    await prisma.employer.update({
      where: { userId: req.userId! },
      data: {
        companyName: profil.companyName,
        description: profil.description,
        location: profil.location,
      },
    })
  }

  res.json({ ok: true })
})

router.post('/me/avatar', authRequired, (req, res, next) => {
  avatarUpload.single('photo')(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: String(err.message || err) })
      return
    }
    next()
  })
}, async (req: AuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Aucun fichier' })
    return
  }

  const prev = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { avatarUrl: true },
  })

  const publicUrl = `/uploads/${path.basename(req.file.path)}`

  await prisma.user.update({
    where: { id: req.userId! },
    data: { avatarUrl: publicUrl },
  })

  if (prev?.avatarUrl?.startsWith('/uploads/')) {
    const oldName = path.basename(prev.avatarUrl)
    const oldPath = path.join(uploadDir, oldName)
    if (oldPath !== req.file.path && fs.existsSync(oldPath)) {
      try {
        fs.unlinkSync(oldPath)
      } catch {
        /* ignore */
      }
    }
  }

  res.json({ avatarUrl: publicUrl })
})

router.get('/', authRequired, requireRole('ADMIN'), async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, createdAt: true },
  })

  res.json({
    users: users.map((u) => ({
      id: u.id,
      nom: u.name,
      email: u.email,
      role: toApiRole(u.role),
      avatarUrl: u.avatarUrl,
      createdAt: u.createdAt,
    })),
  })
})

router.delete('/:id', authRequired, requireRole('ADMIN'), async (req: AuthRequest, res) => {
  const id = String(req.params.id)
  const target = await prisma.user.findUnique({ where: { id }, select: { id: true } })
  if (!target) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  await prisma.user.delete({ where: { id } })
  res.json({ ok: true })
})

export default router
