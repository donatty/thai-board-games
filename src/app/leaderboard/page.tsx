'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { getLeaderboard } from '@/lib/supabase/db'
import { GAME_REGISTRY } from '@/types'
import type { GameType, LeaderboardEntry } from '@/types'
import NeonBackground from '@/components/ui/NeonBackground'

const RANK_COLORS = ['neon-text-gold', 'text-gray-300', 'text-amber-600']
const RANK_ICONS  = ['👑', '🥈', '🥉']

function LeaderboardContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [gameType, setGameType] = useState<GameType>((searchParams.get('game') as GameType) ?? 'makhos')
  const [entries, setEntries]   = useState<LeaderboardEntry[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    getLeaderboard(gameType).then(data => {
      setEntries(data)
      setLoading(false)
    })
  }, [gameType])

  return (
    <div className="relative min-h-screen p-4 md:p-8 flex flex-col items-center">
      <NeonBackground />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <button onClick={() => router.push('/')} className="font-thai text-sm text-white/40 hover:text-white/70 mb-4 block mx-auto">
            ← กลับหน้าหลัก
          </button>
          <h1 className="font-arcade text-2xl neon-text-gold animate-glow-pulse">LEADERBOARD</h1>
          <p className="font-thai text-sm text-white/50 mt-1">กระดานคะแนนผู้เล่น</p>
        </motion.div>

        {/* Game selector */}
        <div className="flex gap-3 mb-6 justify-center flex-wrap">
          {Object.values(GAME_REGISTRY).map(game => (
            <button
              key={game.id}
              onClick={() => setGameType(game.id as GameType)}
              disabled={!game.available}
              className={`
                font-thai text-sm px-4 py-2 rounded-lg border transition-all
                ${gameType === game.id
                  ? 'border-neon-gold bg-neon-gold/10 text-neon-gold shadow-neon-gold'
                  : 'border-white/20 text-white/50 hover:border-white/40 disabled:opacity-30'
                }
              `}
            >
              {game.icon} {game.name}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card neon-border-gold border overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 px-4 py-3 border-b border-white/10">
            <div className="col-span-1 font-mono text-xs text-white/30">#</div>
            <div className="col-span-5 font-thai text-xs text-white/30">ชื่อผู้เล่น</div>
            <div className="col-span-2 font-thai text-xs text-white/30 text-center">ELO</div>
            <div className="col-span-1 font-thai text-xs text-white/30 text-center">ชนะ</div>
            <div className="col-span-1 font-thai text-xs text-white/30 text-center">แพ้</div>
            <div className="col-span-2 font-thai text-xs text-white/30 text-center">เกม</div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="font-arcade text-sm neon-text-cyan animate-pulse">LOADING...</div>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-thai text-white/40">ยังไม่มีข้อมูล</p>
            </div>
          ) : (
            entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`
                  grid grid-cols-12 px-4 py-3 items-center border-b border-white/5
                  hover:bg-white/5 transition-colors
                  ${i < 3 ? 'bg-neon-gold/5' : ''}
                `}
              >
                {/* Rank */}
                <div className="col-span-1">
                  {i < 3
                    ? <span className="text-lg">{RANK_ICONS[i]}</span>
                    : <span className="font-mono text-sm text-white/40">{i + 1}</span>
                  }
                </div>

                {/* Name */}
                <div className="col-span-5 flex items-center gap-2">
                  <PlayerAvatar seed={entry.avatar_seed} size={28} />
                  <span className={`font-thai text-sm font-semibold ${i < 3 ? RANK_COLORS[i] : 'text-white/80'}`}>
                    {entry.username}
                  </span>
                </div>

                {/* ELO */}
                <div className="col-span-2 text-center">
                  <EloBar elo={entry.elo} />
                </div>

                {/* W/L/Total */}
                <div className="col-span-1 text-center font-mono text-sm text-neon-green">{entry.wins}</div>
                <div className="col-span-1 text-center font-mono text-sm text-neon-pink">{entry.losses}</div>
                <div className="col-span-2 text-center font-mono text-xs text-white/40">{entry.total_games}</div>
              </motion.div>
            ))
          )}
        </div>

        <p className="text-center font-thai text-xs text-white/20 mt-4">
          ELO เริ่มต้น 1000 — อัปเดตหลังจบเกม
        </p>
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  return (
    <Suspense>
      <LeaderboardContent />
    </Suspense>
  )
}

function PlayerAvatar({ seed, size }: { seed: string; size: number }) {
  const hue = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `hsl(${hue},80%,50%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 'bold', color: 'white', fontSize: size * 0.45, flexShrink: 0,
    }}>
      {seed[0]?.toUpperCase()}
    </div>
  )
}

function EloBar({ elo }: { elo: number }) {
  const pct = Math.min(100, ((elo - 800) / 400) * 100)
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-xs text-neon-gold">{elo}</span>
      <div className="w-12 h-1 bg-white/10 rounded-full mt-0.5">
        <div
          className="h-full bg-neon-gold rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
