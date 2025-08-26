<template>
  <div
    class="flex flex-col h-screen font-sans overflow-hidden antialiased bg-background text-card-foreground transition-colors">
    <!-- Nav -->
    <Header/>

    <!-- Hero / Intro
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-6">
      <h1 class="text-3xl md:text-4xl font-bold tracking-tight">Mythos vs. Fakt</h1>
      <p class="mt-2 text-muted-foreground max-w-3xl">
        Kurz, präzise, zitierfähig – so konterst du verbreitete Behauptungen.
      </p>

      <div class="mt-6 flex flex-col md:flex-row gap-3 md:items-center">
        <div class="relative flex-1">
          <input
            id="search"
            type="search"
            placeholder="🔎 Suchen (Mythos, Fakt, Tags)…"
            class="w-full rounded-xl border border-border bg-muted px-4 py-3
                   text-card-foreground placeholder:text-muted-foreground
                   focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all"
          />
        </div>

        <div class="relative">
          <select
            id="tagFilter"
            class="w-full md:w-56 rounded-xl border border-border bg-muted px-4 py-3 pr-9
                   text-card-foreground focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            <option>Alle Tags</option>
            <option>Selbstverteidigung</option>
            <option>Völkerrecht</option>
            <option>Kontext</option>
            <option>Grundrechte</option>
            <option>Rechtsstaat</option>
          </select>
          <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60">▾</div>
        </div>
      </div>
    </section>

    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
      <div class="grid gap-6 md:gap-8 md:grid-cols-2">
        <FactCheckCard
          image="https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1600&auto=format&fit=crop"
          category="UKRAINE & ENERGIE"
          title="Angriff auf Druschba = Angriff auf NATO (Ungarn)"
          fact="Fakt: Getroffen wurden Pumpstationen in Russland..."
          :tags="['Selbstverteidigung', 'Völkerrecht', 'Kontext']"
          :links="[{ title: 'UN-Charta Art. 51', url: '#' }]"
        />
        <FactCheckCard
          image="https://images.unsplash.com/photo-1585157603595-5f546fdc9b36?q=80&w=1600&auto=format&fit=crop"
          category="MEINUNGSFREIHEIT"
          title="Man darf ja nichts mehr sagen"
          fact="Fakt: Meinungsfreiheit garantiert Sagen dürfen – nicht Widerspruchsfreiheit..."
          :tags="['Grundrechte', 'Rechtsstaat']"
          :links="[{ title: 'GG Art. 5', url: '#' }]"
        />
      </div>
    </main> -->

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
import { onMounted } from 'vue'
import FactCheckForm from './components/FactCheckForm.vue'
import Header from './components/Header.vue'

const year = new Date().getFullYear()
</script>