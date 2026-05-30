// src/hooks/useNotaryAgent.ts
import { useState, useCallback } from 'react';
import type { NotarizedDocument } from '../types/document';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ToolCall {
    tool: string;
    address?: string;
}

async function callClaude(messages: ChatMessage[], system: string): Promise<string> {
    const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, system }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Agent error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.text ?? '';
}

async function callTatumTool(tool: string, params: Record<string, string> = {}): Promise<unknown> {
    const qs = new URLSearchParams({ tool, ...params }).toString();
    const res = await fetch(`/api/tatum-data?${qs}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Tool error: ${res.statusText}`);
    }
    return res.json();
}

function parseToolCall(text: string): ToolCall | null {
    const match = text.match(/TOOL_CALL:\s*(\{[^}]+\})/);
    if (!match) return null;
    try {
        return JSON.parse(match[1]) as ToolCall;
    } catch {
        return null;
    }
}

function buildSystemPrompt(address: string, documents: NotarizedDocument[]): string {
    const docList = documents.length > 0
        ? documents.map((d, i) =>
            `  ${i + 1}. "${d.fileName}" | notarized: ${new Date(d.timestamp).toLocaleDateString()} | size: ${d.fileSize} bytes | id: ${d.id} | blob: ${d.blobId} | hash: ${d.fileHash}`
        ).join('\n')
        : '  (none yet)';

    return `You are a helpful AI assistant for Notary — a decentralized document notarization app built on the Sui blockchain using Walrus decentralized storage, powered by Tatum.

Connected wallet: ${address}

Notarized documents (${documents.length} total):
${docList}

You have access to live blockchain tools via Tatum's Data API. When you need real-time data, emit exactly one tool call on its own line in this format:
TOOL_CALL: {"tool": "exchange_rate"}
TOOL_CALL: {"tool": "check_malicious", "address": "0x..."}
TOOL_CALL: {"tool": "transaction_history", "address": "0x..."}
TOOL_CALL: {"tool": "wallet_portfolio", "address": "0x..."}

Rules:
- Only emit a TOOL_CALL when you genuinely need live data to answer the question
- Never emit more than one TOOL_CALL per response
- After receiving tool results, give a clean natural language answer — no JSON, no tool syntax
- For questions about the user's own wallet, use address: ${address}
- Be concise (2-4 sentences unless detail is needed)
- Always relate answers back to notarization context when relevant

You can help with:
- Document details (count, names, dates, hashes, blob IDs)
- Checking if a wallet address is safe/malicious
- Current SUI/USD price
- Transaction history and activity
- Explaining what notarization means and how it works on Sui + Walrus`;
}

export function useNotaryAgent(address: string, documents: NotarizedDocument[]) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(async (userText: string) => {
        if (!userText.trim() || isLoading) return;

        const userMsg: ChatMessage = { role: 'user', content: userText.trim() };
        const updatedMessages = [...messages, userMsg];

        setMessages(updatedMessages);
        setIsLoading(true);
        setError(null);

        const system = buildSystemPrompt(address, documents);

        try {
            // First call — Claude may emit a TOOL_CALL
            const firstResponse = await callClaude(updatedMessages, system);
            const toolCall = parseToolCall(firstResponse);

            let finalResponse = firstResponse;

            if (toolCall) {
                // Execute the tool
                let toolResult: unknown;
                try {
                    const { tool, ...params } = toolCall;
                    toolResult = await callTatumTool(tool, params as Record<string, string>);
                } catch (toolErr) {
                    toolResult = { error: toolErr instanceof Error ? toolErr.message : 'Tool failed' };
                }

                // Second call — Claude synthesizes tool result into natural language
                const messagesWithTool: ChatMessage[] = [
                    ...updatedMessages,
                    { role: 'assistant', content: firstResponse },
                    {
                        role: 'user',
                        content: `Tool result: ${JSON.stringify(toolResult, null, 2)}\n\nNow respond naturally without any TOOL_CALL syntax or raw JSON.`,
                    },
                ];

                finalResponse = await callClaude(messagesWithTool, system);
            }

            // Strip any leaked TOOL_CALL lines before displaying
            const cleaned = finalResponse.replace(/TOOL_CALL:[^\n]+\n?/g, '').trim();

            setMessages(prev => [...prev, { role: 'assistant', content: cleaned }]);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Something went wrong.';
            setError(message);
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: 'Sorry, I ran into an issue. Please try again.' },
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [messages, address, documents, isLoading]);

    const reset = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    return { messages, isLoading, error, sendMessage, reset };
}