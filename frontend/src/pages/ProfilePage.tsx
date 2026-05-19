import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'

type UserMe = {
  user: {
    id: string
    nom: string
    email: string
    role: 'candidat' | 'recruteur' | 'admin'
    avatarUrl?: string | null
  }
  profil:
    | {
        bio?: string
        competences?: string[]
        cv_path?: string | null
      }
    | {
        companyName?: string
        description?: string
        location?: string
      }
}

export function ProfilePage() {
  const qc = useQueryClient()
  const me = useQuery({
    queryKey: ['users-me'],
    queryFn: () => apiFetch<UserMe>('/api/users/me'),
  })

  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [competences, setCompetences] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')

  useEffect(() => {
    const sync = me.data
    if (!sync) return
    setNom(sync.user.nom)
    setEmail(sync.user.email)
    if (sync.user.role === 'candidat') {
      const p = sync.profil as { bio?: string; competences?: string[] }
      setBio(p.bio ?? '')
      setCompetences((p.competences ?? []).join(', '))
    } else {
      const p = sync.profil as { companyName?: string; description?: string; location?: string }
      setCompanyName(p.companyName ?? '')
      setDescription(p.description ?? '')
      setLocation(p.location ?? '')
    }
  }, [me.data])

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData()
      fd.append('photo', file)
      const res = await fetch('/api/users/me/avatar', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error || res.statusText)
      }
      return res.json() as Promise<{ avatarUrl: string }>
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['users-me'] })
      await qc.invalidateQueries({ queryKey: ['me'] })
    },
  })

  const save = useMutation({
    mutationFn: () => {
      const isCandidate = me.data?.user.role === 'candidat'
      return apiFetch<{ ok: boolean }>('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          nom,
          email,
          profil: isCandidate
            ? {
                bio,
                competences: competences
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              }
            : {
                companyName,
                description,
                location,
              },
        }),
      })
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['users-me'] })
      await qc.invalidateQueries({ queryKey: ['me'] })
    },
  })

  if (me.isLoading) {
    return <div className="p-8 text-[var(--gray)]">Chargement du profil…</div>
  }

  if (!me.data) {
    return <div className="p-8 text-red-600">Impossible de charger le profil.</div>
  }

  const isCandidate = me.data.user.role === 'candidat'

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Mon profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              {me.data.user.avatarUrl ? (
                <img
                  src={me.data.user.avatarUrl}
                  alt=""
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-[var(--border)]"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg)] text-lg font-semibold text-[var(--gray)] ring-2 ring-[var(--border)]">
                  {(me.data.user.nom || '?')
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join('')
                    .toUpperCase() || '?'}
                </div>
              )}
              <div>
                <Label htmlFor="avatar">Photo de profil</Label>
                <p className="mt-1 text-xs text-[var(--gray)]">JPEG, PNG, WebP ou GIF — max 2 Mo.</p>
              </div>
            </div>
            <div className="sm:ml-auto">
              <Input
                id="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="cursor-pointer text-sm"
                disabled={uploadAvatar.isPending}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  e.target.value = ''
                  if (f) uploadAvatar.mutate(f)
                }}
              />
            </div>
          </div>
          {uploadAvatar.isError && (
            <p className="text-sm text-red-600">{(uploadAvatar.error as Error).message}</p>
          )}
          {uploadAvatar.isSuccess && <p className="text-sm text-green-700">Photo enregistrée.</p>}

          <div>
            <Label>Nom</Label>
            <Input className="mt-1" value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input className="mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Rôle</Label>
            <Input className="mt-1" value={me.data.user.role} readOnly />
          </div>

          {isCandidate ? (
            <>
              <div>
                <Label>Bio</Label>
                <Textarea className="mt-1" value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <div>
                <Label>Compétences (séparées par virgules)</Label>
                <Input className="mt-1" value={competences} onChange={(e) => setCompetences(e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label>Nom entreprise</Label>
                <Input className="mt-1" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea className="mt-1" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <Label>Localisation</Label>
                <Input className="mt-1" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </>
          )}

          <Button
            type="button"
            className="rounded-full"
            onClick={() => save.mutate()}
            disabled={save.isPending}
          >
            Modifier
          </Button>
          {save.isError && <p className="text-sm text-red-600">{(save.error as Error).message}</p>}
          {save.isSuccess && <p className="text-sm text-green-700">Profil mis à jour.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
