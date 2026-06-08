<script setup lang="ts">
import { changelogEntries } from '@/content'
</script>

<template>
  <section class="page-view changelog-page">
    <header class="page-heading">
      <p>更新日志</p>
      <h1>更新日志</h1>
      <span>3.5.2 是当前最新正式版，已同步 Android、macOS 和 Windows；iOS 版本正在路上，敬请期待。</span>
    </header>

    <div class="timeline">
      <article v-for="entry in changelogEntries" :key="entry.version" class="timeline-entry">
        <div class="timeline-date">
          <span>{{ entry.date }}</span>
          <strong>{{ entry.version }}</strong>
          <small>{{ entry.badge }}</small>
        </div>
        <div class="timeline-body">
          <p>{{ entry.lead }}</p>
          <section v-for="section in entry.sections" :key="section.title">
            <h2>{{ section.title }}</h2>
            <ul>
              <li v-for="item in section.items" :key="item">{{ item }}</li>
            </ul>
          </section>
        </div>
      </article>
    </div>
  </section>
</template>
