import type { ReactNode } from 'react';
import type { DocumentStatus, NotarizedDocument, UploadState } from './document';
import type { VerifyStep } from './hooks';

export interface ContainerProps {
    children: ReactNode;
    className?: string;
}

export const navLinks = [
    { label: 'Notarize', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Verify', href: '/verify' },
];

export interface FilePreviewProps {
    uploadState: UploadState;
    onClear: () => void;
}


export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface UploadBoxProps {
    onFileSelect: (file: File) => void;
    disabled?: boolean;
}

export const ACCEPTED_TYPES = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'text/plain',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface UploadProgressProps {
    status: DocumentStatus;
    error: string | null;
}

export const documentSteps: { status: DocumentStatus; label: string }[] = [
    { status: 'hashing', label: 'Computing SHA-256 hash' },
    { status: 'uploading', label: 'Uploading file to Walrus via Tatum' },
    { status: 'certifying', label: 'Waiting for on-chain certification' },
    { status: 'registering', label: 'Registering proof on Sui' },
    { status: 'done', label: 'Document notarized successfully' },
];

const order = ['hashing', 'uploading', 'certifying', 'registering', 'done'];

export function getStepState(
    stepStatus: DocumentStatus,
    currentStatus: DocumentStatus
): 'pending' | 'active' | 'done' | 'error' {
    const stepIndex = order.indexOf(stepStatus);
    const currentIndex = order.indexOf(currentStatus);

    if (currentStatus === 'error') return stepIndex <= currentIndex ? 'error' : 'pending';
    if (stepIndex < currentIndex) return 'done';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
}

export interface BlobPreviewProps {
    blobId: string;
    fileName?: string;
}

export function detectType(bytes: Uint8Array, fileName?: string): string {
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

export interface InfoRowProps {
    label: string;
    value: string;
    mono?: boolean;
    copyable?: boolean;
}

export function formatDate(timestamp: number): string {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(new Date(timestamp));
}

export function shortenAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function shortenHash(hash: string): string {
    return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

export interface DocumentCardProps {
    document: NotarizedDocument;
}    

export const verifySteps: { id: VerifyStep; label: string }[] = [
    { id: 'fetching',        label: 'Looking up record on Sui' },
    { id: 'checking-walrus', label: 'Checking Walrus blob' },
    { id: 'done',            label: 'Verification complete' },
];
