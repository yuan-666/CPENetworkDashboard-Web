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

interface Wave {
  y: number
  length: number
  amplitude: number
  frequency: number
  phase: number
  speed: number
  color: string
}

const waves: Wave[] = []

function isDarkTheme(): boolean {
  const theme = document.documentElement.dataset.theme
  if (theme === 'dark' || theme === 'light') return theme === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function initWaves() {
  const isDark = isDarkTheme()
  waves.length = 0

  waves.push(
    {
      y: 0.7,
      length: 0.012,
      amplitude: 25,
      frequency: 0.008,
      phase: 0,
      speed: 0.015,
      color: isDark ? 'rgba(155, 199, 173, 0.12)' : 'rgba(35, 113, 100, 0.1)',
    },
    {
      y: 0.75,
      length: 0.015,
      amplitude: 20,
      frequency: 0.01,
      phase: Math.PI * 0.5,
      speed: 0.02,
      color: isDark ? 'rgba(155, 199, 173, 0.08)' : 'rgba(35, 113, 100, 0.06)',
    },
    {
      y: 0.8,
      length: 0.018,
      amplitude: 18,
      frequency: 0.012,
      phase: Math.PI,
      speed: 0.025,
      color: isDark ? 'rgba(246, 173, 85, 0.1)' : 'rgba(173, 115, 51, 0.08)',
    }
  )
}

function drawWaves(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.clearRect(0, 0, width, height)

  waves.forEach((wave) => {
    ctx.beginPath()
    ctx.moveTo(0, height)

    for (let x = 0; x <= width; x++) {
      const y =
        height * wave.y +
        Math.sin(x * wave.frequency + wave.phase) * wave.amplitude * Math.sin(x * wave.length)
      ctx.lineTo(x, y)
    }

    ctx.lineTo(width, height)
    ctx.closePath()
    ctx.fillStyle = wave.color
    ctx.fill()

    wave.phase += wave.speed
  })
}

function animate(ctx: CanvasRenderingContext2D) {
  drawWaves(ctx, canvasSize.width, canvasSize.height)
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
    initWaves()
  }

  resizeHandler()
  window.addEventListener('resize', resizeHandler)
  themeObserver = new MutationObserver(() => {
    initWaves()
    drawWaves(ctx, canvasSize.width, canvasSize.height)
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })

  if (prefersReducedMotion()) {
    drawWaves(ctx, canvasSize.width, canvasSize.height)
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
  <div class="footer-flow">
    <canvas ref="canvasRef" class="wave-canvas" aria-hidden="true" />
    <slot />
  </div>
</template>

<style scoped>
.footer-flow {
  position: relative;
  overflow: hidden;
}

.wave-canvas {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 200px;
  pointer-events: none;
}
</style>
