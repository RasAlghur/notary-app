// src/pages/Dashboard.tsx
import { Link } from 'react-router-dom';
import { FileText, ExternalLink, ArrowRight } from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit-react';
import type { NotarizedDocument } from '../types/document';

// Dummy data for UI testing
const DUMMY_DOCUMENTS: NotarizedDocument[] = [
    {
        id: '0xabc001',
        blobId: 'blobABC001XYZ',
        fileName: 'contract_v2.pdf',
        fileSize: 204800,
        fileHash: 'a3f1c2e4b5d6789012345678901234567890abcdef1234567890abcdef123456',
        owner: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
        txDigest: '7xKpQ2mNvL9rT4wYhZbUcDsEfGiJoAkBlMnOpQrStUvWxYz',
    },
    {
        id: '0xabc002',
        blobId: 'blobDEF002XYZ',
        fileName: 'proposal_final.pdf',
        fileSize: 512000,
        fileHash: 'b4g2d3f5c6e7890123456789012345678901bcdefg2345678901bcdefg234567',
        owner: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5,
        txDigest: '8yLqR3nOwM0sU5xZiAcVdTfHgJkPbLcMnQrSuTvXyZ',
    },
    {
        id: '0xabc003',
        blobId: 'blobGHI003XYZ',
        fileName: 'nda_signed.txt',
        fileSize: 8192,
        fileHash: 'c5h3e4g6d7f8901234567890123456789012cdefgh3456789012cdefgh345678',
        owner: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 10,
        txDigest: '9zMrS4oPxN1tV6yAjBwEuGhIlQcMdNoRsTuVwXyZ',
    },
];

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
                        <p className="text-sm font-medium text-white">{document.fileName}</p>
                        <p className="text-xs text-gray-400">
                            {formatFileSize(document.fileSize)} · {formatDate(document.timestamp)}
                        </p>
                    </div>
                </div>

                {/* SuiScan link */}
                <a
                    href={`https://suiscan.xyz/testnet/tx/${document.txDigest}`}
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
                <p className="text-xs font-mono text-green-400">{shortenHash(document.fileHash)}</p>
            </div>

            {/* View certificate */}
            <Link
                to={`/verify/${document.blobId}`}
                className="flex items-center justify-between rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
            >
                <span>View Certificate</span>
                <ArrowRight className="h-4 w-4" />
            </Link>

        </div>
    );
}

export default function Dashboard() {
    const account = useCurrentAccount();

    // Not connected state
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
                        {DUMMY_DOCUMENTS.length} notarized document
                        {DUMMY_DOCUMENTS.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Link
                    to="/"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                    + Notarize New
                </Link>
            </div>

            {/* Empty state */}
            {DUMMY_DOCUMENTS.length === 0 && (
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
            <div className="space-y-4">
                {DUMMY_DOCUMENTS.map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                ))}
            </div>

        </div>
    );
}