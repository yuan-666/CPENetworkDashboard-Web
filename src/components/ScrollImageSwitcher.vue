<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

interface Props {
  images: string[]
  alt?: string
  labels?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  alt: '产品截图',
  labels: () => [],
})

const containerRef = ref<HTMLElement | null>(null)
const scrollProgress = ref(0)
const currentIndex = ref(0)
const touchStartX = ref(0)
const touchStartY = ref(0)
let animationFrame = 0

const totalSegments = computed(() => Math.max(props.images.length, 1))
const maxIndex = computed(() => Math.max(props.images.length - 1, 0))
const visibleImageLayers = computed(() =>
  props.images
    .map((image, index) => ({ image, index }))
    .filter(({ index }) => Math.abs(index - currentIndex.value) <= 1)
)

const currentLabel = computed(() => {
  if (!props.images.length) return '暂无截图'
  if (props.labels.length > currentIndex.value) {
    return props.labels[currentIndex.value]
  }
  return `${currentIndex.value + 1} / ${props.images.length}`
})

function handleScroll() {
  if (!containerRef.value) return

  const canPin = window.matchMedia('(min-width: 1081px)').matches
  const sequenceRoot = canPin
    ? (containerRef.value.closest('[data-scroll-sequence]') as HTMLElement | null)
    : null
  const progressRoot = sequenceRoot || containerRef.value
  const rect = progressRoot.getBoundingClientRect()
  const containerHeight = progressRoot.offsetHeight
  const viewportHeight = window.innerHeight
  const stickyTop = Number.parseFloat(
    getComputedStyle(containerRef.value).getPropertyValue('--showcase-sticky-top')
  )
  const sequenceOffset = Number.isFinite(stickyTop) ? stickyTop : 0
  const scrolled = sequenceRoot ? -rect.top + sequenceOffset : viewportHeight - rect.top
  const totalScrollable = sequenceRoot
    ? Math.max(containerHeight - viewportHeight + sequenceOffset, 1)
    : viewportHeight + containerHeight
  const rawProgress = scrolled / totalScrollable

  scrollProgress.value = Math.max(0, Math.min(1, rawProgress))

  if (!props.images.length) return

  const newIndex = Math.min(
    Math.floor(scrollProgress.value * (maxIndex.value + 0.999)),
    maxIndex.value
  )

  if (newIndex !== currentIndex.value && newIndex >= 0) {
    currentIndex.value = newIndex
  }
}

function scheduleScroll() {
  if (animationFrame) return
  animationFrame = window.requestAnimationFrame(() => {
    animationFrame = 0
    handleScroll()
  })
}

function setCurrentIndex(index: number) {
  if (!props.images.length) return

  const nextIndex = Math.max(0, Math.min(index, maxIndex.value))
  currentIndex.value = nextIndex
  scrollProgress.value = maxIndex.value > 0 ? nextIndex / maxIndex.value : 0
}

function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault()
      setCurrentIndex(currentIndex.value - 1)
      break
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault()
      setCurrentIndex(currentIndex.value + 1)
      break
  }
}

function handleTouchStart(event: TouchEvent) {
  touchStartX.value = event.touches[0].clientX
  touchStartY.value = event.touches[0].clientY
}

function handleTouchEnd(event: TouchEvent) {
  const deltaX = event.changedTouches[0].clientX - touchStartX.value
  const deltaY = event.changedTouches[0].clientY - touchStartY.value

  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
    if (deltaX > 0 && currentIndex.value > 0) {
      setCurrentIndex(currentIndex.value - 1)
    } else if (deltaX < 0 && currentIndex.value < props.images.length - 1) {
      setCurrentIndex(currentIndex.value + 1)
    }
  }
}

function getImageStyle(index: number) {
  const isActive = index === currentIndex.value
  const isBefore = index < currentIndex.value

  const opacity = isActive ? 1 : 0
  const scale = isActive ? 1 : isBefore ? 0.96 : 1.03
  const translateY = isActive ? 0 : isBefore ? 8 : -8

  return {
    opacity: String(opacity),
    transform: `scale(${scale}) translateY(${translateY}px)`,
    zIndex: isActive ? 2 : 1,
  }
}

function getProgressSegmentStyle(index: number) {
  const segmentSize = 1 / totalSegments.value
  const segStart = index * segmentSize
  const segEnd = (index + 1) * segmentSize

  let fill = 0
  if (scrollProgress.value >= segEnd) {
    fill = 1
  } else if (scrollProgress.value > segStart) {
    fill = (scrollProgress.value - segStart) / segmentSize
  }

  return {
    '--segment-fill': String(fill),
  }
}

onMounted(() => {
  window.addEventListener('scroll', scheduleScroll, { passive: true })
  window.addEventListener('resize', scheduleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', scheduleScroll)
  window.removeEventListener('resize', scheduleScroll)
  if (animationFrame) {
    window.cancelAnimationFrame(animationFrame)
  }
})
</script>

<template>
  <div
    ref="containerRef"
    class="scroll-image-container"
    tabindex="0"
    role="region"
    :aria-label="`${alt} - 滚动浏览`"
    @keydown="handleKeydown"
    @touchstart.passive="handleTouchStart"
    @touchend.passive="handleTouchEnd"
  >
    <!-- Fixed viewport; page scroll only drives image selection. -->
    <div class="scroll-viewport">
      <!-- Image stack with crossfade -->
      <div class="image-stack">
        <div
          v-for="{ image, index } in visibleImageLayers"
          :key="image"
          class="image-layer"
          :style="getImageStyle(index)"
        >
          <img
            :src="image"
            :alt="`${alt} ${index + 1}/${images.length}`"
            :loading="index === currentIndex ? 'eager' : 'lazy'"
            :aria-hidden="index !== currentIndex"
          />
        </div>
      </div>

      <!-- Progress bar -->
      <div
        class="progress-track"
        role="progressbar"
        :aria-valuenow="Math.round(scrollProgress * 100)"
      >
        <div
          v-for="(_, index) in images"
          :key="`seg-${index}`"
          class="progress-segment"
          :class="{ active: index === currentIndex }"
          :style="getProgressSegmentStyle(index)"
        >
          <div class="segment-fill" />
        </div>
      </div>

      <!-- Current label -->
      <div :key="currentLabel" class="image-label">
        <span class="label-badge">{{ currentLabel }}</span>
      </div>

      <!-- Screen reader live region -->
      <div class="sr-only" aria-live="polite" aria-atomic="true">
        当前显示第 {{ currentIndex + 1 }} 张，共 {{ images.length }} 张
      </div>
    </div>
  </div>
</template>

<style scoped>
.scroll-image-container {
  position: relative;
  width: 100%;
  min-height: 360px;
  outline: none;
}

.scroll-image-container:focus-visible {
  outline: 2px solid var(--accent, #206d63);
  outline-offset: 4px;
  border-radius: var(--radius-md, 12px);
}

.scroll-viewport {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.image-stack {
  position: relative;
  flex: 1;
  width: 100%;
  overflow: hidden;
}

.image-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    opacity 0.55s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, transform;
}

.image-layer img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}

/* Progress bar */
.progress-track {
  position: absolute;
  bottom: 14px;
  left: 50%;
  width: min(420px, calc(100% - 24px));
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
  z-index: 10;
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

:global(:root[data-theme='dark']) .progress-track {
  background: rgba(255, 255, 255, 0.1);
}

.progress-segment {
  flex: 1 1 0;
  min-width: 8px;
  height: 3px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.2);
  transition: flex-grow 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-segment.active {
  flex-grow: 1.75;
}

.segment-fill {
  height: 100%;
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.9);
  width: calc(var(--segment-fill, 0) * 100%);
  transition: width 0.08s linear;
}

/* Label badge */
.image-label {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 10;
}

.label-badge {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 11px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: rgba(255, 255, 255, 0.88);
  font-family: var(--mono, monospace);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0;
  transition: opacity 0.3s ease;
}

:global(.phone-main .scroll-viewport) {
  overflow: visible;
}

:global(.phone-main .image-stack) {
  overflow: hidden;
  border-radius: var(--radius-xl, 24px);
  background: #121a22;
}

:global(.phone-main .progress-track) {
  bottom: -25px;
  width: min(240px, calc(100% - 24px));
  background: rgba(23, 29, 36, 0.34);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .scroll-image-container {
    min-height: 300px;
  }

  .progress-track {
    bottom: 10px;
    gap: 3px;
    padding: 4px 6px;
  }

  .progress-segment {
    min-width: 6px;
    max-width: 18px;
  }

  .progress-segment.active {
    max-width: 28px;
  }

  .label-badge {
    font-size: 10px;
    height: 22px;
    padding: 0 9px;
  }
}
</style>
