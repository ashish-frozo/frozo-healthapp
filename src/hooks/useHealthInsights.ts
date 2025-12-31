import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { BPReading, GlucoseReading } from '../types';

export interface HealthInsight {
    summary: string;
    keyInsights: string[];
    tips: string[];
}

interface UseHealthInsightsState {
    isLoading: boolean;
    error: string | null;
    insight: HealthInsight | null;
}

const INSIGHTS_PROMPT = `Analyze the following health data for a patient and provide a concise summary, key insights, and actionable tips.
The data includes Blood Pressure (BP) readings and Blood Glucose readings.

Data:
{{DATA}}

Return the analysis in this exact JSON format:
{
  "summary": "A 1-sentence overall status summary.",
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
  "tips": ["Tip 1", "Tip 2"]
}

Guidelines:
- Be encouraging but professional.
- Focus on trends and correlations if visible.
- Keep insights and tips concise and actionable.
- If data is sparse, mention that more readings would help for better analysis.

Only return the JSON object, nothing else.`;

export function useHealthInsights() {
    const { addNotification } = useApp();
    const [state, setState] = useState<UseHealthInsightsState>({
        isLoading: false,
        error: null,
        insight: null,
    });

    const generateInsights = useCallback(async (bpReadings: BPReading[], glucoseReadings: GlucoseReading[]) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            setState({
                isLoading: false,
                error: 'API key not configured. Please add VITE_GEMINI_API_KEY to your environment.',
                insight: null,
            });
            return;
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Format data for the prompt
            const bpData = bpReadings.slice(0, 10).map(r =>
                `BP: ${r.systolic}/${r.diastolic} (${r.status}) at ${new Date(r.timestamp).toLocaleDateString()}`
            ).join('\n');

            const glucoseData = glucoseReadings.slice(0, 10).map(r =>
                `Glucose: ${r.value} mg/dL (${r.context}, ${r.status}) at ${new Date(r.timestamp).toLocaleDateString()}`
            ).join('\n');

            const dataString = `Blood Pressure Readings:\n${bpData}\n\nBlood Glucose Readings:\n${glucoseData}`;
            const prompt = INSIGHTS_PROMPT.replace('{{DATA}}', dataString);

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
                                parts: [{ text: prompt }],
                            },
                        ],
                        generationConfig: {
                            temperature: 0.2,
                            maxOutputTokens: 512,
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

            const insight: HealthInsight = {
                summary: parsed.summary || 'Analysis complete.',
                keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
                tips: Array.isArray(parsed.tips) ? parsed.tips : [],
            };

            setState({ isLoading: false, error: null, insight });

            // Add notification
            addNotification(
                'New Health Insight',
                insight.summary,
                'insight',
                'medium',
                '/trends'
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate insights';
            setState({
                isLoading: false,
                error: errorMessage,
                insight: null,
            });
        }
    }, []);

    return {
        ...state,
        generateInsights,
    };
}
