#!/bin/bash
set -e

echo "🌟 Running post-start setup..."

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if Ollama is running and pull default model
echo "🤖 Setting up Ollama..."
if curl -s http://localhost:11434/api/version > /dev/null; then
    echo "📥 Pulling default Ollama model (llama2)..."
    curl -X POST http://localhost:11434/api/pull -d '{"name": "llama2"}' &
    
    # Also pull a smaller model for faster responses
    echo "📥 Pulling smaller model (phi)..."
    curl -X POST http://localhost:11434/api/pull -d '{"name": "phi"}' &
else
    echo "⚠️ Ollama service not ready yet"
fi

# Start Supabase if not already running
echo "🗄️ Starting Supabase..."
if ! supabase status > /dev/null 2>&1; then
    supabase start --ignore-health-check || echo "⚠️ Supabase might need manual start"
fi

# Show service status
echo "📊 Service Status:"
echo "- Ollama API: http://localhost:11434"
echo "- Supabase Studio: http://localhost:54321"
echo "- Nuxt Dev Server: http://localhost:3000 (run 'pnpm dev' to start)"

echo "✅ Post-start setup complete!"
echo "🎉 Your development environment is ready!"
