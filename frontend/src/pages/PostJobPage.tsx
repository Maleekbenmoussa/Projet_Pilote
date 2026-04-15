import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { PageTransition } from '@/components/PageTransition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch } from '@/lib/api'

export function PostJobPage() {
  const nav = useNavigate()
  const [title, setTitle] = useState('')
  const [type, setType] = useState('Full-time')
  const [location, setLocation] = useState('')
  const [salaryMin, setSalaryMin] = useState<number | ''>('')
  const [salaryMax, setSalaryMax] = useState<number | ''>('')
  const [description, setDescription] = useState('')
  const [skills, setSkills] = useState('')
  const [experience, setExperience] = useState('Mid')
  const [education, setEducation] = useState('Bachelor')

  const submit = useMutation({
    mutationFn: () =>
      apiFetch<{ job: { id: string } }>('/api/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title,
          type,
          location,
          salaryMin: salaryMin === '' ? undefined : Number(salaryMin),
          salaryMax: salaryMax === '' ? undefined : Number(salaryMax),
          description,
          skills: skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      }),
    onSuccess: () => nav('/jobs'),
  })

  return (
    <PageTransition>
      <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6">
        <h1 className="font-heading text-4xl font-extrabold">Post a job</h1>
        <p className="mt-2 text-[var(--gray)]">Publish a role and activate Tanit AI matching for incoming CVs.</p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior React Developer" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Job Type</Label>
                <Input className="mt-1" value={type} onChange={(e) => setType(e.target.value)} />
              </div>
              <div>
                <Label>Location</Label>
                <Input className="mt-1" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Min Salary (TND)</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Max Salary (TND)</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Skills (comma separated)</Label>
              <Input className="mt-1" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, TypeScript, Node.js" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Experience</Label>
                <Input className="mt-1" value={experience} onChange={(e) => setExperience(e.target.value)} />
              </div>
              <div>
                <Label>Education</Label>
                <Input className="mt-1" value={education} onChange={(e) => setEducation(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 rounded-2xl bg-black p-6 text-white">
          <h3 className="font-heading text-lg font-extrabold">AI Enhancement</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {['Auto CV Parsing', 'Skill Matching Score', 'Candidate Ranking', 'Auto Notifications'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="text-[var(--mint)]">✓</span> {t}
              </li>
            ))}
          </ul>
        </div>

        <Button
          className="mt-6 w-full rounded-2xl py-6 text-base"
          onClick={() => submit.mutate()}
          disabled={submit.isPending || !title || !location}
        >
          🚀 Post Job & Activate AI Matching
        </Button>
        {submit.isError && <p className="mt-2 text-sm text-red-600">{(submit.error as Error).message}</p>}
      </div>
    </PageTransition>
  )
}
