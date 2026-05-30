// src/pages/Home.tsx
import { useCurrentAccount } from '@mysten/dapp-kit-react';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import UploadBox from '../components/upload/UploadBox';
import FilePreview from '../components/upload/FilePreview';
import UploadProgress from '../components/upload/UploadProgress';
import { useWalrusUpload } from '../hooks/useWalrusUpload';
import { useRegisterDocument } from '../hooks/useRegisterDocument';
import { NETWORK, SUI_SCAN_URLS } from '../lib/constants';
import { NotaryAgent } from '../components/agent/NotaryAgent';

export default function Home() {
    const account = useCurrentAccount();
    const { uploadState, setUploadState, selectFile, upload, reset } = useWalrusUpload();
    const { register } = useRegisterDocument();

    async function handleNotarize() {
        if (!uploadState.file || !uploadState.hash) return;

        const uploadResult = await upload();
        if (!uploadResult) return;

        setUploadState((prev) => ({ ...prev, status: 'registering' }));

        const document = await register({
            blobId: uploadResult.blobId,
            fileName: uploadState.file.name,
            fileHash: uploadResult.hash,
            fileSize: uploadState.file.size,
        });

        if (!document) {
            setUploadState((prev) => ({
                ...prev,
                status: 'error',
                error: 'Failed to register document on Sui.',
            }));
            return;
        }

        setUploadState((prev) => ({ ...prev, status: 'done', result: document }));
    }

    const isReady =
        uploadState.file &&
        uploadState.hash &&
        uploadState.status === 'idle';

    const isProcessing = ['hashing', 'uploading', 'certifying', 'registering'].includes(
        uploadState.status
    );

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <div>
                <h1 className="text-2xl font-semibold text-white">Notarize a Document</h1>
                <p className="mt-1 text-sm text-gray-400">
                    Upload a file to permanently record its existence on Sui via Walrus.
                </p>
            </div>

            {!account && (
                <div className="rounded-lg border border-yellow-800 bg-yellow-500/10 p-4">
                    <p className="text-sm text-yellow-400">
                        Connect your wallet to notarize documents.
                    </p>
                </div>
            )}

            {uploadState.status !== 'done' && (
                <div className="space-y-4">
                    {!uploadState.file && (
                        <UploadBox onFileSelect={selectFile} disabled={!account || isProcessing} />
                    )}

                    {uploadState.file && (
                        <FilePreview uploadState={uploadState} onClear={reset} />
                    )}

                    {uploadState.status !== 'idle' && (
                        <UploadProgress status={uploadState.status} error={uploadState.error} />
                    )}

                    {isReady && (
                        <button
                            onClick={handleNotarize}
                            disabled={isProcessing}
                            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
                        >
                            Notarize Document
                        </button>
                    )}
                </div>
            )}

            {uploadState.status === 'done' && uploadState.result && (
                <div className="rounded-xl border border-green-800 bg-green-500/5 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-green-400" />
                        <p className="font-semibold text-green-400">Document Notarized Successfully</p>
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
                        <Link
                            to={`/verify/${uploadState.result.id}`}
                            className="flex-1 rounded-lg border border-gray-700 px-4 py-2 text-center text-sm text-gray-300 hover:text-white transition-colors"
                        >
                            View Certificate
                        </Link>
                        <a
                            href={`${SUI_SCAN_URLS[NETWORK as keyof typeof SUI_SCAN_URLS]}tx/${uploadState.result.txDigest}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                            SuiScan
                        </a>
                        <button
                            onClick={reset}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                        >
                            Notarize Another
                        </button>
                    </div>
                </div>
            )}
            {account && (
                <NotaryAgent address={account.address} />
            )}
        </div>
    );
}