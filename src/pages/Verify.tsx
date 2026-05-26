// src/pages/Verify.tsx
import { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
import { useState } from 'react';
import VerificationCard from '../components/verify/VerificationCard';
import { useVerifyDocument } from '../hooks/useVerifyDocument';


export default function Verify() {
    const { blobId } = useParams<{ blobId: string }>();
    const [manualBlobId, setManualBlobId] = useState('');
    const { verify, isVerifying, result, reset } = useVerifyDocument();
    const hasVerified = useRef(false);

    useEffect(() => {
        if (blobId && !hasVerified.current) {
            hasVerified.current = true;
            verify(blobId);
        }
    }, [blobId, verify]);

    function handleManualSearch() {
        if (!manualBlobId.trim()) return;
        reset();
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
                        disabled={!manualBlobId.trim() || isVerifying}
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

            {/* Loading */}
            {isVerifying && (
                <div className="rounded-xl border border-gray-700 bg-gray-900 p-8 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-400 mb-4" />
                    <p className="text-sm text-gray-400">Looking up record on Sui...</p>
                </div>
            )}

            {/* Result */}
            {!isVerifying && result.message && (
                <VerificationCard result={result} />
            )}

        </div>
    );
}