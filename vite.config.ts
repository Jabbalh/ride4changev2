import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { cloudflare } from '@cloudflare/vite-plugin'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Cloudflare (Workers ou Pages) et le dev local servent le site à la racine ;
  // seul le build GitHub Pages est sous /ride4changev2/ (le plugin Cloudflare ne gère pas ce sous-chemin en dev).
  base: command === 'build' && !process.env.WORKERS_CI && !process.env.CF_PAGES ? '/ride4changev2/' : '/',
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    cloudflare(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
}))
