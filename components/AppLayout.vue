<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Navigation -->
    <AppHeader />
    
    <!-- Main Content -->
    <main class="pt-16">
      <slot />
    </main>
    
    <!-- Footer -->
    <AppFooter />
    
    <!-- Notification System -->
    <AppNotifications />
    
    <!-- Loading Overlay -->
    <div 
      v-if="$route.meta.showLoader || loading" 
      class="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50"
    >
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-gray-600">Lädt...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Global loading state
const loading = ref(false)

// Set page loading state
const setLoading = (state: boolean) => {
  loading.value = state
}

// Provide loading function to child components
provide('setLoading', setLoading)

// Handle route changes
const route = useRoute()
watch(() => route.path, () => {
  // You can add global route change logic here
  nextTick(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0)
  })
})
</script>