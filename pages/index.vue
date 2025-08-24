<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8">
      <header class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Fakten statt Fake
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          Vue/Nuxt 3 with Tailwind CSS and Supabase Integration
        </p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <!-- Vue/Nuxt Card -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="ml-3 text-lg font-semibold text-gray-900">Vue/Nuxt 3</h3>
          </div>
          <p class="text-gray-600">Modern Vue.js framework with server-side rendering and static generation capabilities.</p>
        </div>

        <!-- Tailwind Card -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
            <h3 class="ml-3 text-lg font-semibold text-gray-900">Tailwind CSS</h3>
          </div>
          <p class="text-gray-600">Utility-first CSS framework for rapid UI development with beautiful, responsive designs.</p>
        </div>

        <!-- Supabase Card -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>
            <h3 class="ml-3 text-lg font-semibold text-gray-900">Supabase</h3>
          </div>
          <p class="text-gray-600">Open-source Firebase alternative with PostgreSQL database, authentication, and real-time subscriptions.</p>
        </div>
      </div>

      <!-- API Demo Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Serverless API Demo</h2>
        <div class="space-y-4">
          <button 
            @click="testApi"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Test API Endpoint
          </button>
          <div v-if="apiResponse" class="bg-gray-100 rounded-lg p-4">
            <pre class="text-sm text-gray-800">{{ JSON.stringify(apiResponse, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- Supabase Connection Test -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Supabase Connection</h2>
        <div class="space-y-4">
          <button 
            @click="testSupabase"
            class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Test Supabase Connection
          </button>
          <div v-if="supabaseStatus" class="p-4 rounded-lg" :class="supabaseStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
            {{ supabaseStatus.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Set page metadata
useHead({
  title: 'Fakten statt Fake - Vue/Nuxt Demo',
  meta: [
    { name: 'description', content: 'Demo of Vue/Nuxt 3 with Tailwind CSS and Supabase integration' }
  ]
})

// Reactive data
const apiResponse = ref(null)
const supabaseStatus = ref(null)

// Test API endpoint
const testApi = async () => {
  try {
    const { data } = await $fetch('/api/hello')
    apiResponse.value = data
  } catch (error) {
    apiResponse.value = { error: error.message }
  }
}

// Test Supabase connection
const testSupabase = async () => {
  try {
    const supabase = useSupabase()
    const { data, error } = await supabase.from('').select('*').limit(1)
    
    if (error && error.message.includes('relation') || error?.message.includes('schema')) {
      // This is expected if no tables exist yet
      supabaseStatus.value = {
        success: true,
        message: 'Supabase connection successful! (No tables configured yet)'
      }
    } else if (error) {
      supabaseStatus.value = {
        success: false,
        message: `Supabase error: ${error.message}`
      }
    } else {
      supabaseStatus.value = {
        success: true,
        message: 'Supabase connection successful!'
      }
    }
  } catch (error) {
    supabaseStatus.value = {
      success: false,
      message: `Connection failed: ${error.message}`
    }
  }
}
</script>