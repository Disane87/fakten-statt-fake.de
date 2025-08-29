<template>
  <div v-if="result" class="space-y-6">
    <!-- Status row -->
    <div class="flex items-center justify-between">
      <div>
        <span v-if="result.result === 'fact'" class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">✅ Fact</span>
        <span v-else-if="result.result === 'fake'" class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold border bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">❌ Fake</span>
        <span v-else class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold border bg-muted text-muted-foreground border-border">❓ Unknown</span>
      </div>
      <div v-if="typeof result.confidence === 'number'" class="text-xs font-semibold text-muted-foreground">
        Confidence: <span class="font-bold text-card-foreground">{{ result.confidence }}%</span>
      </div>
      <div v-if="result.language" class="flex items-center gap-2">
        <span :class="`fi fi-${flagCode(result.language)}`" style="width:32px;height:22px;display:inline-block;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,.1)"></span>
      </div>
    </div>
    <!-- Claim -->
    <div v-if="result.claim" class="rounded-xl border border-border bg-muted/50 p-5">
      <div class="text-sm font-semibold text-muted-foreground mb-1">Claims</div>
      <ul class="space-y-1">
        <li v-for="(claim, idx) in result.claim" :key="idx" class="text-lg font-medium text-card-foreground break-words">{{ claim }}</li>
      </ul>
    </div>
    <!-- Counterargument -->
    <div v-if="result.compactCounter" class="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5">
      <div class="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-2">Counterargument</div>
      <p class="text-card-foreground/90 leading-relaxed">{{ result.compactCounter }}</p>
    </div>
    <!-- Fake tactic -->
    <div v-if="result.result === 'Fake' && result.fakeTactic" class="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
      <div class="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Detected tactics</div>
      <ul class="space-y-2">
        <li v-for="(tactic, idx) in result.fakeTactic" :key="idx">
          <div class="text-base font-bold text-card-foreground mb-1">{{ tactic.tactic }}</div>
          <div class="text-muted-foreground text-sm">{{ tactic.description }}</div>
        </li>
      </ul>
    </div>
    <!-- Explanation -->
    <div v-if="result.explanationDetails || result.explanation" class="rounded-xl border border-border bg-muted/40 p-5 space-y-3">
      <div class="text-sm font-semibold text-muted-foreground">Explanation</div>
      <p v-if="result.explanation" class="text-card-foreground leading-relaxed">{{ result.explanation }}</p>
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
        <span v-for="(kw, idx) in result.keywords" :key="idx" class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border bg-muted text-muted-foreground border-border">{{ kw }}</span>
      </div>
    </div>
    <!-- Sources -->
    <div v-if="result.sources?.length" class="space-y-3">
      <div class="text-sm font-semibold text-muted-foreground">Sources</div>
      <ul class="space-y-2">
        <li v-for="(src, i) in result.sources" :key="i" class="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
          <img v-if="src.url" :src="getFavicon(src.url)" alt="" class="h-5 w-5 rounded-sm" />
          <a :href="src.url" target="_blank" rel="noopener" class="font-medium text-card-foreground hover:underline flex-1">{{ src.title }}</a>
          <span v-if="src.verified" class="inline-flex items-center gap-1 rounded-full text-[11px] font-bold px-2 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">✓ Verified</span>
          <span v-else class="inline-flex items-center gap-1 rounded-full text-[11px] font-bold px-2 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">! Not verified</span>
          <span v-if="src.verifyReason" class="text-[11px] text-muted-foreground">({{ src.verifyReason }})</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FactCheckResult } from '@/shared/FactCheckModels'

const props = defineProps<{
  result: FactCheckResult | null
  moodPill: (m: string) => string
  flagCode: (lang: string) => string
  getFavicon: (url: string) => string
}>()
</script>

<style scoped>
/* leer – Styling geschieht über Utility-Klassen */
</style>
