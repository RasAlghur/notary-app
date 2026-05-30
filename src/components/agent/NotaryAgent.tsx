// src/components/agent/NotaryAgent.tsx
import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import { Bot, Send, ChevronDown, Sparkles, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import { useNotaryAgent } from '../../hooks/useNotaryAgent';
import type { ChatMessage, NotarizedDocument } from '../../types/document';

const SUGGESTIONS = [
    'How many documents have I notarized?',
    'What is SUI worth in USD right now?',
    'Is my wallet address safe?',
    'Show my recent Sui transactions',
];

interface NotaryAgentProps {
    address: string;
    documents?: NotarizedDocument[];
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
    const isUser = msg.role === 'user';

    return (
        <div className={clsx('flex items-end gap-2', isUser && 'flex-row-reverse')}>
            {!isUser && (
                <div className="mb-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600">
                    <Bot className="h-3.5 w-3.5 text-white" />
                </div>
            )}

            <div
                className={clsx(
                    'max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words',
                    isUser ? 'rounded-br-sm bg-blue-600 text-white' : 'rounded-bl-sm bg-gray-800 text-gray-200'
                )}
            >
                {msg.content}
            </div>
        </div>
    );
}

function TypingIndicator() {
    return (
        <div className="flex items-end gap-2">
            <div className="mb-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600">
                <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="rounded-2xl rounded-bl-sm bg-gray-800 px-4 py-3">
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <span
                            key={i}
                            className="block h-1.5 w-1.5 rounded-full bg-gray-500 animate-bounce"
                            style={{ animationDelay: `${i * 150}ms` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function NotaryAgent({ address, documents = [] }: NotaryAgentProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { messages, isLoading, error, sendMessage, reset } = useNotaryAgent(address, documents);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        if (!isOpen) return;

        const timer = window.setTimeout(() => {
            inputRef.current?.focus();
        }, 50);

        return () => window.clearTimeout(timer);
    }, [isOpen]);

    const handleSend = useCallback(async () => {
        const text = input.trim();
        if (!text || isLoading) return;

        setInput('');
        await sendMessage(text);
    }, [input, isLoading, sendMessage]);

    const handleSuggestion = useCallback((s: string) => {
        setInput(s);
        window.setTimeout(() => inputRef.current?.focus(), 0);
    }, []);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
            }
        },
        [handleSend]
    );

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-xl transition-all hover:bg-blue-500 hover:shadow-blue-900/40 hover:scale-105 active:scale-95"
                >
                    <Sparkles className="h-4 w-4" />
                    Ask AI
                </button>
            )}

            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 flex h-[540px] w-[360px] flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-950 shadow-2xl shadow-black/60">
                    <div className="flex shrink-0 items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 shadow-md shadow-blue-900/40">
                                <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Notary Agent</p>
                                <p className="text-xs text-gray-500">Gemini · Tatum Data API</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {messages.length > 0 && (
                                <button
                                    onClick={reset}
                                    title="Clear chat"
                                    className="rounded-md p-1.5 text-gray-500 transition-colors hover:text-gray-300"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                title="Minimise"
                                className="rounded-md p-1.5 text-gray-500 transition-colors hover:text-gray-300"
                            >
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                        {messages.length === 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-end gap-2">
                                    <div className="mb-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600">
                                        <Bot className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <div className="rounded-2xl rounded-bl-sm bg-gray-800 px-3 py-2 text-sm leading-relaxed text-gray-200">
                                        Hi! I can help you with your notarized documents, check wallet safety, get SUI prices, and more. What would you like to know?
                                    </div>
                                </div>

                                <div className="space-y-2 pl-8">
                                    {SUGGESTIONS.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => handleSuggestion(s)}
                                            className="block w-full rounded-xl border border-gray-700 px-3 py-2 text-left text-xs text-gray-400 transition-all hover:border-blue-500 hover:bg-blue-500/5 hover:text-white"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, i) => (
                                    <MessageBubble key={i} msg={msg} />
                                ))}
                                {isLoading && <TypingIndicator />}
                                {error && <p className="text-center text-xs text-red-400">{error}</p>}
                            </>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <div className="shrink-0 border-t border-gray-800 p-3">
                        <div
                            className={clsx(
                                'flex items-center gap-2 rounded-xl border bg-gray-900 px-3 py-2 transition-colors',
                                isLoading ? 'border-gray-800' : 'border-gray-700 focus-within:border-blue-500'
                            )}
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={isLoading ? 'Thinking...' : 'Ask about your documents...'}
                                disabled={isLoading}
                                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none disabled:opacity-50"
                            />
                            <button
                                onClick={() => void handleSend()}
                                disabled={!input.trim() || isLoading}
                                aria-label="Send message"
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Send className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        <p className="mt-1.5 text-center text-xs text-gray-700">
                            Powered by Gemini + Tatum · Sui Mainnet
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}