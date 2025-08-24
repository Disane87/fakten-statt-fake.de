<template>
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
    @click="$emit('close')"
  >
    <div 
      class="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 p-6"
      @click.stop
    >
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900">Suchen</h2>
        <button 
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <div class="relative mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Nach Faktenchecks suchen..."
          class="form-input pl-10"
          @keyup.enter="performSearch"
        >
        <svg class="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
      
      <div v-else-if="searchResults.length > 0" class="space-y-4">
        <div v-for="result in searchResults" :key="result.id" class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
          <h3 class="font-semibold mb-2">{{ result.summary }}</h3>
          <p class="text-sm text-gray-600">{{ result.submission?.original_content?.substring(0, 100) }}...</p>
        </div>
      </div>
      
      <div v-else-if="searchQuery && !loading" class="text-center py-8 text-gray-500">
        Keine Ergebnisse gefunden
      </div>
      
      <div v-else class="text-center py-8 text-gray-500">
        Geben Sie einen Suchbegriff ein
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['close'])

const searchQuery = ref('')
const searchResults = ref([])
const loading = ref(false)

const performSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  loading.value = true
  try {
    // Implement search API call
    // const { data } = await $fetch(`/api/search?q=${encodeURIComponent(searchQuery.value)}`)
    // searchResults.value = data || []
    searchResults.value = [] // Placeholder
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    loading.value = false
  }
}

watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    performSearch()
  } else {
    searchResults.value = []
  }
})
</script>