import { useState, useEffect, useMemo } from 'react'
import FileUploader from '@project/project-.jsx'

/** Score / compétences déterministes à partir du nom de fichier (démo sans backend) */
function hashString(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

const MOCK_SKILLS = ['React', 'Node.js', 'PostgreSQL', 'Python', 'Docker', 'TypeScript']

function buildMockAnalysis(fileName) {
  const h = hashString(fileName)
  const score = 65 + (h % 30)
  const skills = MOCK_SKILLS.map((name, i) => ({
    name,
    pct: 45 + ((h >> (i * 3)) % 50),
  }))
  return {
    score,
    skills,
    summary:
      'Analyse simulée (démo locale). Avec le backend Tanit + FastAPI, ce score serait calculé à partir du texte extrait du PDF.',
  }
}

const MOCK_JOBS = [
  { id: 1, title: 'Développeur React', company: 'Tanit Labs', location: 'Tunis / Remote', type: 'CDI', match: 94 },
  { id: 2, title: 'Backend Node.js', company: 'DataFlow', location: 'Hybride', type: 'CDI', match: 87 },
  { id: 3, title: 'Full-stack TypeScript', company: 'StartupTN', location: 'Remote', type: 'Freelance', match: 81 },
  { id: 4, title: 'Ingénieur données Python', company: 'AI Core', location: 'Paris', type: 'CDI', match: 76 },
]

export default function App() {
  const [files, setFiles] = useState([])
  const [analyzing, setAnalyzing] = useState(false)
  const [txtPreview, setTxtPreview] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const [searchLoc, setSearchLoc] = useState('')

  const primaryFile = files[files.length - 1] ?? null

  const analysis = useMemo(() => {
    if (!primaryFile) return null
    return buildMockAnalysis(primaryFile.name)
  }, [primaryFile])

  useEffect(() => {
    if (!primaryFile) {
      setTxtPreview('')
      return
    }
    setAnalyzing(true)
    const t = setTimeout(() => setAnalyzing(false), 900)

    if (primaryFile.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = () => {
        const text = typeof reader.result === 'string' ? reader.result : ''
        setTxtPreview(text.slice(0, 800))
      }
      reader.readAsText(primaryFile)
    } else {
      setTxtPreview('')
    }

    return () => clearTimeout(t)
  }, [primaryFile])

  const filteredJobs = useMemo(() => {
    const q = searchQ.trim().toLowerCase()
    const loc = searchLoc.trim().toLowerCase()
    return MOCK_JOBS.filter((j) => {
      const matchQ =
        !q ||
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.type.toLowerCase().includes(q)
      const matchL = !loc || j.location.toLowerCase().includes(loc)
      return matchQ && matchL
    })
  }, [searchQ, searchLoc])

  return (
    <div className="min-h-screen bg-primary-bg p-6 md:p-10">
      <div className="mx-auto max-w-4xl space-y-10">
        <p className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white">
          Étape 1 : dépose ton CV · Étape 2 : analyse (simulation) · Étape 3 : recherche d&apos;emplois (filtrage local)
        </p>

        <FileUploader
          cvCount={files.length}
          onFilesUpload={(accepted) => setFiles((prev) => [...prev, ...accepted])}
        />

        {files.length > 0 && primaryFile && (
          <>
            {/* ——— Analyse ——— */}
            <section className="card animate-fade-in">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-neutral-text">🔍 Analyse du CV</h2>
                {analyzing && (
                  <span className="rounded-full bg-primary-cta px-3 py-1 text-sm font-semibold text-neutral-text">
                    Analyse en cours…
                  </span>
                )}
              </div>

              <p className="mb-2 text-sm text-neutral-text-secondary">
                Dernier fichier traité : <strong className="text-neutral-text">{primaryFile.name}</strong>
              </p>

              {!analyzing && analysis && (
                <div className="grid gap-8 md:grid-cols-[200px_1fr]">
                  <div className="flex flex-col items-center justify-start">
                    <div
                      className="flex size-40 items-center justify-center rounded-full text-3xl font-extrabold text-neutral-text"
                      style={{
                        background: `conic-gradient(#a5d6a7 ${analysis.score * 3.6}deg, #e0e0e0 0deg)`,
                      }}
                    >
                      <div className="flex size-28 items-center justify-center rounded-full bg-white shadow-soft">
                        {analysis.score}%
                      </div>
                    </div>
                    <p className="mt-3 text-center text-xs text-neutral-text-secondary">Score de compatibilité (démo)</p>
                  </div>
                  <div>
                    <p className="mb-4 text-sm leading-relaxed text-neutral-text-secondary">{analysis.summary}</p>
                    <h3 className="mb-3 font-bold text-neutral-text">Compétences détectées (simulation)</h3>
                    <div className="space-y-3">
                      {analysis.skills.map((s) => (
                        <div key={s.name}>
                          <div className="mb-1 flex justify-between text-sm font-semibold text-neutral-text">
                            <span>{s.name}</span>
                            <span>{s.pct}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-black/10">
                            <div
                              className="h-full rounded-full bg-[#a5d6a7] transition-all duration-1000"
                              style={{ width: `${s.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {txtPreview && (
                <div className="mt-6 rounded-xl border border-black/10 bg-primary-bg/80 p-4">
                  <h4 className="mb-2 text-sm font-bold text-neutral-text">Extrait (.txt uniquement, aperçu local)</h4>
                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-xs text-neutral-text-secondary">{txtPreview}</pre>
                </div>
              )}

              {primaryFile.type !== 'text/plain' && !analyzing && (
                <p className="mt-4 text-xs text-neutral-text-secondary/80">
                  Pour un vrai parsing PDF/DOCX + score IA, lance le projet <code className="rounded bg-black/5 px-1">backend</code> +{' '}
                  <code className="rounded bg-black/5 px-1">ai-service</code> et utilise la page{' '}
                  <code className="rounded bg-black/5 px-1">project-ai-cv.html</code> du frontend.
                </p>
              )}
            </section>

            {/* ——— Recherche ——— */}
            <section className="card animate-fade-in">
              <h2 className="mb-6 text-2xl font-bold text-neutral-text">💼 Recherche d&apos;emplois</h2>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <input
                  type="search"
                  placeholder="Mots-clés (ex. React, Python…)"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  className="min-h-11 flex-1 rounded-full border border-black/15 bg-white px-4 text-sm text-neutral-text placeholder:text-neutral-text-secondary/70"
                />
                <input
                  type="search"
                  placeholder="Lieu"
                  value={searchLoc}
                  onChange={(e) => setSearchLoc(e.target.value)}
                  className="min-h-11 flex-1 rounded-full border border-black/15 bg-white px-4 text-sm text-neutral-text placeholder:text-neutral-text-secondary/70"
                />
              </div>
              <p className="mb-4 text-sm text-neutral-text-secondary">
                {filteredJobs.length} offre(s) affichée(s) — données de démo filtrées en direct.
              </p>
              <ul className="space-y-3">
                {filteredJobs.map((job) => (
                  <li
                    key={job.id}
                    className="flex flex-col gap-2 rounded-xl border border-black/8 bg-primary-bg/50 p-4 transition-shadow hover:shadow-soft sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="font-bold text-neutral-text">{job.title}</div>
                      <div className="text-sm text-[#a5d6a7]">{job.company}</div>
                      <div className="text-xs text-neutral-text-secondary">
                        {job.type} · {job.location}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-[#a5d6a7] px-3 py-1 text-xs font-bold text-neutral-text">
                        Match {job.match}%
                      </span>
                      <button
                        type="button"
                        className="rounded-full border border-neutral-text bg-transparent px-4 py-2 text-sm font-semibold text-neutral-text hover:bg-neutral-text hover:text-white"
                      >
                        Postuler
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {filteredJobs.length === 0 && (
                <p className="text-center text-sm text-neutral-text-secondary">Aucun résultat — essaie d&apos;autres mots-clés.</p>
              )}
            </section>

            {/* Liste brute des fichiers (optionnel) */}
            <details className="text-sm text-neutral-text-secondary">
              <summary className="cursor-pointer font-medium text-neutral-text">Voir tous les CV déposés ({files.length})</summary>
              <ul className="mt-2 list-inside list-disc">
                {files.map((f) => (
                  <li key={f.name + f.size + f.lastModified}>
                    {f.name} — {(f.size / 1024).toFixed(1)} Ko
                  </li>
                ))}
              </ul>
            </details>
          </>
        )}
      </div>
    </div>
  )
}
