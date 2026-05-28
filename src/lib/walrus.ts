import type { WalrusUploadResult } from '../types/lib';
import { WALRUS_URLS } from './constants';

async function pollUntilCertified(jobId: string): Promise<string> {
    const MAX_ATTEMPTS = 30; // 60 seconds max
    const INTERVAL_MS = 2000;

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        await new Promise((r) => setTimeout(r, INTERVAL_MS));

        const res = await fetch(`/api/walrus-status?jobId=${jobId}`);
        if (!res.ok) throw new Error('Failed to poll upload status');

        const data = await res.json();

        if (data.status === 'CERTIFIED') {
            return data.downloadUrlByQuiltId ?? '';
        }
        if (data.status === 'FAILED') {
            throw new Error(data.errorMessage || 'Walrus certification failed');
        }
        // PENDING / UPLOADING — keep polling
    }

    throw new Error('Walrus certification timed out');
}

export async function uploadToWalrus(
    file: File,
    onStatus?: (status: 'uploading' | 'certifying') => void,
): Promise<WalrusUploadResult> {
    onStatus?.('uploading');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/walrus-upload', {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Upload failed: ${res.statusText}`);
    }

    const { jobId, blobId } = await res.json();

    onStatus?.('certifying');
    const downloadUrl = await pollUntilCertified(jobId);

    return { blobId, jobId, downloadUrl };
}

export function getWalrusBlobUrl(blobId: string): string {
    return `${WALRUS_URLS.aggregator}/v1/blobs/${blobId}`;
}