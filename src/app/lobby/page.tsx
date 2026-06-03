'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { usePlayerStore } from '@/lib/hooks/usePlayerStore'
import { createRoom, getOpenRooms, joinRoom, ensurePlayerStats } from '@/lib/supabase/db'
import { createInitialMakhosState } from '@/lib/games/makhos'
import { supabase } from '@/lib/supabase/client'
import { GAME_REGISTRY } from '@/types'
import type { GameType, Room } from '@/types'
import NeonBackground from '@/components/ui/NeonBackground'

function LobbyContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const gameType     = (searchParams.get('game') ?? 'makhos') as GameType
  const { player }   = usePlayerStore()
  const [rooms, setRooms]     = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [joining, setJoining] = useState<string | null>(null)
  const game = GAME_REGISTRY[gameType]

  useEffect(() => {
    if (!player) { router.push('/'); return }
    loadRooms()

    // Realtime new rooms
    const ch = supabase
      .channel('lobby')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `game_type=eq.${gameType}` },
        () => loadRooms())
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, gameType])

  async function loadRooms() {
    const data = await getOpenRooms(gameType)
    setRooms(data.filter(r => r.player1_id !== player?.id))
  }

  async function handleCreate() {
    if (!player) return
    setLoading(true)
    try {
      await ensurePlayerStats(player.id, gameType)
      const initState = gameType === 'makhos' ? createInitialMakhosState() : {}
      const room = await createRoom(gameType, player.id, initState)
      router.push(`/game/${room.id}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin(roomId: string) {
    if (!player) return
    setJoining(roomId)
    try {
      await ensurePlayerStats(player.id, gameType)
      await joinRoom(roomId, player.id)
      router.push(`/game/${roomId}`)
    } finally {
      setJoining(null)
    }
  }

  if (!player) return null

  return (
    <div className="relative min-h-screen p-4 md:p-8 flex flex-col items-center">
      <NeonBackground />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <button onClick={() => router.push('/')} className="font-thai text-sm text-white/40 hover:text-white/70 mb-4 block mx-auto">
            ← กลับหน้าหลัก
          </button>
          <h1 className="font-thai text-3xl font-bold neon-text-cyan">{game.name}</h1>
          <p className="font-thai text-sm text-white/50 mt-1">{game.description}</p>
        </motion.div>

        {/* Player info */}
        <div className="glass-card neon-border-gold border p-4 mb-6 flex items-center gap-3">
          <Avatar seed={player.avatar_seed} size={40} />
          <div>
            <p className="font-thai font-semibold text-neon-gold">{player.username}</p>
            <p className="font-thai text-xs text-white/40">พร้อมลงสนาม</p>
          </div>
          <div className="ml-auto flex gap-3">
            <button
              onClick={() => router.push(`/leaderboard?game=${gameType}`)}
              className="font-thai text-sm border border-neon-gold/30 hover:border-neon-gold
                         text-neon-gold/70 hover:text-neon-gold px-3 py-1.5 rounded-lg transition-all"
            >
              🏆 อันดับ
            </button>
          </div>
        </div>

        {/* Create room */}
        <motion.button
          onClick={handleCreate}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full glass-card border-2 border-neon-cyan hover:shadow-neon
                     text-neon-cyan font-thai font-bold text-lg py-4 rounded-xl mb-8
                     transition-all disabled:opacity-50"
        >
          {loading ? '⏳ กำลังสร้างห้อง...' : '+ สร้างห้องใหม่'}
        </motion.button>

        {/* Open rooms */}
        <div>
          <h2 className="font-thai text-lg text-white/70 mb-4">ห้องที่รอคู่ต่อสู้ ({rooms.length})</h2>
          {rooms.length === 0 ? (
            <div className="glass-card border border-white/10 p-8 text-center">
              <p className="font-thai text-white/40 text-sm">ยังไม่มีห้องเปิด — สร้างห้องใหม่เพื่อรอคู่แข่ง</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {rooms.map((room, i) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card border border-neon-pink/30 hover:border-neon-pink p-4
                             flex items-center justify-between transition-all"
                >
                  <div>
                    <p className="font-thai text-sm text-white/60">
                      ห้อง <span className="font-mono text-neon-cyan text-xs">{room.id.slice(0, 8)}</span>
                    </p>
                    <p className="font-thai text-xs text-white/40 mt-0.5">
                      {new Date(room.created_at).toLocaleTimeString('th-TH')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleJoin(room.id)}
                    disabled={joining === room.id}
                    className="font-thai text-sm bg-neon-pink/10 border border-neon-pink
                               text-neon-pink px-4 py-2 rounded-lg hover:bg-neon-pink/20
                               hover:shadow-neon-pink transition-all disabled:opacity-50"
                  >
                    {joining === room.id ? '...' : 'เข้าร่วม'}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LobbyPage() {
  return (
    <Suspense>
      <LobbyContent />
    </Suspense>
  )
}

function Avatar({ seed, size }: { seed: string; size: number }) {
  const hue = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return (
    <div
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: `hsl(${hue},80%,50%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 'bold', color: 'white', fontSize: size * 0.4,
        flexShrink: 0,
      }}
    >
      {seed[0]?.toUpperCase()}
    </div>
  )
}
