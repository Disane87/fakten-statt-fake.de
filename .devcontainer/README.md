# Development Container Setup

Dieser Devcontainer stellt eine vollständige Entwicklungsumgebung für das Fakten-statt-Fake.de Projekt bereit.

## Enthaltene Services

### 🔧 Entwicklungstools
- **Node.js 20** mit pnpm
- **Git** mit GitHub CLI
- **Docker-in-Docker** Support
- **Zsh** mit Oh My Zsh

### 🗄️ Supabase
- **Supabase CLI** - Vollständiges Backend-as-a-Service
- **Ports**: 54321-54326
- **Studio**: http://localhost:54321

### 🤖 Ollama
- **Ollama API** - Lokale LLM-Inferenz
- **Port**: 11434
- **API**: http://localhost:11434
- **Standard-Modelle**: llama2, phi

### 🌐 Nuxt.js
- **Development Server**: Port 3000
- **URL**: http://localhost:3000

## Schnellstart

1. **Container öffnen**:
   ```bash
   # In VS Code: Command Palette -> "Dev Containers: Reopen in Container"
   ```

2. **Services starten**:
   ```bash
   # Supabase (falls nicht automatisch gestartet)
   supabase start
   
   # Nuxt Development Server
   pnpm dev
   ```

3. **Ollama-Modelle laden**:
   ```bash
   # Standard-Modell
   curl -X POST http://localhost:11434/api/pull -d '{"name": "llama2"}'
   
   # Kleineres, schnelleres Modell
   curl -X POST http://localhost:11434/api/pull -d '{"name": "phi"}'
   ```

## Service-URLs

| Service | URL | Beschreibung |
|---------|-----|--------------|
| Nuxt Dev | http://localhost:3000 | Hauptanwendung |
| Supabase Studio | http://localhost:54321 | Database-Management |
| Supabase API | http://localhost:54323 | REST API |
| Ollama API | http://localhost:11434 | LLM API |

## Umgebungsvariablen

Die `.env` Datei wird automatisch erstellt. Fügen Sie Ihre API-Keys hinzu:

```env
# Supabase
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-anon-key

# Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Externe APIs
FACTCHECK_API_KEY=your-key
NEWSAPI_KEY=your-key
# ... weitere Keys
```

## Troubleshooting

### Supabase startet nicht
```bash
supabase stop
supabase start --ignore-health-check
```

### Ollama-Modelle laden nicht
```bash
# Service-Status prüfen
curl http://localhost:11434/api/version

# Modell manuell laden
ollama pull llama2
```

### Port-Konflikte
Prüfen Sie, ob die Ports bereits belegt sind:
```bash
netstat -tulpn | grep :54321
```

## Entwicklung

Der Container ist für optimale Entwicklungserfahrung konfiguriert:

- **Hot Reload** für Nuxt.js
- **Automatische Formatierung** mit Prettier
- **Vue 3** Support mit Volar
- **TailwindCSS** IntelliSense
- **Supabase** Integration

## GPU-Support

Für GPU-beschleunigte Ollama-Inferenz stellen Sie sicher, dass:
1. NVIDIA Docker Runtime installiert ist
2. GPU im Container verfügbar ist

```bash
# GPU-Status prüfen
nvidia-smi
```
