'use client'
import { useEffect, useRef } from 'react'

export default function NeonBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!
    let frame    = 0
    let raf: number

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Stars
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random(),
      speed: Math.random() * 0.02 + 0.005,
    }))

    // Grid lines
    function drawGrid() {
      ctx.strokeStyle = 'rgba(0,245,255,0.04)'
      ctx.lineWidth   = 1
      const s = 60
      for (let x = 0; x < canvas.width; x += s) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += s) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }
    }

    // Horizon glow
    function drawHorizon() {
      const grad = ctx.createLinearGradient(0, canvas.height * 0.4, 0, canvas.height)
      grad.addColorStop(0, 'rgba(0,245,255,0.00)')
      grad.addColorStop(1, 'rgba(0,245,255,0.06)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawGrid()
      drawHorizon()

      // Stars
      stars.forEach(s => {
        s.a += s.speed
        const alpha = (Math.sin(s.a) + 1) / 2
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,245,255,${alpha * 0.6})`
        ctx.fill()
      })

      // Floating orbs
      const t = frame / 120
      const orbs = [
        { x: 0.2, y: 0.3, r: 180, c: '0,245,255' },
        { x: 0.8, y: 0.7, r: 140, c: '255,0,144' },
        { x: 0.5, y: 0.1, r: 100, c: '191,0,255' },
      ]
      orbs.forEach((o, i) => {
        const ox = o.x * canvas.width  + Math.sin(t + i) * 40
        const oy = o.y * canvas.height + Math.cos(t + i) * 30
        const g  = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r)
        g.addColorStop(0, `rgba(${o.c},0.07)`)
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(ox, oy, o.r, 0, Math.PI * 2)
        ctx.fill()
      })

      frame++
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
