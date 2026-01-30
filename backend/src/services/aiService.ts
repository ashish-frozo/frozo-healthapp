import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

export const generateHealthInsights = async (data: any) => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.warn('OPENAI_API_KEY not set');
            return 'AI insights unavailable.';
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a medical AI assistant. Analyze health data and provide 3-4 concise, actionable insights.'
                },
                {
                    role: 'user',
                    content: `Analyze this health data and provide insights: ${JSON.stringify(data)}`
                }
            ],
            temperature: 0.7,
        });

        return completion.choices[0].message.content || 'No insights generated.';
    } catch (error) {
        console.error('OpenAI Insights Error:', error);
        throw new Error('Failed to generate insights');
    }
};

export const translateLabReport = async (text: string) => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.warn('OPENAI_API_KEY not set');
            return 'Translation unavailable.';
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a medical translator. Translate complex lab reports into simple language for patients.'
                },
                {
                    role: 'user',
                    content: `Translate this report: ${text}`
                }
            ],
            temperature: 0.3,
        });

        return completion.choices[0].message.content || 'Translation failed.';
    } catch (error) {
        console.error('OpenAI Translation Error:', error);
        throw new Error('Failed to translate lab report');
    }
};

interface ClassificationResult {
    category: 'prescription' | 'lab_result' | 'bill' | 'insurance' | 'other';
    confidence: number;
    reasoning?: string;
}

export const classifyDocument = async (text: string): Promise<ClassificationResult> => {
    try {
        const apiKey = (process.env.OPENAI_API_KEY || '').trim();

        if (!apiKey) {
            console.warn('OPENAI_API_KEY not set, falling back to "other" category');
            return { category: 'other', confidence: 0 };
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a medical document classifier. Analyze text from a PDF and classify it into ONE category:
Categories:
- prescription: Medical prescriptions, medication orders
- lab_result: Lab test results, blood tests, diagnostic reports
- bill: Medical bills, invoices, receipts
- insurance: Insurance claims, coverage letters, policies
- other: Anything else

Respond ONLY with a JSON object:
{
  "category": "one of: prescription, lab_result, bill, insurance, other",
  "confidence": 0.95,
  "reasoning": "brief explanation"
}`
                },
                {
                    role: 'user',
                    content: `Classify this document text: """${text.slice(0, 4000)}"""`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0,
        });

        const responseText = completion.choices[0].message.content;
        if (!responseText) {
            throw new Error('Empty response from OpenAI');
        }

        const classification = JSON.parse(responseText) as ClassificationResult;

        // Validate category
        const validCategories = ['prescription', 'lab_result', 'bill', 'insurance', 'other'];
        if (!validCategories.includes(classification.category)) {
            classification.category = 'other';
            classification.confidence = 0.5;
        }

        // Ensure confidence is between 0 and 1
        classification.confidence = Math.max(0, Math.min(1, classification.confidence));

        return classification;
    } catch (error) {
        console.error('OpenAI Document classification error:', error);
        return { category: 'other', confidence: 0 };
    }
};
