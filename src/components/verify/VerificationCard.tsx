// src/components/verify/VerificationCard.tsx
import {
    CheckCircle2,
    XCircle,
    FileText,
    Copy,
    ExternalLink,
    Loader2,
    Download,
} from 'lucide-react';

import { useState, useEffect, useMemo } from 'react';
import { clsx } from 'clsx';

import type { VerificationResult } from '../../types/document';
import { NETWORK, SUI_SCAN_URLS } from '../../lib/constants';

interface BlobPreviewProps {
    blobId: string;
    fileName?: string;
}

function detectType(bytes: Uint8Array, fileName?: string): string {
    // PNG
    if (
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47
    ) {
        return 'image/png';
    }

    // JPEG
    if (bytes[0] === 0xff && bytes[1] === 0xd8) {
        return 'image/jpeg';
    }

    // PDF
    if (
        bytes[0] === 0x25 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x44 &&
        bytes[3] === 0x46
    ) {
        return 'application/pdf';
    }

    // GIF
    if (
        bytes[0] === 0x47 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46
    ) {
        return 'image/gif';
    }

    // WEBP
    if (
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50
    ) {
        return 'image/webp';
    }

    // Filename fallback
    const ext = fileName?.split('.').pop()?.toLowerCase();

    if (ext === 'png') return 'image/png';
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'gif') return 'image/gif';
    if (ext === 'webp') return 'image/webp';
    if (ext === 'pdf') return 'application/pdf';

    if (
        ext === 'txt' ||
        ext === 'json' ||
        ext === 'csv' ||
        ext === 'md' ||
        ext === 'log'
    ) {
        return 'text/plain';
    }

    // UTF-8 text fallback
    try {
        const sample = new TextDecoder('utf-8', {
            fatal: true,
        }).decode(bytes.slice(0, 512));

        if (sample.trim().length > 0) {
            return 'text/plain';
        }
    } catch {
        // binary
    }

    return 'application/octet-stream';
}

function BlobPreview({
    blobId,
    fileName,
}: BlobPreviewProps) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [contentType, setContentType] = useState<string | null>(null);
    const [textContent, setTextContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [previewUnavailable, setPreviewUnavailable] = useState(false);

    const resolvedUrl = useMemo(
        () => `/api/walrus-blob?blobId=${encodeURIComponent(blobId)}`,
        [blobId]
    );

    useEffect(() => {
        let objectUrl: string | null = null;
        let cancelled = false;

        async function loadBlob() {
            try {
                setIsLoading(true);
                setPreviewUnavailable(false);

                const response = await fetch(resolvedUrl);

                if (!response.ok) {
                    throw new Error(`Failed to fetch blob (${response.status})`);
                }

                const buffer = await response.arrayBuffer();
                const bytes = new Uint8Array(buffer);

                if (!bytes.length) {
                    throw new Error('Empty blob');
                }

                const headerType =
                    response.headers
                        .get('content-type')
                        ?.split(';')[0]
                        ?.trim() || null;

                const detectedType =
                    headerType === 'application/octet-stream'
                        ? detectType(bytes, fileName)
                        : headerType || detectType(bytes, fileName);

                if (cancelled) return;

                setContentType(detectedType);

                // Text preview
                if (detectedType.startsWith('text/')) {
                    const text = new TextDecoder().decode(bytes);
                    setTextContent(text);
                    return;
                }

                // Binary preview
                const blob = new Blob([bytes], {
                    type: detectedType,
                });

                objectUrl = URL.createObjectURL(blob);

                if (!cancelled) {
                    setBlobUrl(objectUrl);
                }
            } catch (error) {
                console.error('Preview error:', error);

                if (!cancelled) {
                    setPreviewUnavailable(true);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadBlob();

        return () => {
            cancelled = true;

            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [resolvedUrl, fileName]);

    if (isLoading) {
        return (
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                <span className="ml-2 text-sm text-gray-400">
                    Loading document preview...
                </span>
            </div>
        );
    }

    // IMAGE
    if (contentType?.startsWith('image/') && blobUrl) {
        return (
            <div className="rounded-lg border border-gray-800 bg-gray-900 overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-3">
                    <p className="text-xs text-gray-500">Image Preview</p>

                    <a
                        href={resolvedUrl}
                        download={fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                        <Download className="h-3 w-3" />
                        Download
                    </a>
                </div>

                <img
                    src={blobUrl}
                    alt={fileName || 'Document preview'}
                    className="w-full max-h-[500px] object-contain bg-black p-2"
                />
            </div>
        );
    }

    // PDF
    if (contentType?.includes('pdf') && blobUrl) {
        return (
            <div className="rounded-lg border border-gray-800 bg-gray-900 overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-3">
                    <p className="text-xs text-gray-500">PDF Preview</p>

                    <a
                        href={resolvedUrl}
                        download={fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                        <Download className="h-3 w-3" />
                        Download
                    </a>
                </div>

                <iframe
                    src={blobUrl}
                    className="w-full h-[600px]"
                    title="PDF preview"
                />
            </div>
        );
    }

    // TEXT
    if (contentType?.startsWith('text/') && textContent !== null) {
        return (
            <div className="rounded-lg border border-gray-800 bg-gray-900 overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-3">
                    <p className="text-xs text-gray-500">Text Preview</p>

                    <a
                        href={resolvedUrl}
                        download={fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                        <Download className="h-3 w-3" />
                        Download
                    </a>
                </div>

                <pre className="px-4 pb-4 pt-2 text-xs text-gray-300 overflow-auto max-h-[500px] whitespace-pre-wrap break-all">
                    {textContent.slice(0, 5000)}

                    {textContent.length > 5000 &&
                        '\n\n... truncated ...'}
                </pre>
            </div>
        );
    }

    // FALLBACK
    return (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-5">
            <div className="flex flex-col items-center text-center gap-3">
                <FileText className="h-8 w-8 text-gray-500" />

                <div>
                    <p className="text-sm text-white">
                        Preview not available
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                        This file type cannot be previewed in-browser.
                    </p>

                    {previewUnavailable && (
                        <p className="text-xs text-yellow-500 mt-2">
                            The document still exists and can be downloaded.
                        </p>
                    )}
                </div>

                <a
                    href={resolvedUrl}
                    download={fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
                >
                    <Download className="h-4 w-4" />
                    Download Original File
                </a>
            </div>
        </div>
    );
}

interface InfoRowProps {
    label: string;
    value: string;
    mono?: boolean;
    copyable?: boolean;
}

function InfoRow({
    label,
    value,
    mono,
    copyable,
}: InfoRowProps) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        await navigator.clipboard.writeText(value);

        setCopied(true);

        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="flex flex-col gap-1 py-3 border-b border-gray-800 last:border-0">
            <span className="text-xs text-gray-500">
                {label}
            </span>

            <div className="flex items-center justify-between gap-2">
                <span
                    className={clsx(
                        'text-sm break-all text-white',
                        mono && 'font-mono text-xs text-green-400'
                    )}
                >
                    {value}
                </span>

                {copyable && (
                    <button
                        onClick={handleCopy}
                        className="shrink-0 text-gray-500 hover:text-white transition-colors"
                    >
                        <Copy className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {copied && (
                <span className="text-xs text-blue-400">
                    Copied!
                </span>
            )}
        </div>
    );
}

function formatDate(timestamp: number): string {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(new Date(timestamp));
}

function shortenAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

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
                        href={`${SUI_SCAN_URLS[NETWORK]}tx/${document.txDigest}`}
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