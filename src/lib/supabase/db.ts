import { supabase } from './client'
import type { GameType, LeaderboardEntry, Player, Room } from '@/types'

// ─── Players ──────────────────────────────────────────────────────────────────
export async function getOrCreatePlayer(username: string): Promise<Player> {
  const trimmed = username.trim().toLowerCase()

  // Try fetch existing
  const { data: existing } = await supabase
    .from('players')
    .select('*')
    .eq('username', trimmed)
    .single()

  if (existing) return existing as Player

  // Create new
  const seed = Math.random().toString(36).slice(2, 8)
  const { data, error } = await supabase
    .from('players')
    .insert({ username: trimmed, avatar_seed: seed })
    .select()
    .single()

  if (error) throw error
  return data as Player
}

export async function ensurePlayerStats(playerId: string, gameType: GameType) {
  const { error } = await supabase
    .from('player_stats')
    .upsert({ player_id: playerId, game_type: gameType }, { onConflict: 'player_id,game_type' })
  if (error) console.error('ensurePlayerStats:', error)
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export async function getLeaderboard(gameType: GameType, limit = 20): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('game_type', gameType)
    .order('elo', { ascending: false })
    .limit(limit)

  if (error) { console.error('getLeaderboard:', error); return [] }
  return (data ?? []) as LeaderboardEntry[]
}

// ─── Rooms ────────────────────────────────────────────────────────────────────
export async function createRoom(gameType: GameType, player1Id: string, initialState: object): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      game_type:    gameType,
      status:       'waiting',
      player1_id:   player1Id,
      current_turn: player1Id,
      game_state:   initialState,
    })
    .select()
    .single()

  if (error) throw error
  return data as Room
}

export async function joinRoom(roomId: string, player2Id: string): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .update({ player2_id: player2Id, status: 'playing', updated_at: new Date().toISOString() })
    .eq('id', roomId)
    .eq('status', 'waiting')
    .select()
    .single()

  if (error) throw error
  return data as Room
}

export async function updateRoomState(roomId: string, gameState: object, currentTurnId: string): Promise<void> {
  const { error } = await supabase
    .from('rooms')
    .update({ game_state: gameState, current_turn: currentTurnId, updated_at: new Date().toISOString() })
    .eq('id', roomId)

  if (error) throw error
}

export async function finishRoom(roomId: string, winnerId: string | null, finalState: object): Promise<void> {
  const { error } = await supabase
    .from('rooms')
    .update({ status: 'finished', winner_id: winnerId, game_state: finalState, updated_at: new Date().toISOString() })
    .eq('id', roomId)

  if (error) throw error
}

export async function getOpenRooms(gameType: GameType): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('game_type', gameType)
    .eq('status', 'waiting')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) return []
  return (data ?? []) as Room[]
}

// ─── ELO ──────────────────────────────────────────────────────────────────────
export async function updateElo(
  winnerId: string | null,
  loserId: string | null,
  gameType: GameType
) {
  if (!winnerId || !loserId) return  // draw – skip for now

  // Fetch current ELO
  const [w, l] = await Promise.all([
    supabase.from('player_stats').select('elo').eq('player_id', winnerId).eq('game_type', gameType).single(),
    supabase.from('player_stats').select('elo').eq('player_id', loserId).eq('game_type', gameType).single(),
  ])

  const winnerElo = w.data?.elo ?? 1000
  const loserElo  = l.data?.elo ?? 1000
  const k = 32

  const expected = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400))
  const delta    = Math.round(k * (1 - expected))

  await Promise.all([
    supabase.from('player_stats')
      .update({ elo: winnerElo + delta, wins: supabase.rpc as unknown as number })
      .eq('player_id', winnerId)
      .eq('game_type', gameType),
    supabase.from('player_stats')
      .update({ elo: Math.max(100, loserElo - delta) })
      .eq('player_id', loserId)
      .eq('game_type', gameType),
  ])
}
