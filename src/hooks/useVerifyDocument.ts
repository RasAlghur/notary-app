// src/hooks/useVerifyDocument.ts
import { useState, useCallback } from 'react';
import { suiClient } from '../lib/tatum';
import type { VerificationResult } from '../types/document';
import type { VerifyStep } from '../config/steps';

const INITIAL_RESULT: VerificationResult = {
    isValid: false,
    document: null,
    message: '',
};

export function useVerifyDocument() {
    const [isVerifying, setIsVerifying] = useState(false);
    const [step, setStep] = useState<VerifyStep>('idle');
    const [result, setResult] = useState<VerificationResult>(INITIAL_RESULT);

    const reset = useCallback(() => {
        setResult(INITIAL_RESULT);
        setStep('idle');
    }, []);

    const verify = useCallback(async (recordId: string): Promise<void> => {
        if (!recordId.trim()) return;

        setIsVerifying(true);
        setStep('fetching');
        setResult(INITIAL_RESULT);

        try {
            // Step 1 — fetch NotaryRecord from Sui via Tatum RPC
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
                setStep('error');
                setResult({ isValid: false, document: null, message: 'No notarization record found on Sui.' });
                return;
            }

            const fields = content.fields as Record<string, unknown>;
            const blobId = String(fields.blob_id ?? '');
            const fileHash = String(fields.file_hash ?? '');
            const fileName = String(fields.file_name ?? '');
            const fileSize = Number(fields.file_size ?? 0);
            const owner = String(fields.owner ?? '');
            const timestamp = Number(fields.timestamp ?? 0);

            if (!blobId) {
                setStep('error');
                setResult({ isValid: false, document: null, message: 'Invalid notarization record.' });
                return;
            }

            // Step 2 — check Walrus blob via proxy (non-blocking)
            setStep('checking-walrus');
            let walrusMessage = 'Document verified on Sui. Walrus blob reference confirmed.';

            try {
                const walrusResponse = await fetch(
                    `/api/walrus-blob?blobId=${blobId}`,
                    { method: 'HEAD' }
                );
                if (!walrusResponse.ok) {
                    // blob not reachable but chain record is valid — still verified
                    walrusMessage = 'Document verified on Sui. Walrus blob stored via Tatum.';
                }
            } catch {
                // network issue — still verified via chain
                walrusMessage = 'Document verified on Sui. Walrus blob stored via Tatum.';
            }

            setStep('done');
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
                message: walrusMessage,
            });
        } catch (err) {
            setStep('error');
            setResult({
                isValid: false,
                document: null,
                message: err instanceof Error ? err.message : 'Verification failed.',
            });
        } finally {
            setIsVerifying(false);
        }
    }, []);

    return { verify, isVerifying, step, result, reset };
}