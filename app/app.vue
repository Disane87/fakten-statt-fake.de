<template>
  <div class="min-h-screen bg-background">
    <NuxtRouteAnnouncer />
    
    <!-- Hero Section -->
    <div class="container mx-auto px-4 py-16">
      <div class="text-center space-y-8">
        <h1 class="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          Fakten statt Fake
        </h1>
        <p class="mx-auto max-w-2xl text-xl text-muted-foreground">
          A modern starter project built with Nuxt 4, Tailwind CSS 4, and shadcn-vue components.
        </p>
        
        <!-- Demo Buttons -->
        <div class="flex flex-wrap justify-center gap-4 pt-8">
          <Button variant="default" size="lg">
            Get Started
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
          <Button variant="secondary" size="lg">
            View Docs
          </Button>
        </div>
        
        <!-- Feature Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
          <Card>
            <CardHeader>
              <CardTitle>🚀 Nuxt 4</CardTitle>
              <CardDescription>
                The latest version of Nuxt.js with improved performance and developer experience.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>🎨 Tailwind CSS 4</CardTitle>
              <CardDescription>
                Next-generation utility-first CSS framework with enhanced features.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>🧩 shadcn-vue</CardTitle>
              <CardDescription>
                Beautiful, accessible Vue components built on top of Radix Vue and Tailwind.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        
        <!-- Technology Stack -->
        <div class="pt-16">
          <h2 class="text-2xl font-semibold text-center mb-8">Technology Stack</h2>
          <div class="flex flex-wrap justify-center gap-4">
            <Button variant="ghost" size="sm" class="bg-accent">Vue 3</Button>
            <Button variant="ghost" size="sm" class="bg-accent">TypeScript</Button>
            <Button variant="ghost" size="sm" class="bg-accent">Nuxt 4</Button>
            <Button variant="ghost" size="sm" class="bg-accent">Tailwind 4</Button>
            <Button variant="ghost" size="sm" class="bg-accent">shadcn-vue</Button>
            <Button variant="ghost" size="sm" class="bg-accent">Radix Vue</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'

// Set page title and meta
useHead({
  title: 'Fakten statt Fake - Nuxt 4 + Tailwind 4 + shadcn-vue',
  meta: [
    { name: 'description', content: 'A modern starter project built with Nuxt 4, Tailwind CSS 4, and shadcn-vue components.' }
  ]
})
</script>
