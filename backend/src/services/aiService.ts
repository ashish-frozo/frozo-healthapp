import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generateHealthInsights = async (data: any) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
        if (!process.env.GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY not set, falling back to "other" category');
            return { category: 'other', confidence: 0 };
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

        const result = await model.generateContent(prompt);
        const response = result.response.text();

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
