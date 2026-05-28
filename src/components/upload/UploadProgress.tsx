import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { getStepState, type UploadProgressProps, documentSteps } from '../../types/components';

export default function UploadProgress({ status, error }: UploadProgressProps) {
    if (status === 'idle') return null;

    return (
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
            <div className="space-y-4">
                {documentSteps.map((step) => {
                    const state = getStepState(step.status, status);
                    return (
                        <div key={step.status} className="flex items-center gap-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                                {state === 'active' && <Loader2 className="h-5 w-5 animate-spin text-blue-400" />}
                                {state === 'done' && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                                {state === 'error' && <XCircle className="h-5 w-5 text-red-400" />}
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

            {status === 'error' && error && (
                <div className="mt-4 rounded-lg bg-red-500/10 border border-red-800 p-3">
                    <p className="text-xs text-red-400">{error}</p>
                </div>
            )}
        </div>
    );
}