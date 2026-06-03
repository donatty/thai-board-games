// ─── Game Registry ────────────────────────────────────────────────────────────
// Add new games here — all other code picks them up automatically.
export const GAME_REGISTRY = {
  makhos: {
    id:          'makhos',
    name:        'หมากฮอส',
    nameEn:      'Makhos (Thai Checkers)',
    description: 'หมากฮอสไทย 8 ตัว กระดาน 8×8',
    icon:        '⬟',
    minPlayers:  2,
    maxPlayers:  2,
    available:   true,
  },
  chess: {
    id:          'chess',
    name:        'หมากรุก',
    nameEn:      'Chess',
    description: 'หมากรุกสากล — เร็วๆ นี้',
    icon:        '♟',
    minPlayers:  2,
    maxPlayers:  2,
    available:   false,        // flip to true when ready
  },
} as const

export type GameType = keyof typeof GAME_REGISTRY

// ─── Player ───────────────────────────────────────────────────────────────────
export interface Player {
  id:          string
  username:    string
  avatar_seed: string
  created_at?: string
}

export interface PlayerStats {
  id:         string
  player_id:  string
  game_type:  GameType
  wins:       number
  losses:     number
  draws:      number
  elo:        number
  updated_at: string
}

export interface LeaderboardEntry extends Player {
  game_type:   GameType
  wins:        number
  losses:      number
  draws:       number
  elo:         number
  total_games: number
}

// ─── Room / Game ──────────────────────────────────────────────────────────────
export type RoomStatus = 'waiting' | 'playing' | 'finished'

export interface Room {
  id:           string
  game_type:    GameType
  status:       RoomStatus
  player1_id:   string | null
  player2_id:   string | null
  current_turn: string | null
  game_state:   MakhosState | Record<string, unknown>
  winner_id:    string | null
  created_at:   string
  updated_at:   string
}

// ─── Makhos (Thai Checkers) ───────────────────────────────────────────────────
export type PieceColor = 'red' | 'black'
export type PieceType  = 'normal' | 'king'

export interface MakhosPiece {
  id:    string
  color: PieceColor
  type:  PieceType
  row:   number
  col:   number
}

export interface MakhosState {
  pieces:      MakhosPiece[]
  currentTurn: PieceColor
  selected:    string | null      // piece id
  validMoves:  Move[]
  captureChain: string | null    // piece id forced to continue capturing
  moveHistory: Move[]
  gameOver:    boolean
  winner:      PieceColor | null
}

export interface Move {
  pieceId:   string
  from:      { row: number; col: number }
  to:        { row: number; col: number }
  captures?: string[]             // captured piece ids
}
