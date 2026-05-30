import { ArrowRight, ExternalLink, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { NETWORK, SUI_SCAN_URLS } from "../../lib/constants";
import type { DocumentCardProps } from "../../types/components";
import { formatDate, formatFileSize, shortenHash } from "../../utils/format";

export function DocumentCard({ document }: DocumentCardProps) {
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
                    href={`${SUI_SCAN_URLS[NETWORK as keyof typeof SUI_SCAN_URLS]}object/${document.id}`}
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

            {/* Blob ID */}
            <div className="rounded-lg bg-gray-800 px-3 py-2">
                <p className="text-xs text-gray-500 mb-1">Walrus Blob ID</p>
                <p className="text-xs font-mono text-blue-400 truncate">
                    {document.blobId}
                </p>
            </div>

            {/* View certificate */}
            <Link
                to={`/verify/${document.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
            >
                <span>View Certificate</span>
                <ArrowRight className="h-4 w-4" />
            </Link>

        </div>
    );
}