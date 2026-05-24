// src/pages/Verify.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import VerificationCard from '../components/verify/VerificationCard';
import type { VerificationResult } from '../types/document';

// Dummy data for UI testing
const DUMMY_VERIFICATION: VerificationResult = {
    isValid: true,
    message: 'This document was found on Sui and its hash matches the Walrus blob.',
    document: {
        id: '0xabc001',
        blobId: 'blobABC001XYZ',
        fileName: 'contract_v2.pdf',
        fileSize: 204800,
        fileHash: 'a3f1c2e4b5d6789012345678901234567890abcdef1234567890abcdef123456',
        owner: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
        txDigest: '7xKpQ2mNvL9rT4wYhZbUcDsEfGiJoAkBlMnOpQrStUvWxYz',
    },
};

const DUMMY_FAILED: VerificationResult = {
    isValid: false,
    message: 'No record found on Sui for this blob ID.',
    document: null,
};

type PageStatus = 'idle' | 'loading' | 'done';

export default function Verify() {
    const { blobId } = useParams<{ blobId: string }>();
    const [manualBlobId, setManualBlobId] = useState('');
    const [pageStatus, setPageStatus] = useState<PageStatus>('idle');
    const [result, setResult] = useState<VerificationResult | null>(null);

    // Auto-verify if blobId is in the URL
    useEffect(() => {
        if (blobId) {
            verify(blobId);
        }
    }, [blobId]);

    function verify(id: string) {
        if (!id.trim()) return;

        setPageStatus('loading');
        setResult(null);

        // Simulate lookup delay
        setTimeout(() => {
            // Use failed result for unknown blob IDs
            const found = id === DUMMY_VERIFICATION.document?.blobId;
            setResult(found ? DUMMY_VERIFICATION : DUMMY_FAILED);
            setPageStatus('done');
        }, 1500);
    }

    function handleManualSearch() {
        verify(manualBlobId);
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">

            {/* Header */}
            <div className="flex items-center gap-3">
                <Link
                    to="/"
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold text-white">
                        Verify Document
                    </h1>
                    <p className="mt-1 text-sm text-gray-400">
                        Enter a Walrus blob ID to check its notarization record on Sui.
                    </p>
                </div>
            </div>

            {/* Manual search — shown when no blobId in URL */}
            {!blobId && (
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Enter Walrus blob ID..."
                        value={manualBlobId}
                        onChange={(e) => setManualBlobId(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                        className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                        onClick={handleManualSearch}
                        disabled={!manualBlobId.trim() || pageStatus === 'loading'}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
                    >
                        <Search className="h-4 w-4" />
                        Verify
                    </button>
                </div>
            )}

            {/* Blob ID from URL */}
            {blobId && (
                <div className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-3">
                    <p className="text-xs text-gray-500 mb-1">Blob ID</p>
                    <p className="text-xs font-mono text-green-400 break-all">{blobId}</p>
                </div>
            )}

            {/* Loading state */}
            {pageStatus === 'loading' && (
                <div className="rounded-xl border border-gray-700 bg-gray-900 p-8 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-blue-400 mb-4" />
                    <p className="text-sm text-gray-400">Looking up record on Sui...</p>
                </div>
            )}

            {/* Result */}
            {pageStatus === 'done' && result && (
                <VerificationCard result={result} />
            )}

            {/* Hint for manual testing */}
            {!blobId && pageStatus === 'idle' && (
                <p className="text-xs text-gray-600 text-center">
                    Try entering <span className="font-mono">blobABC001XYZ</span> to see a verified result.
                </p>
            )}

        </div>
    );
}