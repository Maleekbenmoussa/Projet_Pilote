import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function AccessDeniedPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-4xl font-extrabold">Accès refusé</h1>
      <p className="mt-3 text-[var(--gray)]">
        Vous n&apos;avez pas les permissions nécessaires pour consulter cette page.
      </p>
      <Button className="mt-6 rounded-full" asChild>
        <Link to="/login">Retour vers Login</Link>
      </Button>
    </div>
  )
}
