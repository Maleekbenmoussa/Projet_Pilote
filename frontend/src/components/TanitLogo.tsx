import { cn } from '@/lib/utils'

type Props = {
  variant?: 'dark' | 'light'
  className?: string
  showTagline?: boolean
}

export function TanitLogo({ variant = 'dark', className, showTagline = true }: Props) {
  const fg = variant === 'dark' ? '#000' : '#fff'
  const sub = variant === 'dark' ? '#4F4F4F' : 'rgba(255,255,255,0.65)'
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-black shadow-sm"
        style={{ borderRadius: 8 }}
        aria-hidden
      >
        <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="14" r="8" fill="#F9E98E" />
          <path
            d="M8 30c2-8 8-12 12-12s10 4 12 12"
            stroke="#F9E98E"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="font-heading text-lg font-extrabold tracking-tight" style={{ color: fg }}>
          TANIT TALENT
        </div>
        {showTagline && (
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: sub }}>
            AI Platform
          </div>
        )}
      </div>
    </div>
  )
}
