// Test-Beispiele für Rechtschreibkorrektur im Fact-Checking

export const spellingCorrectionTestCases = [
    // Deutsche Rechtschreibfehler
    {
        input: "Angla Merkel wahr 16 Jahre Bundeskanlerin und hat Deutschland gut regiert.",
        expectedCorrected: "Angela Merkel war 16 Jahre Bundeskanzlerin und hat Deutschland gut regiert.",
        errors: ["Angla → Angela", "wahr → war", "Bundeskanlerin → Bundeskanzlerin"]
    },

    // Tippfehler und fehlende Großschreibung
    {
        input: "donald trump behauptet, dass die wahl gestohlen wurde udn joe biden nicht gewonnen hat.",
        expectedCorrected: "Donald Trump behauptet, dass die Wahl gestohlen wurde und Joe Biden nicht gewonnen hat.",
        errors: ["donald → Donald", "trump → Trump", "wahl → Wahl", "udn → und", "joe → Joe", "biden → Biden"]
    },

    // Häufige Tippfehler
    {
        input: "Teh COVID-19 Impfung ist sicher udn effektiv. Studien zeiegn das.",
        expectedCorrected: "Die COVID-19 Impfung ist sicher und effektiv. Studien zeigen das.",
        errors: ["Teh → Die", "udn → und", "zeiegn → zeigen"]
    },

    // Englische Rechtschreibfehler
    {
        input: "Teh climate change is a hoax and goverment is lying to us.",
        expectedCorrected: "The climate change is a hoax and government is lying to us.",
        errors: ["Teh → The", "goverment → government"]
    },

    // Gemischte Fehler mit Zahlen
    {
        input: "Im jahr 2020 kamen 1 mio flüchtlinge nach deutschland udn das war ein problem.",
        expectedCorrected: "Im Jahr 2020 kamen 1 Mio. Flüchtlinge nach Deutschland und das war ein Problem.",
        errors: ["jahr → Jahr", "mio → Mio.", "flüchtlinge → Flüchtlinge", "deutschland → Deutschland", "udn → und", "problem → Problem"]
    },

    // Wissenschaftliche Begriffe
    {
        input: "Die relativitätstheorie von einstein besagt das licht hat eine konstante geschwindigkeit.",
        expectedCorrected: "Die Relativitätstheorie von Einstein besagt, dass Licht eine konstante Geschwindigkeit hat.",
        errors: ["relativitätstheorie → Relativitätstheorie", "einstein → Einstein", "das → dass", "licht → Licht", "geschwindigkeit → Geschwindigkeit"]
    },

    // Politische Aussagen mit Fehlern
    {
        input: "biden udn trump kämpften um die präsidentschaft. beide parteien behaupteten wahlbetrug.",
        expectedCorrected: "Biden und Trump kämpften um die Präsidentschaft. Beide Parteien behaupteten Wahlbetrug.",
        errors: ["biden → Biden", "udn → und", "trump → Trump", "präsidentschaft → Präsidentschaft", "beide → Beide", "parteien → Parteien", "wahlbetrug → Wahlbetrug"]
    }
];

// Spezielle Korrekturen für häufige Fehler
export const commonTypos = {
    german: {
        "teh": "die",
        "udn": "und",
        "wahr": "war",
        "das": "dass", // in context
        "seit": "seid", // in context
        "wider": "wieder", // in context
        "garnicht": "gar nicht",
        "vorallem": "vor allem",
        "aufjedenfall": "auf jeden Fall",
        "nichtsdestotrotz": "nichtsdestotrotz", // correct
        "ausversehen": "aus Versehen"
    },
    english: {
        "teh": "the",
        "recieve": "receive",
        "seperate": "separate",
        "definately": "definitely",
        "occured": "occurred",
        "goverment": "government",
        "accomodate": "accommodate",
        "existance": "existence"
    }
};

// Test-Funktion für Rechtschreibkorrektur
export function validateSpellingCorrection(input: string, output: string): {
    hasCorrections: boolean;
    correctedErrors: string[];
    missedErrors: string[];
} {
    const correctedErrors: string[] = [];
    const missedErrors: string[] = [];

    // Einfache Überprüfung auf häufige Fehler
    Object.entries(commonTypos.german).forEach(([wrong, correct]) => {
        if (input.toLowerCase().includes(wrong.toLowerCase())) {
            if (output.toLowerCase().includes(correct.toLowerCase())) {
                correctedErrors.push(`${wrong} → ${correct}`);
            } else {
                missedErrors.push(`${wrong} sollte ${correct} sein`);
            }
        }
    });

    return {
        hasCorrections: correctedErrors.length > 0,
        correctedErrors,
        missedErrors
    };
}

// Erwartetes Verhalten im JSON-Output
export const expectedBehavior = {
    description: "Der Prompt soll Rechtschreibfehler automatisch korrigieren",
    examples: [
        {
            input: "angla merkel ist schuld an teh migrationskrise",
            expectedOutput: {
                claim: ["Angela Merkel ist schuld an der Migrationskrise"],
                explanation: "Diese Behauptung stellt eine subjektive Schuldzuweisung dar...",
                // Alle anderen Felder ebenfalls mit korrigierter Rechtschreibung
            }
        }
    ]
};
