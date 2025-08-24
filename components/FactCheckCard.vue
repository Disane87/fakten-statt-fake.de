<template>
  <div class="card hover:shadow-lg transition-shadow duration-200">
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="flex items-center space-x-2 mb-2">
          <span 
            class="badge"
            :class="verdictClasses[factCheck.verdict]"
          >
            {{ verdictLabels[factCheck.verdict] }}
          </span>
          <span v-if="factCheck.confidence_score" class="text-sm text-gray-500">
            {{ Math.round(factCheck.confidence_score * 100) }}% Vertrauen
          </span>
        </div>
        <h3 class="font-semibold text-lg text-gray-900 line-clamp-2 mb-2">
          {{ factCheck.summary }}
        </h3>
      </div>
    </div>
    
    <!-- Source Info -->
    <div v-if="factCheck.submission" class="mb-4">
      <div class="flex items-center space-x-2 text-sm text-gray-600 mb-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
        </svg>
        <span>{{ platformLabels[factCheck.submission.source_platform] || 'Unbekannt' }}</span>
        <span>•</span>
        <span>{{ formatDate(factCheck.published_at) }}</span>
      </div>
      
      <p v-if="!compact" class="text-sm text-gray-700 line-clamp-3">
        {{ factCheck.submission.original_content }}
      </p>
    </div>
    
    <!-- Actions -->
    <div class="flex items-center justify-between pt-4 border-t border-gray-200">
      <div class="flex items-center space-x-4">
        <button class="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
          <span>Hilfreich</span>
        </button>
        <button class="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
          </svg>
          <span>Teilen</span>
        </button>
      </div>
      <NuxtLink 
        :to="`/fact-check/${factCheck.id}`"
        class="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
      >
        Details →
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FactCheckResult } from '~/types/database'

interface Props {
  factCheck: FactCheckResult & {
    submission?: any
    categories?: any[]
  }
  compact?: boolean
  showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  showDetails: true
})

// Verdict styling and labels
const verdictClasses = {
  verified: 'badge-success',
  disputed: 'badge-warning',
  false: 'badge-danger',
  mixed: 'bg-orange-100 text-orange-800',
  unverifiable: 'bg-gray-100 text-gray-800'
}

const verdictLabels = {
  verified: 'Verifiziert',
  disputed: 'Umstritten',
  false: 'Falsch',
  mixed: 'Teilweise richtig',
  unverifiable: 'Nicht überprüfbar'
}

const platformLabels = {
  twitter: 'Twitter/X',
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  other: 'Andere'
}

// Helper functions
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>