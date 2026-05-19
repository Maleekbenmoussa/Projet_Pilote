export type EmployerBrief = {
  id: string
  companyName: string
  logoUrl: string | null
  location: string | null
}

export type Job = {
  id: string
  title: string
  type: string
  location: string
  salaryMin: number | null
  salaryMax: number | null
  skills: string[]
  description: string | null
  employerId: string
  createdAt: string
  employer: EmployerBrief
}
