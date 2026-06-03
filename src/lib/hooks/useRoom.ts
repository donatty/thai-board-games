'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { updateRoomState, finishRoom } from '@/lib/supabase/db'
import type { Room, MakhosState } from '@/types'

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)

  // Initial fetch
  useEffect(() => {
    supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()
      .then(({ data }) => {
        if (data) setRoom(data as Room)
        setLoading(false)
      })
  }, [roomId])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
        event:  'UPDATE',
        schema: 'public',
        table:  'rooms',
        filter: `id=eq.${roomId}`,
      }, (payload) => {
        setRoom(payload.new as Room)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [roomId])

  const pushMove = useCallback(async (newState: MakhosState, currentTurnPlayerId: string) => {
    if (!room) return
    if (newState.gameOver) {
      const winnerId = newState.winner === 'red' ? room.player1_id : room.player2_id
      await finishRoom(roomId, winnerId, newState)
    } else {
      await updateRoomState(roomId, newState, currentTurnPlayerId)
    }
  }, [room, roomId])

  return { room, loading, pushMove }
}
