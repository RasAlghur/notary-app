// src/lib/walrus.ts
import { WALRUS_URLS } from '../lib/constants';

export interface WalrusUploadResponse {
    blobId: string;
    endEpoch: number;
    blobObject?: {
        id: string;
        storedEpoch: number;
        blobId: string;
        size: number;
        erasureCodeType: string;
        certifiedEpoch: number;
        storage: {
            id: string;
            startEpoch: number;
            endEpoch: number;
            storageSize: number;
        };
    };
}

export async function uploadToWalrus(
    file: File,
    epochs: number = 5
): Promise<WalrusUploadResponse> {
    const url = `${WALRUS_URLS.publisher}/v1/blobs?epochs=${epochs}`;

    const response = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type || 'application/octet-stream',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Walrus upload failed: ${error}`);
    }

    const data = await response.json();

    if (data.newlyCreated) {
        return {
            blobId: data.newlyCreated.blobObject.blobId,
            endEpoch: data.newlyCreated.blobObject.storage.endEpoch,
            blobObject: data.newlyCreated.blobObject,
        };
    }

    if (data.alreadyCertified) {
        return {
            blobId: data.alreadyCertified.blobId,
            endEpoch: data.alreadyCertified.endEpoch,
        };
    }

    throw new Error('Unexpected Walrus response format');
}

export async function readFromWalrus(blobId: string): Promise<Blob> {
  const url = `${WALRUS_URLS.aggregator}/v1/blobs/${blobId}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Walrus read failed: ${response.statusText}`);
  }

  return response.blob();
}

export async function checkBlobExists(blobId: string): Promise<boolean> {
  try {
    const url = `${WALRUS_URLS.aggregator}/v1/blobs/${blobId}`;
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

export function getWalrusBlobUrl(blobId: string): string {
  return `${WALRUS_URLS.aggregator}/v1/blobs/${blobId}`;
}