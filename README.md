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
6. Ask the AI Agent anything about your documents, wallet safety, or SUI prices

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
| AI Agent | Gemini 3.1 Flash Lite + Tatum Data API |
| Deployment | Vercel (serverless API routes) |

---

## Project Structure

```
notary-app/
├── api/
│   ├── agent.ts            # Vercel serverless — AI agent via Gemini + Tatum Data API
│   ├── tatum-data.ts       # Vercel serverless — Tatum Data API proxy
│   ├── walrus-upload.ts    # Vercel serverless — proxies file upload to Tatum
│   ├── walrus-status.ts    # Vercel serverless — polls Tatum job status
│   ├── walrus-blob.ts      # Vercel serverless — proxies blob fetch from Walrus aggregator
│   └── sui.ts              # Vercel serverless — proxies Sui RPC to Tatum
├── move/
│   └── notary/
│       ├── sources/
│       │   └── registry.move   # NotaryRecord struct + register_document fn
│       ├── Move.toml
│       └── Published.toml
├── src/
│   ├── components/
│   │   ├── agent/          # NotaryAgent AI chat widget
│   │   ├── document/       # DocumentCard
│   │   ├── layout/         # Navbar
│   │   ├── upload/         # UploadBox, FilePreview, UploadProgress
│   │   ├── verify/         # VerificationCard, StepIndicator, BlobPreview, InfoRow
│   │   └── wallet/         # ConnectWallet button
│   ├── config/
│   │   ├── nav.ts          # Nav link definitions
│   │   ├── steps.ts        # Upload + verify step definitions
│   │   └── upload.ts       # Upload config constants
│   ├── hooks/
│   │   ├── useNotaryAgent.ts       # AI agent chat hook
│   │   ├── useRegisterDocument.ts  # On-chain Sui registration
│   │   ├── useVerifyDocument.ts    # Certificate verification flow
│   │   └── useWalrusUpload.ts      # Upload + certification polling flow
│   ├── lib/
│   │   ├── constants.ts    # Env vars, network URLs
│   │   ├── hash.ts         # SHA-256 client-side hashing
│   │   ├── tatum.ts        # Sui client, queries, mutations, mapper
│   │   └── walrus.ts       # uploadToWalrus with retry + polling logic
│   ├── pages/
│   │   ├── Dashboard.tsx   # Wallet document history + AI agent
│   │   ├── Home.tsx        # Upload and notarize flow + AI agent
│   │   └── Verify.tsx      # Public certificate page + AI agent
│   ├── types/
│   │   ├── components.ts   # Component prop types and static config
│   │   ├── document.ts     # NotarizedDocument, UploadState, VerificationResult
│   │   └── lib.ts          # WalrusUploadResult
│   └── utils/
│       └── format.ts       # formatDate, formatFileSize, shortenAddress, shortenHash
├── vite.config.ts          # Dev proxy config for Sui RPC + Walrus routes
└── .env
```

---

## Getting Started

### Prerequisites

- Node.js v22+
- A Sui-compatible wallet (Sui Wallet, Phantom, etc.)
- Tatum API key — get one free at [dashboard.tatum.io](https://dashboard.tatum.io)
- Gemini API key — get one free at [aistudio.google.com](https://aistudio.google.com)
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
GEMINI_API_KEY=your-gemini-api-key
```

> To use the existing mainnet deployment:

```bash
VITE_SUI_NETWORK=mainnet
SUI_NETWORK=mainnet
VITE_TATUM_API_KEY=your-tatum-api-key
TATUM_API_KEY=your-tatum-api-key
VITE_PACKAGE_ID=0xefed65928f6d4e28b242dc042faa22f1aa16632c76c37b091f952a0cfe3bf363
GEMINI_API_KEY=your-gemini-api-key
```

### Run Locally

```bash
vercel dev    # recommended — runs frontend + serverless functions together
# or
npm run dev   # frontend only, /api/* routes won't work
```

Open [http://localhost:3000](http://localhost:3000)

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

### AI Agent

The Notary Agent is a floating chat widget available on every page. It uses Gemini as the language model and Tatum's Data API as live blockchain tools:

| Question | Tool Used |
|---|---|
| "How many documents have I notarized?" | Document context from wallet |
| "Is my wallet address safe?" | Tatum `check_malicious` |
| "What is SUI worth right now?" | Tatum `exchange_rate` |
| "Show my recent transactions" | Tatum `transaction_history` |
| "What is my portfolio worth?" | Tatum `wallet_portfolio` |

All API keys stay server-side — the agent calls `/api/agent` and `/api/tatum-data` serverless functions, never exposing keys to the browser.

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

```bash
vercel deploy
```

Set these environment variables in your Vercel project settings:

| Variable | Used By |
|---|---|
| `VITE_SUI_NETWORK` | Frontend build |
| `VITE_TATUM_API_KEY` | Frontend build |
| `VITE_PACKAGE_ID` | Frontend build |
| `SUI_NETWORK` | Serverless functions |
| `TATUM_API_KEY` | Serverless functions |
| `GEMINI_API_KEY` | Serverless functions |

---

## Supported File Types

| Type | Max Size |
|---|---|
| PDF | 10 MB |
| PNG | 10 MB |
| JPG / JPEG | 10 MB |
| TXT | 10 MB |

---

## Hackathon Submission — Tatum x Build on Sui with Walrus

**Tatum x Build on Sui with Walrus · May 23 – June 6, 2025**

### How This Project Meets the Criteria

**Walrus Integration (30%)** — Walrus is core, not an add-on. Every notarized file is stored as a Walrus blob. The `blobId` is what gets registered on-chain, and verification fetches the blob directly from the Walrus aggregator. No Walrus = no notarization.

**Tatum Integration (30%)** — Tatum powers four things:
- Sui JSON-RPC via `https://sui-mainnet.gateway.tatum.io` for all on-chain reads and writes
- Tatum Storage API (`/v4/data/storage/upload`) for Walrus blob uploads with job polling
- Tatum Data API for the AI Agent — malicious address check, exchange rate, transaction history, wallet portfolio
- Serverless API routes in `api/` keep all Tatum keys server-side on Vercel

**Technical Quality (30%)** — TypeScript throughout, custom retry logic for Walrus certification timeouts, clean hook/lib/component separation, AI agent with server-side key proxying, deployed to Vercel on Sui mainnet.

**Creativity (20%)** — Document notarization is a real-world legal use case that anyone understands immediately. The shareable certificate URL lets anyone verify a document with no wallet or login. The AI agent turns blockchain data into natural language — ask about your documents, check if an address is safe, or get the current SUI price, all in one chat.

### Live Demo
[https://notary-app-two.vercel.app/](https://notary-app-two.vercel.app/)

### Contract
- **Package ID:** `0xefed65928f6d4e28b242dc042faa22f1aa16632c76c37b091f952a0cfe3bf363`
- **Network:** Sui Mainnet
- **Explorer:** [View on SuiVision](https://suivision.xyz/package/0xefed65928f6d4e28b242dc042faa22f1aa16632c76c37b091f952a0cfe3bf363)

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
- [x] AI Agent with Tatum Data API tools
- [ ] Batch notarization
- [ ] Email certificate delivery

---

## Built For

[Tatum x Build on Sui with Walrus Hackathon](https://tatum.io/tatum-x-walrus-hackathon) — May 23 to June 6, 2025

---

## License

MIT