// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  runtimeConfig: {
    factcheckApiKey: process.env.FACTCHECK_API_KEY,
    cloudVisionApiKey: process.env.GCV_API_KEY
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: [
    '@/assets/css/main.css'
  ],

  components: [
    { path: '~/app/components' }
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  modules: ['@nuxtjs/color-mode', '@nuxtjs/supabase', 'nuxt-openapi-docs-module'],

  supabase: {
    redirectOptions: {
      login: false,
      callback: false,
      exclude: undefined
    },
    cookieOptions: {
      maxAge: 0
    }
  },

  colorMode: {
    preference: 'system', // default value of $colorMode.preference
    fallback: 'light', // fallback value if not system preference found
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '',
    storage: 'localStorage', // or 'sessionStorage' or 'cookie'
    storageKey: 'nuxt-color-mode'
  }
})