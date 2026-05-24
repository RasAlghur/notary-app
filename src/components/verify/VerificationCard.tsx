// src/components/verify/VerificationCard.tsx
import { CheckCircle2, XCircle, FileText, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import type { VerificationResult } from '../../types/document';

interface VerificationCardProps {
    result: VerificationResult;
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
                <span className={clsx(
                    'text-sm break-all text-white',
                    mono && 'font-mono text-xs text-green-400'
                )}>
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
                <span className="text-xs text-blue-400">Copied!</span>
            )}
        </div>
    );
}

export default function VerificationCard({ result }: VerificationCardProps) {
    const { isValid, document, message } = result;

    return (
        <div className={clsx(
            'rounded-xl border p-6 space-y-6',
            isValid
                ? 'border-green-800 bg-green-500/5'
                : 'border-red-800 bg-red-500/5'
        )}>

            {/* Status header */}
            <div className="flex items-center gap-3">
                {isValid
                    ? <CheckCircle2 className="h-7 w-7 text-green-400 shrink-0" />
                    : <XCircle className="h-7 w-7 text-red-400 shrink-0" />
                }
                <div>
                    <p className={clsx(
                        'font-semibold text-lg',
                        isValid ? 'text-green-400' : 'text-red-400'
                    )}>
                        {isValid ? 'Document Verified' : 'Verification Failed'}
                    </p>
                    <p className="text-sm text-gray-400">{message}</p>
                </div>
            </div>

            {/* Document details */}
            {isValid && document && (
                <div className="rounded-lg border border-gray-800 bg-gray-900 px-4 divide-y divide-gray-800">

                    {/* File name */}
                    <div className="flex items-center gap-3 py-3">
                        <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="text-sm text-white">{document.fileName}</span>
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

            {/* Explorer link */}
            {isValid && document && (
                <a

                    href={`https://suiscan.xyz/testnet/tx/${document.txDigest}`}

                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                    <ExternalLink className="h-4 w-4" />
                    View on SuiScan
                </a>
            )
            }

        </div >
    );
}