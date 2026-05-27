// api/walrus-blob.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const AGGREGATOR = process.env.VITE_SUI_NETWORK === 'mainnet'
    ? 'https://aggregator.walrus-mainnet.walrus.space'
    : 'https://aggregator.walrus-testnet.walrus.space';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const { blobId } = req.query;
    if (!blobId || typeof blobId !== 'string') {
        return res.status(400).json({ error: 'blobId required' });
    }

    try {
        const response = await fetch(`${AGGREGATOR}/v1/blobs/${blobId}`);

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Blob not found' });
        }

        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const buffer = Buffer.from(await response.arrayBuffer());

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.status(200).send(buffer);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}