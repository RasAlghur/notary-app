// src/hooks/useVerifyDocument.ts
import { useState, useCallback } from 'react';
import { suiClient } from '../lib/tatum';
import type { VerificationResult } from '../types/document';
import { WALRUS_URLS } from '../lib/constants';

const INITIAL_RESULT: VerificationResult = {
    isValid: false,
    document: null,
    message: '',
};

export function useVerifyDocument() {
    const [isVerifying, setIsVerifying] = useState(false);
    const [result, setResult] = useState<VerificationResult>(INITIAL_RESULT);

    const reset = useCallback(() => {
        setResult(INITIAL_RESULT);
    }, []);

    const verify = useCallback(async (recordId: string): Promise<void> => {
        if (!recordId.trim()) return;

        setIsVerifying(true);
        setResult(INITIAL_RESULT);

        try {
            const object = await suiClient.getObject({
                id: recordId,
                options: {
                    showContent: true,
                    showOwner: true,
                    showType: true,
                    showPreviousTransaction: true,
                },
            });

            const content = object.data?.content;
            if (!content || content.dataType !== 'moveObject') {
                setResult({
                    isValid: false,
                    document: null,
                    message: 'No notarization record found on Sui.',
                });
                return;
            }

            const fields = content.fields as Record<string, unknown>;

            const blobId    = String(fields.blob_id   ?? '');
            const fileHash  = String(fields.file_hash  ?? '');
            const fileName  = String(fields.file_name  ?? '');
            const fileSize  = Number(fields.file_size  ?? 0);
            const owner     = String(fields.owner      ?? '');
            const timestamp = Number(fields.timestamp  ?? 0);

            if (!blobId) {
                setResult({
                    isValid: false,
                    document: null,
                    message: 'Invalid notarization record.',
                });
                return;
            }

            // HEAD request — check blob exists without downloading it
            const walrusResponse = await fetch(
                `${WALRUS_URLS.aggregator}/v1/blobs/${blobId}`,
                { method: 'HEAD' },
            );

            if (!walrusResponse.ok) {
                setResult({
                    isValid: false,
                    document: null,
                    message: 'Walrus blob not found for this record.',
                });
                return;
            }

            setResult({
                isValid: true,
                document: {
                    id: recordId,
                    blobId,
                    fileName,
                    fileSize,
                    fileHash,
                    owner,
                    timestamp,
                    txDigest: object.data?.previousTransaction ?? '',
                },
                message: 'Document verified. On-chain record and Walrus blob found.',
            });
        } catch (err) {
            console.error('Verify error:', err);
            setResult({
                isValid: false,
                document: null,
                message: err instanceof Error ? err.message : 'Verification failed.',
            });
        } finally {
            setIsVerifying(false);
        }
    }, []);

    return { verify, isVerifying, result, reset };
}