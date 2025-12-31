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
