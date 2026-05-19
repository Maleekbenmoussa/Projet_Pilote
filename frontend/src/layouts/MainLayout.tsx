import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { AIAgentWidget } from '@/components/AIAgentWidget'
import { useAuthStore } from '@/store/auth'
import { useMeQuery } from '@/hooks/useMeQuery'
import { io, type Socket } from 'socket.io-client'

export function MainLayout() {
  const setUser = useAuthStore((s) => s.setUser)

  const me = useMeQuery()

  useEffect(() => {
    if (me.isPending) return
    setUser(me.data ?? null)
  }, [me.isPending, me.data, setUser])

  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!user?.id) return
    const base = import.meta.env.VITE_API_URL || ''
    const socket: Socket = io(base, {
      path: '/socket.io',
      query: { userId: user.id },
      transports: ['websocket'],
    })
    socket.on('notification', () => {
      /* hook into toast later */
    })
    return () => {
      socket.disconnect()
    }
  }, [user?.id])

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <Outlet />
      <AIAgentWidget />
    </div>
  )
}

