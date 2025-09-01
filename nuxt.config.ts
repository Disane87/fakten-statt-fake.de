// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  runtimeConfig: {
    factcheckApiKey: process.env.FACTCHECK_API_KEY,
    cloudVisionApiKey: process.env.GCV_API_KEY,
    newsApiKey: process.env.NEWSAPI_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    googleCseApiKey: process.env.GOOGLE_CSE_API_KEY,
    googleCseCxId: process.env.GOOGLE_CSE_CX_ID,
    ollamaModel: process.env.OLLAMA_MODEL,
    ollamaUrl: process.env.OLLAMA_URL,
    threadsAppId: process.env.THREADS_APP_ID,
    threadsAppSecret: process.env.THREADS_APP_SECRET
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
    redirect: false
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