import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import type { AuthRequest } from '../middleware/auth'
import { authRequired, requireRole } from '../middleware/auth'

const router = Router()

router.get('/me', authRequired, requireRole('CANDIDATE', 'ADMIN'), async (req: AuthRequest, res) => {
  const candidate = await prisma.candidate.findUnique({ where: { userId: req.userId! } })
  if (!candidate) {
    res.status(400).json({ error: 'Candidate profile missing' })
    return
  }

  const applications = await prisma.application.findMany({
    where: { candidateId: candidate.id },
    include: {
      job: { include: { employer: { select: { companyName: true, logoUrl: true } } } },
    },
    orderBy: { appliedAt: 'desc' },
  })

  res.json({ applications })
})

router.post('/', authRequired, requireRole('CANDIDATE', 'ADMIN'), async (req: AuthRequest, res) => {
  const schema = z.object({ jobId: z.string().min(1) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const candidate = await prisma.candidate.findUnique({ where: { userId: req.userId! } })
  if (!candidate) {
    res.status(400).json({ error: 'Candidate profile missing' })
    return
  }

  const job = await prisma.job.findUnique({ where: { id: parsed.data.jobId } })
  if (!job) {
    res.status(404).json({ error: 'Job not found' })
    return
  }

  try {
    const application = await prisma.application.create({
      data: {
        candidateId: candidate.id,
        jobId: job.id,
      },
      include: { job: { include: { employer: true } } },
    })
    res.status(201).json({ application })
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code
    if (code === 'P2002') {
      res.status(409).json({ error: 'Already applied' })
      return
    }
    throw e
  }
})

export default router
