// src/components/upload/FilePreview.tsx
import { FileText, X } from 'lucide-react';
import { formatFileSize, type FilePreviewProps } from '../../types/components';

export default function FilePreview({ uploadState, onClear }: FilePreviewProps) {
    const { file, hash } = uploadState;

    if (!file) return null;

    return (
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">

            {/* File info row */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500/10 p-2">
                        <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">{file.name}</p>
                        <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                    </div>
                </div>

                {/* Clear button */}
                <button
                    onClick={onClear}
                    className="rounded-md p-1 text-gray-500 transition-colors hover:text-white"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Hash */}
            {hash && (
                <div className="mt-4 rounded-lg bg-gray-800 p-3">
                    <p className="mb-1 text-xs text-gray-400">SHA-256 Hash</p>
                    <p className="break-all font-mono text-xs text-green-400">{hash}</p>
                </div>
            )}

            {/* Hashing in progress */}
            {!hash && (
                <div className="mt-4 rounded-lg bg-gray-800 p-3">
                    <p className="text-xs text-gray-400">Computing hash...</p>
                </div>
            )}

        </div>
    );
}