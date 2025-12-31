import { useState, useCallback } from 'react';

// Types for extraction results
export interface BPExtractionResult {
    systolic: number | null;
    diastolic: number | null;
    pulse: number | null;
}

export interface GlucoseExtractionResult {
    value: number | null;
    context: 'fasting' | 'before_meal' | 'after_meal' | 'bedtime' | null;
}

interface UseImageExtractionOptions {
    type: 'bp' | 'glucose';
    apiKey?: string;
}

interface ExtractionState {
    isLoading: boolean;
    error: string | null;
    result: BPExtractionResult | GlucoseExtractionResult | null;
}

const BP_EXTRACTION_PROMPT = `Analyze this image of a blood pressure monitor display.
Extract the blood pressure readings and return them in this exact JSON format:
{
  "systolic": <number or null if not readable>,
  "diastolic": <number or null if not readable>,
  "pulse": <number or null if not shown/readable>
}

Look for:
- Systolic (upper/larger number, typically 90-180 range)
- Diastolic (lower/smaller number, typically 60-120 range)
- Pulse/heart rate (often shown with a heart icon)

Only return the JSON object, nothing else.`;

const GLUCOSE_EXTRACTION_PROMPT = `Analyze this image of a blood glucose meter display.
Extract the glucose reading and return it in this exact JSON format:
{
  "value": <number in mg/dL or null if not readable>,
  "context": null
}

Look for the glucose value (typically in the range 50-400 mg/dL).
Only return the JSON object, nothing else.`;

export function useImageExtraction({ type, apiKey }: UseImageExtractionOptions) {
    const [state, setState] = useState<ExtractionState>({
        isLoading: false,
        error: null,
        result: null,
    });

    const extractFromImage = useCallback(async (imageBase64: string): Promise<BPExtractionResult | GlucoseExtractionResult | null> => {
        // Get API key from environment or props
        const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;

        if (!key) {
            setState({
                isLoading: false,
                error: 'API key not configured. Please add VITE_GEMINI_API_KEY to your environment.',
                result: null,
            });
            return null;
        }

        setState({ isLoading: true, error: null, result: null });

        try {
            const prompt = type === 'bp' ? BP_EXTRACTION_PROMPT : GLUCOSE_EXTRACTION_PROMPT;

            // Remove data URL prefix if present
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${key}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    { text: prompt },
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
                            maxOutputTokens: 256,
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

            // Extract JSON from response (handle markdown code blocks)
            const jsonMatch = textContent.match(/\{[\s\S]*?\}/);
            if (!jsonMatch) {
                throw new Error('Could not parse AI response');
            }

            const parsed = JSON.parse(jsonMatch[0]);

            // Validate the result based on type
            if (type === 'bp') {
                const result: BPExtractionResult = {
                    systolic: typeof parsed.systolic === 'number' ? parsed.systolic : null,
                    diastolic: typeof parsed.diastolic === 'number' ? parsed.diastolic : null,
                    pulse: typeof parsed.pulse === 'number' ? parsed.pulse : null,
                };

                // Check if we got at least the main values
                if (result.systolic === null && result.diastolic === null) {
                    throw new Error('Could not detect blood pressure values from the image');
                }

                setState({ isLoading: false, error: null, result });
                return result;
            } else {
                const result: GlucoseExtractionResult = {
                    value: typeof parsed.value === 'number' ? parsed.value : null,
                    context: parsed.context || null,
                };

                if (result.value === null) {
                    throw new Error('Could not detect glucose value from the image');
                }

                setState({ isLoading: false, error: null, result });
                return result;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to extract values from image';
            setState({
                isLoading: false,
                error: errorMessage,
                result: null,
            });
            return null;
        }
    }, [type, apiKey]);

    const reset = useCallback(() => {
        setState({ isLoading: false, error: null, result: null });
    }, []);

    return {
        ...state,
        extractFromImage,
        reset,
    };
}
