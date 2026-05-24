// src/lib/sui.ts
import { createDAppKit } from '@mysten/dapp-kit-react';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { RPC_URLS, NETWORK } from '../lib/constants';

export const dAppKit = createDAppKit({
    networks: [NETWORK],
    createClient: (network) =>
        new SuiGrpcClient({
            network,
            baseUrl: RPC_URLS[network],
        }),
});

declare module '@mysten/dapp-kit-react' {
    interface Register {
        dAppKit: typeof dAppKit;
    }
}