/* eslint-disable @typescript-eslint/no-explicit-any */
// api/walrus-upload.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
    api: { bodyParser: false },
};

const TATUM_API_KEY = process.env.TATUM_API_KEY;
console.log(`Walrus upload handler initialized. Tatum API key: ${TATUM_API_KEY ? 'Yes' : 'No'}`);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk);
        const rawBody = Buffer.concat(chunks);

        const response = await fetch('https://api.tatum.io/v4/data/storage/upload', {
            method: 'POST',
            headers: {
                'x-api-key': TATUM_API_KEY!,
                'Content-Type': req.headers['content-type']!,
            },
            body: rawBody,
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}