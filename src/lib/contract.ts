/**
 * LAYER 4 - CONFIGURATION LAYER
 * Contract initialization and ABI management
 */

import { ethers } from "ethers";
import { CONTRACT_ADDRESS, BASE_SEPOLIA_RPC } from "./constants";

// TODO: Add full smart contract ABI from Remix deployment
export const VAULTED_CONTRACT_ABI = [
  "function createJob(string title, string description, uint256 amount) external",
  "function acceptJob(uint256 jobId) external",
  "function submitMilestone(uint256 jobId, string workDetails) external",
  "function releasePayment(uint256 jobId) external",
  "function disputeJob(uint256 jobId) external",
  "function autoRelease(uint256 jobId) external",
  "function getJob(uint256 jobId) external view returns (tuple(uint256 id, string title, string description, address client, address freelancer, uint256 amount, uint8 status, uint256 createdAt, uint256 autoReleaseAt))",
  "function getAllJobs() external view returns (tuple(uint256 id, string title, string description, address client, address freelancer, uint256 amount, uint8 status, uint256 createdAt, uint256 autoReleaseAt)[])"
];

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
