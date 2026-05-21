# ◈ VAULTED

> **Post. Work. Get Paid. No Middlemen.**

Vaulted is a gasless freelance escrow platform built on Base Sepolia. Payment is locked on-chain the moment a job is posted, released only on approval, and neither party ever needs ETH — UGF handles all gas fees automatically.

Built for the **UGF Hackathon** · Deployed on **Base Sepolia Testnet**

---

## The Problem

- Freelancers get ghosted after delivering work
- Clients pay for work that never arrives
- Platforms like Fiverr and Upwork take 20% cuts and can freeze accounts
- Existing blockchain solutions require ETH, making them inaccessible to most people

## The Solution

Vaulted removes every middleman from the equation:

- Payment is **locked on-chain** the moment a job is posted
- Released **automatically** when work is approved
- Neither party ever needs ETH — UGF handles all gas fees
- No platform can freeze your account — the contract is the authority

---

## Tech Stack

| Layer          | Technology                            |
| -------------- | ------------------------------------- |
| Frontend       | React + TypeScript + Vite             |
| Styling        | Plain CSS (custom design system)      |
| Wallet         | ethers.js + MetaMask                  |
| Gasless Layer  | UGF SDK (`@tychilabs/ugf-testnet-js`) |
| Smart Contract | Solidity + OpenZeppelin               |
| Network        | Base Sepolia Testnet                  |
| Payment Token  | Mock USD (`TYI_MOCK_USD`)             |
| Deployment     | Remix IDE                             |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MetaMask browser extension
- Base Sepolia network added to MetaMask

### Installation

```bash
git clone https://github.com/your-username/vaulted.git
cd vaulted
npm install
```

### Environment Setup

Create a `.env` file in the project root:

```env
VITE_CONTRACT_ADDRESS=       # Deployed Escrow.sol address
VITE_CHAIN_ID=84532          # Base Sepolia
VITE_MOCK_USD_ADDRESS=       # From UGF testnet docs
VITE_UGF_ENDPOINT=           # From UGF testnet docs
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
vaulted/
├── contracts/
│   └── Escrow.sol              # OpenZeppelin base + custom logic
│
├── src/
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── PostJob.tsx
│   │   ├── BrowseJobs.tsx
│   │   ├── Dashboard.tsx
│   │   └── JobDetail.tsx
│   │
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── WalletConnect.tsx
│   │   ├── RoleSelect.tsx
│   │   ├── JobCard.tsx
│   │   ├── MilestoneTracker.tsx
│   │   ├── PaymentFlow.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── StatusBadge.tsx
│   │
│   ├── hooks/
│   │   ├── useWallet.ts        # Wallet connection + network check
│   │   ├── useRole.ts          # Client / Freelancer role state
│   │   ├── useUGF.ts           # Gasless transaction flow
│   │   └── useContract.ts      # Read + encode contract calls
│   │
│   ├── lib/
│   │   ├── ugf.ts              # UGFClient singleton
│   │   ├── contract.ts         # Contract instance + ABI
│   │   └── constants.ts        # Chain ID, addresses, config
│   │
│   ├── types/
│   │   └── index.ts            # Shared TypeScript types
│   │
│   ├── App.tsx                 # Router + ProtectedRoute
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
│
├── public/
│   └── vaulted-logo.svg
│
├── .env
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## How It Works

### The UGF Gasless Flow

Every on-chain action in Vaulted runs through this exact 4-step sequence — no exceptions:

| Step        | What Happens                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------- |
| `login()`   | UGF authenticates the wallet. Required once per session.                                                      |
| `quote()`   | UGF estimates gas cost in Mock USD. Shown to user before any action.                                          |
| `settle()`  | User signs an ERC-3009 authorization. No blockchain transaction yet — just a signature.                       |
| `execute()` | UGF submits the transaction, pays ETH gas from its own reserves, deducts Mock USD from user. Returns tx hash. |

### The "Read with Ethers, Write with UGF" Rule

`useContract.ts` **never** submits transactions directly — doing so would trigger MetaMask to demand native ETH gas.

- **Read functions** (safe to call via Ethers): `getJob()`
- **Encode functions** (return calldata only): `encodeCreateJob()`, `encodeAcceptJob()`, `encodeSubmitMilestone()`, `encodeReleasePayment()`, `encodeDisputeJob()`
- **Execution**: always handed off to `useUGF.ts` → `execute()`

### User Flows

**Client Posts a Job**

1. Connect wallet → Select Client role
2. PostJob page → Fill title, description, payment amount
3. UGF flow runs → Mock USD locked in smart contract
4. Job appears on BrowseJobs for freelancers

**Freelancer Accepts and Completes**

1. Connect wallet → Select Freelancer role
2. BrowseJobs → Pick a job → Accept
3. UGF flow runs → Job status becomes Active
4. Do the work → JobDetail → Mark Complete

**Client Releases Payment**

1. Dashboard → See completed job → Approve & Release
2. UGF flow runs → Mock USD sent to freelancer
3. Freelancer receives ~498.8 USD (1.2 USD deducted for gas automatically)

---

## Smart Contract

Deployed on Base Sepolia via Remix IDE.

### Key Functions

| Function            | Access                   | Description                                  |
| ------------------- | ------------------------ | -------------------------------------------- |
| `createJob()`       | Any wallet               | Locks Mock USD in escrow, emits `JobCreated` |
| `acceptJob()`       | Any wallet except client | Sets freelancer, status → Active             |
| `submitMilestone()` | Freelancer only          | Marks work complete, status → Complete       |
| `releasePayment()`  | Client only              | Sends Mock USD to freelancer                 |
| `disputeJob()`      | Client or Freelancer     | Status → Disputed                            |
| `autoRelease()`     | Anyone after 7 days      | Auto-releases if client is unresponsive      |

### Job Status Flow

```
Open → Active → Complete → Released
                    ↓
                Disputed
```

---

## Security

### Frontend

- `ProtectedRoute` redirects unauthenticated users to home
- Clients redirected away from `/browse`, freelancers from `/post-job`
- Wrong network blocked at wallet level

### Smart Contract

- All write functions enforce caller identity on-chain
- `autoRelease()` only callable after `autoReleaseAt` timestamp
- Built on audited OpenZeppelin `Escrow.sol` base

---

## What Makes Vaulted Stand Out

- ✅ Payment locked before work starts — no ghosting possible
- ✅ Release only on approval — no paying for incomplete work
- ✅ 7-day auto-release — client cannot hold payment hostage
- ✅ Zero ETH required — works for anyone, anywhere
- ✅ No platform account — connect wallet and go
- ✅ UGF deducts gas from incoming USD — freelancer needs literally 0 ETH

---

## Team

| Role      | Owns                              |
| --------- | --------------------------------- |
| Tech Lead | Hooks, lib setup, UGF integration |
| Dev 2     | All pages                         |
| Dev 3     | Escrow.sol deployment             |
| Dev 4     | All components + UI               |
| Dev 5     | Pitch deck, demo, branding        |

---

## License

MIT — Built for the UGF Hackathon on Base Sepolia.
