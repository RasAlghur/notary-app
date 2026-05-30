# Notary App

A decentralized document notarization app built on Sui using Walrus storage. Upload any file and permanently record its existence on-chain — timestamped, tamper-proof, and owned by your wallet.

---

## What It Does

Notary lets you prove a document existed at a specific point in time without lawyers, middlemen, or central servers.

1. Upload a file (PDF, PNG, JPG, or TXT)
2. The file is hashed client-side using SHA-256
3. The file blob is stored on Walrus via Tatum Storage API
4. A `NotaryRecord` object is registered on Sui with your wallet address and timestamp
5. You get a shareable certificate link anyone can use to verify the document

---

## Use Cases

- **Freelancers** — prove you submitted a proposal before a client claims they came up with the idea
- **Legal documents** — timestamp contracts, NDAs, and agreements without paying a notary
- **Creators** — establish prior existence of your work before publishing
- **Researchers** — timestamp findings before peer review or publication
- **Whistleblowers** — prove you had evidence before coming forward

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Wallet | @mysten/dapp-kit-react |
| Sui Client | @mysten/sui (JSON-RPC via Tatum) |
| Storage | Walrus decentralized blob storage (via Tatum Storage API) |
| Smart Contract | Move on Sui |
| RPC & Storage | Tatum enterprise Sui + Walrus endpoints |
| Deployment | Vercel (serverless API routes) |

---

## Project Structure

```
notary-app/
├── api/
│   ├── walrus-upload.ts    # Vercel serverless — proxies file upload to Tatum
│   ├── walrus-status.ts    # Vercel serverless — polls Tatum job status
│   ├── walrus-blob.ts      # Vercel serverless — proxies blob fetch from Walrus aggregator
│   └── sui.ts              # Vercel serverless — proxies Sui RPC to Tatum
├── move/
│   └── notary/
│       ├── sources/
│       │    └── registry.move   # NotaryRecord struct + register_document fn
│       ├── Move.toml
│       └── Published.toml
├── public/
│   │   ├── favicon.svg       
│   │   └── icons.svg         
├── src/
│   ├── assets/
│   │   ├── hero.png 
│   │   ├── react.svg       
│   │   └── vite.svg         
│   ├── components/
│   │   ├── document/       # DocumentCard
│   │   ├── layout/         # Navbar, Container
│   │   ├── upload/         # UploadBox, FilePreview, UploadProgress
│   │   ├── verify/         # VerificationCard, StepIndicator, BlobPreview, InfoRow
│   │   └── wallet/         # ConnectWallet button
│   ├── config/
│   │   ├── nav.ts          # Upload and notarize flow
│   │   ├── steps.ts        # Upload and notarize flow
│   │   └── upload.ts       # Public certificate page
│   ├── hooks/
│   │   ├── useRegisterDocument.ts  # On-chain Sui registration
│   │   └── useVerifyDocument.ts    # Certificate verification flow
│   │   └── useWalrusUpload.ts      # Upload + certification polling flow
│   ├── lib/
│   │   ├── constants.ts    # Env vars, network URLs
│   │   ├── hash.ts         # SHA-256 client-side hashing
│   │   ├── sui.ts          # Sui client
│   │   ├── tatum.ts        # Sui client, queries, mutations, mapper
│   │   └── walrus.ts       # uploadToWalrus with retry + polling logic
│   ├── pages/
│   │   ├── Dashboard.tsx   # Wallet document history
│   │   ├── Home.tsx        # Upload and notarize flow
│   │   └── Verify.tsx      # Public certificate page
│   ├── types/
│   │   ├── components.ts   # Component prop types, helpers, static config
│   │   ├── document.ts     # NotarizedDocument, UploadState, VerificationResult
│   │    └── lib.ts         # WalrusUploadResult
│   ├── utils/
│   │    └── format.ts       # formatDate, formatFileSize, shortenAddress, shortenHash
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── .env
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   │
└── vite.config.ts          # Dev proxy config for Sui RPC + Walrus routes
```

---

## Getting Started

### Prerequisites

- Node.js v22+
- A Sui-compatible wallet (Sui Wallet, Phantom, etc.)
- Tatum API key — get one free at [dashboard.tatum.io](https://dashboard.tatum.io)
- Sui CLI (only if deploying your own Move contract)

### Installation

```bash
git clone https://github.com/RasAlghur/notary-app.git
cd notary-app
npm install
```

### Environment Setup

Create a `.env` file in the root:

```bash
VITE_SUI_NETWORK=mainnet
SUI_NETWORK=mainnet
VITE_TATUM_API_KEY=your-tatum-api-key
TATUM_API_KEY=your-tatum-api-key
VITE_PACKAGE_ID=your-package-id
```

> To skip deploying the Move contract and use the existing deployment:

```bash
VITE_SUI_NETWORK=mainnet
SUI_NETWORK=mainnet
VITE_TATUM_API_KEY=your-tatum-api-key
TATUM_API_KEY=your-tatum-api-key
VITE_PACKAGE_ID=0xefed65928f6d4e28b242dc042faa22f1aa16632c76c37b091f952a0cfe3bf363
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

The Vite dev server proxies all `/api/*` routes to Tatum and Walrus, so no separate backend process is needed locally.

---

## How It Works

### Upload Flow

1. User selects a file — hashed immediately in the browser via the Web Crypto API (SHA-256)
2. File is sent to `/api/walrus-upload`, which forwards it to the Tatum Storage API
3. Tatum returns a `jobId`; the app polls `/api/walrus-status?jobId=...` until status is `CERTIFIED`
4. On certification, the `blobId` is used to call the Move contract via `register_document`
5. A `NotaryRecord` object is created on Sui and transferred to the user's wallet

Certification can take 1–3 minutes on mainnet due to Walrus epoch finality. The app retries automatically up to 3 times on retriable network errors.

### Verification Flow

Anyone with a certificate URL (`/verify/:recordId`) can:
1. Fetch the `NotaryRecord` object from Sui by object ID via Tatum RPC
2. Confirm the blob is reachable on Walrus via the aggregator
3. View the original file, SHA-256 hash, owner address, and timestamp — no login required

---

## Move Contract

The smart contract is in `move/notary/sources/registry.move`.

It creates a `NotaryRecord` object owned by the user's wallet:

| Field | Type | Description |
|---|---|---|
| `blob_id` | String | Walrus blob reference |
| `file_name` | String | Original filename |
| `file_hash` | String | SHA-256 hash of the file |
| `file_size` | u64 | File size in bytes |
| `timestamp` | u64 | Unix timestamp in milliseconds |
| `owner` | address | Sui wallet address |

### Deploy Your Own (Optional)

```bash
cd move/notary
sui move build
sui client publish --gas-budget 50000000
```

Copy the published package ID into your `.env` as `VITE_PACKAGE_ID`.

---

## Deployment (Vercel)

The `api/` directory contains Vercel serverless functions that securely proxy requests to Tatum and Walrus — keeping your API key server-side.

```bash
vercel deploy
```

Set the same environment variables from `.env` in your Vercel project settings. The `VITE_` prefixed vars are used by the frontend build; the unprefixed ones (`TATUM_API_KEY`, `SUI_NETWORK`) are used by the serverless functions.

---

## Supported File Types

| Type | Max Size |
|---|---|
| PDF | 10 MB |
| PNG | 10 MB |
| JPG / JPEG | 10 MB |
| TXT | 10 MB |

---

## RPC Endpoints

Powered by [Tatum](https://tatum.io):

```
Mainnet RPC:  https://sui-mainnet.gateway.tatum.io
Testnet RPC:  https://sui-testnet.gateway.tatum.io
Storage API:  https://api.tatum.io/v4/data/storage/upload
Aggregator:   https://aggregator.walrus-mainnet.walrus.space
```

---

## Roadmap

- [x] Client-side SHA-256 hashing
- [x] Walrus blob upload via Tatum Storage API with retry logic
- [x] On-chain registration via Move contract
- [x] Dashboard fetching real wallet document history
- [x] Public certificate verification page
- [x] Mainnet deployment
- [ ] Batch notarization
- [ ] Email certificate delivery
- [ ] AI Agent integration

---

## Built For

[Tatum x Build on Sui with Walrus Hackathon](https://tatum.io/tatum-x-walrus-hackathon) — May 23 to June 6, 2025

---

## License

MIT