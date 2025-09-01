#!/bin/bash
set -e

echo "🚀 Running post-create setup..."

# Install dependencies
echo "📦 Installing Node.js dependencies..."
pnpm install

# Setup Supabase if not already initialized
if [ ! -f "supabase/config.toml" ]; then
    echo "🗄️ Initializing Supabase..."
    supabase init
fi

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Supabase
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Other APIs (add your keys here)
FACTCHECK_API_KEY=
GCV_API_KEY=
NEWSAPI_KEY=
GOOGLE_CSE_API_KEY=
GOOGLE_CSE_CX_ID=
THREADS_APP_ID=
THREADS_APP_SECRET=
EOF
fi

# Setup git hooks if needed
if [ -d ".git" ]; then
    echo "🔧 Setting up git hooks..."
    # Add any git hooks setup here
fi

echo "✅ Post-create setup complete!"
