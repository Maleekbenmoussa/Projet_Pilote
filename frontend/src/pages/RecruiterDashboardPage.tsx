import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { Job } from '@/types/job'

export function RecruiterDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const jobsQ = useQuery({
    queryKey: ['jobs-mine'],
    queryFn: () => apiFetch<{ jobs: Job[] }>('/api/jobs/mine'),
  })

  const jobs = jobsQ.data?.jobs ?? []

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold">Recruiter Dashboard</h1>
          <p className="text-sm text-[var(--gray)]">
            Bonjour {user?.name}, gérez vos offres publiées et suivez votre activité.
          </p>
        </div>
        <Button variant="yellow" className="rounded-full" asChild>
          <Link to="/post-job">Publier une offre</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Offres publiées</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="rounded-full bg-[var(--yellow)] px-3 py-1 text-2xl font-extrabold">
              {jobs.length}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Offres actives</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="rounded-full bg-[var(--mint)] px-3 py-1 text-2xl font-extrabold">
              {jobs.length}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Portail public</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link to="/jobs">Voir les offres côté candidat</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Mes offres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {jobsQ.isLoading && <p className="text-sm text-[var(--gray)]">Chargement…</p>}
          {!jobsQ.isLoading && jobs.length === 0 && (
            <p className="text-sm text-[var(--gray)]">Aucune offre publiée pour le moment.</p>
          )}
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="font-heading font-extrabold">{job.title}</div>
                <div className="text-xs text-[var(--gray)]">
                  {job.type} · {job.location}
                </div>
              </div>
              <div className="text-xs font-semibold text-[var(--gray)]">
                {job.salaryMin != null && job.salaryMax != null
                  ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} TND`
                  : 'Salaire non précisé'}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
