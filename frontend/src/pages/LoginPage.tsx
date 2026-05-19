import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TanitLogo } from '@/components/TanitLogo'
import { apiFetch } from '@/lib/api'
import { useAuthStore, type AuthUser } from '@/store/auth'

export function LoginPage() {
  const nav = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  const qc = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'CANDIDATE' | 'EMPLOYER'>('CANDIDATE')
  const [companyName, setCompanyName] = useState('')

  const login = useMutation({
    mutationFn: () =>
      apiFetch<{ user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    onSuccess: (data) => {
      setUser(data.user)
      qc.setQueryData(['me'], data.user)
      void qc.invalidateQueries({ queryKey: ['me'] })
      const fallback = data.user.role === 'EMPLOYER' ? '/recruiter-dashboard' : '/dashboard'
      nav(from || fallback, { replace: true })
    },
  })

  const register = useMutation({
    mutationFn: () =>
      apiFetch<{ user: AuthUser }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          companyName: role === 'EMPLOYER' ? companyName : undefined,
        }),
      }),
    onSuccess: (data) => {
      setUser(data.user)
      qc.setQueryData(['me'], data.user)
      void qc.invalidateQueries({ queryKey: ['me'] })
      const fallback = data.user.role === 'EMPLOYER' ? '/recruiter-dashboard' : '/dashboard'
      nav(from || fallback, { replace: true })
    },
  })

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-black p-10 text-white md:flex">
        <TanitLogo variant="light" />
        <div className="pointer-events-none absolute -left-10 top-20 size-40 rounded-full bg-[var(--yellow)] opacity-40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-10 size-48 rounded-full bg-[var(--mint)] opacity-30 blur-3xl" />
        <div className="relative z-10 max-w-md">
          <h2 className="font-heading text-4xl font-extrabold leading-tight">
            Find your <span className="text-[var(--yellow)]">perfect</span> match with AI
          </h2>
          <ul className="mt-8 space-y-3 text-sm">
            {['Smart CV parsing', 'Transparent compatibility scores', 'Realtime employer alerts'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="text-[var(--mint)]">✓</span> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 text-xs text-white/50">© Tanit Talent AI</p>
      </div>

      <div className="flex items-center justify-center bg-[var(--bg)] p-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-white p-8 shadow-xl">
          <Tabs defaultValue="signin">
            <TabsList className="w-full">
              <TabsTrigger className="flex-1" value="signin">
                Sign In
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="signup">
                Sign Up
              </TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="space-y-4">
              <h3 className="font-heading text-2xl font-extrabold">Welcome back</h3>
              <div>
                <Label>Email</Label>
                <Input className="mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label>Password</Label>
                <Input className="mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-[var(--gray)]">
                  <input type="checkbox" className="rounded" /> Remember me
                </label>
                <button type="button" className="font-semibold underline">
                  Forgot password
                </button>
              </div>
              <Button className="w-full rounded-full" type="button" onClick={() => login.mutate()} disabled={login.isPending}>
                Sign In
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" type="button" className="rounded-full">
                  Google
                </Button>
                <Button variant="outline" type="button" className="rounded-full">
                  LinkedIn
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="signup" className="space-y-4">
              <h3 className="font-heading text-2xl font-extrabold">Create account</h3>
              <div className="flex gap-2 rounded-full bg-[var(--bg)] p-1">
                <button
                  type="button"
                  className={`flex-1 rounded-full py-2 text-sm font-bold ${role === 'CANDIDATE' ? 'bg-black text-white' : ''}`}
                  onClick={() => setRole('CANDIDATE')}
                >
                  Candidate
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-full py-2 text-sm font-bold ${role === 'EMPLOYER' ? 'bg-black text-white' : ''}`}
                  onClick={() => setRole('EMPLOYER')}
                >
                  Employer
                </button>
              </div>
              <div>
                <Label>Name</Label>
                <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              {role === 'EMPLOYER' && (
                <div>
                  <Label>Company name</Label>
                  <Input className="mt-1" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
              )}
              <div>
                <Label>Email</Label>
                <Input className="mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label>Password</Label>
                <Input className="mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button className="w-full rounded-full" type="button" onClick={() => register.mutate()} disabled={register.isPending}>
                Create account
              </Button>
            </TabsContent>
          </Tabs>
          <p className="mt-6 text-center text-sm text-[var(--gray)]">
            <Link to="/jobs" className="font-bold text-black underline">
              Browse jobs without an account
            </Link>
          </p>
          {(login.error || register.error) && (
            <p className="mt-4 text-center text-sm text-red-600">{String((login.error || register.error) as Error)}</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
