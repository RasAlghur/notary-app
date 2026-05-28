// api/walrus-download-url.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const { blobId } = req.query;
    if (!blobId || typeof blobId !== 'string') {
        return res.status(400).json({ error: 'blobId required' });
    }

    try {
        let offset = 0;
        const limit = 50;

        while (true) {
            const response = await fetch(
                `https://api.tatum.io/v4/data/storage/uploads?limit=${limit}&offset=${offset}`,
                { headers: { 'x-api-key': process.env.TATUM_API_KEY! } }
            );

            if (!response.ok) {
                return res.status(response.status).json({ error: 'Failed to query Tatum storage' });
            }

            const data = await response.json();
            const uploads: any[] = Array.isArray(data) ? data : (data.data ?? []);

            const match = uploads.find((u) => u.blobId === blobId);
            if (match) {
                return res.status(200).json({
                    downloadUrl: match.downloadUrlByQuiltId ?? match.downloadUrlByQuiltPatchId ?? null,
                    mimeType: match.mimeType ?? null,
                    fileName: match.filename ?? null,
                    status: match.status,
                    jobId: match.jobId,
                });
            }

            if (uploads.length < limit) break; // no more pages
            offset += limit;
        }

        return res.status(404).json({ error: 'Upload not found in Tatum storage' });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}