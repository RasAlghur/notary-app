// src/hooks/useRegisterDocument.ts
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { getTransaction, registerDocument } from "../lib/tatum";
import type { NotarizedDocument } from "../types/document";

export function useRegisterDocument() {
    const account = useCurrentAccount();
    const dAppKit = useDAppKit();

    async function register(params: {
        blobId: string;
        fileName: string;
        fileHash: string;
        fileSize: number;
    }): Promise<NotarizedDocument | null> {
        try {
            if (!account) {
                throw new Error("No connected wallet address");
            }

            const digest = await registerDocument({
                blobId: params.blobId,
                fileName: params.fileName,
                fileHash: params.fileHash,
                fileSize: params.fileSize,
                senderAddress: account.address,
                signAndExecute: async ({ transaction }) => {
                    const result = await dAppKit.signAndExecuteTransaction({
                        transaction,
                    });

                    if (result.FailedTransaction) {
                        throw new Error(
                            result.FailedTransaction.status.error?.message ??
                            "Transaction failed"
                        );
                    }

                    return { digest: result.Transaction.digest };
                },
            });

            const tx = await getTransaction(digest);

            const createdObjectId =
                (tx as any)?.objectChanges?.find(
                    (change: any) =>
                        change?.type === "created" &&
                        typeof change?.objectType === "string" &&
                        change.objectType.includes("NotaryRecord")
                )?.objectId ??
                (tx as any)?.effects?.created?.[0]?.reference?.objectId ??
                "";

            return {
                id: createdObjectId,
                blobId: params.blobId,
                fileName: params.fileName,
                fileSize: params.fileSize,
                fileHash: params.fileHash,
                owner: account.address,
                timestamp: Date.now(),
                txDigest: digest,
            };
        } catch (err) {
            console.error("Registration failed:", err);
            return null;
        }
    }

    return { register };
}