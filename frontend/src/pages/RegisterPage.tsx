import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'
import { useAuthStore, type AuthUser } from '@/store/auth'

export function RegisterPage() {
  const nav = useNavigate()
  const qc = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'candidat' | 'recruteur'>('candidat')

  const register = useMutation({
    mutationFn: () =>
      apiFetch<{ user: AuthUser }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: nom,
          email,
          password,
          role,
        }),
      }),
    onSuccess: (data) => {
      setUser(data.user)
      qc.setQueryData(['me'], data.user)
      void qc.invalidateQueries({ queryKey: ['me'] })
      const fallback = data.user.role === 'EMPLOYER' ? '/recruiter-dashboard' : '/dashboard'
      nav(fallback)
    },
  })

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Créer un compte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nom</Label>
            <Input className="mt-1" value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input className="mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Mot de passe</Label>
            <Input className="mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <Label>Rôle</Label>
            <select
              className="mt-1 h-11 w-full rounded-full border border-[var(--border)] bg-white px-4 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as 'candidat' | 'recruteur')}
            >
              <option value="candidat">Candidat</option>
              <option value="recruteur">Recruteur</option>
            </select>
          </div>

          <Button
            type="button"
            className="w-full rounded-full"
            disabled={register.isPending || !nom || !email || !password}
            onClick={() => register.mutate()}
          >
            Créer le compte
          </Button>

          {register.isError && (
            <p className="text-sm text-red-600">{(register.error as Error).message}</p>
          )}

          <p className="text-sm text-[var(--gray)]">
            Déjà inscrit ?{' '}
            <Link to="/login" className="font-semibold text-black underline">
              Se connecter
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
