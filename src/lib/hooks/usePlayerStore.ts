import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Player } from '@/types'

interface PlayerStore {
  player: Player | null
  setPlayer: (p: Player) => void
  clearPlayer: () => void
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set) => ({
      player:      null,
      setPlayer:   (p) => set({ player: p }),
      clearPlayer: () => set({ player: null }),
    }),
    { name: 'tbg-player' }
  )
)
