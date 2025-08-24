# fakten-statt-fake.de

A modern Vue/Nuxt 3 application with serverless functions, Supabase integration, and Tailwind CSS.

## 🚀 Features

- **Vue/Nuxt 3**: Latest Vue.js framework with server-side rendering
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Supabase**: Open-source Firebase alternative with PostgreSQL database
- **Serverless Functions**: Built-in API routes for backend functionality
- **TypeScript**: Full TypeScript support for better development experience

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (optional, for database features)

## 🛠️ Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fakten-statt-fake.de
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
├── app/                    # App configuration
├── assets/                 # CSS and static assets
├── components/             # Vue components
├── composables/            # Composition API utilities
├── pages/                  # File-based routing pages
├── plugins/                # Nuxt plugins
├── public/                 # Static files
├── server/                 # Serverless API routes
│   └── api/               # API endpoints
├── nuxt.config.ts         # Nuxt configuration
└── package.json           # Dependencies and scripts
```

## 🚀 Deployment

This project is configured for serverless deployment and works with:

- **Vercel**: `npm run build` then deploy
- **Netlify**: `npm run generate` for static generation
- **Nuxt Cloud**: Native Nuxt deployment platform

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run generate` - Generate static site
- `npm run preview` - Preview production build locally

## 📚 Learn More

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Vue 3 Documentation](https://vuejs.org/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
