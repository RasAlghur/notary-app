// src/lib/tatum.ts
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { Transaction } from '@mysten/sui/transactions';
import { TATUM_API_KEY, NETWORK, PACKAGE_ID, MODULE_NAME, REGISTRY_FUNCTION } from '../lib/constants';

const READ_RPC_URLS = {
    testnet: 'https://fullnode.testnet.sui.io:443',
    mainnet: 'https://fullnode.mainnet.sui.io:443',
} as const;

export const TATUM_RPC_URL = `https://sui-${NETWORK}.gateway.tatum.io?api-key=${TATUM_API_KEY}`;

export const suiClient = new SuiJsonRpcClient({
    url: READ_RPC_URLS[NETWORK],
    network: NETWORK,
});
export async function getDocumentsByOwner(owner: string) {
    const objects = await suiClient.getOwnedObjects({
        owner,
        filter: {
            StructType: `${PACKAGE_ID}::registry::NotaryRecord`,
        },
        options: {
            showContent: true,
            showType: true,
        },
    });

    return objects.data;
}

export async function getDocumentById(objectId: string) {
    const object = await suiClient.getObject({
        id: objectId,
        options: {
            showContent: true,
            showType: true,
        },
    });

    return object.data;
}

export async function getTransaction(digest: string) {
    const tx = await suiClient.getTransactionBlock({
        digest,
        options: {
            showEffects: true,
            showEvents: true,
        },
    });

    return tx;
}

export interface RegisterDocumentParams {
    blobId: string;
    fileName: string;
    fileHash: string;
    fileSize: number;
    senderAddress: string;
    signAndExecute: (params: { transaction: Transaction }) => Promise<{ digest: string }>;
}

export async function registerDocument({
    blobId,
    fileName,
    fileHash,
    fileSize,
    senderAddress,
    signAndExecute,
}: RegisterDocumentParams): Promise<string> {
    const tx = new Transaction();

    const clock = tx.object('0x0000000000000000000000000000000000000000000000000000000000000006');

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

    tx.transferObjects([record], tx.pure.address(senderAddress));

    const result = await signAndExecute({ transaction: tx });

    return result.digest;
}