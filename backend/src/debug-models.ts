import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the root of the backend
dotenv.config({ path: path.join(__dirname, '../.env') });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY not found in .env');
        return;
    }

    console.log('Using API Key (first 5 chars):', apiKey.substring(0, 5) + '...');

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // There isn't a direct listModels in the high-level SDK easily exposed 
        // but we can try to initialize some common ones and see which fail.
        const models = [
            'gemini-1.5-flash',
            'gemini-1.5-flash-latest',
            'gemini-1.5-pro',
            'gemini-pro',
            'gemini-1.0-pro'
        ];

        console.log('Testing connectivity and model availability...');

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                // Try a very simple prompt to verify existence
                const result = await model.generateContent('hi');
                console.log(`✅ [SUCCESS] Model "${modelName}" is available and responding.`);
                break; // If one works, we can stop or keep checking
            } catch (err: any) {
                console.log(`❌ [FAILED] Model "${modelName}": ${err.message}`);
            }
        }
    } catch (error) {
        console.error('Fatal error during model listing:', error);
    }
}

listModels();
