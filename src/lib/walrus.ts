/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/walrus.ts
import type { WalrusUploadResult } from '../types/lib';

const MAX_ATTEMPTS = 90;        // 3 minutes (90 × 2s)
const INTERVAL_MS  = 2000;
const MAX_RETRIES  = 2;         // retry the whole upload on retriable failures

function decodeErrorMessage(raw: string): string {
    try {
        // strip everything after the first sentence for display
        const decoded = decodeURIComponent(raw);
        const firstSentence = decoded.split('.')[0];
        return firstSentence.length > 120
            ? firstSentence.slice(0, 120) + '…'
            : firstSentence;
    } catch {
        return raw;
    }
}

function isRetriable(errorMessage: string): boolean {
    const decoded = decodeURIComponent(errorMessage).toLowerCase();
    return (
        decoded.includes('retriable') ||
        decoded.includes('timed-out') ||
        decoded.includes('timed out') ||
        decoded.includes('epoch change')
    );
}

async function pollUntilCertified(jobId: string): Promise<string> {
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        await new Promise((r) => setTimeout(r, INTERVAL_MS));

        const res = await fetch(`/api/walrus-status?jobId=${jobId}`);
        if (!res.ok) throw new Error('Failed to poll upload status');

        const data = await res.json();

        if (data.status === 'CERTIFIED') {
            return data.downloadUrlByQuiltId ?? '';
        }

        if (data.status === 'FAILED') {
            const msg = data.errorMessage ?? 'Walrus certification failed';
            // surface retriability so the caller can decide to retry
            const err = new Error(decodeErrorMessage(msg));
            (err as any).retriable = isRetriable(msg);
            throw err;
        }
        // PENDING / UPLOADING — keep polling
    }

    const err = new Error('Upload is taking longer than expected. Please try again.');
    (err as any).retriable = true;
    throw err;
}

async function attemptUpload(file: File): Promise<{ jobId: string; blobId: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/walrus-upload', { method: 'POST', body: formData });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Upload failed: ${res.statusText}`);
    }

    return res.json();
}

export async function uploadToWalrus(
    file: File,
    onStatus?: (status: 'uploading' | 'certifying') => void,
): Promise<WalrusUploadResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) {
            // brief back-off before retrying
            await new Promise((r) => setTimeout(r, 3000));
        }

        try {
            onStatus?.('uploading');
            const { jobId, blobId } = await attemptUpload(file);

            onStatus?.('certifying');
            const downloadUrl = await pollUntilCertified(jobId);

            return { blobId, jobId, downloadUrl };
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            const retriable = (lastError as any).retriable === true;

            if (!retriable || attempt === MAX_RETRIES) {
                throw lastError;
            }
            // retriable — loop and try again
        }
    }

    throw lastError ?? new Error('Upload failed');
}