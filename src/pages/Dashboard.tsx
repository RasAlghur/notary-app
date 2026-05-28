// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Loader2 } from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit-react';
import { getDocumentsByOwner } from '../lib/tatum';
import type { NotarizedDocument } from '../types/document';
import { DocumentCard } from '../components/document/DocumentCard';

export default function Dashboard() {
    const account = useCurrentAccount();
    const [documents, setDocuments] = useState<NotarizedDocument[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!account?.address) return;

        let cancelled = false;

        async function fetchDocuments() {
            setIsLoading(true);
            setError(null);
            try {
                const docs = await getDocumentsByOwner(account!.address);
                if (!cancelled) setDocuments(docs);
            } catch (err) {
                if (!cancelled) setError(
                    err instanceof Error ? err.message : 'Failed to load documents.'
                );
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        fetchDocuments();

        return () => {
            cancelled = true;
        };
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