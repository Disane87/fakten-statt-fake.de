<template>
  <footer class="bg-gray-900 text-white">
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="md:col-span-1">
          <div class="flex items-center space-x-2 mb-4">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span class="text-xl font-bold">Fakten statt Fake</span>
          </div>
          <p class="text-gray-400 mb-4">
            Demokratische Plattform für kollaborative Faktenchecks von Social Media Inhalten.
          </p>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-400 hover:text-white transition-colors">
              <span class="sr-only">Twitter</span>
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"/>
              </svg>
            </a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors">
              <span class="sr-only">GitHub</span>
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd"/>
              </svg>
            </a>
          </div>
        </div>
        
        <!-- Navigation -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Navigation</h3>
          <ul class="space-y-2">
            <li><NuxtLink to="/" class="footer-link">Startseite</NuxtLink></li>
            <li><NuxtLink to="/explore" class="footer-link">Entdecken</NuxtLink></li>
            <li><NuxtLink to="/categories" class="footer-link">Kategorien</NuxtLink></li>
            <li><NuxtLink to="/submit" class="footer-link">Einreichen</NuxtLink></li>
            <li><NuxtLink to="/about" class="footer-link">Über uns</NuxtLink></li>
          </ul>
        </div>
        
        <!-- Resources -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Ressourcen</h3>
          <ul class="space-y-2">
            <li><NuxtLink to="/help" class="footer-link">Hilfe</NuxtLink></li>
            <li><NuxtLink to="/methodology" class="footer-link">Methodik</NuxtLink></li>
            <li><NuxtLink to="/api" class="footer-link">API</NuxtLink></li>
            <li><NuxtLink to="/stats" class="footer-link">Statistiken</NuxtLink></li>
            <li><NuxtLink to="/supporters" class="footer-link">Supporter werden</NuxtLink></li>
          </ul>
        </div>
        
        <!-- Legal -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Rechtliches</h3>
          <ul class="space-y-2">
            <li><NuxtLink to="/privacy" class="footer-link">Datenschutz</NuxtLink></li>
            <li><NuxtLink to="/terms" class="footer-link">Nutzungsbedingungen</NuxtLink></li>
            <li><NuxtLink to="/impressum" class="footer-link">Impressum</NuxtLink></li>
            <li><NuxtLink to="/guidelines" class="footer-link">Community-Richtlinien</NuxtLink></li>
            <li><NuxtLink to="/contact" class="footer-link">Kontakt</NuxtLink></li>
          </ul>
        </div>
      </div>
      
      <div class="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-400 text-sm">
          © {{ new Date().getFullYear() }} Fakten statt Fake. Alle Rechte vorbehalten.
        </p>
        <div class="flex items-center space-x-4 mt-4 md:mt-0">
          <span class="text-gray-400 text-sm">Unterstützt von der Community</span>
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-green-500 text-sm">Online</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-link {
  @apply text-gray-400 hover:text-white transition-colors duration-200;
}
</style>