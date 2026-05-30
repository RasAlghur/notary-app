// src/components/verify/VerificationCard.tsx
import {
    CheckCircle2,
    XCircle,
    FileText,
    ExternalLink
} from 'lucide-react';
import { clsx } from 'clsx';
import type { VerificationResult } from '../../types/document';
import { NETWORK, SUI_SCAN_URLS } from '../../lib/constants';
import { InfoRow } from './InfoRow';
import { BlobPreview } from './BlobPreview';
import { formatDate, shortenAddress } from '../../utils/format';


export default function VerificationCard({
    result,
}: {
    result: VerificationResult;
}) {
    const { isValid, document, message } = result;

    return (
        <div
            className={clsx(
                'rounded-xl border p-6 space-y-6',
                isValid
                    ? 'border-green-800 bg-green-500/5'
                    : 'border-red-800 bg-red-500/5'
            )}
        >
            <div className="flex items-center gap-3">
                {isValid ? (
                    <CheckCircle2 className="h-7 w-7 text-green-400 shrink-0" />
                ) : (
                    <XCircle className="h-7 w-7 text-red-400 shrink-0" />
                )}

                <div>
                    <p
                        className={clsx(
                            'font-semibold text-lg',
                            isValid
                                ? 'text-green-400'
                                : 'text-red-400'
                        )}
                    >
                        {isValid
                            ? 'Document Verified'
                            : 'Verification Failed'}
                    </p>

                    <p className="text-sm text-gray-400">
                        {message}
                    </p>
                </div>
            </div>

            {isValid && document && (
                <BlobPreview
                    blobId={document.blobId}
                    fileName={document.fileName}
                />
            )}

            {isValid && document && (
                <div className="rounded-lg border border-gray-800 bg-gray-900 px-4 divide-y divide-gray-800">
                    <div className="flex items-center gap-3 py-3">
                        <FileText className="h-4 w-4 text-gray-400 shrink-0" />

                        <span className="text-sm text-white">
                            {document.fileName || 'Document'}
                        </span>
                    </div>

                    <InfoRow
                        label="Notarized on"
                        value={formatDate(document.timestamp)}
                    />

                    <InfoRow
                        label="Owner"
                        value={shortenAddress(document.owner)}
                        copyable
                    />

                    <InfoRow
                        label="SHA-256 Hash"
                        value={document.fileHash}
                        mono
                        copyable
                    />

                    <InfoRow
                        label="Walrus Blob ID"
                        value={document.blobId}
                        mono
                        copyable
                    />

                    <InfoRow
                        label="Transaction"
                        value={document.txDigest}
                        mono
                        copyable
                    />
                </div>
            )}

            {isValid && document && (
                <div className="flex flex-col gap-3">
                    <a
                        href={`/api/walrus-blob?blobId=${encodeURIComponent(document.blobId)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                    >
                        <ExternalLink className="h-4 w-4" />
                        View Original File
                    </a>

                    <a
                        href={`${SUI_SCAN_URLS[NETWORK as keyof typeof SUI_SCAN_URLS]}tx/${document.txDigest}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-700 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
                    >
                        <ExternalLink className="h-4 w-4" />
                        View on SuiScan
                    </a>
                </div>
            )}
        </div>
    );
}