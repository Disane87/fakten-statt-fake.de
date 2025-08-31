# Target Audience & Mentioned Persons Integration - Zusammenfassung

Diese Dokumentation beschreibt die Integration der Target Audience-Erkennung und Personenerkennung in das Fact-Checking-System.

## Änderungen

### 1. Typen (shared/FactCheckModels.ts)
- Neues Feld `targetAudience: string[]` in `FactCheckResult` Interface
- **NEU**: Neues Feld `mentionedPersons: string[]` für erkannte Personen
- Unterstützt mehrere Zielgruppen und Personen pro Text

### 2. Prompt (supabase/seed/prompts.sql)
- Erweitert den factcheck-Prompt um Target Audience-Erkennung
- **NEU**: Erweitert um Personenerkennung (`mentionedPersons`)
- **VERBESSERT**: Schärfere Unterscheidung zwischen "fact" und "fake"
- **NEU**: Automatische Rechtschreibkorrektur in allen Ausgabefeldern
- **KRITISCHE REGELN**:
  - "fact" = NUR für objektiv verifizierbare, wissenschaftlich bewiesene Aussagen
  - "fake" = für falsche Aussagen, Meinungen als Fakten, Schuldzuweisungen, unbeweisbare Behauptungen
- Regel: Extrahiert Namen (Vor- und Nachname), Titel (Dr., Prof., etc.), öffentliche Personen
- Verwendet die erkannte Eingabesprache für Namen
- Erweiterte Fake-Taktiken für bessere Klassifizierung
- **Rechtschreibkorrektur**: Korrigiert Tippfehler, falsche Groß-/Kleinschreibung und häufige Rechtschreibfehler

### 3. Frontend (app/components/FactCheckResult.vue)
- Neue Sektion "Target Audience" in der Ergebnisanzeige (blaue Badges)
- **NEU**: Neue Sektion "Mentioned Persons" (violette Badges mit 👤 Icon)
- Formatierung: Unterstriche werden zu Leerzeichen, erste Buchstaben groß

### 4. Datenbank
- Migration `20250831000001_add_target_audience_and_mentioned_persons_support.sql`
- Enum-Type `target_audience_enum` mit allen unterstützten Zielgruppen
- **NEU**: Dokumentation für `mentionedPersons` als String-Array in JSONB
- JSONB-Struktur in claims-Tabelle unterstützt automatisch neue Felder

### 5. Dokumentation
- `docs/target-audience-examples.ts`: Beispiele für verschiedene Zielgruppen
- **NEU**: `docs/mentioned-persons-examples.ts`: Beispiele für Personenerkennung
- Testfälle und erwartete Erkennungen für Validierung

## Unterstützte Zielgruppen

1. **general_public**: Allgemeine Öffentlichkeit
2. **professionals**: Berufstätige/Fachkräfte
3. **experts**: Fachexperten
4. **children**: Kinder und Jugendliche
5. **young_adults**: Junge Erwachsene (18-35)
6. **elderly**: Ältere Menschen (65+)
7. **parents**: Eltern und Erziehungsberechtigte
8. **voters**: Wahlberechtigte Bürger
9. **consumers**: Verbraucher/Käufer
10. **students**: Schüler und Studierende
11. **specific_group**: Spezifische Interessensgruppen

## Backend-Integration

Das Backend benötigt keine Änderungen, da:
- Der OllamaService bereits JSON-Responses verarbeitet
- Die claims-Tabelle JSONB verwendet (automatische Unterstützung)
- Der PromptBuilderService die neuen Prompts verwendet

## Rechtschreibkorrektur

### ✅ Automatisch korrigiert werden:
- **Häufige Tippfehler**: "teh" → "die", "udn" → "und", "wahr" → "war"
- **Groß-/Kleinschreibung**: "angela merkel" → "Angela Merkel"
- **Fehlende Satzzeichen**: Grundlegende Interpunktion wird ergänzt
- **Englische Fehler**: "goverment" → "government", "recieve" → "receive"

### 📝 Beispiele:
```
Input:  "angla merkel ist schuld an teh migrationskrise"
Output: "Angela Merkel ist schuld an der Migrationskrise"

Input:  "donald trump udn joe biden kämpften um die wahl"
Output: "Donald Trump und Joe Biden kämpften um die Wahl"
```

### 🎯 Beibehaltenes Verhalten:
- **Originalkontext**: Der Sinn und Kontext bleibt erhalten
- **Bedeutung**: Keine inhaltlichen Änderungen
- **Sprache**: Die erkannte Sprache wird beibehalten

## Verbesserte Fact vs Fake Unterscheidung

### ✅ Als "FACT" klassifiziert:
- **Objektiv messbare Daten**: "Deutschland hat 83 Mio. Einwohner"
- **Wissenschaftlich bewiesene Tatsachen**: "Wasser kocht bei 100°C"
- **Historische Fakten**: "Merkel war 2005-2021 Bundeskanzlerin"
- **Statistisch belegbare Zahlen**: "2015 kamen 1 Mio. Flüchtlinge"

### ❌ Als "FAKE" klassifiziert:
- **Subjektive Schuldzuweisungen**: "Merkel ist schuld an der Migrationskrise"
- **Meinungen als Fakten**: "Bitcoin ist die beste Investition"
- **Pauschale Verallgemeinerungen**: "Politiker lügen immer"
- **Unbeweisbare Kausalbehauptungen**: "Lockdowns zerstörten die Wirtschaft"
- **Verschwörungstheorien**: "Impfungen enthalten Mikrochips"

### 🎯 Erweiterte Fake-Taktiken:
- `blame_attribution`: Subjektive Schuldzuweisungen
- `oversimplification`: Unzulässige Vereinfachung komplexer Themen
- `opinion_as_fact`: Meinungen werden als Fakten präsentiert
- `false_causation`: Unbelegte Ursache-Wirkungs-Behauptungen
- `sweeping_generalization`: Pauschale Verallgemeinerungen

## Beispiel-Outputs

### Rechtschreibkorrektur + Fake-Klassifizierung:
**Input**: "angla merkel ist schuld an teh migrationskrise udn hat deutschland ruiniert"

```json
{
  "result": "fake",
  "language": "de", 
  "tone": ["accusatory", "political"],
  "textType": "opinion",
  "targetAudience": ["voters"],
  "mentionedPersons": ["Angela Merkel"],
  "claim": ["Angela Merkel ist schuld an der Migrationskrise und hat Deutschland ruiniert"],
  "keywords": ["merkel", "schuld", "migration", "krise", "deutschland"],
  "compactCounter": "Die Migrationskrise ist das Ergebnis komplexer Faktoren, nicht einer Person.",
  "explanation": "Diese Behauptung stellt subjektive Schuldzuweisungen dar, die nicht objektiv beweisbar sind.",
  "explanationDetails": "Die Migrationskrise und politische Entwicklungen resultieren aus komplexen Zusammenhängen...",
  "sources": [],
  "fakeTactic": [{"tactic": "blame_attribution", "description": "Subjektive Schuldzuweisung ohne objektive Beweise"}]
}
```

### Fake-Klassifizierung (Schuldzuweisung):
```json
{
  "result": "fake",
  "language": "de", 
  "tone": ["accusatory", "political"],
  "textType": "opinion",
  "targetAudience": ["voters"],
  "mentionedPersons": ["Angela Merkel"],
  "claim": ["Angela Merkel ist schuld an der Migrationskrise"],
  "keywords": ["merkel", "schuld", "migration", "krise"],
  "compactCounter": "Die Migrationskrise ist das Ergebnis komplexer politischer, wirtschaftlicher und sozialer Faktoren.",
  "explanation": "Diese Behauptung stellt eine subjektive Schuldzuweisung dar, die nicht objektiv beweisbar ist.",
  "explanationDetails": "Die Migrationskrise resultiert aus einem komplexen Zusammenspiel verschiedener Faktoren...",
  "sources": [],
  "fakeTactic": [{"tactic": "blame_attribution", "description": "Subjektive Schuldzuweisung ohne objektive Beweise"}]
}
```

### Fact-Klassifizierung (Objektive Tatsache):
```json
{
  "result": "fact",
  "language": "de",
  "tone": ["neutral"],
  "textType": "statement", 
  "targetAudience": ["general_public"],
  "mentionedPersons": ["Angela Merkel"],
  "claim": ["Angela Merkel war von 2005 bis 2021 deutsche Bundeskanzlerin"],
  "keywords": ["merkel", "bundeskanzlerin", "2005", "2021"],
  "compactCounter": "",
  "explanation": "Dies ist eine objektiv überprüfbare historische Tatsache.",
  "explanationDetails": "Angela Merkel amtierte tatsächlich als deutsche Bundeskanzlerin von 2005 bis 2021.",
  "sources": [],
  "fakeTactic": []
}
```

## Deployment

1. Führe die Migration aus: `npx supabase db reset --local`
2. Stelle sicher, dass die neuen Prompts geladen werden
3. Das Frontend zeigt automatisch die neuen Target Audience-Informationen an
