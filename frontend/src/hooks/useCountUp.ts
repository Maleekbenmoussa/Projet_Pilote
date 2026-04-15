import { useEffect, useState } from 'react'

export function useCountUp(target: number, durationMs = 1800, stepMs = 30) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const steps = Math.max(1, Math.floor(durationMs / stepMs))
    const increment = target / steps
    let current = 0
    let frame = 0
    const id = window.setInterval(() => {
      frame += 1
      current = Math.min(target, Math.floor(increment * frame))
      setValue(current)
      if (frame >= steps) {
        setValue(target)
        window.clearInterval(id)
      }
    }, stepMs)
    return () => window.clearInterval(id)
  }, [target, durationMs, stepMs])

  return value
}
