// src/pages/verify.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import VerificationCard from '../components/verify/VerificationCard';
import { useVerifyDocument } from '../hooks/useVerifyDocument';
import type { VerifyStep } from '../hooks/useVerifyDocument';

const steps: { id: VerifyStep; label: string }[] = [
    { id: 'fetching',        label: 'Looking up record on Sui' },
    { id: 'checking-walrus', label: 'Checking Walrus blob' },
    { id: 'done',            label: 'Verification complete' },
];

function StepIndicator({ currentStep }: { currentStep: VerifyStep }) {
    const order: VerifyStep[] = ['fetching', 'checking-walrus', 'done'];

    return (
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-5 space-y-4">
            {steps.map((step) => {
                const stepIndex = order.indexOf(step.id);
                const currentIndex = order.indexOf(currentStep);
                const isError = currentStep === 'error';

                let state: 'pending' | 'active' | 'done' | 'error';
                if (isError) {
                    state = stepIndex <= currentIndex ? 'error' : 'pending';
                } else if (stepIndex < currentIndex) {
                    state = 'done';
                } else if (stepIndex === currentIndex) {
                    state = 'active';
                } else {
                    state = 'pending';
                }

                return (
                    <div key={step.id} className="flex items-center gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                            {state === 'active'  && <Loader2 className="h-5 w-5 animate-spin text-blue-400" />}
                            {state === 'done'    && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                            {state === 'error'   && <XCircle className="h-5 w-5 text-red-400" />}
                            {state === 'pending' && <div className="h-2 w-2 rounded-full bg-gray-600" />}
                        </div>
                        <span className={clsx('text-sm', {
                            'text-blue-400 font-medium': state === 'active',
                            'text-green-400': state === 'done',
                            'text-red-400': state === 'error',
                            'text-gray-500': state === 'pending',
                        })}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export default function Verify() {
    const { recordId } = useParams<{ recordId: string }>();
    const [manualId, setManualId] = useState('');
    const { verify, isVerifying, step, result, reset } = useVerifyDocument();

    useEffect(() => {
        if (!recordId) return;
        reset();
        verify(recordId);
    }, [recordId]); // eslint-disable-line react-hooks/exhaustive-deps

    function handleManualSearch() {
        const value = manualId.trim();
        if (!value) return;
        reset();
        verify(value);
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center gap-3">
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold text-white">Verify Document</h1>
                    <p className="mt-1 text-sm text-gray-400">
                        Enter a Notary record ID to check its notarization on Sui.
                    </p>
                </div>
            </div>

            {!recordId && (
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Enter Notary record ID..."
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                        className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                        onClick={handleManualSearch}
                        disabled={!manualId.trim() || isVerifying}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
                    >
                        <Search className="h-4 w-4" />
                        Verify
                    </button>
                </div>
            )}

            {recordId && (
                <div className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-3">
                    <p className="text-xs text-gray-500 mb-1">Record ID</p>
                    <p className="text-xs font-mono text-green-400 break-all">{recordId}</p>
                </div>
            )}

            {/* Step indicators — shown while verifying or on error */}
            {step !== 'idle' && step !== 'done' && (
                <StepIndicator currentStep={step} />
            )}
            {step === 'error' && (
                <StepIndicator currentStep={step} />
            )}

            {/* Result */}
            {!isVerifying && result.message && (
                <VerificationCard result={result} />
            )}
        </div>
    );
}