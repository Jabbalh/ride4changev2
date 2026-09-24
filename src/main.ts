import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// Polices hébergées avec le site (pas d'appel à Google Fonts)
import '@fontsource/bebas-neue/400.css'
import '@fontsource/barlow-condensed/400.css'
import '@fontsource/barlow-condensed/600.css'
import '@fontsource/barlow-condensed/700.css'
import '@fontsource/barlow/300.css'
import '@fontsource/barlow/400.css'
import '@fontsource/barlow/400-italic.css'
import '@fontsource/barlow/600.css'
import '@fontsource/barlow/700.css'
import './assets/main.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
