import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize with API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generateHealthInsights = async (data: any) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }, { apiVersion: 'v1' });

        const prompt = `
      As a medical AI assistant, analyze the following health data and provide 3-4 concise, actionable insights.
      Focus on trends, potential risks, and positive progress.
      Data: ${JSON.stringify(data)}
      
      Return the response in a clear bulleted format.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Insights Error:', error);
        throw new Error('Failed to generate insights');
    }
};

export const translateLabReport = async (text: string) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }, { apiVersion: 'v1' });

        const prompt = `
      Translate the following complex medical lab report into simple, easy-to-understand language for a patient.
      Explain what the key values mean and if they are within normal ranges.
      Report Text: ${text}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Translation Error:', error);
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
        const rawApiKey = process.env.GEMINI_API_KEY || '';
        const apiKey = rawApiKey.trim();

        if (!apiKey) {
            console.warn('GEMINI_API_KEY not set, falling back to "other" category');
            return { category: 'other', confidence: 0 };
        }

        // Minimal validation log (don't log the actual key)
        console.log(`API Key Check: length=${apiKey.length}, startsWithAIza=${apiKey.startsWith('AIza')}`);

        const localGenAI = new GoogleGenerativeAI(apiKey);

        const prompt = `You are a medical document classifier. Analyze the following text extracted from a PDF and classify it into ONE of these categories:

Categories:
- prescription: Medical prescriptions, medication orders, Rx documents
- lab_result: Laboratory test results, blood tests, diagnostic reports, pathology reports
- bill: Medical bills, invoices, payment receipts, hospital charges
- insurance: Insurance documents, claims, coverage letters, policy documents
- other: Any document that doesn't fit the above categories

Text to classify:
"""
${text.slice(0, 3000)}
"""

Respond ONLY with a JSON object in this exact format:
{
  "category": "one of: prescription, lab_result, bill, insurance, other",
  "confidence": 0.95,
  "reasoning": "brief explanation"
}`;

        let responseText = '';
        // Comprehensive fallback list for models and versions
        const combinations = [
            { name: 'gemini-1.5-flash', version: 'v1' },
            { name: 'gemini-1.5-flash', version: 'v1beta' },
            { name: 'gemini-1.5-flash-latest', version: 'v1' },
            { name: 'gemini-pro', version: 'v1' },
            { name: 'gemini-pro', version: 'v1beta' }
        ];

        for (const combo of combinations) {
            try {
                process.stdout.write(`Attempting: ${combo.name} (${combo.version})... `);
                const model = localGenAI.getGenerativeModel({ model: combo.name }, { apiVersion: combo.version as any });
                const result = await model.generateContent(prompt);
                responseText = result.response.text();
                process.stdout.write('SUCCESS\n');
                break;
            } catch (err: any) {
                process.stdout.write(`FAILED (${err.status || 'Error'})\n`);
                // If it's the last one, throw it
                if (combo === combinations[combinations.length - 1]) {
                    throw err;
                }
            }
        }

        const response = responseText;

        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid response format from AI');
        }

        const classification = JSON.parse(jsonMatch[0]) as ClassificationResult;

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
        console.error('Document classification error:', error);
        return { category: 'other', confidence: 0 };
    }
};
