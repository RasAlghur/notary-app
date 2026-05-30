/* eslint-disable @typescript-eslint/no-explicit-any */
// api/agent.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    try {
        const { messages, system } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'messages array required' });
        }

        // Gemini requires alternating user/model roles — dedupe consecutive same-role messages
        const contents: { role: string; parts: { text: string }[] }[] = [];
        for (const m of messages) {
            const role = m.role === 'assistant' ? 'model' : 'user';
            const last = contents[contents.length - 1];
            if (last && last.role === role) {
                // merge into previous turn
                last.parts[0].text += '\n' + m.content;
            } else {
                contents.push({ role, parts: [{ text: m.content }] });
            }
        }

        // Ensure conversation starts with a user turn
        if (contents.length === 0 || contents[0].role !== 'user') {
            return res.status(400).json({ error: 'Conversation must start with a user message' });
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: system
                        ? { parts: [{ text: system }] }
                        : undefined,
                    contents,
                    generationConfig: {
                        maxOutputTokens: 1000,
                        temperature: 0.7,
                    },
                }),
            }
        );

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            console.error('Gemini API error:', err);
            return res.status(response.status).json({
                error: (err as any)?.error?.message ?? `Gemini error: ${response.statusText}`,
            });
        }

        const data = (await response.json()) as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

        return res.status(200).json({ text });
    } catch (err: any) {
        console.error('Agent handler error:', err);
        return res.status(500).json({ error: err.message ?? 'Internal server error' });
    }
}