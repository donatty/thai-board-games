'use client'
import { useEffect, useRef } from 'react'

export default function ParticlesBurst({ color = '#00f5ff' }: { color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const cx = canvas.width  / 2
    const cy = canvas.height / 2

    const particles = Array.from({ length: 60 }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 8 + 2
      return {
        x:   cx, y: cy,
        vx:  Math.cos(angle) * speed,
        vy:  Math.sin(angle) * speed,
        r:   Math.random() * 4 + 2,
        alpha: 1,
        color: [color, '#ff0090', '#ffd700', '#39ff14'][Math.floor(Math.random() * 4)],
      }
    })

    let raf: number
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.15
        p.alpha -= 0.018
        if (p.alpha > 0) {
          alive = true
          ctx.globalAlpha = p.alpha
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.shadowBlur = 10
          ctx.shadowColor = p.color
          ctx.fill()
        }
      })
      ctx.globalAlpha = 1
      if (alive) raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [color])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 100 }}
    />
  )
}
