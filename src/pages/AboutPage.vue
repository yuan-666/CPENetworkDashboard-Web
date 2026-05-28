<script setup lang="ts">
import LazyImage from '@/components/LazyImage.vue'
import { aboutInfo, appIcon } from '@/content'
</script>

<template>
  <section class="page-view about-page">
    <header class="about-hero">
      <LazyImage :src="appIcon" alt="" eager />
      <div>
        <p>关于</p>
        <h1>{{ aboutInfo.chineseName }}</h1>
        <span>{{ aboutInfo.englishName }} / 版本 {{ aboutInfo.versionName }}</span>
      </div>
    </header>

    <section class="about-intro">
      <div>
        <p>{{ aboutInfo.description }}</p>
        <small>{{ aboutInfo.note }}</small>
      </div>
      <div class="about-stats">
        <span>QQ群</span>
        <strong>{{ aboutInfo.userGroup }}</strong>
      </div>
    </section>

    <section class="about-section makers-section">
      <div class="section-copy split-title-copy">
        <p>开发者</p>
        <h2>
          <span>本项目开发者：</span>
          <small>Project Developers</small>
        </h2>
      </div>
      <div class="person-grid">
        <article
          v-for="person in aboutInfo.makers"
          :key="person.name"
          class="person-card maker-card"
        >
          <div>
            <small>Developer</small>
            <h3>{{ person.name }}</h3>
          </div>
          <div class="person-links">
            <a
              v-for="link in person.links"
              :key="link.href"
              :href="link.href"
              target="_blank"
              rel="noreferrer"
            >
              {{ link.label }}
            </a>
          </div>
        </article>
      </div>
    </section>

    <section class="about-section thanks-section">
      <div class="section-copy split-title-copy">
        <p>致谢</p>
        <h2>
          <span>特别致谢</span>
          <small>Special Thanks</small>
        </h2>
      </div>
      <div class="thanks-list">
        <article v-for="person in aboutInfo.thanks" :key="person.name" class="thanks-card">
          <h3>{{ person.name }}</h3>
          <p>{{ person.contribution }}</p>
          <div v-if="person.links?.length" class="person-links">
            <a
              v-for="link in person.links"
              :key="link.href"
              :href="link.href"
              target="_blank"
              rel="noreferrer"
            >
              {{ link.label }}
            </a>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>
