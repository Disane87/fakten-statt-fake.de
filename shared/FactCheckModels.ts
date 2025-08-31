export interface Source {
    title: string;
    url: string;
    verified: boolean;
    verifyReason?: string;
}

export interface FakeTactic {
    tactic: string;
    description: string;
}

export interface FactCheckResult {
    result: 'fact' | 'fake' | 'unknown';
    language: string;
    tone: string[];
    textType: string;
    targetAudience: string[];
    mentionedPersons: string[];
    claim: string[];
    keywords: string[];
    compactCounter: string;
    explanation: string;
    explanationDetails?: string;
    sources: Source[];
    fakeTactic: FakeTactic[];
}

export interface FactCheckApiResponse {
    status: 'info' | 'success' | 'error';
    message: string;
    result: FactCheckResult;
}
