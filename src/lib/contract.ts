/**
 * LAYER 4 - CONFIGURATION LAYER
 * Contract initialization and ABI management
 */

import { ethers } from "ethers";
import { CONTRACT_ADDRESS, BASE_SEPOLIA_RPC } from "./constants";

// TODO: Add full smart contract ABI from Remix deployment
export const VAULTED_CONTRACT_ABI = [
  // Placeholder for contract ABI
  // Copy from Remix after deployment
];

// Singleton contract instance
let contractInstance: ethers.Contract | null = null;

/**
 * Initialize or get contract instance
 * Uses Ethers.js for reading data
 * Never submits transactions directly (UGF handles that)
 */
export const getContract = async (): Promise<ethers.Contract | null> => {
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
