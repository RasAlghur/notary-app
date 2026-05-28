// api/walrus-status.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const TATUM_API_KEY = process.env.TATUM_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { jobId } = req.query;
  if (!jobId || typeof jobId !== 'string') {
    return res.status(400).json({ error: 'jobId required' });
  }

  try {
    const response = await fetch(
      `https://api.tatum.io/v4/data/storage/upload/${jobId}`,
      {
        headers: {
          'x-api-key': TATUM_API_KEY ?? '',
        },
      }
    );

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}