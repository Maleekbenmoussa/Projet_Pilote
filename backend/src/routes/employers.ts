import { Router } from 'express'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { optionalAuth } from '../middleware/auth'

const router = Router()

router.get('/', optionalAuth, async (req, res) => {
  const q = z
    .object({
      keyword: z.string().optional(),
      sort: z.enum(['name', 'jobs']).optional().default('name'),
      take: z.coerce.number().min(1).max(100).optional().default(50),
      skip: z.coerce.number().min(0).optional().default(0),
    })
    .parse(req.query)

  const where: Prisma.EmployerWhereInput = {}
  if (q.keyword) {
    where.OR = [
      { companyName: { contains: q.keyword, mode: 'insensitive' } },
      { description: { contains: q.keyword, mode: 'insensitive' } },
      { location: { contains: q.keyword, mode: 'insensitive' } },
    ]
  }

  const orderBy: Prisma.EmployerOrderByWithRelationInput =
    q.sort === 'jobs' ? { jobs: { _count: 'desc' } } : { companyName: 'asc' }

  const [employers, total] = await Promise.all([
    prisma.employer.findMany({
      where,
      include: {
        _count: { select: { jobs: true } },
      },
      orderBy,
      take: q.take,
      skip: q.skip,
    }),
    prisma.employer.count({ where }),
  ])

  res.json({ employers, total, skip: q.skip, take: q.take })
})

router.get('/:id', optionalAuth, async (req, res) => {
  const id = String(req.params.id)
  const employer = await prisma.employer.findUnique({
    where: { id },
    include: {
      jobs: { take: 20, orderBy: { createdAt: 'desc' } },
      _count: { select: { jobs: true } },
    },
  })
  if (!employer) {
    res.status(404).json({ error: 'Employer not found' })
    return
  }
  res.json({ employer })
})

export default router
