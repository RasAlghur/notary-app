import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import clsx from "clsx";
import { verifySteps, type VerifyStep } from "../../config/steps";

export function StepIndicator({ currentStep }: { currentStep: VerifyStep }) {
    const order: VerifyStep[] = ['fetching', 'checking-walrus', 'done'];

    return (
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-5 space-y-4">
            {verifySteps.map((step) => {
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
