import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
import { PageTransition } from '@/components/PageTransition'
import { apiFetch } from '@/lib/api'
import type { Job } from '@/types/job'
import { cn } from '@/lib/utils'

function aiScore(id: string) {
  return 68 + (id.charCodeAt(2) % 28)
}

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship']
const experiences = ['Junior', 'Mid', 'Senior', 'Lead']

export function JobsPage() {
  const [params] = useSearchParams()
  const [keyword, setKeyword] = useState(params.get('keyword') ?? '')
  const [location, setLocation] = useState(params.get('location') ?? '')
  const [type, setType] = useState('')
  const [experience, setExperience] = useState('')
  const [salaryMin, setSalaryMin] = useState(3000)
  const [aiMin, setAiMin] = useState(0)
  const [types, setTypes] = useState<string[]>([])
  const [sort, setSort] = useState<'newest' | 'salary'>('newest')

  const qs = useMemo(() => {
    const q = new URLSearchParams()
    if (keyword) q.set('keyword', keyword)
    if (location) q.set('location', location)
    if (type) q.set('type', type)
    q.set('sort', sort)
    q.set('salaryMin', String(salaryMin))
    return q.toString()
  }, [keyword, location, type, sort, salaryMin])

  const q = useQuery({
    queryKey: ['jobs', qs],
    queryFn: () => apiFetch<{ jobs: Job[]; total: number }>(`/api/jobs?${qs}&take=50`),
  })

  let jobs = q.data?.jobs ?? []

  if (experience) {
    jobs = jobs.filter((j) => j.title.toLowerCase().includes(experience.toLowerCase()) || j.description?.toLowerCase().includes(experience.toLowerCase()))
  }
  if (types.length) {
    jobs = jobs.filter((j) => types.some((t) => j.type.toLowerCase() === t.toLowerCase()))
  }
  jobs = jobs.filter((j) => aiScore(j.id) >= aiMin)

  return (
    <PageTransition>
      <section className="border-b border-[var(--border)] bg-[var(--bg)] py-12">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-extrabold">Find Your Dream Job</h1>
          <form
            className="mt-6 grid gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_1fr_1fr_auto]"
            onSubmit={(e) => e.preventDefault()}
          >
            <Input placeholder="Keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            <select
              className="h-11 rounded-full border border-[var(--border)] bg-white px-4 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Job Type</option>
              {jobTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              className="h-11 rounded-full border border-[var(--border)] bg-white px-4 text-sm"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            >
              <option value="">Experience</option>
              {experiences.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <Button type="button" variant="yellow" className="rounded-full" onClick={() => q.refetch()}>
              Search
            </Button>
          </form>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <Card className="h-fit">
          <CardContent className="space-y-6 pt-6">
            <div>
              <Label className="mb-2 block">Job Type</Label>
              <div className="space-y-2">
                {jobTypes.map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={types.includes(t)}
                      onChange={() =>
                        setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
                      }
                      className="rounded border-[var(--border)]"
                    />
                    {t}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Experience focus</Label>
              <div className="space-y-2">
                {experiences.map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="exp"
                      checked={experience === t}
                      onChange={() => setExperience(t)}
                      className="border-[var(--border)]"
                    />
                    {t}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Min. salary (TND)</Label>
              <Slider min={1000} max={12000} step={100} value={[salaryMin]} onValueChange={(v) => setSalaryMin(v[0] ?? 3000)} />
              <div className="mt-1 text-xs text-[var(--gray)]">{salaryMin.toLocaleString()} TND</div>
            </div>
            <div>
              <Label className="mb-2 block">AI Score min</Label>
              <Slider min={0} max={100} step={1} value={[aiMin]} onValueChange={(v) => setAiMin(v[0] ?? 0)} />
              <div className="mt-1 text-xs text-[var(--gray)]">{aiMin}</div>
            </div>
          </CardContent>
        </Card>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-semibold text-[var(--gray)]">
              {jobs.length} results {q.data?.total != null ? `(of ${q.data.total} total)` : ''}
            </p>
            <select
              className="h-10 rounded-full border border-[var(--border)] bg-white px-4 text-sm font-semibold"
              value={sort}
              onChange={(e) => setSort(e.target.value as 'newest' | 'salary')}
            >
              <option value="newest">Sort: Newest</option>
              <option value="salary">Sort: Salary</option>
            </select>
          </div>

          <div className="mt-6 space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={cn(
                  'flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 transition-all',
                  'hover:border-black hover:shadow-md',
                )}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--bg)] text-lg font-bold">
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
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-bold">
                      {job.salaryMin != null && job.salaryMax != null
                        ? `${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()} TND`
                        : '—'}
                    </span>
                    <span className="rounded-full bg-[var(--mint)] px-3 py-1 text-xs font-bold">AI {aiScore(job.id)}</span>
                    <Button variant="outline" size="sm" className="rounded-full" asChild>
                      <Link to="/login">Apply</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {q.isLoading && <p>Loading…</p>}
            {!q.isLoading && jobs.length === 0 && <p className="text-[var(--gray)]">No jobs match your filters.</p>}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
