<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const flowRef = ref<HTMLElement | null>(null)
let animationFrame = 0
let reduceMotion = false

function updateFooterMotion(): void {
  animationFrame = 0
  const element = flowRef.value
  if (!element || reduceMotion) return

  const rect = element.getBoundingClientRect()
  const viewport = window.innerHeight || 1
  const progress = Math.max(0, Math.min(1, (viewport - rect.top) / (viewport + rect.height)))
  element.style.setProperty('--footer-shift', `${(progress - 0.5) * 140}px`)
  element.style.setProperty('--footer-fade', String(0.22 + progress * 0.42))
}

function scheduleFooterMotion(): void {
  if (animationFrame) return
  animationFrame = window.requestAnimationFrame(updateFooterMotion)
}

onMounted(() => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  updateFooterMotion()
  window.addEventListener('scroll', scheduleFooterMotion, { passive: true })
  window.addEventListener('resize', scheduleFooterMotion, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', scheduleFooterMotion)
  window.removeEventListener('resize', scheduleFooterMotion)
  if (animationFrame) window.cancelAnimationFrame(animationFrame)
})
</script>

<template>
  <section ref="flowRef" class="footer-flow">
    <div class="footer-flow-brand" aria-hidden="true">
      <span>CPE</span>
      <span>NETWORK</span>
      <span>DASHBOARD</span>
    </div>
    <div class="footer-flow-line footer-flow-line-a" aria-hidden="true">
      <span>CPE NETWORK DASHBOARD</span>
      <span>CPE NETWORK DASHBOARD</span>
    </div>
    <div class="footer-flow-line footer-flow-line-b" aria-hidden="true">
      <span>SIGNAL LOCK TEST</span>
      <span>SIGNAL LOCK TEST</span>
    </div>
    <slot />
  </section>
</template>

<style scoped>
.footer-flow {
  --footer-shift: 0px;
  --footer-fade: 0.34;
  position: relative;
  overflow: hidden;
  margin-top: clamp(48px, 8vw, 112px);
  padding: clamp(56px, 9vw, 116px) 0 clamp(26px, 5vw, 48px);
  border-top: 1px solid var(--line);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0), var(--paper-soft) 34%, var(--soft)), var(--soft);
}

.footer-flow::before {
  position: absolute;
  inset: 0;
  content: '';
  background:
    linear-gradient(90deg, transparent, rgba(35, 113, 100, 0.08), transparent),
    repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent calc(25% - 1px),
      var(--line) 25%,
      transparent calc(25% + 1px)
    );
  opacity: 0.65;
  pointer-events: none;
}

.footer-flow-brand {
  position: absolute;
  left: 50%;
  bottom: -0.2em;
  display: flex;
  gap: 0.08em;
  color: transparent;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', 'HarmonyOS Sans SC', MiSans,
    'PingFang SC', sans-serif;
  font-size: clamp(78px, 15vw, 250px);
  font-weight: 800;
  line-height: 0.76;
  white-space: nowrap;
  -webkit-text-stroke: 1px rgba(24, 27, 24, var(--footer-fade));
  opacity: 0.42;
  transform: translate3d(calc(-50% + var(--footer-shift)), 0, 0);
  transition: opacity var(--transition-normal);
  pointer-events: none;
}

.footer-flow-line {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  width: max-content;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  opacity: 0.58;
  transform: translate3d(calc(var(--footer-shift) * -0.32), 0, 0);
  pointer-events: none;
}

.footer-flow-line span {
  padding-right: 36px;
}

.footer-flow-line-a {
  top: 26px;
  animation: footer-line 36s linear infinite;
}

.footer-flow-line-b {
  bottom: 32px;
  opacity: 0.36;
  animation: footer-line-reverse 42s linear infinite;
}

:global(:root[data-theme='dark'] .footer-flow) {
  background:
    linear-gradient(180deg, rgba(16, 19, 17, 0), rgba(13, 16, 14, 0.98) 32%, #0d100e), #0d100e;
}

:global(:root[data-theme='dark'] .footer-flow::before) {
  background:
    linear-gradient(90deg, transparent, rgba(155, 199, 173, 0.08), transparent),
    repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent calc(25% - 1px),
      rgba(244, 242, 234, 0.08) 25%,
      transparent calc(25% + 1px)
    );
}

:global(:root[data-theme='dark'] .footer-flow-brand) {
  -webkit-text-stroke-color: rgba(244, 242, 234, var(--footer-fade));
  opacity: 0.34;
}

@keyframes footer-line {
  from {
    translate: 0 0;
  }
  to {
    translate: -50% 0;
  }
}

@keyframes footer-line-reverse {
  from {
    translate: -50% 0;
  }
  to {
    translate: 0 0;
  }
}

@media (max-width: 720px) {
  .footer-flow {
    margin-top: 48px;
    padding-top: 72px;
  }

  .footer-flow-brand {
    left: 0;
    bottom: 12px;
    transform: translate3d(calc(-14% + var(--footer-shift)), 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .footer-flow-line {
    animation: none;
  }
}
</style>
