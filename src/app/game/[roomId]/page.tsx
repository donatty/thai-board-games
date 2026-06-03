'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePlayerStore } from '@/lib/hooks/usePlayerStore'
import { useRoom } from '@/lib/hooks/useRoom'
import MakhosBoard from '@/components/games/makhos/MakhosBoard'
import NeonBackground from '@/components/ui/NeonBackground'

export default function GamePage({ params }: { params: { roomId: string } }) {
  const router   = useRouter()
  const { player } = usePlayerStore()
  const { room, loading, pushMove } = useRoom(params.roomId)

  useEffect(() => {
    if (!player) router.push('/')
  }, [player, router])

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <NeonBackground />
        <div className="relative z-10 text-center">
          <div className="font-arcade text-lg neon-text-cyan animate-pulse">LOADING...</div>
        </div>
      </div>
    )
  }

  if (!room || !player) return null

  if (room.game_type === 'makhos') {
    return <MakhosBoard room={room} player={player} pushMove={pushMove} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="font-thai text-white/50">ยังไม่รองรับเกมนี้</p>
    </div>
  )
}
