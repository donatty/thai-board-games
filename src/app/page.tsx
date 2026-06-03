'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { usePlayerStore } from '@/lib/hooks/usePlayerStore'
import { getOrCreatePlayer, ensurePlayerStats } from '@/lib/supabase/db'
import { GAME_REGISTRY } from '@/types'
import NeonBackground from '@/components/ui/NeonBackground'
import ParticlesBurst from '@/components/ui/ParticlesBurst'

export default function HomePage() {
  const router = useRouter()
  const { player, setPlayer } = usePlayerStore()
  const [username, setUsername] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [step, setStep]         = useState<'login' | 'select'>('login')
  const [burst, setBurst]       = useState(false)

  useEffect(() => {
    if (player) setStep('select')
  }, [player])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) return
    setLoading(true)
    setError('')
    try {
      const p = await getOrCreatePlayer(username)
      for (const key of Object.keys(GAME_REGISTRY)) {
        await ensurePlayerStats(p.id, key as keyof typeof GAME_REGISTRY)
      }
      setPlayer(p)
      setBurst(true)
      setTimeout(() => setStep('select'), 600)
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-4">
      <NeonBackground />
      {burst && <ParticlesBurst />}

      {/* Logo */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-10 text-center"
      >
        <h1 className="font-arcade text-2xl md:text-4xl neon-text-cyan animate-glow-pulse leading-loose tracking-widest">
          THAI
        </h1>
        <h1 className="font-arcade text-2xl md:text-4xl neon-text-pink animate-glow-pulse leading-loose tracking-widest">
          BOARD GAMES
        </h1>
        <p className="font-thai text-neon-cyan/60 text-sm mt-2 tracking-widest">เกมกระดานไทยออนไลน์</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card neon-border-cyan border p-8 w-full max-w-sm"
          >
            <h2 className="font-thai text-xl text-neon-cyan mb-6 text-center font-semibold">
              เข้าสู่สนามรบ
            </h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="font-thai text-sm text-white/60 mb-1 block">ชื่อผู้เล่น</label>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="กรอกชื่อที่ต้องการ..."
                  maxLength={20}
                  className="w-full bg-dark-700 border border-neon-cyan/30 rounded-lg px-4 py-3
                             font-thai text-white placeholder-white/30 outline-none
                             focus:border-neon-cyan focus:shadow-neon transition-all"
                />
              </div>
              {error && <p className="font-thai text-sm text-neon-pink">{error}</p>}
              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="relative overflow-hidden bg-neon-cyan/10 border border-neon-cyan
                           text-neon-cyan font-thai font-semibold py-3 rounded-lg
                           hover:bg-neon-cyan/20 hover:shadow-neon transition-all
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="animate-pulse">กำลังโหลด...</span>
                ) : (
                  <>▶ เข้าสู่เกม</>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {step === 'select' && player && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="w-full max-w-2xl"
          >
            {/* Welcome */}
            <div className="text-center mb-8">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-thai text-lg text-white/70"
              >
                ยินดีต้อนรับ{' '}
                <span className="neon-text-gold font-semibold">{player.username}</span>
              </motion.p>
            </div>

            {/* Game Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Object.values(GAME_REGISTRY).map((game, i) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <GameCard
                    game={game}
                    onClick={() => game.available && router.push(`/lobby?game=${game.id}`)}
                  />
                </motion.div>
              ))}
            </div>

            {/* Bottom nav */}
            <div className="flex justify-center gap-6 mt-8">
              <button
                onClick={() => router.push('/leaderboard')}
                className="font-thai text-sm text-neon-gold/80 hover:neon-text-gold transition-all
                           border border-neon-gold/30 hover:border-neon-gold px-5 py-2 rounded-lg"
              >
                🏆 กระดานคะแนน
              </button>
              <button
                onClick={() => { usePlayerStore.getState().clearPlayer(); setStep('login') }}
                className="font-thai text-sm text-white/40 hover:text-white/70 transition-all
                           border border-white/10 hover:border-white/30 px-5 py-2 rounded-lg"
              >
                ออกจากระบบ
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function GameCard({ game, onClick }: { game: typeof GAME_REGISTRY[keyof typeof GAME_REGISTRY]; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={!game.available}
      className={`
        w-full text-left glass-card border p-6 rounded-xl transition-all duration-300
        ${game.available
          ? 'border-neon-cyan/30 hover:border-neon-cyan hover:shadow-neon hover:-translate-y-1 cursor-pointer'
          : 'border-white/10 opacity-40 cursor-not-allowed'
        }
      `}
    >
      <div className="flex items-start gap-4">
        <span className="text-4xl">{game.icon}</span>
        <div>
          <h3 className="font-thai text-xl font-bold text-white">{game.name}</h3>
          <p className="font-thai text-sm text-white/50 mt-1">{game.description}</p>
          {!game.available && (
            <span className="font-thai text-xs text-neon-pink/60 mt-2 inline-block">เร็วๆ นี้</span>
          )}
          {game.available && (
            <span className="font-thai text-xs text-neon-green mt-2 inline-block">● ออนไลน์</span>
          )}
        </div>
      </div>
    </button>
  )
}
