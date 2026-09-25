import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// Polices hébergées avec le site (pas d'appel à Google Fonts). Sous-ensemble latin seul : il couvre le français
// (accents, œ, « »), et évite de publier les variantes vietnamienne et latin étendu.
import '@fontsource/bebas-neue/latin-400.css'
import '@fontsource/barlow-condensed/latin-400.css'
import '@fontsource/barlow-condensed/latin-600.css'
import '@fontsource/barlow-condensed/latin-700.css'
import '@fontsource/barlow/latin-300.css'
import '@fontsource/barlow/latin-400.css'
import '@fontsource/barlow/latin-400-italic.css'
import '@fontsource/barlow/latin-600.css'
import '@fontsource/barlow/latin-700.css'
import './assets/main.css'
import './assets/article.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
