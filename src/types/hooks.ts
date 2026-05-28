import type { UploadState, VerificationResult } from "./document";

export type VerifyStep = 'idle' | 'fetching' | 'checking-walrus' | 'done' | 'error';

export const INITIAL_RESULT: VerificationResult = {
    isValid: false,
    document: null,
    message: '',
};

export const INITIAL_STATE: UploadState = {
    file: null,
    hash: null,
    status: 'idle',
    progress: 0,
    error: null,
    result: null,
};
