// src/pages/Home.tsx
import { useState } from 'react';
import UploadBox from '../components/upload/UploadBox';
import FilePreview from '../components/upload/FilePreview';
import UploadProgress from '../components/upload/UploadProgress';
import { useCurrentAccount } from '@mysten/dapp-kit-react';
import type { UploadState, NotarizedDocument } from '../types/document';
import { CheckCircle2, ExternalLink } from 'lucide-react';

const INITIAL_STATE: UploadState = {
    file: null,
    hash: null,
    status: 'idle',
    progress: 0,
    error: null,
    result: null,
};

// Dummy notarized result for UI testing
const DUMMY_RESULT: NotarizedDocument = {
    id: '0xabc123',
    blobId: 'blobABC123XYZ',
    fileName: 'contract.pdf',
    fileSize: 204800,
    fileHash: 'a3f1c2e4b5d6789012345678901234567890abcdef1234567890abcdef123456',
    owner: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    timestamp: Date.now(),
    txDigest: '7xKpQ2mNvL9rT4wYhZbUcDsEfGiJoAkBlMnOpQrStUvWxYz',
};

export default function Home() {
    const account = useCurrentAccount();
    const [uploadState, setUploadState] = useState<UploadState>(INITIAL_STATE);

    function handleFileSelect(file: File) {
        setUploadState({
            ...INITIAL_STATE,
            file,
            status: 'hashing',
            hash: null,
        });

        // Simulate hashing delay
        setTimeout(() => {
            setUploadState((prev) => ({
                ...prev,
                hash: DUMMY_RESULT.fileHash,
                status: 'idle',
            }));
        }, 1000);
    }

    function handleClear() {
        setUploadState(INITIAL_STATE);
    }

    function handleNotarize() {
        if (!uploadState.file || !uploadState.hash) return;

        // Simulate the full flow with dummy data
        setUploadState((prev) => ({ ...prev, status: 'uploading' }));

        setTimeout(() => {
            setUploadState((prev) => ({ ...prev, status: 'registering' }));
        }, 1500);

        setTimeout(() => {
            setUploadState((prev) => ({
                ...prev,
                status: 'done',
                result: DUMMY_RESULT,
            }));
        }, 3000);
    }

    const isReady =
        uploadState.file &&
        uploadState.hash &&
        uploadState.status === 'idle';

    const isProcessing = ['hashing', 'uploading', 'registering'].includes(
        uploadState.status
    );

    return (
        <div className="mx-auto max-w-2xl space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Notarize a Document
                </h1>
                <p className="mt-1 text-sm text-gray-400">
                    Upload a file to permanently record its existence on Sui via Walrus.
                </p>
            </div>

            {/* Wallet warning */}
            {!account && (
                <div className="rounded-lg border border-yellow-800 bg-yellow-500/10 p-4">
                    <p className="text-sm text-yellow-400">
                        Connect your wallet to notarize documents.
                    </p>
                </div>
            )}

            {/* Upload area — hide when done */}
            {uploadState.status !== 'done' && (
                <div className="space-y-4">
                    {!uploadState.file && (
                        <UploadBox
                            onFileSelect={handleFileSelect}
                            disabled={!account || isProcessing}
                        />
                    )}

                    {uploadState.file && (
                        <FilePreview
                            uploadState={uploadState}
                            onClear={handleClear}
                        />
                    )}

                    {uploadState.status !== 'idle' && (
                        <UploadProgress
                            status={uploadState.status}
                            error={uploadState.error}
                        />
                    )}

                    {/* Notarize button */}
                    {isReady && (
                        <button
                            onClick={handleNotarize}
                            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
                        >
                            Notarize Document
                        </button>
                    )}
                </div>
            )}

            {/* Success state */}
            {uploadState.status === 'done' && uploadState.result && (
                <div className="rounded-xl border border-green-800 bg-green-500/5 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-green-400" />
                        <p className="font-semibold text-green-400">
                            Document Notarized Successfully
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-900 border border-gray-800 p-4 space-y-2">
                        <div>
                            <p className="text-xs text-gray-500">Walrus Blob ID</p>
                            <p className="text-xs font-mono text-green-400 break-all">
                                {uploadState.result.blobId}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Transaction</p>
                            <p className="text-xs font-mono text-green-400 break-all">
                                {uploadState.result.txDigest}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <a
                            href={`/verify/${uploadState.result.blobId}`}
                            className="flex-1 rounded-lg border border-gray-700 px-4 py-2 text-center text-sm text-gray-300 hover:text-white transition-colors"
                        >
                            View Certificate
                        </a>
                        <a
                            href={`https://suiscan.xyz/testnet/tx/${uploadState.result.txDigest}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                            SuiScan
                        </a>
                        <button
                            onClick={handleClear}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                        >
                            Notarize Another
                        </button>
                    </div>
                </div >
            )
            }

        </div >
    );
}