import { Router } from 'express'
import axios from 'axios'
import { prisma } from '../lib/prisma'
import type { AuthRequest } from '../middleware/auth'
import { authRequired, optionalAuth } from '../middleware/auth'

const router = Router()
const fastapi = () => process.env.FASTAPI_URL || 'http://localhost:8000'

function ruleReply(userText: string): string {
  const t = (userText || '').toLowerCase().trim()
  if (!t) return "Hi! I’m Tanit AI. Ask me about jobs, your CV, or interview tips."
  if (t.includes('job') || t.includes('emploi')) {
    return "I can help you find roles that fit your skills. Try uploading your CV from the dashboard for a compatibility score."
  }
  if (t.includes('cv') || t.includes('resume')) {
    return "Upload a PDF CV (max 5MB) on your candidate dashboard — I’ll extract skills and estimate your match strength."
  }
  if (t.includes('salary') || t.includes('salaire')) {
    return 'Salary ranges depend on role and location — filter jobs on the Browse page and compare listings.'
  }
  return (
    'Thanks for your message. Tanit Talent AI matches candidates using skills overlap and role context. ' +
    'What would you like to explore next?'
  )
}

router.post('/score', authRequired, async (req: AuthRequest, res) => {
  try {
    const { data } = await axios.post(`${fastapi()}/score`, req.body, { timeout: 30_000 })
    res.json(data)
  } catch (e) {
    res.status(502).json({ error: 'AI service unavailable', detail: String(e) })
  }
})

router.post('/match', authRequired, async (req: AuthRequest, res) => {
  try {
    const { data } = await axios.post(`${fastapi()}/match`, req.body, { timeout: 30_000 })
    res.json(data)
  } catch (e) {
    res.status(502).json({ error: 'AI service unavailable', detail: String(e) })
  }
})

router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { data } = await axios.post(`${fastapi()}/chat`, req.body, { timeout: 60_000 })
    res.json(data)
  } catch (e) {
    // Fallback so the app still works when FastAPI is down
    const messages = (req.body?.messages as Array<{ role?: string; content?: string }> | undefined) ?? []
    const lastUser = [...messages].reverse().find((m) => m?.role === 'user')?.content ?? ''
    res.status(200).json({ reply: ruleReply(lastUser), message_id: 'fallback' })
  }
})

router.get('/suggestions/:userId', authRequired, async (req: AuthRequest, res) => {
  if (req.params.userId !== req.userId) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }
  try {
    const { data } = await axios.get(`${fastapi()}/suggestions/${req.params.userId}`, { timeout: 30_000 })
    res.json(data)
  } catch (e) {
    res.status(502).json({ error: 'AI service unavailable', detail: String(e) })
  }
})

/** Fallback job suggestions from DB when FastAPI is down */
router.get('/suggestions-db/:userId', authRequired, async (req: AuthRequest, res) => {
  if (req.params.userId !== req.userId) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }
  const candidate = await prisma.candidate.findUnique({
    where: { userId: req.userId },
    include: { user: true },
  })
  if (!candidate) {
    res.status(400).json({ error: 'Candidate not found' })
    return
  }

  const jobs = await prisma.job.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { employer: { select: { companyName: true, logoUrl: true } } },
  })

  const skills = new Set(candidate.skills.map((s) => s.toLowerCase()))
  const withMatch = jobs.map((job) => {
    let match = 60
    if (skills.size) {
      const overlap = job.skills.filter((s) => skills.has(s.toLowerCase())).length
      match = Math.min(99, 55 + overlap * 8)
    }
    return { job, matchPercent: match }
  })

  res.json({ suggestions: withMatch })
})

export default router
