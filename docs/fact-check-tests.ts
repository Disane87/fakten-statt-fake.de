// Test-Skript für die erweiterte Fact-Check-Funktionalität
// Testet Target Audience und Mentioned Persons Erkennung

export interface TestCase {
    text: string;
    expectedTargetAudience: string[];
    expectedMentionedPersons: string[];
    description: string;
}

export const factCheckTestCases: TestCase[] = [
    {
        text: "Donald Trump behauptet, die Wahl 2020 sei gestohlen worden. Wähler sollten das wissen.",
        expectedTargetAudience: ["voters"],
        expectedMentionedPersons: ["Donald Trump"],
        description: "Politisches Statement mit Personenerwähnung"
    },
    {
        text: "Liebe Eltern, Dr. Schmidt empfiehlt Kindern täglich Obst zu essen.",
        expectedTargetAudience: ["parents"],
        expectedMentionedPersons: ["Dr. Schmidt"],
        description: "Direkte Ansprache an Eltern mit Expertenempfehlung"
    },
    {
        text: "Neue Studie zeigt: Klimawandel beschleunigt sich. Experten sind besorgt.",
        expectedTargetAudience: ["general_public"],
        expectedMentionedPersons: [],
        description: "Allgemeine Nachricht ohne spezifische Personen"
    },
    {
        text: "Prof. Dr. Drosten und Dr. Fauci diskutieren über Pandemie-Maßnahmen für Fachkräfte.",
        expectedTargetAudience: ["professionals"],
        expectedMentionedPersons: ["Prof. Dr. Drosten", "Dr. Fauci"],
        description: "Fachliche Diskussion zwischen benannten Experten"
    },
    {
        text: "Elon Musk erklärt Kindern, wie Raketen funktionieren.",
        expectedTargetAudience: ["children"],
        expectedMentionedPersons: ["Elon Musk"],
        description: "Bildungsinhalt von prominenter Person für Kinder"
    },
    {
        text: "Angela Merkel und Emmanuel Macron beraten über EU-Politik. Bürger warten auf Entscheidungen.",
        expectedTargetAudience: ["voters", "general_public"],
        expectedMentionedPersons: ["Angela Merkel", "Emmanuel Macron"],
        description: "Politische Nachricht mit mehreren Personen"
    },
    {
        text: "Verbraucher aufgepasst: Bill Gates investiert in nachhaltige Technologien.",
        expectedTargetAudience: ["consumers"],
        expectedMentionedPersons: ["Bill Gates"],
        description: "Verbraucherinformation mit Unternehmer-Erwähnung"
    },
    {
        text: "Studierende sollten wissen: Prof. Einstein entwickelte die Relativitätstheorie 1905.",
        expectedTargetAudience: ["students"],
        expectedMentionedPersons: ["Prof. Einstein"],
        description: "Bildungsinhalt für Studierende"
    }
];

// Funktion zum Testen der KI-Antworten
export function validateFactCheckResult(result: any, expectedCase: TestCase): {
    targetAudienceMatch: boolean;
    mentionedPersonsMatch: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Target Audience prüfen
    const targetAudienceMatch = expectedCase.expectedTargetAudience.every(
        audience => result.targetAudience?.includes(audience)
    );
    if (!targetAudienceMatch) {
        errors.push(`Target Audience mismatch. Expected: ${expectedCase.expectedTargetAudience.join(', ')}, Got: ${result.targetAudience?.join(', ') || 'none'}`);
    }

    // Mentioned Persons prüfen
    const mentionedPersonsMatch = expectedCase.expectedMentionedPersons.every(
        person => result.mentionedPersons?.includes(person)
    );
    if (!mentionedPersonsMatch) {
        errors.push(`Mentioned Persons mismatch. Expected: ${expectedCase.expectedMentionedPersons.join(', ')}, Got: ${result.mentionedPersons?.join(', ') || 'none'}`);
    }

    return {
        targetAudienceMatch,
        mentionedPersonsMatch,
        errors
    };
}

// Beispiel für manuellen Test
export const manualTestExample = {
    text: "Herr Dr. Müller, Ihre Aussage über den Klimawandel ist wissenschaftlich nicht haltbar. Experten widersprechen Ihnen.",
    expectedResult: {
        targetAudience: ["experts", "professionals"],
        mentionedPersons: ["Dr. Müller"],
        tone: ["critical", "formal"],
        textType: "criticism"
    }
};
