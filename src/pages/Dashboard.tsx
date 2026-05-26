// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit-react';
import { getDocumentsByOwner } from '../lib/tatum';
import type { NotarizedDocument } from '../types/document';

function formatDate(timestamp: number): string {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
    }).format(new Date(timestamp));
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function shortenHash(hash: string): string {
    return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

function parseDocumentFromObject(obj: unknown): NotarizedDocument | null {
    try {
        const raw = obj as {
            data?: {
                objectId?: string;
                content?: {
                    fields?: {
                        blob_id?: string;
                        file_name?: string;
                        file_hash?: string;
                        file_size?: string;
                        owner?: string;
                        timestamp?: string;
                    };
                };
            };
        };

        const fields = raw?.data?.content?.fields;
        if (!fields) return null;

        return {
            id: raw.data?.objectId ?? '',
            blobId: fields.blob_id ?? '',
            fileName: fields.file_name ?? '',
            fileSize: Number(fields.file_size ?? 0),
            fileHash: fields.file_hash ?? '',
            owner: fields.owner ?? '',
            timestamp: Number(fields.timestamp ?? 0),
            txDigest: '',
        };
    } catch {
        return null;
    }
}

interface DocumentCardProps {
    document: NotarizedDocument;
}

function DocumentCard({ document }: DocumentCardProps) {
    return (
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-5 space-y-4 hover:border-gray-600 transition-colors">

            {/* Top row */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500/10 p-2 shrink-0">
                        <FileText className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">
                            {document.fileName || 'Untitled Document'}
                        </p>
                        <p className="text-xs text-gray-400">
                            {formatFileSize(document.fileSize)} · {formatDate(document.timestamp)}
                        </p>
                    </div>
                </div>

                {/* SuiScan link */}
                <a
                    href={`https://suiscan.xyz/testnet/object/${document.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-gray-500 hover:text-blue-400 transition-colors"
                >
                    <ExternalLink className="h-4 w-4" />
                </a>
            </div>

            {/* Hash */}
            <div className="rounded-lg bg-gray-800 px-3 py-2">
                <p className="text-xs text-gray-500 mb-1">SHA-256</p>
                <p className="text-xs font-mono text-green-400">
                    {shortenHash(document.fileHash)}
                </p>
            </div>

            {/* View certificate */}
            <Link
                to={`/verify/${document.blobId}`}
                className="flex items-center justify-between rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
            >
                <span>View Certificate</span>
                <ArrowRight className="h-4 w-4" />
            </Link>

        </div >
    );
}

export default function Dashboard() {
    const account = useCurrentAccount();
    const [documents, setDocuments] = useState<NotarizedDocument[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!account?.address) return;

        async function fetchDocuments() {
            setIsLoading(true);
            setError(null);

            try {
                const objects = await getDocumentsByOwner(account!.address);
                const parsed = objects
                    .map(parseDocumentFromObject)
                    .filter((doc): doc is NotarizedDocument => doc !== null);
                setDocuments(parsed);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'Failed to load documents.'
                );
            } finally {
                setIsLoading(false);
            }
        }

        fetchDocuments();
    }, [account, account?.address]);

    if (!account) {
        return (
            <div className="mx-auto max-w-2xl">
                <div className="rounded-xl border border-gray-700 bg-gray-900 p-12 text-center">
                    <FileText className="mx-auto h-10 w-10 text-gray-600 mb-4" />
                    <p className="text-white font-medium">Connect your wallet</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Your notarized documents will appear here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-400">
                        {isLoading
                            ? 'Loading...'
                            : `${documents.length} notarized document${documents.length !== 1 ? 's' : ''}`
                        }
                    </p>
                </div>
                <Link
                    to="/"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                    + Notarize New
                </Link>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="rounded-lg border border-red-800 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && documents.length === 0 && (
                <div className="rounded-xl border border-gray-700 bg-gray-900 p-12 text-center">
                    <FileText className="mx-auto h-10 w-10 text-gray-600 mb-4" />
                    <p className="text-white font-medium">No documents yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Notarize your first document to see it here.
                    </p>
                    <Link
                        to="/"
                        className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                    >
                        Get Started
                    </Link>
                </div>
            )}

            {/* Document list */}
            {!isLoading && documents.length > 0 && (
                <div className="space-y-4">
                    {documents.map((doc) => (
                        <DocumentCard key={doc.id} document={doc} />
                    ))}
                </div>
            )}

        </div>
    );
}