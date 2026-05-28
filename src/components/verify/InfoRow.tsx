import { useState } from "react";
import type { InfoRowProps } from "../../types/components";
import clsx from "clsx";
import { Copy } from "lucide-react";

export function InfoRow({
    label,
    value,
    mono,
    copyable,
}: InfoRowProps) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        await navigator.clipboard.writeText(value);

        setCopied(true);

        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="flex flex-col gap-1 py-3 border-b border-gray-800 last:border-0">
            <span className="text-xs text-gray-500">
                {label}
            </span>

            <div className="flex items-center justify-between gap-2">
                <span
                    className={clsx(
                        'text-sm break-all text-white',
                        mono && 'font-mono text-xs text-green-400'
                    )}
                >
                    {value}
                </span>

                {copyable && (
                    <button
                        onClick={handleCopy}
                        className="shrink-0 text-gray-500 hover:text-white transition-colors"
                    >
                        <Copy className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {copied && (
                <span className="text-xs text-blue-400">
                    Copied!
                </span>
            )}
        </div>
    );
}