<template>
  <div
    class="flex flex-col h-screen font-sans overflow-hidden antialiased bg-background text-card-foreground transition-colors">
    <!-- Nav -->
    <Header/>

    <main class="h-full p-4 overflow-y-auto">
      <FactCheckForm />

    </main>



    <!-- Footer -->
    <footer class="border-t border-border">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
        © {{ year }} Fakten statt Fakes · Gemeinsam gegen Desinformation
      </div>
    </footer>


  </div>
</template>

<script setup lang="ts">
import Header from './components/Header.vue'
import FactCheckForm from './components/FactCheckForm.vue'

const year = new Date().getFullYear()
</script>