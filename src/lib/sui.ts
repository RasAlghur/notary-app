 // src/lib/sui.ts
import { createDAppKit } from '@mysten/dapp-kit-react';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { NETWORK } from './constants';


export const dAppKit = createDAppKit({
    networks: [NETWORK],
    createClient: (network) =>
        new SuiJsonRpcClient({
            url: '/api/sui',
            network,
        }),
});

declare module '@mysten/dapp-kit-react' {
    interface Register {
        dAppKit: typeof dAppKit;
    }
}