import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'

type Msg = { role: 'user' | 'assistant'; content: string }

export function AIAgentWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: "Hi! I'm Tanit AI — ask me about jobs, CV tips, or interviews." },
  ])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, open])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: text }])
    setLoading(true)
    try {
      const body = {
        messages: [...messages, { role: 'user', content: text }].map(({ role, content }) => ({ role, content })),
      }
      const res = await apiFetch<{ reply: string }>('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      setMessages((m) => [...m, { role: 'assistant', content: res.reply }])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'AI service is offline — start the FastAPI service on port 8000.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.button
        type="button"
        className="ai-pulse fixed bottom-6 right-6 z-[100] flex size-14 items-center justify-center rounded-full bg-black text-[var(--yellow)] shadow-xl"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        aria-label="Open Tanit AI"
      >
        <Play className="size-6 fill-current" />
        <span className="absolute -right-1 -top-1 rounded-full bg-[var(--mint)] px-1.5 py-0.5 text-[10px] font-bold text-black">
          AI
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-[100] flex w-[320px] flex-col overflow-hidden rounded-[20px] border border-[var(--border)] bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between bg-black px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--mint)] opacity-60" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-[var(--mint)]" />
                </span>
                <span className="font-heading text-sm font-extrabold">Tanit AI Agent</span>
              </div>
              <button type="button" className="rounded-full p-1 hover:bg-white/10" onClick={() => setOpen(false)}>
                <X className="size-4" />
              </button>
            </div>
            <div className="h-[240px] space-y-2 overflow-y-auto bg-[var(--bg)]/40 p-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={m.role === 'user' ? 'ml-8 rounded-2xl bg-black px-3 py-2 text-sm text-white' : 'mr-4 rounded-2xl bg-[var(--bg)] px-3 py-2 text-sm text-black'}
                >
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="flex gap-1 px-2 py-1">
                  <span className="typing-dot size-2 rounded-full bg-[var(--gray)]" />
                  <span className="typing-dot size-2 rounded-full bg-[var(--gray)]" />
                  <span className="typing-dot size-2 rounded-full bg-[var(--gray)]" />
                </div>
              )}
              <div ref={endRef} />
            </div>
            <div className="flex gap-2 border-t border-[var(--border)] bg-white p-3">
              <Input
                className="rounded-full"
                placeholder="Ask Tanit AI…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
              />
              <Button type="button" size="icon" className="shrink-0 rounded-full" onClick={send} disabled={loading}>
                <Send className="size-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
