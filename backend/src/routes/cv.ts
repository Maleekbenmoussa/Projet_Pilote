import fs from 'fs'
import path from 'path'
import { Router } from 'express'
import multer from 'multer'
import pdfParse from 'pdf-parse'
import axios from 'axios'
import { prisma } from '../lib/prisma'
import type { AuthRequest } from '../middleware/auth'
import { authRequired, requireRole } from '../middleware/auth'

const router = Router()

const uploadDir = process.env.UPLOAD_DIR || './uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    cb(null, safe)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('PDF only'))
      return
    }
    cb(null, true)
  },
})

router.post('/upload', authRequired, requireRole('CANDIDATE', 'ADMIN'), upload.single('file'), async (req: AuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' })
    return
  }

  const candidate = await prisma.candidate.findUnique({ where: { userId: req.userId! } })
  if (!candidate) {
    res.status(400).json({ error: 'Candidate profile missing' })
    return
  }

  const buffer = fs.readFileSync(req.file.path)
  let text = ''
  try {
    const data = await pdfParse(buffer)
    text = data.text || ''
  } catch {
    text = ''
  }

  const fastapi = process.env.FASTAPI_URL || 'http://localhost:8000'
  let score = 50
  let skills: string[] = []
  try {
    const { data } = await axios.post(`${fastapi}/score`, { cv_text: text }, { timeout: 30_000 })
    if (typeof data.score === 'number') score = data.score
    if (Array.isArray(data.skills)) skills = data.skills
  } catch {
    /* FastAPI optional at dev time */
  }

  const cvUrl = `/uploads/${path.basename(req.file.path)}`

  await prisma.candidate.update({
    where: { id: candidate.id },
    data: { cvUrl, skills: skills.length ? skills : candidate.skills, score },
  })

  res.json({ cvUrl, score, skills, textPreview: text.slice(0, 500) })
})

export default router
