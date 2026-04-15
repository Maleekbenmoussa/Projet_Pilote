import { Router } from 'express'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import type { AuthRequest } from '../middleware/auth'
import { authRequired, optionalAuth, requireRole } from '../middleware/auth'

const router = Router()

router.get('/', optionalAuth, async (req, res) => {
  const q = z
    .object({
      keyword: z.string().optional(),
      location: z.string().optional(),
      type: z.string().optional(),
      salaryMin: z.coerce.number().optional(),
      sort: z.enum(['newest', 'salary']).optional().default('newest'),
      take: z.coerce.number().min(1).max(100).optional().default(50),
      skip: z.coerce.number().min(0).optional().default(0),
    })
    .parse(req.query)

  const andConditions: Prisma.JobWhereInput[] = []

  if (q.keyword) {
    andConditions.push({
      OR: [
        { title: { contains: q.keyword, mode: 'insensitive' } },
        { description: { contains: q.keyword, mode: 'insensitive' } },
      ],
    })
  }
  if (q.location) {
    andConditions.push({ location: { contains: q.location, mode: 'insensitive' } })
  }
  if (q.type) {
    andConditions.push({ type: { equals: q.type, mode: 'insensitive' } })
  }
  if (q.salaryMin != null) {
    andConditions.push({
      OR: [{ salaryMax: { gte: q.salaryMin } }, { salaryMin: { gte: q.salaryMin } }],
    })
  }

  const where: Prisma.JobWhereInput = andConditions.length ? { AND: andConditions } : {}

  const orderBy: Prisma.JobOrderByWithRelationInput[] =
    q.sort === 'salary'
      ? [{ salaryMax: 'desc' }, { createdAt: 'desc' }]
      : [{ createdAt: 'desc' }]

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        employer: {
          select: { id: true, companyName: true, logoUrl: true, location: true },
        },
      },
      orderBy,
      take: q.take,
      skip: q.skip,
    }),
    prisma.job.count({ where }),
  ])

  res.json({ jobs, total, skip: q.skip, take: q.take })
})

router.get('/mine', authRequired, requireRole('EMPLOYER', 'ADMIN'), async (req: AuthRequest, res) => {
  if (req.userRole === 'ADMIN') {
    const jobs = await prisma.job.findMany({
      include: {
        employer: { select: { id: true, companyName: true, logoUrl: true, location: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ jobs })
    return
  }

  const employer = await prisma.employer.findUnique({ where: { userId: req.userId! } })
  if (!employer) {
    res.status(400).json({ error: 'Employer profile missing' })
    return
  }

  const jobs = await prisma.job.findMany({
    where: { employerId: employer.id },
    include: {
      employer: { select: { id: true, companyName: true, logoUrl: true, location: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  res.json({ jobs })
})

router.get('/:id', optionalAuth, async (req, res) => {
  const id = String(req.params.id)
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      employer: {
        select: { id: true, companyName: true, description: true, logoUrl: true, location: true },
      },
    },
  })
  if (!job) {
    res.status(404).json({ error: 'Job not found' })
    return
  }
  res.json({ job })
})

const createJobSchema = z.object({
  title: z.string().min(1),
  type: z.string().min(1),
  location: z.string().min(1),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  description: z.string().optional(),
  skills: z.array(z.string()).optional().default([]),
})

router.post('/', authRequired, requireRole('EMPLOYER', 'ADMIN'), async (req: AuthRequest, res) => {
  const parsed = createJobSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const employer = await prisma.employer.findUnique({ where: { userId: req.userId! } })
  if (!employer) {
    res.status(400).json({ error: 'Employer profile missing' })
    return
  }

  const job = await prisma.job.create({
    data: {
      ...parsed.data,
      employerId: employer.id,
      skills: parsed.data.skills ?? [],
    },
    include: { employer: true },
  })

  res.status(201).json({ job })
})

const updateJobSchema = createJobSchema.partial()

router.put('/:id', authRequired, requireRole('EMPLOYER', 'ADMIN'), async (req: AuthRequest, res) => {
  const parsed = updateJobSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const employer = await prisma.employer.findUnique({ where: { userId: req.userId! } })
  const jid = String(req.params.id)
  const job = await prisma.job.findUnique({ where: { id: jid } })
  if (!job) {
    res.status(404).json({ error: 'Job not found' })
    return
  }
  if (req.userRole !== 'ADMIN' && job.employerId !== employer?.id) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const updated = await prisma.job.update({
    where: { id: jid },
    data: {
      ...parsed.data,
      skills: parsed.data.skills,
    },
    include: { employer: true },
  })

  res.json({ job: updated })
})

router.delete('/:id', authRequired, requireRole('EMPLOYER', 'ADMIN'), async (req: AuthRequest, res) => {
  const employer = await prisma.employer.findUnique({ where: { userId: req.userId! } })
  const jid = String(req.params.id)
  const job = await prisma.job.findUnique({ where: { id: jid } })
  if (!job) {
    res.status(404).json({ error: 'Job not found' })
    return
  }
  if (req.userRole !== 'ADMIN' && job.employerId !== employer?.id) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  await prisma.job.delete({ where: { id: jid } })
  res.json({ ok: true })
})

export default router
