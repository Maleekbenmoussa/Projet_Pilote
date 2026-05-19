import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const pass = await bcrypt.hash('password123', 10)

  let employerUser = await prisma.user.findUnique({ where: { email: 'employer@tanit.demo' } })
  if (!employerUser) {
    employerUser = await prisma.user.create({
      data: {
        name: 'Demo Employer',
        email: 'employer@tanit.demo',
        password: pass,
        role: Role.EMPLOYER,
        employer: {
          create: {
            companyName: 'Tanit Labs',
            description: 'AI-first hiring partner.',
            location: 'Tunis',
          },
        },
      },
    })
  }

  const employer = await prisma.employer.findUnique({ where: { userId: employerUser.id } })
  if (employer) {
    const n = await prisma.job.count({ where: { employerId: employer.id } })
    if (n === 0) {
      const samples = [
        {
          title: 'Senior Frontend Engineer',
          type: 'Full-time',
          location: 'Remote',
          salaryMin: 4500,
          salaryMax: 6500,
          skills: ['React', 'TypeScript', 'Tailwind'],
          description: 'Build Tanit Talent web experience with React 18 and Vite.',
        },
        {
          title: 'Backend Engineer (Node)',
          type: 'Full-time',
          location: 'Hybrid — Tunis',
          salaryMin: 4000,
          salaryMax: 5800,
          skills: ['Node.js', 'Express', 'Prisma', 'PostgreSQL'],
          description: 'Design APIs and integrations for recruitment workflows.',
        },
        {
          title: 'ML Engineer',
          type: 'Contract',
          location: 'Remote',
          salaryMin: 5000,
          salaryMax: 8000,
          skills: ['Python', 'FastAPI', 'Docker'],
          description: 'Improve CV parsing and job matching pipelines.',
        },
      ]
      for (const s of samples) {
        await prisma.job.create({
          data: {
            ...s,
            employerId: employer.id,
          },
        })
      }
    }
  }

  let candidateUser = await prisma.user.findUnique({ where: { email: 'candidate@tanit.demo' } })
  if (!candidateUser) {
    candidateUser = await prisma.user.create({
      data: {
        name: 'Demo Candidate',
        email: 'candidate@tanit.demo',
        password: pass,
        role: Role.CANDIDATE,
        candidate: {
          create: {
            skills: ['React', 'Node.js', 'PostgreSQL'],
            score: 82,
          },
        },
      },
    })
  }

  console.log('Seed OK:', { employer: 'employer@tanit.demo', candidate: 'candidate@tanit.demo', password: 'password123' })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
