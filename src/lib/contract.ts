/**
 * LAYER 4 - CONFIGURATION LAYER
 * Contract initialization and ABI management
 */

import { ethers } from "ethers";
import { CONTRACT_ADDRESS, BASE_SEPOLIA_RPC } from "./constants";

// TODO: Add full smart contract ABI from Remix deployment
export const VAULTED_CONTRACT_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "jobId", "type": "uint256" }],
    "name": "acceptJob", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "jobId", "type": "uint256" }],
    "name": "autoRelease", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "createJob", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "jobId", "type": "uint256" }],
    "name": "disputeJob", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "jobId", "type": "uint256" }],
    "name": "releasePayment", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "jobId", "type": "uint256" }],
    "name": "submitMilestone", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }],
    "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [],
    "name": "jobCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "jobs",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "address", "name": "client", "type": "address" },
      { "internalType": "address", "name": "freelancer", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "enum Escrow.JobStatus", "name": "status", "type": "uint8" },
      { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
      { "internalType": "uint256", "name": "autoReleaseAt", "type": "uint256" }
    ],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [],
    "name": "mockUSD",
    "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view", "type": "function"
  }
] as const;

// Singleton contract instance
let contractInstance: ethers.Contract | null = null;

/**
 * Initialize or get contract instance
 * Uses Ethers.js for reading data
 * Never submits transactions directly (UGF handles that)
 */
export const getContract = (): ethers.Contract | null => {
  if (contractInstance) {
    return contractInstance;
  }

  try {
    if (!CONTRACT_ADDRESS) {
      console.error("Contract address not configured in .env");
      return null;
    }

    const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
    contractInstance = new ethers.Contract(
      CONTRACT_ADDRESS,
      VAULTED_CONTRACT_ABI,
      provider,
    );

    return contractInstance;
  } catch (error) {
    console.error("Failed to initialize contract:", error);
    return null;
  }
};

// Reset contract instance (useful for network switching)
export const resetContract = () => {
  contractInstance = null;
};
