<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            <span class="gradient-text">Fakten statt Fake</span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Demokratische Plattform für kollaborative Faktenchecks von Social Media Inhalten
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <NuxtLink to="/submit" class="btn-primary text-lg px-8 py-3">
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Inhalt einreichen
            </NuxtLink>
            <NuxtLink to="/explore" class="btn-secondary text-lg px-8 py-3">
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              Faktenchecks entdecken
            </NuxtLink>
          </div>
          
          <!-- Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div class="card text-center">
              <div class="text-3xl font-bold text-blue-600 mb-2">{{ stats.totalFactChecks || 0 }}</div>
              <div class="text-sm text-gray-600">Faktenchecks</div>
            </div>
            <div class="card text-center">
              <div class="text-3xl font-bold text-green-600 mb-2">{{ stats.totalUsers || 0 }}</div>
              <div class="text-sm text-gray-600">Nutzer</div>
            </div>
            <div class="card text-center">
              <div class="text-3xl font-bold text-purple-600 mb-2">{{ stats.verifiedFacts || 0 }}</div>
              <div class="text-sm text-gray-600">Verifiziert</div>
            </div>
            <div class="card text-center">
              <div class="text-3xl font-bold text-orange-600 mb-2">{{ Math.round((stats.averageConfidence || 0) * 100) }}%</div>
              <div class="text-sm text-gray-600">Vertrauen</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How it Works -->
    <section class="py-20">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
          So funktioniert's
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-4">1. Einreichen</h3>
            <p class="text-gray-600">
              Reichen Sie verdächtige Social Media Inhalte ein. Einfach URL kopieren und einreichen.
            </p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-4">2. Prüfen</h3>
            <p class="text-gray-600">
              Experten und Community prüfen die Inhalte mit verifizierbaren Quellen und transparenter Methodik.
            </p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-4">3. Teilen</h3>
            <p class="text-gray-600">
              Erhalten Sie eine ausführliche Bewertung mit Quellen, die Sie vertrauensvoll teilen können.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Recent Fact Checks -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900">
            Aktuelle Faktenchecks
          </h2>
          <NuxtLink to="/explore" class="btn-primary">
            Alle ansehen
          </NuxtLink>
        </div>
        
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="card animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div class="h-16 bg-gray-200 rounded mb-4"></div>
            <div class="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
        
        <div v-else-if="recentFactChecks.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FactCheckCard 
            v-for="factCheck in recentFactChecks" 
            :key="factCheck.id"
            :fact-check="factCheck"
            :compact="true"
          />
        </div>
        
        <div v-else class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h3 class="text-lg font-semibold text-gray-600 mb-2">Noch keine Faktenchecks</h3>
          <p class="text-gray-500 mb-4">Seien Sie der Erste und reichen Sie einen Inhalt zur Prüfung ein.</p>
          <NuxtLink to="/submit" class="btn-primary">
            Jetzt einreichen
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="py-20">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
          Kategorien
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <NuxtLink 
            v-for="category in categories" 
            :key="category.id"
            :to="`/categories/${category.slug}`"
            class="card hover:shadow-lg transition-shadow text-center group"
          >
            <div class="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                 :style="{ backgroundColor: category.color + '20', color: category.color }">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {{ category.name }}
            </h3>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Community Features -->
    <section class="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-3xl md:text-4xl font-bold mb-6">
            Werden Sie Teil der Community
          </h2>
          <p class="text-xl mb-8 opacity-90">
            Helfen Sie dabei, Fehlinformationen zu bekämpfen und eine vertrauenswürdige Informationsquelle aufzubauen.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div>
              <div class="text-4xl mb-4">🏆</div>
              <h3 class="text-lg font-semibold mb-2">Badges verdienen</h3>
              <p class="opacity-80">Sammeln Sie Erfahrungspunkte und schalten Sie Belohnungen frei</p>
            </div>
            <div>
              <div class="text-4xl mb-4">🤝</div>
              <h3 class="text-lg font-semibold mb-2">Zusammenarbeiten</h3>
              <p class="opacity-80">Arbeiten Sie mit Experten und anderen Nutzern zusammen</p>
            </div>
            <div>
              <div class="text-4xl mb-4">🛡️</div>
              <h3 class="text-lg font-semibold mb-2">Demokratie stärken</h3>
              <p class="opacity-80">Tragen Sie zu einer informierten Gesellschaft bei</p>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink v-if="!isAuthenticated" to="/auth/register" class="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-md transition duration-200">
              Jetzt registrieren
            </NuxtLink>
            <NuxtLink v-else to="/dashboard" class="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-md transition duration-200">
              Zum Dashboard
            </NuxtLink>
            <NuxtLink to="/about" class="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-3 px-8 rounded-md transition duration-200">
              Mehr erfahren
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { FactCheckResult, Category, PlatformStats } from '~/types/database'

// Page metadata
useHead({
  title: 'Fakten statt Fake - Demokratische Faktenchecks',
  meta: [
    { name: 'description', content: 'Demokratische Plattform für kollaborative Faktenchecks von Social Media Inhalten. Helfen Sie dabei, Fehlinformationen zu bekämpfen.' }
  ]
})

const { isAuthenticated } = useAuth()

// Data
const loading = ref(true)
const recentFactChecks = ref<FactCheckResult[]>([])
const categories = ref<Category[]>([])
const stats = ref<PlatformStats>({
  total_fact_checks: 0,
  total_users: 0,
  verified_fact_checks: 0,
  disputed_fact_checks: 0,
  false_fact_checks: 0,
  average_confidence: 0,
  top_categories: []
})

// Load data
onMounted(async () => {
  try {
    // Load recent fact checks
    const { data: factChecks } = await $fetch('/api/fact-checks/recent')
    recentFactChecks.value = factChecks || []
    
    // Load categories
    const { data: categoriesData } = await $fetch('/api/categories')
    categories.value = categoriesData || []
    
    // Load platform stats
    const { data: statsData } = await $fetch('/api/stats/platform')
    stats.value = { ...stats.value, ...statsData }
  } catch (error) {
    console.error('Error loading homepage data:', error)
  } finally {
    loading.value = false
  }
})
</script>