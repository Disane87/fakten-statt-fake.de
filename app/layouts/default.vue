<template>
  <div
    class="flex flex-col min-h-screen font-sans antialiased bg-background text-ink transition-all duration-300"
  >
    <!-- Global navigation -->
    <Header />

    <!-- Main content area with modern spacing -->
    <main class="flex-1 py-8 px-4 overflow-y-auto">
      <div class="max-w-7xl mx-auto">
        <!-- Route content goes here -->
        <slot />
      </div>
    </main>

    <!-- Enhanced footer -->
    <footer class="border-t border-border/50 glass">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="text-center md:text-left">
            <p class="text-sm text-muted-foreground">
              © {{ year }} Fakten statt Fakes · Gemeinsam gegen Desinformation
            </p>
          </div>
          <div class="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#" class="hover:text-ink transition-colors duration-200">Datenschutz</a>
            <span>·</span>
            <a href="#" class="hover:text-ink transition-colors duration-200">Impressum</a>
            <span>·</span>
            <a href="#" class="hover:text-ink transition-colors duration-200">Kontakt</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * Default app-wide layout.
 * Puts the global chrome (Header/Footer) around all pages.
 */
const year = new Date().getFullYear()

/**
 * Prefer Nuxt's components auto-import:
 * - Place components in /components
 * - Don't import them manually unless necessary
 * If manual import is desired, uncomment the lines below.
 */
import Header from '../components/Header.vue'
</script>
