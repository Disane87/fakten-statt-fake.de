-- Migration: add_improved_fake_tactics
-- Erweitert die verfügbaren Fake-Taktiken für bessere Erkennung

-- Neue Fake-Taktiken für subjektive Behauptungen und Meinungen
-- Diese werden im Prompt für bessere Klassifizierung verwendet

-- Dokumentation der erweiterten Fake-Taktiken:
-- blame_attribution: Subjektive Schuldzuweisungen ohne objektive Beweise
-- oversimplification: Komplexe Zusammenhänge werden unzulässig vereinfacht  
-- opinion_as_fact: Subjektive Meinungen werden als objektive Fakten präsentiert
-- false_causation: Unbelegte oder falsche Ursache-Wirkungs-Behauptungen
-- sweeping_generalization: Pauschale Verallgemeinerungen ohne ausreichende Belege
-- cherry_picking: Selektive Auswahl von Daten oder Fakten
-- conspiracy_theory: Unbelegte Verschwörungstheorien
-- false_dichotomy: Falsche Entweder-Oder-Darstellung komplexer Sachverhalte
-- ad_hominem: Angriff auf die Person statt auf das Argument
-- strawman: Verfälschung oder Verzerrung der Gegenposition

-- Diese Taktiken ergänzen die bestehenden und helfen bei der Unterscheidung
-- zwischen objektiven Fakten und subjektiven Meinungen/falschen Behauptungen

COMMENT ON SCHEMA public IS 'Extended fake tactics for improved fact-checking classification';
