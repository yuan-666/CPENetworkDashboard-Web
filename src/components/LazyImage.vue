<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    src: string
    alt?: string
    eager?: boolean
  }>(),
  {
    alt: '',
    eager: false,
  }
)
</script>

<template>
  <img
    v-bind="$attrs"
    :src="src"
    :alt="alt"
    :loading="eager ? 'eager' : 'lazy'"
    :fetchpriority="eager ? 'high' : 'auto'"
    decoding="async"
  />
</template>
