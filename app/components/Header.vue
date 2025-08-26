<template>
    <header class="glass sticky top-0 z-40">
        <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-full bg-brand grid place-items-center font-semibold text-white shadow">
                    FS
                </div>
                <a href="#" class="font-semibold hover:opacity-90">Fakten statt Fakes</a>
            </div>

            <ul class="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                <li><a class="hover:text-card-foreground transition-colors" href="#">Leitfaden</a></li>
                <li><a class="hover:text-card-foreground transition-colors" href="#">Faktenchecks</a></li>
                <li><a class="hover:text-card-foreground transition-colors" href="#">Werkzeuge</a></li>
                <li><a class="hover:text-card-foreground transition-colors" href="#">FAQ</a></li>
            </ul>

            <div class="flex items-center gap-3">
                <button @click="toggleDark"
                    class="text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
                    <span v-if="colorMode.value === 'light'">🌙</span>
                    <span v-else>☀️</span>
                </button>

                <a href="#check" class="hidden sm:inline-block text-sm font-semibold px-4 py-2 rounded-lg text-white
                   bg-[linear-gradient(180deg,var(--color-brand),var(--color-brand-600))]
                   hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand/40 transition">Fakten prüfen</a>
            </div>
        </nav>
    </header>
</template>

<script setup lang="ts">

const colorMode = useColorMode()

function toggleDark() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<style scoped>
header a:hover {
    transform: translateY(-1px);
    transition: transform 0.15s ease;
}
</style>
