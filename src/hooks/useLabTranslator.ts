import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';

export interface LabBiomarker {
    name: string;
    value: string;
    explanation: string;
    status: 'normal' | 'attention' | 'consult';
}

export interface LabTranslation {
    summary: string;
    biomarkers: LabBiomarker[];
    nextSteps: string[];
    isLabReport: boolean;
}

interface UseLabTranslatorState {
    isLoading: boolean;
    error: string | null;
    translation: LabTranslation | null;
}

const TRANSLATOR_PROMPT = `Analyze this image of a medical lab report. 
Translate the complex medical jargon into simple, reassuring, and easy-to-understand language for a patient.

Return the analysis in this exact JSON format:
{
  "isLabReport": <boolean, true if this is actually a lab report>,
  "summary": "A high-level, reassuring 2-sentence overview of the results.",
  "biomarkers": [
    {
      "name": "Name of the test (e.g., HbA1c)",
      "value": "The result value (e.g., 6.4%)",
      "explanation": "A simple explanation of what this means (e.g., This measures your average blood sugar over 3 months).",
      "status": "normal" | "attention" | "consult"
    }
  ],
  "nextSteps": ["Step 1", "Step 2"]
}

Guidelines:
- If it's NOT a lab report, set isLabReport to false and provide a helpful summary.
- Be encouraging and professional.
- Avoid scaring the patient; use "Attention Needed" instead of "Critical" or "Danger".
- Focus on the most important 3-5 biomarkers if there are many.

Only return the JSON object, nothing else.`;

export function useLabTranslator() {
    const { addNotification } = useApp();
    const [state, setState] = useState<UseLabTranslatorState>({
        isLoading: false,
        error: null,
        translation: null,
    });

    const translateLabReport = useCallback(async (imageBase64: string) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            setState({
                isLoading: false,
                error: 'API key not configured. Please add VITE_GEMINI_API_KEY to your environment.',
                translation: null,
            });
            return;
        }

        setState({ isLoading: true, error: null, translation: null });

        try {
            // Remove data URL prefix if present
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    { text: TRANSLATOR_PROMPT },
                                    {
                                        inline_data: {
                                            mime_type: 'image/jpeg',
                                            data: base64Data,
                                        },
                                    },
                                ],
                            },
                        ],
                        generationConfig: {
                            temperature: 0.1,
                            maxOutputTokens: 1024,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
            }

            const data = await response.json();
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            // Extract JSON from response
            const jsonMatch = textContent.match(/\{[\s\S]*?\}/);
            if (!jsonMatch) {
                throw new Error('Could not parse AI response');
            }

            const parsed = JSON.parse(jsonMatch[0]);

            const translation: LabTranslation = {
                isLabReport: !!parsed.isLabReport,
                summary: parsed.summary || 'Translation complete.',
                biomarkers: Array.isArray(parsed.biomarkers) ? parsed.biomarkers : [],
                nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
            };

            setState({ isLoading: false, error: null, translation });

            // Add notification
            addNotification(
                'Lab Result Translated',
                'Your lab report has been simplified by AI. Tap to view the explanation.',
                'insight',
                'low',
                '/documents'
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to translate lab report';
            setState({
                isLoading: false,
                error: errorMessage,
                translation: null,
            });
        }
    }, []);

    const reset = useCallback(() => {
        setState({ isLoading: false, error: null, translation: null });
    }, []);

    return {
        ...state,
        translateLabReport,
        reset,
    };
}
