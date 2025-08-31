-- Seed für Target Audience Enum-Werte und Mentioned Persons Dokumentation
-- Diese Werte werden im Prompt und in der KI-Erkennung verwendet

-- TARGET AUDIENCE DOKUMENTATION (als Kommentare für Entwickler-Referenz)
-- 'general_public': Allgemeine Öffentlichkeit ohne spezielle Fachkenntnisse (Nachrichtenartikel, Social Media Posts)
-- 'professionals': Berufstätige in einem spezifischen Arbeitsbereich (Fachzeitschriften, Branchenberichte)
-- 'experts': Fachexperten mit tiefem Spezialwissen (Wissenschaftliche Publikationen, Fachkonferenzen)
-- 'children': Kinder und Jugendliche (Bildungsmaterialien, kindgerechte Erklärungen)
-- 'young_adults': Junge Erwachsene 18-35 Jahre (Campus-Zeitungen, Lifestyle-Magazine)
-- 'elderly': Ältere Menschen 65+ Jahre (Seniorenzeitschriften, Gesundheitsinformationen)
-- 'parents': Eltern und Erziehungsberechtigte (Erziehungsratgeber, Familienmagazine)
-- 'voters': Wahlberechtigte Bürger (Politische Kampagnen, Wahlprogramme)
-- 'consumers': Verbraucher und Käufer (Produktbewertungen, Verbrauchertests, Werbung)
-- 'students': Schüler und Studierende (Lehrpläne, akademische Texte)
-- 'specific_group': Spezifische Interessensgruppen (Vereinsnachrichten, Hobby-Communities)

-- MENTIONED PERSONS DOKUMENTATION
-- Die KI erkennt folgende Arten von Personen:
-- - Vollständige Namen: "Angela Merkel", "Donald Trump", "Elon Musk"
-- - Namen mit Titeln: "Dr. Fauci", "Prof. Drosten", "Herr Müller", "Frau Schmidt"
-- - Öffentliche Personen: Politiker, Wissenschaftler, Prominente, Unternehmer
-- - Historische Personen: "Napoleon Bonaparte", "Albert Einstein", "Marie Curie"
-- - Direkte Ansprache: "Lieber Herr Schmidt", "Frau Professor Müller"

-- NICHT erkannt werden:
-- - Anonyme Gruppen: "Wissenschaftler", "Experten", "Politiker", "Ärzte"
-- - Allgemeine Berufsbezeichnungen ohne Namen
-- - Unspezifische Erwähnungen: "Ein Forscher", "Mehrere Experten"

-- Diese Enum-Werte sind bereits in der Migration 20250831000001_add_target_audience_and_mentioned_persons_support.sql definiert
