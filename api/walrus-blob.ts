// api/walrus-blob.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const TATUM_API_KEY = process.env.TATUM_API_KEY;
const TATUM_STORAGE_URL = 'https://api.tatum.io/v4/data/storage/uploads';

function safeFilename(name?: string | null) {
  if (!name) return 'file';
  return name.replace(/[/\\?%*:|"<>]/g, '_');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { blobId } = req.query;
  if (!blobId || typeof blobId !== 'string') {
    return res.status(400).json({ error: 'blobId required' });
  }

  try {
    let offset = 0;
    const limit = 100;
    let match: any = null;

    while (true) {
      const lookup = await fetch(`${TATUM_STORAGE_URL}?limit=${limit}&offset=${offset}`, {
        headers: {
          'x-api-key': TATUM_API_KEY ?? '',
        },
      });

      if (!lookup.ok) {
        return res.status(lookup.status).json({
          error: 'Failed to query Tatum storage',
        });
      }

      const data = await lookup.json();
      const uploads: any[] = Array.isArray(data) ? data : (data.data ?? []);

      match = uploads.find((u) => u.blobId === blobId);

      if (match || uploads.length < limit) break;
      offset += limit;
    }

    if (!match) {
      return res.status(404).json({ error: 'Upload not found in Tatum storage' });
    }

    const sourceUrl =
      match.downloadUrlByQuiltId ??
      match.downloadUrlByQuiltPatchId;

    if (!sourceUrl) {
      return res.status(404).json({ error: 'No downloadable URL found for this blob' });
    }

    const upstream = await fetch(sourceUrl);

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: 'Failed to fetch original file',
      });
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());

    const contentType =
      match.mimeType ||
      upstream.headers.get('content-type') ||
      'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename(match.filename)}"`);

    return res.status(200).send(buffer);
  } catch (error: any) {
    console.error('walrus-blob error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}