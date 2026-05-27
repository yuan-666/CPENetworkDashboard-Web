<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const animationId = ref<number | null>(null)
let resizeHandler: (() => void) | null = null
const canvasSize = {
  width: 0,
  height: 0,
}
let themeObserver: MutationObserver | null = null

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
}

const particles: Particle[] = []
const particleCount = 48

function isDarkTheme(): boolean {
  const theme = document.documentElement.dataset.theme
  if (theme === 'dark' || theme === 'light') return theme === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function initParticles(width: number, height: number) {
  particles.length = 0
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      hue: Math.random() * 60 + 160,
    })
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.clearRect(0, 0, width, height)

  const isDark = isDarkTheme()
  const baseHue = isDark ? 170 : 160

  particles.forEach((particle, i) => {
    particle.x += particle.vx
    particle.y += particle.vy

    if (particle.x < 0 || particle.x > width) particle.vx *= -1
    if (particle.y < 0 || particle.y > height) particle.vy *= -1

    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${baseHue + particle.hue - 160}, 42%, ${isDark ? '68%' : '36%'}, ${particle.opacity})`
    ctx.fill()

    particles.slice(i + 1).forEach((other) => {
      const dx = particle.x - other.x
      const dy = particle.y - other.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 120) {
        ctx.beginPath()
        ctx.moveTo(particle.x, particle.y)
        ctx.lineTo(other.x, other.y)
        ctx.strokeStyle = `hsla(${baseHue}, 38%, ${isDark ? '68%' : '36%'}, ${0.12 * (1 - distance / 120)})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
    })
  })
}

function animate(ctx: CanvasRenderingContext2D) {
  drawParticles(ctx, canvasSize.width, canvasSize.height)
  animationId.value = requestAnimationFrame(() => animate(ctx))
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  resizeHandler = () => {
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvasSize.width = Math.max(1, rect.width)
    canvasSize.height = Math.max(1, rect.height)
    canvas.width = Math.round(canvasSize.width * dpr)
    canvas.height = Math.round(canvasSize.height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    initParticles(canvasSize.width, canvasSize.height)
  }

  resizeHandler()
  window.addEventListener('resize', resizeHandler)
  themeObserver = new MutationObserver(() => {
    drawParticles(ctx, canvasSize.width, canvasSize.height)
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })

  if (prefersReducedMotion()) {
    drawParticles(ctx, canvasSize.width, canvasSize.height)
    return
  }

  animate(ctx)
})

onUnmounted(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
  themeObserver?.disconnect()
  themeObserver = null
})
</script>

<template>
  <canvas ref="canvasRef" class="flow-canvas" aria-hidden="true" />
</template>

<style scoped>
.flow-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.6;
}
</style>
