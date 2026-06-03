import { v4 as uuidv4 } from 'uuid'
import type { MakhosState, MakhosPiece, Move, PieceColor } from '@/types'

// ─── Board Constants ──────────────────────────────────────────────────────────
export const BOARD_SIZE = 8
// Thai Makhos starts with 8 pieces per side (rows 0-1 for black, rows 6-7 for red)
// Pieces only on dark squares (where (row+col) is odd)

// ─── Initial State ────────────────────────────────────────────────────────────
export function createInitialMakhosState(): MakhosState {
  const pieces: MakhosPiece[] = []

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {          // dark squares only
        if (row <= 1) {
          pieces.push({ id: uuidv4(), color: 'black', type: 'normal', row, col })
        } else if (row >= 6) {
          pieces.push({ id: uuidv4(), color: 'red', type: 'normal', row, col })
        }
      }
    }
  }

  return {
    pieces,
    currentTurn:  'red',
    selected:     null,
    validMoves:   [],
    captureChain: null,
    moveHistory:  [],
    gameOver:     false,
    winner:       null,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getPieceAt(pieces: MakhosPiece[], row: number, col: number): MakhosPiece | undefined {
  return pieces.find(p => p.row === row && p.col === col)
}

function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

// ─── Move Calculation ─────────────────────────────────────────────────────────
export function getValidMoves(state: MakhosState, pieceId: string): Move[] {
  const piece = state.pieces.find(p => p.id === pieceId)
  if (!piece || piece.color !== state.currentTurn) return []

  // If there's an active capture chain, only that piece can move
  if (state.captureChain && state.captureChain !== pieceId) return []

  const captures = getCaptureMoves(state.pieces, piece)
  if (captures.length > 0) return captures

  // If any other piece can capture, this piece cannot make a simple move
  if (!state.captureChain) {
    const anyCapture = state.pieces
      .filter(p => p.color === piece.color)
      .some(p => getCaptureMoves(state.pieces, p).length > 0)
    if (anyCapture) return []
  }

  return getSimpleMoves(state.pieces, piece)
}

function getSimpleMoves(pieces: MakhosPiece[], piece: MakhosPiece): Move[] {
  const moves: Move[] = []
  const dirs = getDirections(piece)

  for (const [dr, dc] of dirs) {
    const nr = piece.row + dr
    const nc = piece.col + dc
    if (isInBounds(nr, nc) && !getPieceAt(pieces, nr, nc)) {
      moves.push({ pieceId: piece.id, from: { row: piece.row, col: piece.col }, to: { row: nr, col: nc } })
    }
  }
  return moves
}

function getCaptureMoves(pieces: MakhosPiece[], piece: MakhosPiece, visited: string[] = []): Move[] {
  const moves: Move[] = []
  const dirs = getDirections(piece)

  for (const [dr, dc] of dirs) {
    const mr = piece.row + dr
    const mc = piece.col + dc
    const lr = piece.row + dr * 2
    const lc = piece.col + dc * 2

    if (!isInBounds(lr, lc)) continue

    const mid = getPieceAt(pieces, mr, mc)
    const land = getPieceAt(pieces, lr, lc)

    if (mid && mid.color !== piece.color && !land) {
      const key = `${mid.id}@${lr},${lc}`
      if (!visited.includes(key)) {
        moves.push({
          pieceId:  piece.id,
          from:     { row: piece.row, col: piece.col },
          to:       { row: lr, col: lc },
          captures: [mid.id],
        })
      }
    }
  }
  return moves
}

function getDirections(piece: MakhosPiece): [number, number][] {
  if (piece.type === 'king') return [[-1,-1],[-1,1],[1,-1],[1,1]]
  return piece.color === 'red' ? [[-1,-1],[-1,1]] : [[1,-1],[1,1]]
}

// ─── Apply Move ───────────────────────────────────────────────────────────────
export function applyMove(state: MakhosState, move: Move): MakhosState {
  let pieces = state.pieces.map(p => ({ ...p }))

  // Move piece
  const piece = pieces.find(p => p.id === move.pieceId)!
  piece.row = move.to.row
  piece.col = move.to.col

  // Remove captured
  if (move.captures?.length) {
    pieces = pieces.filter(p => !move.captures!.includes(p.id))
  }

  // Promote to king
  if (piece.type === 'normal') {
    if (piece.color === 'red'   && piece.row === 0) piece.type = 'king'
    if (piece.color === 'black' && piece.row === 7) piece.type = 'king'
  }

  // Check for capture chain
  let captureChain: string | null = null
  if (move.captures?.length) {
    const further = getCaptureMoves(pieces, piece)
    if (further.length > 0) captureChain = piece.id
  }

  const nextTurn: PieceColor = captureChain ? state.currentTurn : (state.currentTurn === 'red' ? 'black' : 'red')

  // Check game over
  const nextPieces = pieces.filter(p => p.color === nextTurn)
  const hasMove    = nextPieces.some(p => {
    const tmp: MakhosState = { ...state, pieces, currentTurn: nextTurn, captureChain: null, selected: null, validMoves: [], gameOver: false, winner: null, moveHistory: [] }
    return getValidMoves(tmp, p.id).length > 0
  })

  const gameOver = nextPieces.length === 0 || !hasMove
  const winner   = gameOver ? state.currentTurn : null

  return {
    pieces,
    currentTurn:  nextTurn,
    selected:     null,
    validMoves:   [],
    captureChain,
    moveHistory:  [...state.moveHistory, move],
    gameOver,
    winner,
  }
}

// ─── All Forced Captures ──────────────────────────────────────────────────────
export function getAllForcedCaptures(state: MakhosState): Move[] {
  return state.pieces
    .filter(p => p.color === state.currentTurn)
    .flatMap(p => getCaptureMoves(state.pieces, p))
}
