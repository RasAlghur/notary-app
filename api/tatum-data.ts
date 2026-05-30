/* eslint-disable @typescript-eslint/no-explicit-any */
// api/tatum-data.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const TATUM_API_KEY = process.env.TATUM_API_KEY;
const BASE = 'https://api.tatum.io/v4';

type Tool = 'transaction_history' | 'check_malicious' | 'exchange_rate' | 'wallet_portfolio';

function buildUrl(tool: Tool, params: Record<string, string>): string | null {
    switch (tool) {
        case 'transaction_history':
            if (!params.address) return null;
            return `${BASE}/data/transactions?chain=sui&address=${encodeURIComponent(params.address)}&pageSize=20`;
        case 'check_malicious':
            if (!params.address) return null;
            return `${BASE}/security/address/${encodeURIComponent(params.address)}?chain=sui`;
        case 'exchange_rate':
            return `${BASE}/rates/SUI?basePair=USD`;
        case 'wallet_portfolio':
            if (!params.address) return null;
            return `${BASE}/data/portfolio?chain=sui&address=${encodeURIComponent(params.address)}`;
        default:
            return null;
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    if (!TATUM_API_KEY) {
        return res.status(500).json({ error: 'Tatum API key not configured' });
    }

    const { tool, ...params } = req.query as Record<string, string>;

    if (!tool) return res.status(400).json({ error: 'tool parameter required' });

    const url = buildUrl(tool as Tool, params);
    if (!url) {
        return res.status(400).json({ error: `Unknown tool or missing parameters: ${tool}` });
    }

    try {
        const response = await fetch(url, {
            headers: { 'x-api-key': TATUM_API_KEY },
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (err: any) {
        return res.status(500).json({ error: err.message ?? 'Internal server error' });
    }
}