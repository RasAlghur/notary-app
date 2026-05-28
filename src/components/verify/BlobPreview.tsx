import { useEffect, useMemo, useState } from "react";
import { detectType, type BlobPreviewProps } from "../../types/components";
import { Download, FileText, Loader2 } from "lucide-react";

export function BlobPreview({
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
