// src/types/document.ts
export type DocumentStatus = 'idle' | 'hashing' | 'uploading' | 'registering' | 'done' | 'error';

export interface NotarizedDocument {
    id: string;               // Sui object ID (on-chain)
    blobId: string;           // Walrus blob ID
    fileName: string;         // Original file name
    fileSize: number;         // File size in bytes
    fileHash: string;         // SHA-256 hash of the file
    owner: string;            // Sui wallet address
    timestamp: number;        // Unix timestamp in ms
    txDigest: string;         // Sui transaction digest
}

export interface UploadState {
    file: File | null;
    hash: string | null;
    status: DocumentStatus;
    progress: number;         // 0 - 100
    error: string | null;
    result: NotarizedDocument | null;
}

export interface VerificationResult {
    isValid: boolean;
    document: NotarizedDocument | null;
    message: string;
}