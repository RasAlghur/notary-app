// src/lib/tatum.ts
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { Transaction } from '@mysten/sui/transactions';
import type { NotarizedDocument } from '../types/document';
import { NETWORK, PACKAGE_ID, MODULE_NAME, REGISTRY_FUNCTION } from './constants';

export const suiClient = new SuiJsonRpcClient({
    url: '/api/sui',  // Vite proxy in dev, Vercel function in prod — same path either way
    network: NETWORK,
});

// ─── Mapper ──────────────────────────────────────────────────────────────────

function mapToNotarizedDocument(obj: any): NotarizedDocument | null {
    const content = obj.data?.content;
    if (!content || content.dataType !== 'moveObject') return null;

    const f = content.fields as Record<string, unknown>;

    return {
        id: obj.data.objectId,
        blobId: f.blob_id as string,
        fileName: f.file_name as string,
        fileHash: f.file_hash as string,
        fileSize: Number(f.file_size),
        timestamp: Number(f.timestamp),
        owner: (obj.data.owner as any)?.AddressOwner ?? '',
        txDigest: obj.data.previousTransaction ?? '',
    };
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getDocumentsByOwner(owner: string): Promise<NotarizedDocument[]> {
    const { data } = await suiClient.getOwnedObjects({
        owner,
        filter: { StructType: `${PACKAGE_ID}::registry::NotaryRecord` },
        options: { showContent: true, showType: true, showOwner: true, showPreviousTransaction: true },
    });

    return data
        .map(mapToNotarizedDocument)
        .filter((d): d is NotarizedDocument => d !== null);
}

export async function getDocumentById(objectId: string): Promise<NotarizedDocument | null> {
    const { data } = await suiClient.getObject({
        id: objectId,
        options: { showContent: true, showType: true, showOwner: true, showPreviousTransaction: true },
    });

    return data ? mapToNotarizedDocument({ data }) : null;
}

export async function getTransaction(digest: string) {
    return suiClient.getTransactionBlock({
        digest,
        options: { showEffects: true, showEvents: true, showObjectChanges: true },
    });
}

// ─── Write ────────────────────────────────────────────────────────────────────

export interface RegisterDocumentParams {
    blobId: string;
    fileName: string;
    fileHash: string;
    fileSize: number;
    senderAddress: string;
    signAndExecute: (p: { transaction: Transaction }) => Promise<{ digest: string }>;
}

export async function registerDocument(params: RegisterDocumentParams): Promise<string> {
    const { blobId, fileName, fileHash, fileSize, senderAddress, signAndExecute } = params;

    const tx = new Transaction();
    const clock = tx.object('0x6');

    const record = tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::${REGISTRY_FUNCTION}`,
        arguments: [
            tx.pure.string(blobId),
            tx.pure.string(fileName),
            tx.pure.string(fileHash),
            tx.pure.u64(fileSize),
            clock,
        ],
    });

    tx.transferObjects([record], tx.pure.address(senderAddress));  // ← was missing

    const { digest } = await signAndExecute({ transaction: tx });
    return digest;
}