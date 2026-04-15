import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { TanitLogo } from '@/components/TanitLogo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuthStore, type AuthUser } from '@/store/auth'

function UserAvatar({ user }: { user: AuthUser }) {
  const initials = user.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-[var(--border)]"
      />
    )
  }
  return (
    <span
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg)] text-xs font-bold text-[var(--gray)] ring-2 ring-[var(--border)]"
      aria-hidden
    >
      {initials || '?'}
    </span>
  )
}

const mainLinks = [
  { to: '/jobs', label: 'Find Jobs' },
  { to: '/employers', label: 'Employers' },
  { to: '/#pricing', label: 'Pricing' },
  { to: '/#blog', label: 'Blog' },
  { to: '/#contact', label: 'Contact' },
]

const pagesMenu = [
  { to: '/dashboard', label: 'Candidate dashboard' },
  { to: '/post-job', label: 'Post a job' },
  { to: '/jobs', label: 'Browse jobs' },
]

export function Navbar() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const qc = useQueryClient()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
    await qc.invalidateQueries({ queryKey: ['me'] })
    nav('/')
  }

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0">
          <TanitLogo />
        </Link>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 lg:flex">
          {mainLinks.map(({ to, label }) => (
            <NavLink
              key={to + label}
              to={to}
              className={({ isActive }) =>
                cn(
                  'nav-link-underline relative text-sm font-semibold text-[var(--gray)] transition-colors hover:text-black',
                  isActive && 'text-black',
                )
              }
            >
              {label}
            </NavLink>
          ))}
          <div className="relative" ref={ref}>
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-semibold text-[var(--gray)] hover:text-black"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
            >
              Pages
              <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
            </button>
            {open && (
              <div className="absolute left-0 top-full z-50 mt-2 min-w-[220px] rounded-2xl border border-[var(--border)] bg-white py-2 shadow-xl">
                {pagesMenu.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="block px-4 py-2.5 text-sm font-medium hover:bg-[var(--bg)]"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <UserAvatar user={user} />
              <Button variant="ghost" size="sm" className="rounded-full" asChild>
                <Link to="/profile">Profil</Link>
              </Button>
              {user.role === 'CANDIDATE' && (
                <Button variant="ghost" size="sm" className="rounded-full" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              )}
              {user.role === 'EMPLOYER' && (
                <>
                  <Button variant="ghost" size="sm" className="rounded-full" asChild>
                    <Link to="/recruiter-dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-full" asChild>
                    <Link to="/post-job">Post a Job</Link>
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" className="rounded-full border-black" type="button" onClick={() => void logout()}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="rounded-full border-black" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full" asChild>
                <Link to="/register">S'inscrire</Link>
              </Button>
              <Button variant="yellow" size="sm" className="rounded-full" asChild>
                <Link to="/post-job">Post a Job</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
      <style>{`
        .nav-link-underline::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -4px;
          height: 2px;
          width: 0;
          background: black;
          transition: width 0.2s ease;
        }
        .nav-link-underline:hover::after,
        .nav-link-underline.active::after {
          width: 100%;
        }
      `}</style>
    </header>
  )
}
