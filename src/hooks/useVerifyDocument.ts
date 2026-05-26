// src/hooks/useVerifyDocument.ts
import { useState } from 'react';
import { suiClient } from '../lib/tatum';
import type { VerificationResult, NotarizedDocument } from '../types/document';
import { PACKAGE_ID, WALRUS_URLS } from '../lib/constants';

const INITIAL_RESULT: VerificationResult = {
    isValid: false,
    document: null,
    message: '',
};

export function useVerifyDocument() {
    const [isVerifying, setIsVerifying] = useState(false);
    const [result, setResult] = useState<VerificationResult>(INITIAL_RESULT);

    async function verify(blobId: string): Promise<void> {
        if (!blobId.trim()) return;

        setIsVerifying(true);
        setResult(INITIAL_RESULT);

        try {
            const walrusResponse = await fetch(
                `${WALRUS_URLS.aggregator}/v1/blobs/${blobId}`
            );

            if (!walrusResponse.ok) {
                setResult({
                    isValid: false,
                    document: null,
                    message: 'No file found on Walrus for this blob ID.',
                });
                return;
            }

            const events = await suiClient.queryEvents({
                query: {
                    MoveEventType: `${PACKAGE_ID}::registry::DocumentRegistered`,
                },
                limit: 1000,
                order: 'descending',
            });

            console.log('Events found:', events.data.length);
            console.log('Looking for blobId:', blobId);

            const matchingEvent = events.data.find((event) => {
                const fields = event.parsedJson as {
                    blob_id?: string;
                };
                console.log('Event blob_id:', fields?.blob_id);
                return fields?.blob_id === blobId;
            });

            if (!matchingEvent) {
                setResult({
                    isValid: false,
                    document: null,
                    message: 'File exists on Walrus but no notarization record found on Sui.',
                });
                return;
            }

            const fields = matchingEvent.parsedJson as {
                blob_id: string;
                file_hash: string;
                owner: string;
                timestamp: string;
            };

            const document: NotarizedDocument = {
                id: matchingEvent.id.txDigest,
                blobId: fields.blob_id,
                fileName: '',
                fileSize: 0,
                fileHash: fields.file_hash,
                owner: fields.owner,
                timestamp: Number(fields.timestamp),
                txDigest: matchingEvent.id.txDigest,
            };

            setResult({
                isValid: true,
                document,
                message: 'Document verified. Hash and ownership confirmed on Sui.',
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
    }

    function reset() {
        setResult(INITIAL_RESULT);
    }

    return { verify, isVerifying, result, reset };
}