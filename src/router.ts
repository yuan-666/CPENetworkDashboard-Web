import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
    meta: { title: 'CPE 网络看板' },
  },
  {
    path: '/product',
    name: 'product',
    component: () => import('@/pages/ProductPage.vue'),
    meta: { title: '产品介绍' },
  },
  {
    path: '/download',
    name: 'download',
    component: () => import('@/pages/DownloadPage.vue'),
    meta: { title: '下载 CPE 网络看板' },
  },
  {
    path: '/changelog',
    name: 'changelog',
    component: () => import('@/pages/ChangelogPage.vue'),
    meta: { title: '更新日志' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/pages/AboutPage.vue'),
    meta: { title: '关于 CPE 网络看板' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
