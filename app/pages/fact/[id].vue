<template>
  <div class="min-h-screen max-w-6xl mx-auto flex flex-col relative overflow-hidden">
    <!-- Animated background elements -->
    
    <div class="flex-1 flex flex-col z-10 px-4 py-8 max-w-none w-full">
      <!-- Navigation zurück zur Startseite -->
      <!-- <div class="flex justify-center mb-8">
        <NuxtLink 
          to="/" 
          class="inline-flex items-center gap-3 text-slate-300 hover:text-white transition-all duration-300 text-sm font-medium bg-slate-800/60 backdrop-blur-xl p-3 rounded-full shadow-lg hover:shadow-xl hover:bg-slate-700/60 border-0 group"
        >
          <svg class="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Zurück zur Fact-Check-Suche
        </NuxtLink>
      </div> -->

      <!-- Loading State -->
      <div v-if="pending" class="flex flex-col items-center justify-center py-24 gap-6">
        <div class="relative">
          <div class="animate-spin rounded-full h-20 w-20 border-4 border-blue-200/30 border-t-blue-400"></div>
          <div class="absolute inset-0 rounded-full border-4 border-indigo-200/20 border-r-indigo-400 animate-spin" style="animation-direction: reverse; animation-duration: 1.5s;"></div>
        </div>
        <div class="flex flex-col items-center gap-2">
          <p class="text-slate-300 font-medium text-lg animate-pulse">Lade Fact-Check...</p>
          <div class="flex gap-1">
            <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.1s;"></div>
            <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex justify-center items-center py-24">
        <div class="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border-0 max-w-lg w-full overflow-hidden">
          <!-- Error background glow -->
          <div class="bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-3xl p-4 -m-4"></div>
          
          <div class="flex flex-col items-center text-center gap-6">
            <div class="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
              <svg class="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            <div class="flex flex-col gap-4">
              <h2 class="text-2xl font-bold text-red-400">Fact nicht gefunden</h2>
              <p class="text-slate-300 leading-relaxed">{{ error.statusMessage || 'Ein Fehler ist aufgetreten beim Laden der Daten.' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-else-if="data" class="flex flex-col gap-4">
        <!-- Claim als Zitat mit Datum -->
        <div class="border-0 rounded-3xl  shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-500 mx-4 sm:mx-8 lg:mx-16">
          <!-- Gradient overlay -->
          
          <div class="flex items-start gap-6">
            <!-- Quote Icon -->
            <div class="text-blue-400 bg-blue-500/10 p-3 rounded-full group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
              </svg>
            </div>
            
            <!-- Quote Content -->
            <div class="flex-1 min-w-0 flex flex-col">
              <blockquote class="text-xl text-slate-100 leading-relaxed font-medium flex flex-col">
                <h1 class="font-monospace text-2xl">{{ data.data.text }}</h1>
              </blockquote>
              
              <!-- Metadata -->
              <div class="flex flex-wrap items-center gap-2 text-sm text-slate-300">
                <div class="flex items-center gap-2 rounded-full border-0">
                  <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span>{{ formatDate(data.data.createdAt) }}</span>
                </div>
                
                <div class="flex items-center gap-2 rounded-full border-0">
                  <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                  <span>ID: {{ data.data.id }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- FactCheck Result -->
        <div v-if="data.data.result" class="flex justify-center">
          <div class="backdrop-blur-xl rounded-3xl  border-0 shadow-2xl mx-4 sm:mx-8 lg:mx-16 w-full max-w-none flex flex-col gap-6">
            
            <FactCheckResult 
              :result="data.data.result" 
              :moodPill="moodPill"
              :flagCode="flagCode"
              :getFavicon="getFavicon"
            />
          </div>
        </div>

        <!-- Share Section -->
        <div class=" border-0 rounded-3xl mx-4 sm:mx-8 lg:mx-16 flex flex-col gap-6">
          <div class="flex items-center gap-3">
            <div class="p-3 rounded-full">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white">Teilen</h3>
          </div>
          
          <div class="flex flex-col gap-6">
            <div class="rounded-2xl p-4 border-0">
              <div class="flex items-center gap-4">
                <input 
                  type="text" 
                  :value="shareUrl" 
                  readonly
                  class="flex-1  border-0 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                  placeholder="URL wird geladen..."
                >
                <button 
                  @click="copyToClipboard"
                  class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  Kopieren
                </button>
              </div>
            </div>
            
            <!-- Social sharing buttons -->
            <div class="flex flex-wrap gap-3">
              <button 
                @click="shareOnTwitter"
                class="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl text-sm font-medium transition-all duration-300 border-0"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Twitter
              </button>
              
              <button 
                @click="shareOnFacebook"
                class="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-xl text-sm font-medium transition-all duration-300 border-0"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
              
              <button 
                @click="shareOnLinkedIn"
                class="flex items-center gap-2 px-4 py-2 bg-blue-700/20 hover:bg-blue-700/30 text-blue-300 rounded-xl text-sm font-medium transition-all duration-300 border-0"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Get route parameter
const route = useRoute();
const factId = route.params.id;

import FactCheckResult from '~/components/FactCheckResult.vue';

// Set page meta
useHead({
  title: `Fact-Check #${factId} - Fakten statt Fake`,
  meta: [
    { name: 'description', content: 'Detaillierte Fact-Check Analyse eines Claims' }
  ]
});

// Fetch fact data
const { data, pending, error } = await useFetch(`/api/facts/${factId}`);

// Computed for sharing
const shareUrl = computed(() => {
  if (process.client) {
    return window.location.href;
  }
  return '';
});

// Methods
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const copyToClipboard = async () => {
  if (navigator.clipboard && shareUrl.value) {
    try {
      await navigator.clipboard.writeText(shareUrl.value);
      // You could add a toast notification here
      console.log('URL copied to clipboard');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }
};

const shareOnTwitter = () => {
  if (data.value) {
    const text = `Fact-Check: "${data.value.data.text.substring(0, 100)}..." - Fakten statt Fake`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl.value)}`;
    window.open(url, '_blank');
  }
};

const shareOnFacebook = () => {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`;
  window.open(url, '_blank');
};

const shareOnLinkedIn = () => {
  if (data.value) {
    const title = `Fact-Check: ${data.value.data.text.substring(0, 80)}...`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl.value)}&title=${encodeURIComponent(title)}`;
    window.open(url, '_blank');
  }
};

// Helper functions for FactCheckResult component
const moodPill = (mood) => {
  const moodColors = {
    positive: 'bg-green-500',
    negative: 'bg-red-500',
    neutral: 'bg-gray-500',
    warning: 'bg-yellow-500'
  };
  return moodColors[mood] || 'bg-gray-500';
};

const flagCode = (language) => {
  const languageToFlag = {
    'de': 'de',
    'en': 'us',
    'fr': 'fr',
    'es': 'es',
    'it': 'it',
    'pt': 'pt',
    'nl': 'nl'
  };
  return languageToFlag[language?.toLowerCase()] || 'us';
};

const getFavicon = (url) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
  } catch {
    return '';
  }
};

// SEO and OG tags based on the data
watchEffect(() => {
  if (data.value) {
    const claim = data.value.data;
    const resultText = claim.result?.result === 'fact' ? 'Bestätigt' : 
                      claim.result?.result === 'fake' ? 'Als Fake identifiziert' : 'Unbestätigt';
    
    useHead({
      title: `${resultText}: "${claim.text.substring(0, 60)}..." - Fakten statt Fake`,
      meta: [
        { name: 'description', content: `Fact-Check Ergebnis: ${resultText}. ${claim.result?.explanation?.substring(0, 150) || ''}` },
        { property: 'og:title', content: `Fact-Check: ${claim.text.substring(0, 100)}...` },
        { property: 'og:description', content: `${resultText}: ${claim.result?.explanation?.substring(0, 200) || ''}` },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: shareUrl.value }
      ]
    });
  }
});
</script>
