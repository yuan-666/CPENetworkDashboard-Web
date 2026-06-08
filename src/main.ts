import { createApp } from 'vue'
import { MotionPlugin } from '@vueuse/motion'
import App from './App.vue'
import { router } from './router'
import 'leaflet/dist/leaflet.css'
import './styles.css'

createApp(App).use(router).use(MotionPlugin).mount('#app')
