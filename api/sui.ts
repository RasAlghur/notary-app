// api/sui.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

console.log('SUI API handler loaded');
const NETWORK = process.env.SUI_NETWORK || 'testnet';
const TATUM_API_KEY = process.env.TATUM_API_KEY;

console.log(`SUI API handler initialized with network: ${NETWORK}`);
console.log(`Using Tatum API key: ${TATUM_API_KEY ? 'Yes' : 'No'}`);

const RPC_URL =
    NETWORK === 'mainnet'
        ? 'https://sui-mainnet.gateway.tatum.io'
        : 'https://sui-testnet.gateway.tatum.io';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const response = await fetch(RPC_URL, {  // ← no query param
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': TATUM_API_KEY!,
            },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}