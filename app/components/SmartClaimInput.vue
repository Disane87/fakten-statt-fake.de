<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

type ResultType = 'text' | 'url' | 'image' | 'images' | 'video'
type OgMeta = {
  url?: string
  siteName?: string
  title?: string
  description?: string
  image?: string
  images?: string[]
  video?: string
  type?: string
  favicon?: string
}

type Payload =
  | { type: 'text'; value: string }
  | { type: 'url' | 'image' | 'images' | 'video'; value: string | string[]; meta: OgMeta }

const props = defineProps<{
  modelValue?: string
  placeholder?: string
  autoFocus?: boolean
  disabled?: boolean
  rows?: number
  maxLength?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'change', payload: Payload): void
  (e: 'og:error', err: string): void
}>()

const input = ref(props.modelValue ?? '')
const loadingOg = ref(false)
const og: any = ref<OgMeta | null>(null)
const inputIsUrl = computed(() => isLikelyUrl(input.value))

watch(() => props.modelValue, v => {
  if (typeof v === 'string' && v !== input.value) input.value = v
})

onMounted(() => {
  if (props.autoFocus) {
    requestAnimationFrame(() => {
      ;(document.getElementById('smart-claim-textarea') as HTMLTextAreaElement | null)?.focus()
    })
  }
  // initial detection
  maybeFetchOg()
})

watch(input, async () => {
  emit('update:modelValue', input.value)
  await maybeFetchOg()
  emitChange()
})

function emitChange() {
  if (!input.value.trim()) return
  if (!inputIsUrl.value) {
    emit('change', { type: 'text', value: input.value.trim() })
    return
  }

  // URL case → refine type based on OG/meta or extension
  const t = resolveUrlType(input.value, og.value)
  if (t === 'images') {
    emit('change', { type: 'images', value: og.value?.images ?? [], meta: og.value ?? {} })
  } else if (t === 'image') {
    emit('change', { type: 'image', value: (og.value?.image ?? input.value) as string, meta: og.value ?? {} })
  } else if (t === 'video') {
    emit('change', { type: 'video', value: (og.value?.video ?? input.value) as string, meta: og.value ?? {} })
  } else {
    emit('change', { type: 'url', value: input.value.trim(), meta: og.value ?? {} })
  }
}

async function maybeFetchOg() {
  og.value = null
  if (!inputIsUrl.value) return
  loadingOg.value = true
  try {
    const u = new URL(input.value.trim())
    const res = await $fetch<OgMeta>('/api/og', { query: { url: u.toString() } })
    og.value = res ?? null
  } catch (e: any) {
    emit('og:error', e?.message ?? 'OG fetch failed')
  } finally {
    loadingOg.value = false
  }
}

function isLikelyUrl(v: string): boolean {
  const s = v.trim()
  if (!s) return false
  // quick check
  const urlPattern =
    /^(https?:\/\/)?([a-z0-9\-]+\.)+[a-z]{2,}(?::\d+)?(\/[^\s]*)?$/i
  return urlPattern.test(s)
    || s.startsWith('http://')
    || s.startsWith('https://')
}

function resolveUrlType(raw: string, meta?: OgMeta | null): ResultType {
  const u = raw.trim().toLowerCase()
  const isImageExt = /\.(png|jpe?g|gif|webp|bmp|svg|avif)(\?|#|$)/i.test(u)
  const isVideoExt = /\.(mp4|webm|mov|m4v|mkv|avi)(\?|#|$)/i.test(u)
  if (isImageExt) return 'image'
  if (isVideoExt) return 'video'
  if (!meta) return 'url'
  const ogType = meta.type?.toLowerCase() ?? ''
  if (ogType.includes('video')) return 'video'
  if (meta.images && meta.images.length > 1) return 'images'
  if (meta.image) return 'image'
  return 'url'
}

// Hilfsfunktion für sicheres Parsen der Host-URL
function getOgHost(url?: string): string {
  if (!url) return ''
  try {
    return new URL(url).host
  } catch (e) {
    return ''
  }
}

const charCount = computed(() => input.value.length)
const max = computed(() => props.maxLength ?? 2000)
</script>

<template>
  <div class="w-full flex flex-col gap-3">
    <!-- Label + Mode badge -->
    <div class="flex items-center justify-between">
      <!-- <span class="text-sm font-medium text-gray-700 dark:text-gray-200">Eingabe</span> -->
      <span
        class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
        :class="inputIsUrl ? 'border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300' : 'border-emerald-300 text-emerald-700 dark:border-emerald-600 dark:text-emerald-300'"
        title="Automatische Erkennung"
      >
        <svg v-if="inputIsUrl" viewBox="0 0 24 24" class="h-3.5 w-3.5"><path fill="currentColor" d="M10.59 13.41a1 1 0 0 1 0-1.41l2.59-2.59a1 1 0 1 1 1.41 1.41l-2.59 2.59a1 1 0 0 1-1.41 0Z"/><path fill="currentColor" d="M9 17a4 4 0 0 1 0-8h2a1 1 0 1 1 0 2H9a2 2 0 0 0 0 4h2a1 1 0 1 1 0 2H9Z"/><path fill="currentColor" d="M15 17h-2a1 1 0 1 1 0-2h2a2 2 0 0 0 0-4h-2a1 1 0 1 1 0-2h2a4 4 0 0 1 0 8Z"/></svg>
        <svg v-else viewBox="0 0 24 24" class="h-3.5 w-3.5"><path fill="currentColor" d="M5 4h14v2H5zM5 9h14v2H5zM5 14h14v2H5zM5 19h10v2H5z"/></svg>
        <span>{{ inputIsUrl ? 'URL' : 'Text' }}</span>
      </span>
    </div>

    <!-- Textarea -->
    <div class="relative">
      <textarea
        id="smart-claim-textarea"
        :rows="rows ?? 6"
        :maxlength="max"
        :disabled="disabled"
        v-model="input"
        :placeholder="placeholder ?? 'Text eingeben oder eine URL einfügen…'"
        class="block w-full resize-y rounded-xl border border-gray-300 bg-white/60 px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
      />
      <div class="pointer-events-none absolute bottom-1 right-2 text-xs text-gray-500 dark:text-gray-400">{{ charCount }}/{{ max }}</div>
    </div>

    <!-- OG Preview (URL mode) -->
    <div v-if="inputIsUrl" class="mt-1">
      <div
        v-if="loadingOg"
        class="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-300"
      >
        <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" class="opacity-25"/><path d="M4 12a8 8 0 0 1 8-8" fill="currentColor"/></svg>
        Vorschau wird geladen…
      </div>

      <div
        v-else-if="og"
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div class="grid grid-cols-[96px,1fr] gap-0">
          <div class="h-24 w-24 overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img v-if="og.image" :src="og.image" alt="" class="h-full w-full object-cover" />
            <div v-else class="grid h-full w-full place-items-center text-gray-400">🔗</div>
          </div>
          <div class="p-3">
            <div class="flex items-center justify-between gap-2">
              <div class="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                {{ og.title || 'Unbenannte Seite' }}
              </div>
              <span
                class="shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide"
                :class="{
                  'border-fuchsia-300 text-fuchsia-700 dark:border-fuchsia-600 dark:text-fuchsia-300': (og.type||'').includes('video'),
                  'border-emerald-300 text-emerald-700 dark:border-emerald-600 dark:text-emerald-300': !og.type || (og.type||'').includes('article'),
                  'border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-300': (og.images?.length ?? 0) > 1
                }"
              >
                {{ (og.type?.toUpperCase()) || ((og.images?.length ?? 0) > 1 ? 'IMAGES' : 'URL') }}
              </span>
            </div>
            <p class="mt-0.5 line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
              {{ og.description || og.url }}
            </p>
            <div class="mt-1 flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
              <img v-if="og.favicon" :src="og.favicon" alt="" class="h-3.5 w-3.5 rounded-sm" />
              <span class="truncate">{{ og.siteName || getOgHost(og.url) }}</span>

            </div>
          </div>
        </div>
        <div v-if="og.video" class="border-t border-gray-100 p-3 dark:border-gray-800">
          <div class="text-xs mb-2 text-gray-600 dark:text-gray-300">Erkanntes Video</div>
          <video :src="og.video" controls class="w-full rounded-lg"></video>
        </div>
        <div v-else-if="og.images && og.images.length > 1" class="border-t border-gray-100 p-3 dark:border-gray-800">
          <div class="text-xs mb-2 text-gray-600 dark:text-gray-300">Erkannte Bilder ({{ og.images.length }})</div>
          <div class="grid grid-cols-3 gap-2">
            <img v-for="(img, i) in og.images" :key="i" :src="img" class="h-20 w-full rounded object-cover" />
          </div>
        </div>
      </div>

      <div
        v-else
        class="rounded-xl border border-dashed border-gray-300 p-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400"
      >
        Keine OG-Daten gefunden – die URL wird trotzdem als Quelle übernommen.
      </div>
    </div>
  </div>
</template>

<style scoped>
/* optional: hübschere Scrollbar für die Textarea (nur WebKit) */
textarea::-webkit-scrollbar{width:10px}
textarea::-webkit-scrollbar-thumb{border-radius:8px}
</style>
