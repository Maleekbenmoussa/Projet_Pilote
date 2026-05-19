import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Monitor, Search, Smartphone, Tablet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageTransition } from '@/components/PageTransition'
import { apiFetch } from '@/lib/api'
import { useCountUp } from '@/hooks/useCountUp'
import type { Job } from '@/types/job'
import { cn } from '@/lib/utils'

function aiScore(id: string) {
  return 68 + (id.charCodeAt(2) % 28)
}

const categories = [
  { emoji: '💻', label: 'Technology' },
  { emoji: '🏦', label: 'Finance' },
  { emoji: '🎨', label: 'Design' },
  { emoji: '📣', label: 'Marketing' },
  { emoji: '⚙️', label: 'Engineering' },
  { emoji: '🏥', label: 'Healthcare' },
  { emoji: '📚', label: 'Education' },
  { emoji: '🚚', label: 'Logistics' },
]

type Viewport = 'desktop' | 'tablet' | 'mobile'

const viewportMax: Record<Viewport, string> = {
  desktop: 'min(100%, 1536px)',
  tablet: 'min(100%, 1024px)',
  mobile: 'min(100%, 28rem)',
}

export function HomePage() {
  const [viewport, setViewport] = useState<Viewport>('desktop')

  const jobsQ = useQuery({
    queryKey: ['jobs', 'home'],
    queryFn: () => apiFetch<{ jobs: Job[] }>('/api/jobs?take=5'),
  })

  const jobs = jobsQ.data?.jobs ?? []

  const cJobs = useCountUp(12840)
  const cCompanies = useCountUp(842)
  const cPlaced = useCountUp(3120)
  const cAi = useCountUp(56000)

  const toggleBtn = (v: Viewport, icon: React.ReactNode, label: string) => (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setViewport(v)}
      className={cn(
        'relative flex flex-1 cursor-pointer items-center justify-center rounded-2xl py-1.5 text-sm font-medium whitespace-nowrap transition-colors sm:px-4 lg:flex-1',
        viewport === v
          ? 'border border-gray-200 bg-white text-gray-900 shadow-sm'
          : 'border border-transparent text-gray-500 hover:text-gray-700',
      )}
    >
      {icon}
    </button>
  )

  return (
    <PageTransition>
      <div className="bg-gray-50/80 leading-6 text-gray-700">
        <div className="border-b border-gray-200 bg-white/90 px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex shrink-0 items-center gap-2 text-sm" aria-label="Fil d’Ariane">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-gray-500 transition-colors hover:text-gray-800"
              >
                <svg className="size-5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span className="font-medium">Accueil</span>
              </Link>
            </nav>

            <div className="flex w-full flex-1 justify-center sm:px-4">
              <div className="flex w-full max-w-md gap-0.5 rounded-2xl bg-gray-100 p-0.5 sm:max-w-xl lg:max-w-2xl">
                {toggleBtn(
                  'desktop',
                  <Monitor className="size-[18px]" strokeWidth={2} />,
                  'Aperçu bureau',
                )}
                {toggleBtn(
                  'tablet',
                  <Tablet className="size-[18px]" strokeWidth={2} />,
                  'Aperçu tablette',
                )}
                {toggleBtn(
                  'mobile',
                  <Smartphone className="size-[18px]" strokeWidth={2} />,
                  'Aperçu mobile',
                )}
              </div>
            </div>
          </div>
        </div>

        <section className="px-4 py-6 sm:px-6 lg:px-8">
          <div
            className="mx-auto w-full transform transition-[max-width] duration-500 ease-in-out"
            style={{ maxWidth: viewportMax[viewport] }}
          >
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
              <div className="flex h-7 items-center gap-1 rounded-t-xl bg-gray-200 pl-3">
                <span className="size-2 rounded-full bg-white" />
                <span className="size-2 rounded-full bg-white" />
                <span className="size-2 rounded-full bg-white" />
              </div>

              <div className="rounded-b-xl bg-white">
                <section className="bg-white">
                  <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
                    <div>
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-bold text-white"
                      >
                        <span className="size-2 rounded-full bg-[var(--mint)]" />
                        AI Matching Active
                      </motion.div>
                      <h1 className="font-heading text-3xl leading-tight font-extrabold sm:text-4xl lg:text-5xl">
                        When Searching for a job don&apos;t go in blind,{' '}
                        <span className="text-[var(--gray)]">Research first.</span>
                      </h1>
                      <p className="mt-4 max-w-xl text-lg text-[var(--gray)]">
                        Tanit Talent AI surfaces verified roles, salary signals, and compatibility scores tailored to your profile.
                      </p>
                      <form
                        className="mt-8 flex flex-col gap-3 rounded-full border border-[var(--border)] bg-[var(--bg)]/50 p-2 sm:flex-row sm:items-center"
                        onSubmit={(e) => {
                          e.preventDefault()
                          const fd = new FormData(e.currentTarget)
                          const kw = String(fd.get('kw') || '')
                          const loc = String(fd.get('loc') || '')
                          window.location.href = `/jobs?keyword=${encodeURIComponent(kw)}&location=${encodeURIComponent(loc)}`
                        }}
                      >
                        <Input name="kw" placeholder="Job keyword" className="border-0 bg-transparent" />
                        <Input name="loc" placeholder="Location" className="border-0 bg-transparent" />
                        <Button type="submit" variant="yellow" className="rounded-full px-8">
                          <Search className="size-4" />
                          Search
                        </Button>
                      </form>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[var(--gray)]">
                        <span>Popular:</span>
                        {['React', 'Remote', 'Tunis', 'Python'].map((t) => (
                          <Link key={t} to={`/jobs?keyword=${t}`} className="rounded-full bg-white px-3 py-1 shadow-sm hover:bg-[var(--yellow)]">
                            {t}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="relative flex justify-center">
                      <div className="relative flex size-[min(100%,380px)] items-end justify-center rounded-full bg-[var(--yellow)]">
                        <svg viewBox="0 0 200 240" className="h-72 w-auto pb-4">
                          <ellipse cx="100" cy="210" rx="70" ry="18" fill="rgba(0,0,0,0.08)" />
                          <circle cx="100" cy="80" r="36" fill="#fff" stroke="#000" strokeWidth="2" />
                          <path
                            d="M100 116v52c-24 0-44 18-48 40h96c-4-22-24-40-48-40z"
                            fill="#fff"
                            stroke="#000"
                            strokeWidth="2"
                          />
                          <rect x="58" y="150" width="84" height="56" rx="8" fill="#C5CAE9" stroke="#000" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="border-y border-[var(--border)] bg-[var(--bg)] py-12">
                  <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-6 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
                    {[
                      { label: 'Jobs', v: cJobs, suffix: '+' },
                      { label: 'Companies', v: cCompanies, suffix: '+' },
                      { label: 'Placed', v: cPlaced, suffix: '+' },
                      { label: 'AI Matches', v: cAi, suffix: '+' },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <div className="font-heading text-2xl font-extrabold sm:text-3xl lg:text-4xl">
                          {s.v.toLocaleString()}
                          {s.suffix}
                        </div>
                        <div className="text-sm font-semibold text-[var(--gray)]">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white py-12 lg:py-14">
                  <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
                    <h2 className="font-heading text-2xl font-extrabold sm:text-3xl">Browse by category</h2>
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {categories.map((c) => (
                        <Link
                          key={c.label}
                          to={`/jobs?keyword=${encodeURIComponent(c.label)}`}
                          className={cn(
                            'flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)]/40 p-5 transition-all duration-200',
                            'hover:-translate-y-[3px] hover:shadow-lg',
                          )}
                        >
                          <span className="text-3xl">{c.emoji}</span>
                          <span className="font-heading font-extrabold">{c.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="bg-[var(--bg)] py-12 lg:py-16">
                  <div className="mx-auto grid max-w-[1400px] gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
                    <div className="flex items-center justify-center">
                      <div className="rounded-3xl border border-[var(--border)] bg-white p-8 shadow-sm">
                        <svg viewBox="0 0 240 200" className="h-48 w-full max-w-sm">
                          <rect width="240" height="200" rx="16" fill="var(--lavender)" opacity="0.4" />
                          <circle cx="120" cy="90" r="40" fill="var(--yellow)" />
                          <rect x="70" y="140" width="100" height="12" rx="4" fill="#000" opacity="0.2" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h2 className="font-heading text-2xl font-extrabold sm:text-3xl lg:text-4xl">Grow your career</h2>
                      <p className="mt-3 text-[var(--gray)]">
                        One intelligent profile powers unlimited applications — with AI nudging you toward the best-fit openings.
                      </p>
                      <ul className="mt-8 space-y-4">
                        {[
                          '100% Verified Jobs',
                          'One Profile Unlimited Openings',
                          'Personalized Recommendations',
                          'Perfect Job Match',
                        ].map((t) => (
                          <li key={t} className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 shadow-sm">
                            <span className="mt-0.5 text-[var(--mint)]">✓</span>
                            <span className="font-semibold">{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="jobs" className="bg-white py-12 lg:py-16">
                  <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <h2 className="font-heading text-2xl font-extrabold sm:text-3xl">Recent Available Jobs</h2>
                      <Link to="/jobs" className="text-sm font-bold underline">
                        View all
                      </Link>
                    </div>
                    <div className="mt-8 space-y-3">
                      {jobsQ.isLoading && <p className="text-[var(--gray)]">Loading jobs…</p>}
                      {jobs.map((job) => (
                        <div
                          key={job.id}
                          className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)]/30 p-4 transition-all hover:border-black hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex gap-4">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold shadow-inner">
                              {job.employer.companyName.slice(0, 1)}
                            </div>
                            <div>
                              <div className="font-heading text-lg font-extrabold">{job.title}</div>
                              <div className="text-sm font-semibold text-[var(--mint)]">{job.employer.companyName}</div>
                              <div className="text-xs text-[var(--gray)]">
                                {job.type} · {job.location}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                            <span className="text-sm font-bold">
                              {job.salaryMin != null && job.salaryMax != null
                                ? `${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()} TND`
                                : 'Salary on request'}
                            </span>
                            <span className="rounded-full bg-[var(--mint)] px-3 py-1 text-xs font-bold text-black">AI {aiScore(job.id)}</span>
                            <Button variant="outline" size="sm" className="rounded-full" asChild>
                              <Link to={`/jobs?highlight=${job.id}`}>Apply</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                      {!jobsQ.isLoading && jobs.length === 0 && (
                        <p className="text-[var(--gray)]">No jobs yet — start the API and run the database seed.</p>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  )
}
