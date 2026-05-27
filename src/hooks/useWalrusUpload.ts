import { useState } from 'react';
import { hashFile } from '../lib/hash';
import { uploadToWalrus } from '../lib/walrus';
import type { UploadState } from '../types/document';

const INITIAL_STATE: UploadState = {
    file: null,
    hash: null,
    status: 'idle',
    progress: 0,
    error: null,
    result: null,
};

export function useWalrusUpload() {
    const [uploadState, setUploadState] = useState<UploadState>(INITIAL_STATE);

    function reset() {
        setUploadState(INITIAL_STATE);
    }

    async function selectFile(file: File) {
        setUploadState({ ...INITIAL_STATE, file, status: 'hashing' });

        try {
            const hash = await hashFile(file);
            setUploadState((prev) => ({ ...prev, hash, status: 'idle' }));
        } catch (err) {
            setUploadState((prev) => ({
                ...prev,
                status: 'error',
                error: err instanceof Error ? err.message : 'Hashing failed',
            }));
        }
    }

    async function upload(): Promise<{ blobId: string; hash: string } | null> {
        const { file, hash } = uploadState;
        if (!file || !hash) return null;

        try {
            const result = await uploadToWalrus(file, (status) => {
                setUploadState((prev) => ({ ...prev, status }));
            });

            return { blobId: result.blobId, hash };
        } catch (err) {
            setUploadState((prev) => ({
                ...prev,
                status: 'error',
                error: err instanceof Error ? err.message : 'Walrus upload failed',
            }));
            return null;
        }
    }

    return { uploadState, setUploadState, selectFile, upload, reset };
}