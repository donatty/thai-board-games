'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { applyMove, getValidMoves, createInitialMakhosState } from '@/lib/games/makhos'
import type { Room, Player, MakhosState, MakhosPiece, Move } from '@/types'
import NeonBackground from '@/components/ui/NeonBackground'
import ParticlesBurst from '@/components/ui/ParticlesBurst'

interface Props {
  room:     Room
  player:   Player
  pushMove: (state: MakhosState, turnPlayerId: string) => Promise<void>
}

const CELL = 64  // px per cell

export default function MakhosBoard({ room, player, pushMove }: Props) {
  const router  = useRouter()
  const state   = (room.game_state as MakhosState) ?? createInitialMakhosState()
  const [localState, setLocalState]       = useState<MakhosState>(state)
  const [animating, setAnimating]         = useState(false)
  const [lastMove, setLastMove]           = useState<Move | null>(null)
  const [showWinner, setShowWinner]       = useState(false)
  const [burstColor, setBurstColor]       = useState<string | null>(null)

  // Sync room state
  useEffect(() => {
    setLocalState(room.game_state as MakhosState ?? createInitialMakhosState())
  }, [room.game_state])

  // Win detection
  useEffect(() => {
    if (localState.gameOver && !showWinner) {
      setShowWinner(true)
      const isWinner = (localState.winner === 'red' && room.player1_id === player.id) ||
                       (localState.winner === 'black' && room.player2_id === player.id)
      setBurstColor(isWinner ? '#ffd700' : '#ff0090')
    }
  }, [localState.gameOver, localState.winner, player.id, room.player1_id, room.player2_id, showWinner])

  // Determine which color I am
  const myColor = room.player1_id === player.id ? 'red' : 'black'
  const isMyTurn = localState.currentTurn === myColor && room.status === 'playing'

  const handleCellClick = useCallback(async (row: number, col: number) => {
    if (!isMyTurn || animating) return

    const clickedPiece = localState.pieces.find(p => p.row === row && p.col === col)

    // Selecting a piece
    if (clickedPiece && clickedPiece.color === myColor) {
      const moves = getValidMoves(localState, clickedPiece.id)
      setLocalState(prev => ({ ...prev, selected: clickedPiece.id, validMoves: moves }))
      return
    }

    // Making a move
    if (localState.selected) {
      const move = localState.validMoves.find(m => m.to.row === row && m.to.col === col)
      if (move) {
        setAnimating(true)
        setLastMove(move)
        const newState = applyMove(localState, move)
        setLocalState(newState)

        const nextTurnId = newState.currentTurn === 'red' ? (room.player1_id ?? player.id) : (room.player2_id ?? player.id)
        await pushMove(newState, nextTurnId)
        setAnimating(false)
        return
      }
      // Deselect
      setLocalState(prev => ({ ...prev, selected: null, validMoves: [] }))
    }
  }, [isMyTurn, animating, localState, myColor, pushMove, player.id, room.player1_id, room.player2_id])

  const redPieces   = localState.pieces.filter(p => p.color === 'red').length
  const blackPieces = localState.pieces.filter(p => p.color === 'black').length

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      <NeonBackground />
      {burstColor && <ParticlesBurst color={burstColor} />}

      <div className="relative z-10 w-full max-w-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/')}
            className="font-thai text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            ← ออก
          </button>
          <div className="font-thai text-sm text-white/50">
            {room.status === 'waiting' && <span className="neon-text-pink animate-pulse">⏳ รอคู่แข่ง...</span>}
            {room.status === 'playing' && (
              <span className={isMyTurn ? 'neon-text-green' : 'text-white/40'}>
                {isMyTurn ? '🟢 ตาของคุณ' : `⏳ ตาของคู่แข่ง`}
              </span>
            )}
          </div>
          <div className="font-mono text-xs text-white/20">{room.id.slice(0, 8)}</div>
        </div>

        {/* Score bar */}
        <div className="glass-card neon-border-cyan border p-3 mb-4 flex justify-between items-center">
          <PlayerBadge
            name={room.player1_id === player.id ? player.username : '?????'}
            color="red"
            pieces={redPieces}
            active={localState.currentTurn === 'red'}
            isMe={room.player1_id === player.id}
          />
          <div className="font-arcade text-xs neon-text-cyan">VS</div>
          <PlayerBadge
            name={room.player2_id === player.id ? player.username : (room.player2_id ? '?????' : 'รอ...')}
            color="black"
            pieces={blackPieces}
            active={localState.currentTurn === 'black'}
            isMe={room.player2_id === player.id}
            right
          />
        </div>

        {/* Board */}
        <div className="flex justify-center">
          <div
            className="relative border-2 neon-border-cyan shadow-neon"
            style={{ width: CELL * 8, height: CELL * 8 }}
          >
            {/* Cells */}
            {Array.from({ length: 8 }, (_, row) =>
              Array.from({ length: 8 }, (_, col) => {
                const isDark    = (row + col) % 2 === 1
                const isSelected = localState.selected &&
                  localState.pieces.find(p => p.id === localState.selected && p.row === row && p.col === col)
                const isValidTarget = localState.validMoves.some(m => m.to.row === row && m.to.col === col)
                const isLastFrom = lastMove?.from.row === row && lastMove?.from.col === col
                const isLastTo   = lastMove?.to.row === row && lastMove?.to.col === col

                return (
                  <div
                    key={`${row}-${col}`}
                    onClick={() => handleCellClick(row, col)}
                    style={{ position: 'absolute', left: col * CELL, top: row * CELL, width: CELL, height: CELL }}
                    className={`
                      ${isDark ? 'bg-dark-700' : 'bg-dark-900'}
                      ${isSelected ? 'ring-2 ring-neon-cyan ring-inset' : ''}
                      ${isLastFrom || isLastTo ? 'bg-neon-cyan/10' : ''}
                      ${isMyTurn ? 'cursor-pointer' : ''}
                      transition-colors duration-150
                    `}
                  >
                    {/* Valid move dot */}
                    {isValidTarget && isDark && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-4 h-4 rounded-full bg-neon-green/60 shadow-neon-green animate-pulse" />
                      </motion.div>
                    )}
                  </div>
                )
              })
            )}

            {/* Pieces */}
            {localState.pieces.map(piece => (
              <PieceComponent
                key={piece.id}
                piece={piece}
                isSelected={localState.selected === piece.id}
                onClick={() => handleCellClick(piece.row, piece.col)}
                cellSize={CELL}
                isMyTurn={isMyTurn}
                myColor={myColor}
              />
            ))}
          </div>
        </div>

        {/* Move count */}
        <div className="text-center mt-3 font-mono text-xs text-white/20">
          MOVES: {localState.moveHistory.length}
        </div>
      </div>

      {/* Winner overlay */}
      <AnimatePresence>
        {showWinner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="glass-card border-2 neon-border-gold p-10 text-center max-w-sm w-full mx-4"
            >
              <div className="text-6xl mb-4">
                {(localState.winner === 'red' && myColor === 'red') ||
                 (localState.winner === 'black' && myColor === 'black') ? '🏆' : '😢'}
              </div>
              <h2 className="font-arcade text-2xl neon-text-gold mb-2">
                {(localState.winner === 'red' && myColor === 'red') ||
                 (localState.winner === 'black' && myColor === 'black') ? 'WIN!' : 'LOSE'}
              </h2>
              <p className="font-thai text-white/60 mb-6">
                สีที่ชนะ: {localState.winner === 'red' ? '🔴 แดง' : '⚫ ดำ'}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.push('/')}
                  className="font-thai border border-neon-cyan/50 text-neon-cyan px-5 py-2 rounded-lg hover:border-neon-cyan transition-all"
                >
                  กลับหน้าหลัก
                </button>
                <button
                  onClick={() => router.push('/leaderboard')}
                  className="font-thai bg-neon-gold/10 border border-neon-gold text-neon-gold px-5 py-2 rounded-lg hover:bg-neon-gold/20 transition-all"
                >
                  🏆 อันดับ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function PieceComponent({
  piece, isSelected, onClick, cellSize, isMyTurn, myColor
}: {
  piece: MakhosPiece
  isSelected: boolean
  onClick: () => void
  cellSize: number
  isMyTurn: boolean
  myColor: string
}) {
  const cx = piece.col * cellSize + cellSize / 2
  const cy = piece.row * cellSize + cellSize / 2
  const r  = cellSize * 0.38
  const isRed   = piece.color === 'red'
  const isKing  = piece.type === 'king'
  const canMove = isMyTurn && piece.color === myColor

  return (
    <motion.div
      key={piece.id}
      layout
      layoutId={piece.id}
      initial={{ scale: 0 }}
      animate={{ scale: 1, x: cx - r, y: cy - r }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={onClick}
      style={{
        position:  'absolute',
        width:     r * 2,
        height:    r * 2,
        top:       0,
        left:      0,
        borderRadius: '50%',
        cursor:    canMove ? 'pointer' : 'default',
      }}
      className={`
        flex items-center justify-center select-none
        ${isRed
          ? 'bg-gradient-to-br from-red-500 to-red-800 border-2 border-red-400'
          : 'bg-gradient-to-br from-gray-600 to-gray-900 border-2 border-gray-400'
        }
        ${isSelected ? (isRed ? 'shadow-[0_0_12px_4px_#ff3030]' : 'shadow-[0_0_12px_4px_#aaaaff]') : ''}
        ${canMove && !isSelected ? 'hover:brightness-125' : ''}
        transition-all duration-100
      `}
    >
      {isKing && <span className="text-yellow-300 text-sm font-bold drop-shadow">♛</span>}
    </motion.div>
  )
}

function PlayerBadge({
  name, color, pieces, active, isMe, right = false
}: {
  name: string; color: string; pieces: number; active: boolean; isMe: boolean; right?: boolean
}) {
  const isRed = color === 'red'
  return (
    <div className={`flex items-center gap-2 ${right ? 'flex-row-reverse' : ''}`}>
      <div className={`
        w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold
        ${isRed ? 'bg-red-900/60 border-red-500 text-red-400' : 'bg-gray-800/60 border-gray-500 text-gray-300'}
        ${active ? (isRed ? 'shadow-[0_0_8px_#ff4444]' : 'shadow-[0_0_8px_#aaaaff]') : ''}
      `}>
        {pieces}
      </div>
      <div className={right ? 'text-right' : ''}>
        <p className={`font-thai text-sm font-semibold ${isMe ? 'neon-text-gold' : 'text-white/70'}`}>
          {name}{isMe ? ' (คุณ)' : ''}
        </p>
        <p className="font-thai text-xs text-white/30">{isRed ? '🔴 แดง' : '⚫ ดำ'}</p>
      </div>
    </div>
  )
}
