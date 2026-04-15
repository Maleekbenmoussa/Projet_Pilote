import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { PageTransition } from '@/components/PageTransition'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'

type EmployerRow = {
  id: string
  companyName: string
  description: string | null
  location: string | null
  logoUrl: string | null
  _count: { jobs: number }
}

export function EmployersPage() {
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState<'name' | 'jobs'>('name')

  const q = useQuery({
    queryKey: ['employers', keyword, sort],
    queryFn: () => {
      const p = new URLSearchParams()
      if (keyword) p.set('keyword', keyword)
      p.set('sort', sort)
      return apiFetch<{ employers: EmployerRow[]; total: number }>(`/api/employers?${p.toString()}`)
    },
  })

  const list = q.data?.employers ?? []

  return (
    <PageTransition>
      <section className="border-b border-[var(--border)] bg-[var(--bg)] py-12">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-extrabold">Employers</h1>
          <div className="mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Search companies"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="bg-white"
            />
            <Button variant="yellow" className="rounded-full" type="button" onClick={() => q.refetch()}>
              Search
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold text-[var(--gray)]">{q.data?.total ?? 0} companies</p>
          <select
            className="h-10 rounded-full border border-[var(--border)] bg-white px-4 text-sm font-semibold"
            value={sort}
            onChange={(e) => setSort(e.target.value as 'name' | 'jobs')}
          >
            <option value="name">Sort: Name</option>
            <option value="jobs">Sort: Open jobs</option>
          </select>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {list.map((e, i) => (
            <div
              key={e.id}
              className={cn(
                'flex flex-col rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition-all',
                'hover:-translate-y-0.5 hover:border-black hover:shadow-lg',
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[var(--bg)] text-xl font-bold">
                  {e.companyName.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-xl font-extrabold">{e.companyName}</h2>
                    {i === 0 && (
                      <span className="rounded-full bg-[var(--orange)] px-2 py-0.5 text-xs font-bold">Featured</span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--gray)]">
                    {e.location || 'Global'} · Hiring partner
                  </p>
                </div>
              </div>
              <p className="mt-4 line-clamp-3 text-sm text-[var(--gray)]">{e.description || 'Growing team building with Tanit Talent AI.'}</p>
              <div className="mt-6">
                <Button variant="yellow" className="rounded-full" asChild>
                  <Link to={`/jobs?keyword=${encodeURIComponent(e.companyName)}`}>
                    Open Jobs — {e._count.jobs}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        {q.isLoading && <p className="mt-6 text-[var(--gray)]">Loading…</p>}
        {!q.isLoading && list.length === 0 && <p className="mt-6 text-[var(--gray)]">No employers found.</p>}
      </div>
    </PageTransition>
  )
}
