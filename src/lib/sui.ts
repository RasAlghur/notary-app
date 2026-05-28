// // src/lib/sui.ts
import { createDAppKit } from '@mysten/dapp-kit-react';
// import { SuiGrpcClient } from '@mysten/sui/grpc';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { NETWORK } from './constants';

// const GRPC_URLS = {
//     testnet: 'https://fullnode.testnet.sui.io',
//     mainnet: 'https://fullnode.mainnet.sui.io',
// } as const;

// export const dAppKit = createDAppKit({
//     networks: [NETWORK],
//     createClient: (network) =>
//         new SuiGrpcClient({
//             network,
//             baseUrl: GRPC_URLS[network as keyof typeof GRPC_URLS],
//         }),
// });

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