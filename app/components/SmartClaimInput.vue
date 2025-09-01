<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

type ResultType = 'text' | 'url' | 'image' | 'images' | 'video' | 'ocr'
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

type OcrResult = {
  description: string
  locale?: string
}

type Payload =
  | { type: 'text'; value: string }
  | { type: 'url' | 'image' | 'images' | 'video'; value: string | string[]; meta: OgMeta }
  | { type: 'ocr'; value: string; ocrResults: OcrResult[] }

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
  (e: 'ocr:error', err: string): void
}>()

const input = ref(props.modelValue ?? '')
const loadingOg = ref(false)
const loadingOcr = ref(false)
const og: any = ref<OgMeta | null>(null)
const ocrResults = ref<OcrResult[]>([])
const uploadedImage = ref<string | null>(null)
const inputIsUrl = computed(() => isLikelyUrl(input.value))

watch(() => props.modelValue, v => {
  if (typeof v === 'string' && v !== input.value) input.value = v
})

onMounted(() => {
  if (props.autoFocus) {
    requestAnimationFrame(() => {
      ; (document.getElementById('smart-claim-textarea') as HTMLTextAreaElement | null)?.focus()
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
  if (!input.value.trim() && !uploadedImage.value) return

  if (uploadedImage.value && ocrResults.value.length > 0) {
    emit('change', {
      type: 'ocr',
      value: ocrResults.value.map(r => r.description).join(' '),
      ocrResults: ocrResults.value
    })
    return
  }

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

// File upload and OCR functions
async function handleFileUpload(file: File) {
  if (!file.type.startsWith('image/')) {
    emit('ocr:error', 'Nur Bilddateien sind erlaubt')
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    emit('ocr:error', 'Datei zu groß (max 10MB)')
    return
  }

  // Preview anzeigen
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImage.value = e.target?.result as string
  }
  reader.readAsDataURL(file)

  // OCR durchführen
  await performOcr(file)
}

async function performOcr(file: File) {
  loadingOcr.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const results = await $fetch<OcrResult[]>('/api/ocr/extract', {
      method: 'POST',
      body: formData
    })

    ocrResults.value = results

    // Text aus OCR-Ergebnissen in Input setzen
    if (results.length > 0) {
      input.value = results.map(r => r.description).join(' ')
      emit('update:modelValue', input.value)
      emitChange()
    }
  } catch (e: any) {
    emit('ocr:error', e?.message ?? 'OCR-Fehler')
  } finally {
    loadingOcr.value = false
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    handleFileUpload(files[0])
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
}

async function handlePaste(event: ClipboardEvent) {
  const items = event.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      event.preventDefault()
      const file = item.getAsFile()
      if (file) {
        await handleFileUpload(file)
      }
      break
    }
  }
}

function clearImage() {
  uploadedImage.value = null
  ocrResults.value = []
  input.value = ''
  emit('update:modelValue', input.value)
}
</script>

<template>
  <div class="w-full flex flex-col gap-3">
    <!-- Label + Mode badge -->


    <!-- Textarea Container -->
    <div
      class="rounded-xl border border-gray-300 bg-white/60 shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:border-gray-700 dark:bg-gray-900/60 dark:focus-within:border-blue-400 dark:focus-within:ring-blue-900/40">
      <textarea id="smart-claim-textarea" :rows="rows ?? 6" :maxlength="max" :disabled="disabled || !!uploadedImage"
        v-model="input" 
        :placeholder="uploadedImage ? 'Text aus Bild erkannt...' : placeholder ?? 'Text eingeben, URL einfügen oder Bild hochladen/einfügen…'"
        class="block w-full border-0 bg-transparent px-4 py-3 text-sm text-gray-900 outline-none dark:text-gray-100 resize-none"
        @drop="handleDrop" @dragover="handleDragOver" @paste="handlePaste" />

      <div class="flex items-center justify-between bg-transparent p-2">
        <div class="flex items-center justify-start">
          <input type="file" id="file-upload" accept="image/*" class="hidden"
            @change="(e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) handleFileUpload(file) }">
          <label for="file-upload"
            class="inline-flex items-center gap-2 rounded-lg border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            title="Bild hochladen für Texterkennung">
            <svg viewBox="0 0 24 24" class="h-4 w-4">
              <path fill="currentColor"
                d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
            <span>Bild hochladen oder hier hineinziehen</span>
          </label>
        </div>
        <div class="flex items-center justify-between">
          <!-- <span class="text-sm font-medium text-gray-700 dark:text-gray-200">Eingabe</span> -->
          <span class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs" :class="{
            'border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300': inputIsUrl,
            'border-purple-300 text-purple-700 dark:border-purple-600 dark:text-purple-300': uploadedImage,
            'border-emerald-300 text-emerald-700 dark:border-emerald-600 dark:text-emerald-300': !inputIsUrl && !uploadedImage
          }" title="Automatische Erkennung">
            <svg v-if="inputIsUrl" viewBox="0 0 24 24" class="h-3.5 w-3.5">
              <path fill="currentColor"
                d="M10.59 13.41a1 1 0 0 1 0-1.41l2.59-2.59a1 1 0 1 1 1.41 1.41l-2.59 2.59a1 1 0 0 1-1.41 0Z" />
              <path fill="currentColor" d="M9 17a4 4 0 0 1 0-8h2a1 1 0 1 1 0 2H9a2 2 0 0 0 0 4h2a1 1 0 1 1 0 2H9Z" />
              <path fill="currentColor" d="M15 17h-2a1 1 0 1 1 0-2h2a2 2 0 0 0 0-4h-2a1 1 0 1 1 0-2h2a4 4 0 0 1 0 8Z" />
            </svg>
            <svg v-else-if="uploadedImage" viewBox="0 0 24 24" class="h-3.5 w-3.5">
              <path fill="currentColor"
                d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
            <svg v-else viewBox="0 0 24 24" class="h-3.5 w-3.5">
              <path fill="currentColor" d="M5 4h14v2H5zM5 9h14v2H5zM5 14h14v2H5zM5 19h10v2H5z" />
            </svg>
            <span>{{ uploadedImage ? 'OCR' : inputIsUrl ? 'URL' : 'Text' }}</span>
          </span>
        </div>
        <div class="flex items-center justify-end px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{{ charCount }}/{{ max }}</span>
        </div>
      </div>

    </div>

    <!-- File Upload Area -->


    <!-- OCR Loading -->
    <div v-if="loadingOcr" class="mt-1">
      <div
        class="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-300">
        <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" class="opacity-25" />
          <path d="M4 12a8 8 0 0 1 8-8" fill="currentColor" />
        </svg>
        Text wird aus Bild extrahiert…
      </div>
    </div>

    <!-- Image Preview -->
    <div v-if="uploadedImage" class="mt-1">
      <div
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div class="relative">
          <img :src="uploadedImage" alt="Hochgeladenes Bild" class="w-full max-h-64 object-contain">
          <button @click="clearImage"
            class="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 transition"
            title="Bild entfernen">
            <svg viewBox="0 0 24 24" class="h-4 w-4">
              <path fill="currentColor"
                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" />
            </svg>
          </button>
        </div>
        <div v-if="ocrResults.length > 0" class="border-t border-gray-100 p-3 dark:border-gray-800">
          <div class="text-xs mb-2 text-gray-600 dark:text-gray-300">
            Erkannter Text ({{ ocrResults.length }} Bereiche)
          </div>
          <div class="space-y-1 text-xs">
            <div v-for="(result, i) in ocrResults" :key="i" class="p-2 bg-gray-50 rounded dark:bg-gray-800">
              <span class="font-mono">{{ result.description }}</span>
              <span v-if="result.locale" class="ml-2 text-gray-500 text-[10px]">({{ result.locale }})</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- OG Preview (URL mode) -->
    <div v-if="inputIsUrl && !uploadedImage" class="mt-1">

      <div v-if="loadingOg"
        class="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-300">
        <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" class="opacity-25" />
          <path d="M4 12a8 8 0 0 1 8-8" fill="currentColor" />
        </svg>
        Vorschau wird geladen…
      </div>

      <div v-else-if="og"
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div class="flex overflow-hidden">
          <div class="w-24 shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img v-if="og.image" :src="og.image" alt="" class="w-full h-full object-cover" />
            <div v-else class="flex h-full w-full items-center justify-center text-gray-400">🔗</div>
          </div>
          <div class="flex-1 p-3">
            <div class="flex items-start justify-between gap-2">
              <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {{ og.title || 'Unbenannte Seite' }}
              </div>
              <span class="shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide" :class="{
                'border-fuchsia-300 text-fuchsia-700 dark:border-fuchsia-600 dark:text-fuchsia-300': (og.type || '').includes('video'),
                'border-emerald-300 text-emerald-700 dark:border-emerald-600 dark:text-emerald-300': !og.type || (og.type || '').includes('article'),
                'border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-300': (og.images?.length ?? 0) > 1
              }">
                {{ (og.type?.toUpperCase()) || ((og.images?.length ?? 0) > 1 ? 'IMAGES' : 'URL') }}
              </span>
            </div>
            <p class="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
              {{ og.description || og.url }}
            </p>
            <div class="mt-1 flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
              <img v-if="og.favicon" :src="og.favicon" alt="" class="h-3.5 w-3.5 rounded-sm" />
              <span>{{ og.siteName || getOgHost(og.url) }}</span>

            </div>
          </div>
        </div>
        <div v-if="og.video" class="border-t border-gray-100 p-3 dark:border-gray-800">
          <div class="text-xs mb-2 text-gray-600 dark:text-gray-300">Erkanntes Video</div>
          <video :src="og.video" controls class="w-full rounded-lg"></video>
        </div>
        <div v-else-if="og.images && og.images.length > 1" class="border-t border-gray-100 p-3 dark:border-gray-800">
          <div class="text-xs mb-2 text-gray-600 dark:text-gray-300">Erkannte Bilder ({{ og.images.length }})</div>
          <div class="flex flex-wrap gap-2">
            <img v-for="(img, i) in og.images" :key="i" :src="img" class="h-20 w-20 rounded object-cover" />
          </div>
        </div>
      </div>

      <div v-else
        class="rounded-xl border border-dashed border-gray-300 p-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
        Keine OG-Daten gefunden – die URL wird trotzdem als Quelle übernommen.
      </div>
    </div>
  </div>
</template>

<style scoped>
/* optional: hübschere Scrollbar für die Textarea (nur WebKit) */
textarea::-webkit-scrollbar {
  width: 10px
}

textarea::-webkit-scrollbar-thumb {
  border-radius: 8px
}
</style>
