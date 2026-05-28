// src/components/layout/Container.tsx
import { clsx } from 'clsx';
import type { ContainerProps } from '../../types/components';

export default function Container({ children, className }: ContainerProps) {
    return (
        <main
            className={clsx(
                'mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8',
                className
            )}
        >
            {children}
        </main>
    );
}