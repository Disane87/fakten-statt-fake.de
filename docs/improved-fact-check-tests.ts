// Test-Beispiele für verbesserte Fact vs Fake Unterscheidung

export const factVsFakeTestCases = [
    // FAKE - Subjektive Schuldzuweisungen
    {
        text: "Angela Merkel ist schuld an der Migrationskrise heute",
        expectedResult: "fake",
        reason: "Subjektive Schuldzuweisung ohne objektive Beweisbarkeit",
        expectedTactic: "oversimplification"
    },

    // FAKE - Unbeweisbare Kausalbehauptungen
    {
        text: "Die Grünen haben Deutschland ruiniert",
        expectedResult: "fake",
        reason: "Subjektive Wertung und unbeweisbare Kausalbehauptung"
    },

    // FAKE - Meinungen als Fakten präsentiert
    {
        text: "Bitcoin ist die beste Investition",
        expectedResult: "fake",
        reason: "Subjektive Wertung als objektive Tatsache präsentiert"
    },

    // FAKE - Übervereinfachung komplexer Zusammenhänge
    {
        text: "Lockdowns haben die Wirtschaft zerstört",
        expectedResult: "fake",
        reason: "Übervereinfachung komplexer wirtschaftlicher Zusammenhänge"
    },

    // FACT - Objektive, belegbare Tatsachen
    {
        text: "Angela Merkel war von 2005 bis 2021 deutsche Bundeskanzlerin",
        expectedResult: "fact",
        reason: "Objektiv überprüfbare historische Tatsache"
    },

    // FACT - Wissenschaftlich belegte Fakten
    {
        text: "Wasser kocht bei 100 Grad Celsius unter Normaldruck",
        expectedResult: "fact",
        reason: "Wissenschaftlich bewiesene, objektiv messbare Tatsache"
    },

    // FACT - Statistische Daten
    {
        text: "Deutschland hat etwa 83 Millionen Einwohner",
        expectedResult: "fact",
        reason: "Objektiv messbare, statistisch belegbare Zahl"
    },

    // FAKE - Falsche Tatsachenbehauptungen
    {
        text: "Die Erde ist flach",
        expectedResult: "fake",
        reason: "Wissenschaftlich widerlegte Behauptung"
    },

    // FAKE - Verschwörungstheorien
    {
        text: "COVID-19 Impfungen enthalten Mikrochips",
        expectedResult: "fake",
        reason: "Unbelegte Verschwörungstheorie ohne wissenschaftliche Grundlage"
    },

    // Grenzfälle - sollten als FAKE eingestuft werden
    {
        text: "Politiker lügen immer",
        expectedResult: "fake",
        reason: "Pauschale, unbeweisbare Verallgemeinerung"
    },

    {
        text: "Klimawandel ist nur ein natürlicher Zyklus",
        expectedResult: "fake",
        reason: "Widerspruch zum wissenschaftlichen Konsens"
    },

    // FACT - aber mit Kontext
    {
        text: "Im Jahr 2015 kamen über eine Million Flüchtlinge nach Deutschland",
        expectedResult: "fact",
        reason: "Statistisch belegbare Zahl aus offiziellen Quellen"
    }
];

// Erweiterte Fake-Taktiken für bessere Erkennung
export const improvedFakeTactics = [
    {
        tactic: "blame_attribution",
        description: "Subjektive Schuldzuweisung ohne objektive Beweise"
    },
    {
        tactic: "oversimplification",
        description: "Komplexe Zusammenhänge werden unzulässig vereinfacht"
    },
    {
        tactic: "opinion_as_fact",
        description: "Subjektive Meinungen werden als objektive Fakten präsentiert"
    },
    {
        tactic: "false_causation",
        description: "Unbelegte oder falsche Ursache-Wirkungs-Behauptungen"
    },
    {
        tactic: "sweeping_generalization",
        description: "Pauschale Verallgemeinerungen ohne ausreichende Belege"
    },
    {
        tactic: "cherry_picking",
        description: "Selektive Auswahl von Daten oder Fakten"
    }
];

// Testfunktion für die Prompt-Validierung
export function validateImprovedPrompt(result: any, testCase: any): boolean {
    const isCorrectResult = result.result === testCase.expectedResult;

    if (!isCorrectResult) {
        console.error(`FEHLER bei: "${testCase.text}"`);
        console.error(`Erwartet: ${testCase.expectedResult}, Erhalten: ${result.result}`);
        console.error(`Grund: ${testCase.reason}`);
        return false;
    }

    return true;
}
