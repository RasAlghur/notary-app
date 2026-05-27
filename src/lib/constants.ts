// src/lib/constants.ts
export const NETWORK = import.meta.env.VITE_SUI_NETWORK;
export const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID;
export const MODULE_NAME = 'registry';
export const REGISTRY_FUNCTION = 'register_document';

// aggregator only — uploads go through Tatum Storage API now
export const WALRUS_URLS = {
    aggregator: NETWORK === 'mainnet'
        ? 'https://aggregator.walrus-mainnet.walrus.space'
        : 'https://aggregator.walrus-testnet.walrus.space',
} as const;

export const SUI_SCAN_URLS = {
    testnet: 'https://suiscan.xyz/testnet/',
    mainnet: 'https://suiscan.xyz/mainnet/',
} as const;