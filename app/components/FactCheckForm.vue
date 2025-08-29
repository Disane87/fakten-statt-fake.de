<template>
  <div class="max-w-6xl mx-auto mt-6 flex flex-col gap-8 lg:flex-row items-start">
  <!-- Form left -->
    <div class="flex-1 w-full bg-panel p-8 rounded-2xl shadow-xl border border-border transition-colors">
      <h2 class="text-2xl font-extrabold mb-4 tracking-tight text-card-foreground flex items-center gap-2">
        🕵️‍♂️ Fact Check
        <svg v-if="loading" class="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" class="opacity-25" stroke="currentColor" stroke-width="4" />
          <path d="M4 12a8 8 0 0 1 8-8" fill="currentColor" />
        </svg>
      </h2>

  <!-- <textarea v-model="text" rows="5" class="w-full p-3 rounded-xl bg-muted text-card-foreground placeholder:text-muted-foreground
       border border-border focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
    placeholder="Example: »Germany is doing well in the world.«" :disabled="loading" /> -->

    <SmartClaimInput
    v-model="text"
    :rows="8"
    :max-length="4000"
    @change="onChange"
    @og:error="onOgError"
  />

  <button :disabled="loading || !text.trim()" @click="checkFact" class="w-full mt-4 px-5 py-3 rounded-lg text-white font-bold text-lg shadow transition
       disabled:opacity-50 disabled:cursor-not-allowed
       bg-[linear-gradient(180deg,var(--color-brand),var(--color-brand-600))] hover:opacity-90">
    {{ loading ? 'Checking…' : 'Check text' }}
      </button>
    </div>

  <!-- Result right (sticky on desktop) -->
    <div v-if="result" class="flex-1 w-full lg:sticky lg:top-24 bg-panel p-8 rounded-2xl shadow-xl border border-border transition-colors min-w-0">
      <!-- Error alert -->
      <!-- {{  result }} -->

      <div v-if="result.error" class="rounded-xl border border-rose-500/20 p-5 bg-rose-500/5">
        <div class="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-1">Error</div>
        <p class="text-card-foreground/90">{{ result.error }}</p>
      </div>

      <FactCheckResult
        v-else
        :result="result"
        :moodPill="moodPill"
        :flagCode="flagCode"
        :getFavicon="getFavicon"
      />
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FactCheckResult as FactCheckResultType, FactCheckApiResponse } from '../../shared/FactCheckModels'
import SmartClaimInput from './SmartClaimInput.vue'
import FactCheckResult from './FactCheckResult.vue'
import { useMoodPill } from '../composables/useMoodPill'

const text = ref('')
const loading = ref(false)
const result = ref<FactCheckResultType | null>(null)


function onChange(payload: { type: 'text'|'url'|'image'|'images'|'video'; value: any; meta?: any }) {
  // -> Hier bekommst du genau das, was du wolltest:
  // - Text -> { type:'text', value:'...' }
  // - URL  -> { type:'url', value:'https://...', meta:{...OG...} }
  // - Bild(er) -> type:'image'|'images' inkl. meta.images
  // - Video -> type:'video' inkl. meta.video
  console.log('CHANGE', payload)
}
function onOgError(msg: string) {
  console.warn('OG error:', msg)
}

const moodPill = useMoodPill

const flagCode = (lang: string) => (lang === 'en' ? 'gb' : lang)

function getFavicon(url: string) {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}` }
  catch { return '' }
}

async function checkFact() {
  loading.value = true
  result.value = null
  try {
    const res = await fetch('/api/fact/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.value })
    })
    const apiResponse: FactCheckApiResponse = await res.json()
    result.value = apiResponse
  } catch {
    result.value = null
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* leer – Styling geschieht über Utility-Klassen */
</style>
