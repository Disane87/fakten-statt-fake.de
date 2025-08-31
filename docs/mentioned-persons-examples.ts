// Test-Beispiele für Personenerkennung im Fact-Checking System
// Diese Beispiele zeigen verschiedene Arten von Personenerwähnungen

export const mentionedPersonsExamples = {
    // Direkte Ansprache
    directAddress: [
        "Herr Müller, Ihre Aussage zur Klimapolitik ist falsch.",
        "Angela Merkel hat Deutschland 16 Jahre lang regiert.",
        "Dr. Fauci empfiehlt die COVID-19 Impfung."
    ],

    // Politiker und öffentliche Personen
    politicians: [
        "Donald Trump behauptet, die Wahl sei gestohlen worden.",
        "Olaf Scholz ist der aktuelle Bundeskanzler.",
        "Wladimir Putin führt Krieg gegen die Ukraine.",
        "Joe Biden ist der 46. Präsident der USA."
    ],

    // Wissenschaftler und Experten
    scientists: [
        "Prof. Dr. Christian Drosten warnt vor neuen Virusvarianten.",
        "Albert Einstein entwickelte die Relativitätstheorie.",
        "Dr. BioNTech-Gründer Ugur Sahin arbeitet an mRNA-Impfstoffen."
    ],

    // Prominente und Unternehmer
    celebrities: [
        "Elon Musk kaufte Twitter für 44 Milliarden Dollar.",
        "Bill Gates spendet Milliarden für wohltätige Zwecke.",
        "Mark Zuckerberg gründete Facebook im Jahr 2004."
    ],

    // Historische Personen
    historical: [
        "Napoleon Bonaparte eroberte halb Europa.",
        "Marie Curie war die erste Frau, die einen Nobelpreis erhielt.",
        "Mahatma Gandhi führte Indien in die Unabhängigkeit."
    ],

    // Mehrere Personen
    multiple: [
        "Biden und Putin treffen sich zum Gipfel.",
        "Merkel, Macron und Draghi diskutierten über EU-Politik.",
        "Die Beatles bestanden aus John Lennon, Paul McCartney, George Harrison und Ringo Starr."
    ],

    // Mit Titeln und Anreden
    withTitles: [
        "Dr. med. Schmidt behandelt COVID-19 Patienten.",
        "Professor Dr. Weber forscht an Quantencomputern.",
        "Frau Bundeskanzlerin Merkel traf den US-Präsidenten.",
        "Seine Heiligkeit der Papst Franziskus besucht Deutschland."
    ],

    // Anonyme oder allgemeine Erwähnungen (sollten NICHT erkannt werden)
    anonymous: [
        "Ein Wissenschaftler behauptet, dass...",
        "Experten sind sich einig, dass...",
        "Politiker fordern neue Gesetze.",
        "Ärzte empfehlen regelmäßige Vorsorge."
    ],

    // Erwartete Erkennungen für Tests
    expectedExtractions: {
        "Angela Merkel war 16 Jahre Bundeskanzlerin.": ["Angela Merkel"],
        "Trump und Biden kämpften um die Präsidentschaft.": ["Trump", "Biden"],
        "Dr. Fauci und Prof. Drosten sind führende Virologen.": ["Dr. Fauci", "Prof. Drosten"],
        "Elon Musk, Bill Gates und Mark Zuckerberg sind Tech-Milliardäre.": ["Elon Musk", "Bill Gates", "Mark Zuckerberg"],
        "Experten sind sich einig über den Klimawandel.": [], // Keine konkreten Namen
        "Herr Dr. Schmidt und Frau Prof. Müller forschen gemeinsam.": ["Dr. Schmidt", "Prof. Müller"]
    }
};

// Testfälle für die KI-Prompt-Validierung
export const personExtractionTestCases = [
    {
        input: "Donald Trump behauptet, Joe Biden habe die Wahl gestohlen.",
        expectedPersons: ["Donald Trump", "Joe Biden"],
        description: "Zwei Politiker in einem Statement"
    },
    {
        input: "Professor Drosten warnt vor neuen COVID-Varianten.",
        expectedPersons: ["Professor Drosten"],
        description: "Wissenschaftler mit Titel"
    },
    {
        input: "Wissenschaftler sind sich über den Klimawandel einig.",
        expectedPersons: [],
        description: "Allgemeine Gruppe ohne Namen"
    },
    {
        input: "Elon Musk kaufte Twitter und feuerte viele Mitarbeiter.",
        expectedPersons: ["Elon Musk"],
        description: "Unternehmer in Wirtschaftsnews"
    },
    {
        input: "Lieber Herr Müller, Ihre Behauptung ist falsch.",
        expectedPersons: ["Herr Müller"],
        description: "Direkte Anrede mit Titel"
    }
];
