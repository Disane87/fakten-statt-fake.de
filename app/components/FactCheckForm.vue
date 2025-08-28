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

  <textarea v-model="text" rows="5" class="w-full p-3 rounded-xl bg-muted text-card-foreground placeholder:text-muted-foreground
       border border-border focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
    placeholder="Example: »Germany is doing well in the world.«" :disabled="loading" />

  <button :disabled="loading || !text.trim()" @click="checkFact" class="w-full mt-4 px-5 py-3 rounded-lg text-white font-bold text-lg shadow transition
       disabled:opacity-50 disabled:cursor-not-allowed
       bg-[linear-gradient(180deg,var(--color-brand),var(--color-brand-600))] hover:opacity-90">
    {{ loading ? 'Checking…' : 'Check text' }}
      </button>
    </div>

  <!-- Result right (sticky on desktop) -->
    <div v-if="result"
      class="flex-1 w-full lg:sticky lg:top-24 bg-panel p-8 rounded-2xl shadow-xl border border-border transition-colors min-w-0">
      <!-- Error alert -->
      <div v-if="result.error" class="rounded-xl border border-rose-500/20 p-5 bg-rose-500/5">
        <div class="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-1">Error</div>
        <p class="text-card-foreground/90">{{ result.error }}</p>
      </div>

  <!-- Result content -->
      <div v-else class="space-y-6">
  <!-- Status row -->
        <div class="flex items-center justify-between">
          <div>
            <span v-if="result.result === 'fact'" class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold border
                     bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">✅ Fact</span>

            <span v-else-if="result.result === 'fake'" class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold border
                     bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">❌ Fake</span>

            <span v-else class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold border
                     bg-muted text-muted-foreground border-border">❓ Unknown</span>
          </div>
          <div v-if="typeof result.confidence === 'number'" class="text-xs font-semibold text-muted-foreground">
            Confidence: <span class="font-bold text-card-foreground">{{ result.confidence }}%</span>
          </div>
          <div v-if="result.language" class="flex items-center gap-2">
            <span :class="`fi fi-${flagCode(result.language)}`"
              style="width:32px;height:22px;display:inline-block;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,.1)"></span>
          </div>
        </div>

        <!-- Claim (always English label, dynamic content stays original) -->
        <div v-if="result.claim" class="rounded-xl border border-border bg-muted/50 p-5">
          <div class="text-sm font-semibold text-muted-foreground mb-1">Claims</div>
          <ul class="space-y-1">
            <li v-for="(claim, idx) in result.claim" :key="idx"
              class="text-lg font-medium text-card-foreground break-words">
              {{ claim }}
            </li>
          </ul>
        </div>

        <!-- Counterargument (always English label, dynamic content stays original) -->
        <div v-if="result.compactCounter" class="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5">
          <div class="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-2">Counterargument</div>
          <p class="text-card-foreground/90 leading-relaxed">
            {{ result.compactCounter }}
          </p>
        </div>

        <!-- Fake tactic and explanation (always English label, dynamic content stays original) -->
        <div v-if="result.result === 'Fake' && result.fakeTactic"
          class="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div class="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Detected tactics</div>
          <ul class="space-y-2">
            <li v-for="(tactic, idx) in result.fakeTactic" :key="idx">
              <div class="text-base font-bold text-card-foreground mb-1">{{ tactic.tactic }}</div>
              <div class="text-muted-foreground text-sm">{{ tactic.description }}</div>
            </li>
          </ul>
        </div>

        <!-- Explanation (dynamic text stays in original language) -->
        <div v-if="result.explanationDetails || result.explanation"
          class="rounded-xl border border-border bg-muted/40 p-5 space-y-3">
          <div class="text-sm font-semibold text-muted-foreground">Explanation</div>
          <p v-if="result.explanation" class="text-card-foreground leading-relaxed">
            {{ result.explanation }}
          </p>
          <details v-if="result.explanationDetails" class="mt-1">
            <summary class="cursor-pointer text-sm text-brand font-medium">More details</summary>
            <p class="mt-2 text-muted-foreground leading-relaxed">{{ result.explanationDetails }}</p>
          </details>
        </div>

        <!-- Tone -->
        <div v-if="Array.isArray(result.tone) && result.tone.length" class="space-y-2">
          <div class="text-sm font-semibold text-muted-foreground">Tone</div>
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

        <div v-if="result.sources?.length" class="space-y-3">
          <div class="text-sm font-semibold text-muted-foreground">Sources</div>
          <ul class="space-y-2">
            <li v-for="(src, i) in result.sources" :key="i"
                class="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
              <img v-if="src.url" :src="getFavicon(src.url)" alt="" class="h-5 w-5 rounded-sm" />
              <a :href="src.url" target="_blank" rel="noopener"
                 class="font-medium text-card-foreground hover:underline flex-1">
                {{ src.title }}
              </a>
              <span
                v-if="src.verified"
                class="inline-flex items-center gap-1 rounded-full text-[11px] font-bold px-2 py-0.5
                       bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              >✓ Verified</span>
              <span
                v-else
                class="inline-flex items-center gap-1 rounded-full text-[11px] font-bold px-2 py-0.5
                       bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              >! Not verified</span>
              <span v-if="src.verifyReason" class="text-[11px] text-muted-foreground">
                ({{ src.verifyReason }})
              </span>
            </li>
          </ul>
        </div>
      </div>

    
    </div>
  </div>
  <!-- /Result -->

</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FactCheckResult, FactCheckApiResponse } from '@/shared/FactCheckModels'

const text = ref('')
const loading = ref(false)
const result = ref<FactCheckResult | null>(null)

type Mood = 'neutral' | 'positive' | 'negative' | 'critical' | 'factual' | 'emotional' | 'ironic'

const moodPill = (m: Mood) =>
  `inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border ` +
  (m === 'positive' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
    m === 'negative' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
      m === 'critical' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
        m === 'factual' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
          m === 'emotional' ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20' :
            m === 'ironic' ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20' :
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
