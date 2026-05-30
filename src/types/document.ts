// src/types/document.ts
export type DocumentStatus = 'idle' | 'hashing' | 'uploading' | 'certifying' | 'registering' | 'done' | 'error';

export interface NotarizedDocument {
    id: string;
    blobId: string;
    jobId?: string;
    fileName: string;
    fileSize: number;
    fileHash: string;
    owner: string;
    timestamp: number;
    txDigest: string;
}

export interface UploadState {
    file: File | null;
    hash: string | null;
    status: DocumentStatus;
    progress: number;
    error: string | null;
    result: NotarizedDocument | null;
}

export interface VerificationResult {
    isValid: boolean;
    document: NotarizedDocument | null;
    message: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ToolCall {
    tool: string;
    address?: string;
}
