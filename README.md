# Notary App

A decentralized document notarization app built on Sui using Walrus storage. Upload any file and permanently record its existence on-chain — timestamped, tamper-proof, and owned by your wallet.

---

## What It Does

Notary lets you prove a document existed at a specific point in time without lawyers, middlemen, or central servers.

1. Upload a file (PDF, PNG, JPG, or TXT)
2. The file is hashed client-side using SHA-256
3. The file blob is stored on Walrus decentralized storage
4. A notarization record is registered on Sui with your wallet address and timestamp
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
| Sui Client | @mysten/sui (gRPC via Tatum RPC) |
| Storage | Walrus decentralized blob storage |
| Smart Contract | Move on Sui |
| RPC Nodes | Tatum enterprise Sui endpoints |

---

## Project Structure

```
notary-app/
├── src/
│   ├── components/
│   │   ├── wallet/         # Wallet connect + disconnect
│   │   ├── upload/         # File upload, preview, progress
│   │   ├── verify/         # Verification result card
│   │   └── layout/         # Navbar, Container
│   ├── pages/
│   │   ├── Home.tsx        # Upload and notarize
│   │   ├── Dashboard.tsx   # Document history
│   │   └── Verify.tsx      # Public certificate page
│   ├── lib/
│   │   ├── sui.ts          # Sui client setup
│   │   ├── walrus.ts       # Walrus upload/read
│   │   ├── tatum.ts        # Tatum RPC helpers
│   │   ├── hash.ts         # SHA-256 hashing
│   │   └── constants.ts    # Env vars and URLs
│   ├── hooks/
│   │   ├── useWalrusUpload.ts       # Upload flow hook
│   │   ├── useRegisterDocument.ts  # On-chain registration hook
│   │   └── useVerifyDocument.ts    # Verification hook
│   └── types/
│       └── document.ts     # Shared TypeScript types
├── move/
│   └── notary/
│       ├── Move.toml
│       └── sources/
│           └── registry.move   # NotaryRecord struct + register fn
└── .env
```

---

## Getting Started

### Prerequisites

- Node.js v22+
- A Sui-compatible wallet (Sui Wallet, Phantom, etc.)
- Tatum API key — get one free at [dashboard.tatum.io](https://dashboard.tatum.io)
- Sui CLI (for deploying the Move contract)

### Installation

```bash
# Clone the repo
git clone https://github.com/RasAlghur/notary-app.git
cd notary-app

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root:

```bash
VITE_TATUM_API_KEY=your_tatum_api_key_here
VITE_SUI_NETWORK=testnet
VITE_PACKAGE_ID=0x0000000000000000000000000000000000000000000000000000000000000000
```

> `VITE_PACKAGE_ID` is filled in after deploying the Move contract. 
  if you'd plan to use mine; fill this
  
  ```bash
  VITE_TATUM_API_KEY=your_tatum_api_key_here
  VITE_SUI_NETWORK=mainnet
  VITE_PACKAGE_ID=0x0000000000000000000000000000000000000000000000000000000000000000
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Move Contract
(skip this step if you are using my VITE_PACKAGE_ID)
The smart contract lives in `move/notary/sources/registry.move`.

It creates a `NotaryRecord` object owned by the user's wallet containing:
- `blob_id` — Walrus blob reference
- `file_hash` — SHA-256 hash of the original file
- `timestamp` — Unix timestamp in milliseconds
- `owner` — Sui wallet address

### Deploy to Testnet

```bash
cd move/notary
sui move build
sui client publish --gas-budget 50000000
```

Copy the published package ID into your `.env` as `VITE_PACKAGE_ID`.

---

## How Verification Works

Every notarized document gets a certificate URL:

```
https://your-app.vercel.app/verify/:blobId
```

Anyone with this link can:
1. Fetch the blob metadata from Walrus
2. Look up the on-chain record via Tatum RPC
3. Confirm the hash, owner, and timestamp match

No login required. No central server. Fully verifiable on-chain.

---

## RPC Endpoints

Powered by [Tatum](https://tatum.io):

```
Mainnet:  https://sui-mainnet.gateway.tatum.io
Testnet:  https://sui-testnet.gateway.tatum.io
Devnet:   https://sui-devnet.gateway.tatum.io
```

---

## Supported File Types

| Type | Max Size |
|---|---|
| PDF | 10 MB |
| PNG | 10 MB |
| JPG / JPEG | 10 MB |
| TXT | 10 MB |

---

## Roadmap

- [ ] Move contract deployment
- [ ] Real Walrus blob upload integration
- [ ] Tatum RPC on-chain registration
- [ ] Dashboard fetching real wallet history
- [ ] Mainnet deployment
- [ ] Batch notarization
- [ ] Email certificate delivery

---

## Built For

[Tatum x Build on Sui with Walrus Hackathon](https://tatum.io/tatum-x-walrus-hackathon) — May 23 to June 6, 2025

---

## License

MIT