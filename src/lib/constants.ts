/**
 * LAYER 4 - CONFIGURATION LAYER
 * Setup files, set once, used everywhere
 */

export const APP_NAME = "Vaulted";
export const APP_VERSION = "1.0.0";

// Base Sepolia Constants
export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_SEPOLIA_RPC = "https://sepolia.base.org";
export const BASE_SEPOLIA_EXPLORER = "https://sepolia.basescan.org";

// Environment-based Configuration
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";
export const MOCK_USD_ADDRESS = import.meta.env.VITE_MOCK_USD_ADDRESS || "";
export const MOCK_USD_DECIMALS = 6;
export const UGF_ENDPOINT = import.meta.env.VITE_UGF_ENDPOINT || "";
export const AUTO_RELEASE_DAYS = 7;

// Job & Milestone Status
export const JOB_STATUSES = [
  "Open",
  "Active",
  "Complete",
  "Released",
  "Disputed",
] as const;
export const MILESTONE_STEPS = [
  { step: 1, label: "Posted" },
  { step: 2, label: "Accepted" },
  { step: 3, label: "Submitted" },
  { step: 4, label: "Released" },
] as const;
export const USER_ROLES = ["client", "freelancer"] as const;

export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: "Please connect your wallet first",
  INVALID_ADDRESS: "Invalid wallet address",
  INSUFFICIENT_BALANCE: "Insufficient balance for this transaction",
  TRANSACTION_FAILED: "Transaction failed. Please try again.",
};

export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: "Wallet connected successfully",
  JOB_CREATED: "Job created successfully",
  PAYMENT_RELEASED: "Payment released successfully",
};
