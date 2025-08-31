<template>
  <div v-if="result" class="bg-slate-800 text-white rounded-2xl border border-slate-600 overflow-hidden shadow-xl">
    <!-- Compact Header -->
    <div class="p-4 border-b border-slate-600">
      <div class="flex items-center justify-between">
        <!-- Status Badge -->
        <div class="flex items-center gap-3">
          <div v-if="result.result === 'fact'" 
               class="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <div v-else-if="result.result === 'fake'" 
               class="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <div v-else 
               class="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          
          <div>
            <h2 class="text-lg font-bold" 
                :class="{
                  'text-red-400': result.result === 'fake',
                  'text-emerald-400': result.result === 'fact',
                  'text-gray-400': result.result === 'unknown'
                }">
              {{ result.result === 'fact' ? 'VERIFIED FACT' : result.result === 'fake' ? 'IDENTIFIED AS FAKE' : 'INCONCLUSIVE' }}
            </h2>
            <div class="flex items-center gap-2 text-sm text-slate-400">
              <span v-if="result.language" class="flex items-center gap-1">
                <span :class="`fi fi-${flagCode(result.language)}`" class="w-4 h-3 rounded"></span>
                {{ result.language.toUpperCase() }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Quick Stats -->
        <div class="flex gap-4 text-sm">
          <div v-if="result.sources?.length" class="flex items-center gap-1">
            <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
            <span class="text-slate-300">{{ result.sources.length }} sources</span>
          </div>
          <div v-if="result.keywords?.length" class="flex items-center gap-1">
            <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            <span class="text-slate-300">{{ result.keywords.length }} keywords</span>
          </div>
        </div>
      </div>
    </div>
    <!-- Claims Section -->
    <div v-if="result.claim?.length" class="p-4 border-b border-slate-600">
      <div class="text-slate-400 text-sm mb-2">Claims analyzed:</div>
      <div class="bg-slate-700 rounded-lg p-3">
        <div v-for="(claim, idx) in result.claim.slice(0, 1)" :key="idx" class="text-slate-200">
          <span class="text-blue-400 font-medium">{{ idx + 1 }}.</span> 
          {{ claim?.length > 80 ? claim.substring(0, 80) + '...' : claim }}
        </div>
        <div v-if="result.claim.length > 1" class="text-xs text-slate-500 mt-2">
          +{{ result.claim.length - 1 }} more claims
        </div>
      </div>
    </div>

    <!-- Analysis Section (moved here) -->
    <div v-if="result.explanation" class="p-4 border-b border-slate-600">
      <div class="bg-blue-900/30 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
          <h3 class="font-bold text-blue-300 text-sm">Analysis</h3>
        </div>
        <p class="text-blue-200 text-sm leading-relaxed">
          {{ result.explanation?.length > 150 ? result.explanation.substring(0, 150) + '...' : result.explanation }}
        </p>
        <details v-if="result.explanationDetails" class="mt-2">
          <summary class="cursor-pointer text-xs text-blue-400 font-medium hover:underline flex items-center gap-1">
            <svg class="w-3 h-3 rotate-0 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
            Show detailed analysis
          </summary>
          <p class="mt-2 text-xs text-blue-300 leading-relaxed">{{ result.explanationDetails }}</p>
        </details>
      </div>
    </div>

    <!-- Content Cards Grid -->
    <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Counter Evidence (only for fake/unknown) -->
      <div v-if="result.compactCounter && result.result !== 'fact'" class="bg-red-900/30 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
          <h3 class="font-bold text-red-300 text-sm">Counter Evidence</h3>
        </div>
        <p class="text-red-200 text-sm leading-relaxed">{{ result.compactCounter?.substring(0, 120) }}{{ (result.compactCounter?.length || 0) > 120 ? '...' : '' }}</p>
      </div>

      <!-- Manipulation Tactics -->
      <div v-if="result.result === 'fake' && result.fakeTactic?.length" class="bg-amber-900/30 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-3">
          <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <h3 class="font-bold text-amber-300 text-sm">Manipulation Tactics</h3>
        </div>
        <div class="space-y-2">
          <div v-for="(tactic, idx) in result.fakeTactic.slice(0, 1)" :key="idx" 
               class="bg-amber-900/50 rounded p-2">
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded bg-amber-600 flex items-center justify-center text-xs font-bold text-amber-100">{{ idx + 1 }}</span>
              <div class="font-medium text-amber-200 text-sm">{{ tactic.tactic }}</div>
            </div>
            <div class="text-xs text-amber-300 mt-1 ml-7">{{ tactic.description?.substring(0, 80) }}{{ (tactic.description?.length || 0) > 80 ? '...' : '' }}</div>
          </div>
          <div v-if="result.fakeTactic.length > 1" class="text-xs text-amber-400 text-center">
            +{{ result.fakeTactic.length - 1 }} more tactics
          </div>
        </div>
      </div>

      <!-- Tone -->
      <div v-if="result.tone?.length" class="bg-purple-900/30 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h6a2 2 0 002-2V8M7 8h10M9 12h6m-6 4h6"/>
          </svg>
          <h3 class="font-bold text-purple-300 text-sm">Tone</h3>
        </div>
        <div class="flex flex-wrap gap-1">
          <span v-for="(tone, idx) in result.tone.slice(0, 3)" :key="idx" 
                class="px-2 py-1 bg-purple-800 text-purple-200 rounded text-xs font-medium">
            {{ tone }}
          </span>
          <span v-if="result.tone.length > 3" class="text-xs text-purple-400 px-2 py-1">+{{ result.tone.length - 3 }}</span>
        </div>
      </div>

      <!-- Target Audience -->
      <div v-if="result.targetAudience?.length" class="bg-indigo-900/30 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <h3 class="font-bold text-indigo-300 text-sm">Audience</h3>
        </div>
        <div class="space-y-1">
          <div v-for="(audience, idx) in result.targetAudience.slice(0, 2)" :key="idx" 
               class="text-xs bg-indigo-800 text-indigo-200 px-2 py-1 rounded">
            {{ audience.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
          </div>
          <div v-if="result.targetAudience.length > 2" class="text-xs text-indigo-400">+{{ result.targetAudience.length - 2 }}</div>
        </div>
      </div>

      <!-- Keywords -->
      <div v-if="result.keywords?.length" class="bg-slate-700 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
          </svg>
          <h3 class="font-bold text-slate-300 text-sm">Keywords</h3>
        </div>
        <div class="flex flex-wrap gap-1">
          <span v-for="(keyword, idx) in result.keywords.slice(0, 4)" :key="idx" 
                class="text-xs bg-slate-600 text-slate-200 px-2 py-1 rounded">
            {{ keyword }}
          </span>
          <span v-if="result.keywords.length > 4" class="text-xs text-slate-400 px-2 py-1">+{{ result.keywords.length - 4 }}</span>
        </div>
      </div>
    </div>

    <!-- Sources (only show if available) -->
    <div v-if="result.sources?.length" class="p-4 border-t border-slate-600">
      <div class="bg-emerald-900/30 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
            <h3 class="font-bold text-emerald-300 text-sm">Sources</h3>
          </div>
          <div class="flex gap-2">
            <span class="bg-emerald-700 text-emerald-200 px-2 py-1 rounded text-xs font-bold">
              ✓{{ result.sources.filter(s => s.verified).length }}
            </span>
            <span class="bg-amber-700 text-amber-200 px-2 py-1 rounded text-xs font-bold">
              !{{ result.sources.filter(s => !s.verified).length }}
            </span>
          </div>
        </div>
        <div class="space-y-2 max-h-32 overflow-y-auto">
          <div v-for="(source, idx) in result.sources.slice(0, 3)" :key="idx" 
               class="flex items-center gap-2 p-2 bg-emerald-900/50 rounded hover:bg-emerald-900/70 transition-colors">
            <img :src="getFavicon(source.url)" alt="" class="w-4 h-4 rounded flex-shrink-0" />
            <a :href="source.url" target="_blank" rel="noopener" 
               class="text-xs text-emerald-200 hover:underline flex-1 truncate">
              {{ source.title }}
            </a>
            <span class="flex-shrink-0 text-xs" 
                  :class="source.verified ? 'text-emerald-400' : 'text-amber-400'">
              {{ source.verified ? '✓' : '!' }}
            </span>
          </div>
          <div v-if="result.sources.length > 3" class="text-xs text-emerald-400 text-center">
            +{{ result.sources.length - 3 }} more sources
          </div>
        </div>
      </div>
    </div>

    <!-- Mentioned Persons (if any) -->
    <div v-if="result.mentionedPersons?.length" class="px-4 pb-4">
      <div class="bg-teal-900/30 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <h3 class="font-bold text-teal-300 text-sm">Mentioned Persons</h3>
        </div>
        <div class="flex flex-wrap gap-1">
          <span v-for="(person, idx) in result.mentionedPersons.slice(0, 6)" :key="idx" 
                class="text-xs bg-teal-800 text-teal-200 px-2 py-1 rounded">
            {{ person }}
          </span>
          <span v-if="result.mentionedPersons.length > 6" class="text-xs text-teal-400 px-2 py-1">+{{ result.mentionedPersons.length - 6 }}</span>
        </div>
      </div>
    </div>

    <!-- Expandable Full Claims -->
    <div v-if="result.claim?.length > 1" class="border-t border-slate-600 p-4">
      <details class="group">
        <summary class="cursor-pointer text-sm font-medium text-slate-400 hover:text-slate-300 flex items-center gap-2">
          <svg class="w-4 h-4 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
          Show all {{ result.claim.length }} claims
        </summary>
        <div class="mt-3 space-y-2">
          <div v-for="(claim, idx) in result.claim" :key="idx" 
               class="flex items-start gap-3 p-3 bg-slate-700 rounded-lg">
            <span class="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">{{ idx + 1 }}</span>
            <p class="text-sm text-slate-200 leading-relaxed">{{ claim }}</p>
          </div>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FactCheckResult } from '../../shared/FactCheckModels'

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
