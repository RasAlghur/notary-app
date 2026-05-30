import type { DocumentStatus } from "../types/document";

export type VerifyStep = 'idle' | 'fetching' | 'checking-walrus' | 'done' | 'error';

export const verifySteps: { id: VerifyStep; label: string }[] = [
    { id: 'fetching',        label: 'Looking up record on Sui' },
    { id: 'checking-walrus', label: 'Checking Walrus blob' },
    { id: 'done',            label: 'Verification complete' },
];

export const documentSteps: { status: DocumentStatus; label: string }[] = [
    { status: 'hashing', label: 'Computing SHA-256 hash' },
    { status: 'uploading', label: 'Uploading file to Walrus via Tatum' },
    { status: 'certifying',  label: 'Waiting for network certification (may take 1–3 min)' },
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