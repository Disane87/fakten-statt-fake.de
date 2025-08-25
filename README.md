# Fakten statt Fake

A modern starter project built with **Nuxt 4**, **Tailwind CSS 4**, and **shadcn-vue** components.

## 🚀 Features

- ⚡ **Nuxt 4** - The latest version with improved performance and developer experience
- 🎨 **Tailwind CSS 4** - Next-generation utility-first CSS framework
- 🧩 **shadcn-vue** - Beautiful, accessible Vue components built on Radix Vue
- 📱 **Responsive Design** - Mobile-first responsive layout
- 🔧 **TypeScript** - Full TypeScript support for better development experience
- ✨ **Modern Vue 3** - Composition API with `<script setup>`

## 📦 Tech Stack

- [Nuxt 4](https://nuxt.com/) - Vue.js framework for production
- [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn-vue](https://shadcn-vue.com/) - Vue port of shadcn/ui components
- [Radix Vue](https://radix-vue.com/) - Accessible Vue components
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vue 3](https://vuejs.org/) - Progressive JavaScript framework

## 🛠️ Setup

### Prerequisites

- Node.js 18+ 
- npm, pnpm, yarn, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Disane87/fakten-statt-fake.de.git
   cd fakten-statt-fake.de
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   Your application will be available at `http://localhost:3000`

### Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 🎨 Using Components

This starter includes a configured Button component from shadcn-vue. Here's how to use it:

```vue
<template>
  <div>
    <!-- Different button variants -->
    <Button variant="default">Default Button</Button>
    <Button variant="outline">Outline Button</Button>
    <Button variant="secondary">Secondary Button</Button>
    <Button variant="ghost">Ghost Button</Button>
    <Button variant="link">Link Button</Button>
    
    <!-- Different sizes -->
    <Button size="sm">Small Button</Button>
    <Button size="default">Default Button</Button>
    <Button size="lg">Large Button</Button>
  </div>
</template>

<script setup>
import Button from '@/components/ui/Button.vue'
</script>
```

## 📁 Project Structure

```
.
├── app/                    # Nuxt 4 app directory
│   ├── app.vue            # Main app component
│   ├── assets/            # Assets (CSS, images, etc.)
│   │   └── css/
│   │       └── main.css   # Tailwind CSS with custom variables
│   ├── components/        # Vue components
│   │   └── ui/           # shadcn-vue components
│   │       └── Button.vue
│   └── lib/              # Utility functions
│       └── utils.ts      # Class merging utilities
├── public/               # Static files
├── components.json       # shadcn-vue configuration
├── nuxt.config.ts       # Nuxt configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── package.json         # Dependencies and scripts
```

## 🧩 Adding More shadcn-vue Components

While the shadcn-vue CLI had some compatibility issues with Nuxt 4, you can manually add components:

1. Browse available components at [shadcn-vue.com](https://shadcn-vue.com/)
2. Copy the component code to `app/components/ui/`
3. Install any required dependencies
4. Import and use in your components

## 🎯 Customization

### Tailwind CSS

Customize your design system by editing:
- `tailwind.config.js` - Tailwind configuration
- `app/assets/css/main.css` - Custom CSS variables and styles

### Nuxt Configuration

Modify `nuxt.config.ts` to add:
- Additional modules
- Build optimizations
- Environment variables
- SEO settings

## 📚 Resources

- [Nuxt 4 Documentation](https://nuxt.com/docs)
- [Tailwind CSS 4 Documentation](https://tailwindcss.com/docs)
- [shadcn-vue Documentation](https://shadcn-vue.com/docs)
- [Vue 3 Documentation](https://vuejs.org/guide/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
