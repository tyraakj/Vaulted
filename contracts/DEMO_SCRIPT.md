# Vaulted — Demo Walkthrough Script (90 seconds)

## Setup (before presenting)
- Two browser windows open, two MetaMask wallets (Client wallet + Freelancer wallet)
- Both wallets funded with Mock USD from UGF faucet
- Client wallet must have approved the Escrow contract to spend Mock USD before the demo
- App running on localhost:5173 connected to Base Sepolia

## Flow

**[0:00 — 0:20] The Problem**
"Freelancers get ghosted after delivering work. Platforms like Fiverr take 20% cuts and can freeze your account. Blockchain escrow exists — but requires ETH, which most people worldwide don't have."

**[0:20 — 0:40] Post a Job (Client wallet)**
1. Connect Client wallet → select Client role
2. Go to Post Job → fill in title, description, amount (e.g. 500 Mock USD)
3. Hit Submit → UGF flow triggers: Login → Quote → Settle → Execute
4. Point out: "No ETH needed. Gas comes from the payment itself."
5. Show tx hash on Base Sepolia explorer → Mock USD now locked in contract

**[0:40 — 1:00] Accept + Complete (Freelancer wallet)**
1. Switch to Freelancer window → connect Freelancer wallet → select Freelancer role
2. Browse Jobs → find the posted job → click Accept
3. UGF flow runs → job status becomes Active
4. Click Mark Complete → status becomes Complete

**[1:00 — 1:20] Release Payment (Client wallet)**
1. Back to Client window → Dashboard → see completed job
2. Click Approve & Release → UGF flow → Mock USD sent to freelancer
3. Show freelancer wallet balance: received ~498.8 Mock USD (1.2 deducted for gas)
4. "Neither party needed a single ETH. UGF handled all gas from the payment itself."

## What to show on explorer
- createJob tx → Mock USD moved from client wallet into contract
- releasePayment tx → Mock USD moved from contract to freelancer wallet
