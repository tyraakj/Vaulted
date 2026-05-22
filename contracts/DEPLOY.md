# Vaulted Escrow Deployment

## Network
Base Sepolia Testnet (Chain ID: 84532)

## Steps to Deploy on Remix
1. Open Remix IDE at https://remix.ethereum.org
2. Paste the contents of Escrow.sol into a new file
3. Compile with Solidity 0.8.x — fix any import errors before proceeding
4. In Deploy tab, select "Injected Provider - MetaMask"
5. Make sure MetaMask is on Base Sepolia (Chain ID 84532)
6. In the constructor field, paste the Mock USD address from UGF testnet docs
7. Click Deploy
8. Copy the deployed contract address
9. Share CONTRACT_ADDRESS with Tech Lead immediately — they are blocked without it

## Post-Deploy Handoff
- Paste CONTRACT_ADDRESS into .env as VITE_CONTRACT_ADDRESS
- Export the full ABI from Remix (Compilation Details → ABI → Copy)
- Share ABI JSON with Tech Lead to paste into src/lib/contract.ts
