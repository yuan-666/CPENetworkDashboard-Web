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
          <span>CPE加加开发者：</span>
          <small>CPE++ Developers</small>
        </h2>
      </div>
      <div class="person-grid">
        <article
          v-for="person in aboutInfo.makers"
          :key="person.name"
          class="person-card maker-card"
        >
          <div>
            <small>CPE++ Developer</small>
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

    <section class="about-sponsor">
      <div class="section-copy split-title-copy">
        <p>赞助</p>
        <h2>
          <span>{{ aboutInfo.sponsor.title }}</span>
          <small>Sponsor</small>
        </h2>
      </div>
      <div class="sponsor-panel">
        <p>{{ aboutInfo.sponsor.description }}</p>
        <div class="sponsor-channel-grid">
          <article class="sponsor-channel-card ifdian-channel-card">
            <div class="sponsor-channel-copy">
              <strong>爱发电</strong>
              <small>跳转主页支持 CPE加加</small>
            </div>
            <a
              class="ifdian-sponsor-link"
              :href="aboutInfo.sponsor.ifdianUrl"
              target="_blank"
              rel="noreferrer"
            >
              <img
                width="200"
                src="https://pic1.afdiancdn.com/static/img/welcome/button-sponsorme.png"
                alt="在爱发电赞助 CPE加加"
                loading="lazy"
                decoding="async"
              />
            </a>
          </article>
          <article v-for="qr in aboutInfo.sponsor.qrs" :key="qr.image" class="sponsor-qr-card">
            <LazyImage :src="qr.image" :alt="qr.alt" />
            <strong>{{ qr.label }}</strong>
            <small>扫码支持 CPE加加</small>
          </article>
        </div>
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
