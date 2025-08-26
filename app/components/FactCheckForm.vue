<template>
  <div class="max-w-6xl mx-auto mt-6 flex flex-col gap-8 lg:flex-row items-start">
    <!-- Formular links -->
    <div class="flex-1 w-full bg-panel p-8 rounded-2xl shadow-xl border border-border transition-colors">
      <h2 class="text-2xl font-extrabold mb-4 tracking-tight text-card-foreground flex items-center gap-2">
        🕵️‍♂️ Faktencheck
        <svg v-if="loading" class="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" class="opacity-25" stroke="currentColor" stroke-width="4" />
          <path d="M4 12a8 8 0 0 1 8-8" fill="currentColor" />
        </svg>
      </h2>

      <textarea v-model="text" rows="5" class="w-full p-3 rounded-xl bg-muted text-card-foreground placeholder:text-muted-foreground
               border border-border focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
        placeholder="Beispiel: »Deutschland macht sich gut in der Welt.«" :disabled="loading" />

      <button :disabled="loading || !text.trim()" @click="checkFact" class="w-full mt-4 px-5 py-3 rounded-lg text-white font-bold text-lg shadow transition
               disabled:opacity-50 disabled:cursor-not-allowed
               bg-[linear-gradient(180deg,var(--color-brand),var(--color-brand-600))] hover:opacity-90">
        {{ loading ? 'Prüfe…' : 'Text prüfen' }}
      </button>
    </div>

    <!-- Ergebnis rechts (sticky auf Desktop) -->
    <div v-if="result"
      class="flex-1 w-full lg:sticky lg:top-24 bg-panel p-8 rounded-2xl shadow-xl border border-border transition-colors min-w-0">
      <!-- Fehler-Alert -->
      <div v-if="result.error" class="rounded-xl border border-rose-500/20 p-5 bg-rose-500/5">
        <div class="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-1">Fehler</div>
        <p class="text-card-foreground/90">{{ result.error }}</p>
      </div>

      <!-- Ergebnisinhalt -->
      <div v-else class="space-y-6">
        <!-- Statuszeile -->
        <div class="flex items-center justify-between">
          <div>
            <span v-if="result.result === 'Fakt'" class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold border
                     bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">✅ Fakt</span>

            <span v-else-if="result.result === 'Fake'" class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold border
                     bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">❌ Fake</span>

            <span v-else class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold border
                     bg-muted text-muted-foreground border-border">❓ Unbekannt</span>
          </div>
          <div v-if="typeof result.confidence === 'number'" class="text-xs font-semibold text-muted-foreground">
            Sicherheit: <span class="font-bold text-card-foreground">{{ result.confidence }}%</span>
          </div>
          <div v-if="result.language" class="flex items-center gap-2">
            <span :class="`fi fi-${flagCode(result.language)}`"
              style="width:32px;height:22px;display:inline-block;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,.1)"></span>
          </div>
        </div>

        <!-- Behauptung -->
        <div v-if="result.claim" class="rounded-xl border border-border bg-muted/50 p-5">
          <div class="text-sm font-semibold text-muted-foreground mb-1">Behauptungen</div>
          <ul class="space-y-1">
            <li v-for="(claim, idx) in result.claim" :key="idx"
              class="text-lg font-medium text-card-foreground break-words">
              {{ claim }}
            </li>
          </ul>
        </div>

        <!-- Gegenargument -->
        <div v-if="result.compactCounter" class="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5">
          <div class="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-2">Gegenargument</div>
          <p class="text-card-foreground/90 leading-relaxed">
            {{ result.compactCounter }}
          </p>
        </div>

        <!-- Fake-Taktik und Erklärung -->
        <div v-if="result.result === 'Fake' && result.fakeTactic"
          class="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div class="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Erkannte Taktiken</div>
          <ul class="space-y-2">
            <li v-for="(tactic, idx) in result.fakeTactic" :key="idx">
              <div class="text-base font-bold text-card-foreground mb-1">{{ tactic.tactic }}</div>
              <div class="text-muted-foreground text-sm">{{ tactic.description }}</div>
            </li>
          </ul>
        </div>

        <!-- Erklärung -->
        <div v-if="result.explanationDetails || result.explanation"
          class="rounded-xl border border-border bg-muted/40 p-5 space-y-3">
          <div class="text-sm font-semibold text-muted-foreground">Erklärung</div>
          <p v-if="result.explanation" class="text-card-foreground leading-relaxed">
            {{ result.explanation }}
          </p>
          <details v-if="result.explanationDetails" class="mt-1">
            <summary class="cursor-pointer text-sm text-brand font-medium">Mehr Details</summary>
            <p class="mt-2 text-muted-foreground leading-relaxed">{{ result.explanationDetails }}</p>
          </details>
        </div>

        <!-- Tonalität -->
        <div v-if="Array.isArray(result.tone) && result.tone.length" class="space-y-2">
          <div class="text-sm font-semibold text-muted-foreground">Tonalität</div>
          <div class="flex flex-wrap gap-2">
            <span v-for="(m, idx) in result.tone" :key="idx" :class="moodPill(m)">{{ m }}</span>
          </div>
        </div>

        <!-- Keywords -->
        <div v-if="Array.isArray(result.keywords) && result.keywords.length" class="space-y-2">
          <div class="text-sm font-semibold text-muted-foreground">Keywords</div>
          <div class="flex flex-wrap gap-2">
            <span v-for="(kw, idx) in result.keywords" :key="idx"
              class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border bg-muted text-muted-foreground border-border">
              {{ kw }}
            </span>
          </div>
        </div>
      </div>

    
    </div>
  </div>
  <!-- /Ergebnis -->

</template>

<script setup lang="ts">
import { ref } from 'vue'

const text = ref('')
const loading = ref(false)
const result = ref<any>(null)

type Mood = 'neutral' | 'positiv' | 'negativ' | 'kritisch' | 'sachlich' | 'emotional' | 'ironisch'

const moodPill = (m: Mood) =>
  `inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border ` +
  (m === 'positiv' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
    m === 'negativ' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
      m === 'kritisch' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
        m === 'sachlich' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
          m === 'emotional' ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20' :
            m === 'ironisch' ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20' :
              'bg-muted text-muted-foreground border-border')

const flagCode = (lang: string) => (lang === 'en' ? 'gb' : lang)

function getFavicon(url: string) {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}` }
  catch { return '' }
}

async function checkFact() {
  loading.value = true
  result.value = null
  try {
    const res = await fetch('/api/factcheck', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.value })
    })
    result.value = await res.json()
  } catch {
    result.value = { error: 'Serverfehler oder keine Verbindung.' }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* leer – Styling geschieht über Utility-Klassen */
</style>
