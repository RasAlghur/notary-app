// src/lib/constants.ts
export const NETWORK = import.meta.env.VITE_SUI_NETWORK;
export const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID;
export const MODULE_NAME = 'registry';
export const REGISTRY_FUNCTION = 'register_document';

export const SUI_SCAN_URLS = {
    testnet: 'https://testnet.suivision.xyz/',
    mainnet: 'https://suivision.xyz/',
} as const;