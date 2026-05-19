import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  Send,
  Sparkles,
  Bell,
  Settings,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/PageTransition'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard', label: 'My Profile', icon: User },
  { to: '/dashboard', label: 'My CV', icon: FileText },
  { to: '/jobs', label: 'Browse Jobs', icon: Briefcase },
  { to: '/dashboard', label: 'My Applications', icon: Send },
  { to: '/dashboard', label: 'AI Suggestions', icon: Sparkles },
  { to: '/dashboard', label: 'Notifications', icon: Bell, badge: 2 },
  { to: '/dashboard', label: 'Settings', icon: Settings },
]

const skills = [
  { name: 'React', pct: 92 },
  { name: 'Node.js', pct: 85 },
  { name: 'PostgreSQL', pct: 70 },
  { name: 'Python', pct: 60 },
  { name: 'Docker', pct: 45 },
]

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [competences, setCompetences] = useState('')

  const apps = useQuery({
    queryKey: ['applications'],
    queryFn: () => apiFetch<{ applications: unknown[] }>('/api/applications/me'),
    enabled: !!user,
  })

  const suggestions = useQuery({
    queryKey: ['ai-suggestions', user?.id],
    queryFn: async () => {
      try {
        return await apiFetch<{ suggestions: { job: unknown; matchPercent: number }[] }>(
          `/api/ai/suggestions-db/${user!.id}`,
        )
      } catch {
        return { suggestions: [] }
      }
    },
    enabled: !!user?.id,
  })

  const uploadCv = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/cv/upload', { method: 'POST', body: fd, credentials: 'include' })
      if (!res.ok) throw new Error('Upload failed')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] })
    },
  })

  const profileQ = useQuery({
    queryKey: ['users-me'],
    queryFn: () =>
      apiFetch<{
        user: { nom: string; email: string; role: 'candidat' | 'recruteur' | 'admin' }
        profil: { bio?: string; competences?: string[]; cv_path?: string | null }
      }>('/api/users/me'),
    enabled: !!user,
  })

  useEffect(() => {
    if (!profileQ.data) return
    setNom(profileQ.data.user.nom ?? '')
    setEmail(profileQ.data.user.email ?? '')
    setBio(profileQ.data.profil?.bio ?? '')
    setCompetences((profileQ.data.profil?.competences ?? []).join(', '))
  }, [profileQ.data])

  const saveProfile = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean }>('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          nom,
          email,
          profil: {
            bio,
            competences: competences
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
          },
        }),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['users-me'] })
      await qc.invalidateQueries({ queryKey: ['me'] })
    },
  })

  const [gauge, setGauge] = useState(0)
  useEffect(() => {
    const t = window.setTimeout(() => setGauge(82), 200)
    return () => window.clearTimeout(t)
  }, [])

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <PageTransition>
      <div className="flex min-h-[calc(100vh-80px)]">
        <aside className="hidden w-[240px] shrink-0 border-r border-[var(--border)] bg-white md:block">
          <div className="flex flex-col items-center gap-2 border-b border-[var(--border)] p-6">
            <div className="flex size-14 items-center justify-center rounded-full bg-[var(--yellow)] text-lg font-extrabold">
              {initials}
            </div>
            <div className="text-center">
              <div className="font-heading font-extrabold">{user?.name}</div>
              <div className="text-xs text-[var(--gray)]">Candidate</div>
            </div>
          </div>
          <nav className="space-y-1 p-3">
            {nav.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                  item.label === 'Dashboard' ? 'bg-black text-white' : 'text-[var(--gray)] hover:bg-[var(--bg)]',
                )}
              >
                <item.icon className="size-4" />
                {item.label}
                {item.badge != null && (
                  <span className="ml-auto rounded-full bg-[var(--yellow)] px-2 py-0.5 text-[10px] font-bold text-black">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 space-y-8 p-4 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-extrabold">Welcome back, {user?.name?.split(' ')[0]}</h1>
              <p className="text-sm text-[var(--gray)]">Your AI-powered career cockpit.</p>
            </div>
            <div>
              <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && uploadCv.mutate(e.target.files[0])} />
              <Button variant="yellow" className="rounded-full" type="button" onClick={() => fileRef.current?.click()} disabled={uploadCv.isPending}>
                Upload New CV
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Applications Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="inline-flex rounded-full bg-[var(--lavender)] px-3 py-1 text-2xl font-extrabold">
                  {apps.data?.applications?.length ?? 0}
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Interviews Scheduled</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="inline-flex rounded-full bg-[var(--mint)] px-3 py-1 text-2xl font-extrabold">2</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI Compatibility</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="inline-flex rounded-full bg-[var(--yellow)] px-3 py-1 text-2xl font-extrabold">82%</span>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mon profil (candidat)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Nom</Label>
                  <Input className="mt-1" value={nom} onChange={(e) => setNom(e.target.value)} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input className="mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea className="mt-1" value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <div>
                <Label>Compétences (séparées par virgules)</Label>
                <Input
                  className="mt-1"
                  value={competences}
                  onChange={(e) => setCompetences(e.target.value)}
                  placeholder="React, Node.js, PostgreSQL"
                />
              </div>
              {profileQ.data?.profil?.cv_path && (
                <p className="text-xs text-[var(--gray)]">CV uploadé: {profileQ.data.profil.cv_path}</p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  className="rounded-full"
                  onClick={() => saveProfile.mutate()}
                  disabled={saveProfile.isPending || profileQ.isLoading}
                >
                  Modifier mon profil
                </Button>
                {saveProfile.isSuccess && (
                  <span className="text-sm font-medium text-green-700">Profil mis à jour.</span>
                )}
                {saveProfile.isError && (
                  <span className="text-sm font-medium text-red-600">
                    {(saveProfile.error as Error).message}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI CV Analysis</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8 lg:grid-cols-[220px_1fr]">
              <div className="flex flex-col items-center justify-center">
                <div
                  className="relative flex size-44 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(var(--mint) ${gauge * 3.6}deg, var(--border) 0deg)`,
                  }}
                >
                  <div className="flex size-32 items-center justify-center rounded-full bg-white font-heading text-3xl font-extrabold">
                    {gauge}%
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {skills.map((s) => (
                  <div key={s.name}>
                    <div className="mb-1 flex justify-between text-sm font-semibold">
                      <span>{s.name}</span>
                      <span>{s.pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
                      <motion.div
                        className="h-full rounded-full bg-[var(--mint)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${s.pct}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
                <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg)]/50 p-4 text-sm text-[var(--gray)]">
                  <strong className="text-black">Suggestions:</strong> Add quantified impact to your React projects and mention Prisma + PostgreSQL in your summary.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Job Matches</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(suggestions.data?.suggestions as { job?: { title?: string; employer?: { companyName?: string } }; matchPercent?: number }[] | undefined)?.map(
                (row, i) => (
                  <div key={i} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3">
                    <div>
                      <div className="font-heading font-extrabold">{row.job && 'title' in row.job ? row.job.title : 'Matched role'}</div>
                      <div className="text-sm text-[var(--mint)]">{row.job && 'employer' in row.job ? row.job.employer?.companyName : 'Tanit Labs'}</div>
                    </div>
                    <span className="rounded-full bg-[var(--mint)] px-3 py-1 text-xs font-bold">{row.matchPercent ?? 88}% match</span>
                  </div>
                ),
              )}
              {(!suggestions.data?.suggestions || suggestions.data.suggestions.length === 0) && (
                <p className="text-sm text-[var(--gray)]">Upload a CV or browse jobs to populate matches.</p>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </PageTransition>
  )
}
