// src/lib/constants.ts
export const NETWORK = import.meta.env.VITE_SUI_NETWORK as 'testnet' | 'mainnet';
export const TATUM_API_KEY = import.meta.env.VITE_TATUM_API_KEY;
export const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID;

export const WALRUS_URLS = {
  publisher: 'https://publisher.walrus-testnet.walrus.space',
  aggregator: 'https://aggregator.walrus-testnet.walrus.space',
} as const;

export const TATUM_RPC_URLS = {
  testnet: `https://sui-testnet.gateway.tatum.io?api-key=${TATUM_API_KEY}`,
  mainnet: `https://sui-mainnet.gateway.tatum.io?api-key=${TATUM_API_KEY}`,
} as const;

export const TATUM_GRPC_URLS = {
  testnet: 'https://sui-testnet-grpc.gateway.tatum.io',
  mainnet: 'https://sui-mainnet-grpc.gateway.tatum.io',
} as const;



export const SUI_SCAN_URLS = {
  testnet: 'https://suiscan.xyz/testnet/',
  mainnet: 'https://suiscan.xyz/mainnet/',
} as const;

export const MODULE_NAME = 'registry';
export const REGISTRY_FUNCTION = 'register_document';