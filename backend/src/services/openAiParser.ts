import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
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
 * Parse a WhatsApp message using OpenAI
 */
export async function parseWithOpenAI(message: string): Promise<ParsedHealthMessage> {
    const defaultResponse: ParsedHealthMessage = {
        type: 'unknown',
        confidence: 0,
        originalMessage: message,
    };

    if (!openai) {
        console.warn('OpenAI API not configured, falling back to regex parsing');
        return defaultResponse;
    }

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT
                },
                {
                    role: 'user',
                    content: `Parse this health message: "${message}"`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
        });

        const responseText = completion.choices[0].message.content;
        if (!responseText) {
            return defaultResponse;
        }

        const parsed = JSON.parse(responseText);

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
        console.error('OpenAI parsing error:', error);
        return defaultResponse;
    }
}

/**
 * Fallback regex-based parser
 */
export function parseWithRegex(message: string): ParsedHealthMessage {
    const text = message.trim().toLowerCase();
    const originalMessage = message.trim();

    // BP patterns
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
 * Main parsing function - tries regex first, then OpenAI
 */
export async function parseHealthMessage(message: string): Promise<ParsedHealthMessage> {
    const regexResult = parseWithRegex(message);

    if (regexResult.confidence >= 0.85) {
        return regexResult;
    }

    if (openai) {
        const openaiResult = await parseWithOpenAI(message);

        if (openaiResult.confidence > regexResult.confidence) {
            return openaiResult;
        }
    }

    return regexResult;
}
