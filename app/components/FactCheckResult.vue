<template>
  <div v-if="result" class="bg-slate-800 text-white rounded-2xl border border-slate-600 overflow-hidden shadow-xl">
    <!-- Compact Header -->
    <div class="p-4 border-b border-slate-600">
      <div class="flex items-center justify-between">
        <!-- Status Badge -->
        <div class="flex items-center gap-3">
          <div v-if="result.result === 'fact'" 
               class="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
            <CheckCircle class="w-6 h-6 text-emerald-400" />
          </div>
          <div v-else-if="result.result === 'fake'" 
               class="w-12 h-12 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center">
            <XCircle class="w-6 h-6 text-red-400" />
          </div>
          <div v-else 
               class="w-12 h-12 rounded-full bg-gray-500/20 border border-gray-400/30 flex items-center justify-center">
            <HelpCircle class="w-6 h-6 text-gray-400" />
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
          <div v-if="result.sources?.length > 0" class="flex items-center gap-1">
            <BookOpen class="w-4 h-4 text-blue-400" />
            <span class="text-slate-300">{{ result.sources.length }} sources</span>
          </div>
          <div v-if="result.keywords?.length" class="flex items-center gap-1">
            <Tag class="w-4 h-4 text-yellow-400" />
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
          <Lightbulb class="w-5 h-5 text-blue-400" />
          <h3 class="font-bold text-blue-300 text-sm">Analysis</h3>
        </div>
        <p class="text-blue-200 text-sm leading-relaxed">
          {{ result.explanation?.length > 150 ? result.explanation.substring(0, 150) + '...' : result.explanation }}
        </p>
        <details v-if="result.explanationDetails" class="mt-2">
          <summary class="cursor-pointer text-xs text-blue-400 font-medium hover:underline flex items-center gap-1">
            <ChevronRight class="w-3 h-3 rotate-0 group-open:rotate-90 transition-transform" />
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
          <Shield class="w-5 h-5 text-red-400" />
          <h3 class="font-bold text-red-300 text-sm">Counter Evidence</h3>
        </div>
        <p class="text-red-200 text-sm leading-relaxed">{{ result.compactCounter?.substring(0, 120) }}{{ (result.compactCounter?.length || 0) > 120 ? '...' : '' }}</p>
      </div>

      <!-- Manipulation Tactics -->
      <div v-if="result.result === 'fake' && result.fakeTactic?.length" class="bg-amber-900/30 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-3">
          <AlertTriangle class="w-5 h-5 text-amber-400" />
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
          <MessageCircle class="w-5 h-5 text-purple-400" />
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
          <Users class="w-5 h-5 text-indigo-400" />
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
          <Tag class="w-5 h-5 text-yellow-400" />
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
            <BookOpen class="w-5 h-5 text-emerald-400" />
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
          <User class="w-5 h-5 text-teal-400" />
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
          <ChevronRight class="w-4 h-4 group-open:rotate-90 transition-transform" />
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
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  BookOpen, 
  Tag, 
  Lightbulb, 
  ChevronRight, 
  Shield, 
  AlertTriangle, 
  MessageCircle, 
  Users, 
  User 
} from 'lucide-vue-next'

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
