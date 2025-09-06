<template>
    <header class="sticky top-0 z-40 transition-all duration-500 lg:z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-backdrop-blur:bg-background/60">
        <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-xl bg-gradient-to-br from-brand to-brand-600 grid place-items-center font-bold text-white shadow-lg">
                    FS
                </div>
                <a href="#" class="font-bold text-lg bg-gradient-to-r from-ink to-ink/80 bg-clip-text text-transparent hover:from-brand hover:to-brand-600 transition-all duration-300">
                    Fakten statt Fakes
                </a>
            </div>

            <ul class="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                <li><a class="hover:text-ink dark:hover:text-panel transition-colors duration-200 hover:underline underline-offset-4" href="#">Leitfaden</a></li>
                <li><a class="hover:text-ink dark:hover:text-panel transition-colors duration-200 hover:underline underline-offset-4" href="#">Faktenchecks</a></li>
                <li><a class="hover:text-ink dark:hover:text-panel transition-colors duration-200 hover:underline underline-offset-4" href="#">Werkzeuge</a></li>
                <li><a class="hover:text-ink dark:hover:text-panel transition-colors duration-200 hover:underline underline-offset-4" href="#">FAQ</a></li>
            </ul>

            <div class="flex items-center gap-3">
                <button @click="toggleDark" class="theme-toggle group">
                    <ClientOnly>
                        <div class="flex items-center justify-center transition-all duration-300">
                            <span v-if="colorMode.value === 'light'" class="text-lg transform group-hover:rotate-12 transition-transform duration-300">🌙</span>
                            <span v-else class="text-lg transform group-hover:rotate-12 transition-transform duration-300">☀️</span>
                        </div>
                        <template #fallback>
                            <div class="w-4 h-4 rounded-full bg-muted animate-pulse"></div>
                        </template>
                    </ClientOnly>
                </button>

                <a href="#check" class="btn-primary hidden sm:inline-flex items-center gap-2">
                   <span>🔍</span>
                   Fakten prüfen
                </a>
            </div>
        </nav>
    </header>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue'
const colorMode = useColorMode()

const systemIsDark = ref(false)

onMounted(() => {
    // System-Mode erkennen
    systemIsDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
})

function toggleDark() {
    if (colorMode.preference === 'system') {
        colorMode.preference = systemIsDark.value ? 'light' : 'dark'
    } else {
        colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
    }
}

function setSystem() {
    colorMode.preference = 'system'
}
</script>

<style scoped>
header a:hover {
    transform: translateY(-1px);
    transition: transform 0.15s ease;
}
</style>
