<template>
  <header class="fixed top-0 left-0 right-0 bg-white shadow-md z-40">
    <nav class="container mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <span class="text-xl font-bold gradient-text">Fakten statt Fake</span>
        </NuxtLink>
        
        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-6">
          <NuxtLink to="/explore" class="nav-link">
            Entdecken
          </NuxtLink>
          <NuxtLink to="/categories" class="nav-link">
            Kategorien
          </NuxtLink>
          <NuxtLink to="/submit" class="nav-link">
            Einreichen
          </NuxtLink>
          <NuxtLink to="/about" class="nav-link">
            Über uns
          </NuxtLink>
        </div>
        
        <!-- User Menu / Auth -->
        <div class="flex items-center space-x-4">
          <!-- Search -->
          <button 
            @click="toggleSearch" 
            class="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </button>
          
          <!-- User Menu -->
          <div v-if="isAuthenticated" class="relative">
            <button 
              @click="toggleUserMenu" 
              class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <img 
                :src="profile?.avatar_url || '/default-avatar.png'" 
                :alt="profile?.display_name || 'User'" 
                class="w-8 h-8 rounded-full"
              >
              <span class="hidden md:block text-sm font-medium">{{ profile?.display_name }}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            
            <!-- User Dropdown -->
            <div 
              v-if="showUserMenu" 
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
            >
              <NuxtLink to="/dashboard" class="dropdown-item">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                </svg>
                Dashboard
              </NuxtLink>
              <NuxtLink to="/profile" class="dropdown-item">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Profil
              </NuxtLink>
              <div class="border-t border-gray-100 my-1"></div>
              <button @click="signOut" class="dropdown-item w-full text-left">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Abmelden
              </button>
            </div>
          </div>
          
          <!-- Auth Buttons -->
          <div v-else class="flex items-center space-x-2">
            <NuxtLink to="/auth/login" class="btn-secondary">
              Anmelden
            </NuxtLink>
            <NuxtLink to="/auth/register" class="btn-primary">
              Registrieren
            </NuxtLink>
          </div>
          
          <!-- Mobile Menu Button -->
          <button 
            @click="toggleMobileMenu" 
            class="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Mobile Menu -->
      <div v-if="showMobileMenu" class="md:hidden mt-4 pb-4 border-t border-gray-200">
        <div class="flex flex-col space-y-2 mt-4">
          <NuxtLink to="/explore" class="mobile-nav-link">Entdecken</NuxtLink>
          <NuxtLink to="/categories" class="mobile-nav-link">Kategorien</NuxtLink>
          <NuxtLink to="/submit" class="mobile-nav-link">Einreichen</NuxtLink>
          <NuxtLink to="/about" class="mobile-nav-link">Über uns</NuxtLink>
        </div>
      </div>
    </nav>
    
    <!-- Search Overlay -->
    <AppSearchOverlay v-if="showSearch" @close="toggleSearch" />
  </header>
</template>

<script setup lang="ts">
const { isAuthenticated, profile, signOut } = useAuth()

// Menu states
const showUserMenu = ref(false)
const showMobileMenu = ref(false)
const showSearch = ref(false)

// Toggle functions
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showMobileMenu.value = false
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  showUserMenu.value = false
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

// Close menus when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as Element
    if (!target.closest('.relative')) {
      showUserMenu.value = false
    }
  })
})
</script>

<style scoped>
.nav-link {
  @apply text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200;
}

.nav-link.router-link-active {
  @apply text-blue-600;
}

.dropdown-item {
  @apply flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors;
}

.mobile-nav-link {
  @apply block px-4 py-2 text-gray-700 hover:text-blue-600 font-medium;
}

.mobile-nav-link.router-link-active {
  @apply text-blue-600 bg-blue-50;
}
</style>