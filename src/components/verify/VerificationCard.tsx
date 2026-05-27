// src/components/verify/VerificationCard.tsx
import { CheckCircle2, XCircle, FileText, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import type { VerificationResult } from '../../types/document';
import { NETWORK, SUI_SCAN_URLS } from '../../lib/constants';

interface BlobPreviewProps {
    blobId: string;
}

function detectTypeFromBytes(bytes: Uint8Array): string {
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
    if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg';
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return 'application/pdf';
    try {
        const sample = new TextDecoder('utf-8', { fatal: true }).decode(bytes.slice(0, 512));
        if (sample) return 'text/plain';
    } catch {
        // Not valid UTF-8, likely binary
    }
    return 'application/octet-stream';
}

function BlobPreview({ blobId }: BlobPreviewProps) {
    const [contentType, setContentType] = useState<string | null>(null);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [text, setText] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let objectUrl: string | null = null;

        async function fetchBlob() {
            setIsLoading(true);
            setError(false);

            try {
                // ← proxy instead of direct aggregator URL
                const response = await fetch(`/api/walrus-blob?blobId=${blobId}`);
                if (!response.ok) throw new Error('Failed to fetch blob');

                const arrayBuffer = await response.arrayBuffer();
                const bytes = new Uint8Array(arrayBuffer);
                const detectedType = detectTypeFromBytes(bytes);
                setContentType(detectedType);

                if (detectedType.startsWith('text/')) {
                    setText(new TextDecoder().decode(bytes));
                } else {
                    const blob = new Blob([bytes], { type: detectedType });
                    objectUrl = URL.createObjectURL(blob);
                    setBlobUrl(objectUrl);
                }
            } catch {
                setError(true);
            } finally {
                setIsLoading(false);
            }
        }

        fetchBlob();
        return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }, [blobId]);

    if (isLoading) return (
        <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-gray-900 p-6">
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
            <span className="ml-2 text-sm text-gray-400">Loading preview...</span>
        </div>
    );

    if (error) return (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
            <p className="text-xs text-gray-500">Preview unavailable</p>
        </div>
    );

    if (contentType?.startsWith('image/') && blobUrl) return (
        <div className="rounded-lg border border-gray-800 bg-gray-900 overflow-hidden">
            <p className="px-4 pt-3 text-xs text-gray-500 mb-2">File Preview</p>
            <img src={blobUrl} alt="Document preview" className="w-full max-h-64 object-contain bg-gray-950 p-2" />
        </div>
    );

    if (contentType?.includes('pdf') && blobUrl) return (
        <div className="rounded-lg border border-gray-800 bg-gray-900 overflow-hidden">
            <p className="px-4 pt-3 text-xs text-gray-500 mb-2">File Preview</p>
            <iframe src={blobUrl} className="w-full h-64" title="PDF preview" />
        </div>
    );

    if (contentType?.startsWith('text/') && text !== null) return (
        <div className="rounded-lg border border-gray-800 bg-gray-900 overflow-hidden">
            <p className="px-4 pt-3 text-xs text-gray-500 mb-2">File Preview</p>
            <pre className="px-4 pb-4 text-xs text-gray-300 overflow-auto max-h-64 whitespace-pre-wrap break-all">
                {text.slice(0, 2000)}{text.length > 2000 && '\n\n... (truncated)'}
            </pre>
        </div>
    );

    return (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
            <p className="text-xs text-gray-500">Preview not available for this file type</p>
        </div>
    );
}

interface InfoRowProps {
    label: string;
    value: string;
    mono?: boolean;
    copyable?: boolean;
}

function InfoRow({ label, value, mono, copyable }: InfoRowProps) {
    const [copied, setCopied] = useState(false);

    function handleCopy() {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="flex flex-col gap-1 py-3 border-b border-gray-800 last:border-0">
            <span className="text-xs text-gray-500">{label}</span>
            <div className="flex items-center justify-between gap-2">
                <span className={clsx('text-sm break-all text-white', mono && 'font-mono text-xs text-green-400')}>
                    {value}
                </span>
                {copyable && (
                    <button onClick={handleCopy} className="shrink-0 text-gray-500 hover:text-white transition-colors">
                        <Copy className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
            {copied && <span className="text-xs text-blue-400">Copied!</span>}
        </div>
    );
}

function formatDate(timestamp: number): string {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(timestamp));
}

function shortenAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function VerificationCard({ result }: { result: VerificationResult }) {
    const { isValid, document, message } = result;

    // real Walrus URL for the external "View Original" button
    const externalBlobUrl = document
        ? `https://aggregator.walrus-${NETWORK}.walrus.space/v1/blobs/${document.blobId}`
        : null;

    return (
        <div className={clsx(
            'rounded-xl border p-6 space-y-6',
            isValid ? 'border-green-800 bg-green-500/5' : 'border-red-800 bg-red-500/5'
        )}>
            <div className="flex items-center gap-3">
                {isValid
                    ? <CheckCircle2 className="h-7 w-7 text-green-400 shrink-0" />
                    : <XCircle className="h-7 w-7 text-red-400 shrink-0" />
                }
                <div>
                    <p className={clsx('font-semibold text-lg', isValid ? 'text-green-400' : 'text-red-400')}>
                        {isValid ? 'Document Verified' : 'Verification Failed'}
                    </p>
                    <p className="text-sm text-gray-400">{message}</p>
                </div>
            </div>

            {isValid && document && <BlobPreview blobId={document.blobId} />}

            {isValid && document && (
                <div className="rounded-lg border border-gray-800 bg-gray-900 px-4 divide-y divide-gray-800">
                    <div className="flex items-center gap-3 py-3">
                        <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="text-sm text-white">{document.fileName || 'Document'}</span>
                    </div>
                    <InfoRow label="Notarized on" value={formatDate(document.timestamp)} />
                    <InfoRow label="Owner" value={shortenAddress(document.owner)} copyable />
                    <InfoRow label="SHA-256 Hash" value={document.fileHash} mono copyable />
                    <InfoRow label="Walrus Blob ID" value={document.blobId} mono copyable />
                    <InfoRow label="Transaction" value={document.txDigest} mono copyable />
                </div>
            )}

            {isValid && document && (
                <div className="flex flex-col gap-3">
                    <a
                        href={externalBlobUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                    >
                        <ExternalLink className="h-4 w-4" />
                        View Original File on Walrus
                    </a>
                    <a
                        href={`${SUI_SCAN_URLS[NETWORK]}tx/${document.txDigest}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-700 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
                    >
                        <ExternalLink className="h-4 w-4" />
                        View on SuiScan
                    </a>
                </div>
            )
            }
        </div >
    );
}