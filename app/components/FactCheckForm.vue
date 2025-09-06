<template>
  <div class="max-w-6xl mx-auto mt-8 px-4 flex flex-col gap-8 lg:flex-row items-start justify-center">
    <!-- Enhanced Form Section -->
    <div class="w-full lg:w-1/2 card">
      <div class="flex items-center gap-3 mb-6">
        <div class="p-2 rounded-xl bg-gradient-to-br from-brand/10 to-accent/10 border border-brand/20">
          <span class="text-2xl">🕵️‍♂️</span>
        </div>
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-ink">
            Fact Check
          </h2>
          <p class="text-sm text-muted-foreground mt-1">
            Überprüfe Informationen auf ihren Wahrheitsgehalt
          </p>
        </div>
      </div>

      <!-- Enhanced Smart Input -->
      <div class="relative">
        <SmartClaimInput 
          v-model="text" 
          :rows="8" 
          :max-length="4000" 
          @change="onChange" 
          @og:error="onOgError" 
          class="transition-all duration-200 focus-within:scale-[1.02] focus-within:shadow-lg"
        />
      </div>

      <!-- Enhanced Action Button -->
      <button 
        :disabled="loading || !text.trim()" 
        @click="checkFact" 
        class="btn-primary group w-full mt-6 px-6 py-4 text-lg flex items-center justify-center gap-3
               disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <div v-if="loading" class="flex items-center gap-3">
          <svg class="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Wird überprüft...</span>
        </div>
        <div v-else class="flex items-center gap-3">
          <span class="text-xl group-hover:scale-110 transition-transform duration-200">🔍</span>
          <span>Fakten prüfen</span>
        </div>
      </button>

      <!-- Progress indicator for loading state -->
      <div v-if="loading" class="mt-4 w-full bg-muted rounded-full h-2 overflow-hidden">
        <div class="h-full bg-gradient-to-r from-brand to-accent animate-pulse"></div>
      </div>
    </div>

    <!-- Enhanced Result Section -->
    <div v-if="result" class="w-full lg:w-1/2 lg:sticky lg:top-24 min-w-0 animate-in slide-in-from-right">
      <div class="card">
        <FactCheckResult :result="result" :moodPill="moodPill" :flagCode="flagCode" :getFavicon="getFavicon" />
      </div>
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


function onChange(payload: { type: 'text' | 'url' | 'image' | 'images' | 'video'; value: any; meta?: any }) {
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
