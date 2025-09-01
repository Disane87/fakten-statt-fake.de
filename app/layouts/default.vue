<template>
  <div
    class="flex flex-col h-screen font-sans overflow-hidden antialiased bg-background text-card-foreground transition-colors"
  >
    <!-- Global navigation -->
    <Header />

    <main class="h-full p-4 overflow-y-auto">
      <!-- Route content goes here -->
      <slot />
    </main>

    <!-- Global footer -->
    <footer class="border-t border-border">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
        © {{ year }} Fakten statt Fakes · Gemeinsam gegen Desinformation
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
