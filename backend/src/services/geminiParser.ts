import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

export interface ParsedHealthMessage {
    type: 'bp' | 'glucose' | 'symptom' | 'status' | 'help' | 'unknown';
    confidence: number; // 0-1
    systolic?: number;
    diastolic?: number;
    pulse?: number;
    glucoseValue?: number;
    glucoseContext?: 'fasting' | 'after_food' | 'before_food' | 'random';
    symptom?: string;
    severity?: 'mild' | 'moderate' | 'severe';
    originalMessage: string;
    interpretation?: string; // AI's understanding of what user meant
}

const SYSTEM_PROMPT = `You are a health data extraction AI for a WhatsApp-based health tracking app used by elderly Indian users.

Your job is to parse natural language messages (in English, Hindi, or Hinglish) and extract health readings.

SUPPORTED DATA TYPES:
1. Blood Pressure (BP): systolic/diastolic values, optionally pulse
2. Glucose/Sugar: value in mg/dL, with context (fasting, after food, before food, random)
3. Symptoms: any health complaints or feelings
4. Status: user wants to see their readings
5. Help: user needs guidance on how to use the bot

EXAMPLES:
- "BP 130/85" → BP: 130/85
- "mera bp 140 over 90 hai" → BP: 140/90
- "blood pressure check kiya 135 by 88" → BP: 135/88
- "sugar 110 fasting" → Glucose: 110, fasting
- "khali pet sugar 95" → Glucose: 95, fasting
- "khana khane ke baad sugar 140" → Glucose: 140, after food
- "dinner ke baad 160 tha sugar" → Glucose: 160, after food
- "feeling dizzy and weak" → Symptom: dizzy, weak
- "sir dard ho raha hai" → Symptom: headache
- "kaise use karu" → Help
- "aaj ka status" → Status

RESPOND IN JSON FORMAT ONLY:
{
    "type": "bp" | "glucose" | "symptom" | "status" | "help" | "unknown",
    "confidence": 0.0-1.0,
    "systolic": number | null,
    "diastolic": number | null,
    "pulse": number | null,
    "glucoseValue": number | null,
    "glucoseContext": "fasting" | "after_food" | "before_food" | "random" | null,
    "symptom": string | null,
    "severity": "mild" | "moderate" | "severe" | null,
    "interpretation": "brief explanation of what user meant"
}`;

/**
 * Parse a WhatsApp message using Gemini AI
 */
export async function parseWithGemini(message: string): Promise<ParsedHealthMessage> {
    // Default response for unknown messages
    const defaultResponse: ParsedHealthMessage = {
        type: 'unknown',
        confidence: 0,
        originalMessage: message,
    };

    if (!genAI) {
        console.warn('Gemini API not configured, falling back to regex parsing');
        return defaultResponse;
    }

    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 0.1, // Low temperature for consistent parsing
                maxOutputTokens: 256,
            },
        });

        const prompt = `${SYSTEM_PROMPT}\n\nParse this message from user:\n"${message}"\n\nRespond with JSON only:`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('Gemini response not valid JSON:', response);
            return defaultResponse;
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return {
            type: parsed.type || 'unknown',
            confidence: parsed.confidence || 0,
            systolic: parsed.systolic || undefined,
            diastolic: parsed.diastolic || undefined,
            pulse: parsed.pulse || undefined,
            glucoseValue: parsed.glucoseValue || undefined,
            glucoseContext: parsed.glucoseContext || undefined,
            symptom: parsed.symptom || undefined,
            severity: parsed.severity || undefined,
            originalMessage: message,
            interpretation: parsed.interpretation || undefined,
        };
    } catch (error) {
        console.error('Gemini parsing error:', error);
        return defaultResponse;
    }
}

/**
 * Fallback regex-based parser (when Gemini is unavailable)
 */
export function parseWithRegex(message: string): ParsedHealthMessage {
    const text = message.trim().toLowerCase();
    const originalMessage = message.trim();

    // BP patterns (English, Hindi, Hinglish)
    const bpPatterns = [
        /(?:bp|blood\s*pressure|b\.p\.?)\s*[:=]?\s*(\d{2,3})\s*[\/\-\s]\s*(\d{2,3})/i,
        /(\d{2,3})\s*(?:over|by|\/)\s*(\d{2,3})/i,
        /mera?\s*(?:bp|pressure)\s*(\d{2,3})\s*(?:over|by|\/)\s*(\d{2,3})/i,
    ];

    for (const pattern of bpPatterns) {
        const match = text.match(pattern);
        if (match) {
            return {
                type: 'bp',
                confidence: 0.9,
                systolic: parseInt(match[1]),
                diastolic: parseInt(match[2]),
                originalMessage,
            };
        }
    }

    // Glucose patterns
    const glucosePatterns = [
        /(?:sugar|glucose|shoogar)\s*[:=]?\s*(\d{2,3})(?:\s*(fasting|khali\s*pet|before|after|baad|pehle))?/i,
        /(\d{2,3})\s*(?:sugar|glucose|mg\/dl)/i,
        /khali\s*pet\s*(?:sugar|glucose)?\s*(\d{2,3})/i,
        /(?:khana|dinner|lunch|breakfast)\s*(?:ke)?\s*(?:baad|after)\s*(?:sugar)?\s*(\d{2,3})/i,
    ];

    for (const pattern of glucosePatterns) {
        const match = text.match(pattern);
        if (match) {
            let context: 'fasting' | 'after_food' | 'before_food' | 'random' = 'fasting';
            const contextWord = match[2]?.toLowerCase() || '';

            if (contextWord.includes('after') || contextWord.includes('baad')) {
                context = 'after_food';
            } else if (contextWord.includes('before') || contextWord.includes('pehle')) {
                context = 'before_food';
            } else if (contextWord.includes('fasting') || contextWord.includes('khali')) {
                context = 'fasting';
            }

            return {
                type: 'glucose',
                confidence: 0.85,
                glucoseValue: parseInt(match[1]),
                glucoseContext: context,
                originalMessage,
            };
        }
    }

    // Status patterns
    if (/status|summary|aaj\s*ka|today|readings?/i.test(text)) {
        return {
            type: 'status',
            confidence: 0.95,
            originalMessage,
        };
    }

    // Help patterns
    if (/help|kaise|how\s*to|madad|guide/i.test(text)) {
        return {
            type: 'help',
            confidence: 0.95,
            originalMessage,
        };
    }

    // Symptom patterns
    const symptomKeywords = [
        'feeling', 'pain', 'headache', 'dizzy', 'weak', 'tired',
        'dard', 'chakkar', 'kamzori', 'bukhar', 'fever', 'cough',
        'khansi', 'cold', 'thakaan', 'neend', 'breathless', 'saans'
    ];

    if (symptomKeywords.some(kw => text.includes(kw))) {
        return {
            type: 'symptom',
            confidence: 0.7,
            symptom: originalMessage,
            severity: 'moderate',
            originalMessage,
        };
    }

    return {
        type: 'unknown',
        confidence: 0,
        originalMessage,
    };
}

/**
 * Main parsing function - tries Gemini first, falls back to regex
 */
export async function parseHealthMessage(message: string): Promise<ParsedHealthMessage> {
    // Always try regex first for simple patterns (faster)
    const regexResult = parseWithRegex(message);

    // If regex is confident enough, use it
    if (regexResult.confidence >= 0.85) {
        return regexResult;
    }

    // For complex/natural language, use Gemini
    if (genAI) {
        const geminiResult = await parseWithGemini(message);

        // Use Gemini if it's more confident
        if (geminiResult.confidence > regexResult.confidence) {
            return geminiResult;
        }
    }

    return regexResult;
}
