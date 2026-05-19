import { useState, useCallback } from "react";
import type { Job } from "../types";
import { getContract } from "../lib/contract";

/**
 * LAYER 3 - LOGIC LAYER
 * Business logic for blockchain interactions
 *
 * Rule: READ with Ethers, WRITE with UGF
 * - Read functions safe to call via Ethers directly
 * - Encode functions return calldata only (never execute)
 * - Execution always handed to useUGF.ts
 */
export const useContract = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // READ: Fetch a single job by ID
  const getJob = useCallback(async (jobId: string): Promise<Job | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getContract();
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      // TODO: Implement getJob on smart contract
      const jobData = await contract.getJob(jobId);
      return jobData;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch job";
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // READ: Fetch all jobs
  const getAllJobs = useCallback(async (): Promise<Job[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = await getContract();
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      // TODO: Implement getAllJobs on smart contract
      const jobs = await contract.getAllJobs();
      return jobs;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch jobs";
      setError(errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ENCODE: Create job (returns calldata for UGF to execute)
  const encodeCreateJob = useCallback(
    (title: string, description: string, amount: string): string => {
      try {
        const contract = getContract();
        if (!contract) {
          throw new Error("Contract not initialized");
        }

        // TODO: Encode createJob function call
        // return contract.interface.encodeFunctionData('createJob', [title, description, amount]);
        return "";
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Encoding failed";
        setError(errorMsg);
        return "";
      }
    },
    [],
  );

  // ENCODE: Accept job (returns calldata for UGF to execute)
  const encodeAcceptJob = useCallback((jobId: string): string => {
    try {
      const contract = getContract();
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      // TODO: Encode acceptJob function call
      // return contract.interface.encodeFunctionData('acceptJob', [jobId]);
      return "";
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Encoding failed";
      setError(errorMsg);
      return "";
    }
  }, []);

  // ENCODE: Submit milestone (returns calldata for UGF to execute)
  const encodeSubmitMilestone = useCallback(
    (jobId: string, workDetails: string): string => {
      try {
        const contract = getContract();
        if (!contract) {
          throw new Error("Contract not initialized");
        }

        // TODO: Encode submitMilestone function call
        // return contract.interface.encodeFunctionData('submitMilestone', [jobId, workDetails]);
        return "";
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Encoding failed";
        setError(errorMsg);
        return "";
      }
    },
    [],
  );

  // ENCODE: Release payment (returns calldata for UGF to execute)
  const encodeReleasePayment = useCallback((jobId: string): string => {
    try {
      const contract = getContract();
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      // TODO: Encode releasePayment function call
      // return contract.interface.encodeFunctionData('releasePayment', [jobId]);
      return "";
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Encoding failed";
      setError(errorMsg);
      return "";
    }
  }, []);

  // ENCODE: Dispute job (returns calldata for UGF to execute)
  const encodeDisputeJob = useCallback((jobId: string): string => {
    try {
      const contract = getContract();
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      // TODO: Encode disputeJob function call
      // return contract.interface.encodeFunctionData('disputeJob', [jobId]);
      return "";
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Encoding failed";
      setError(errorMsg);
      return "";
    }
  }, []);

  // ENCODE: Auto release (returns calldata for UGF to execute)
  const encodeAutoRelease = useCallback((jobId: string): string => {
    try {
      const contract = getContract();
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      // TODO: Encode autoRelease function call
      // return contract.interface.encodeFunctionData('autoRelease', [jobId]);
      return "";
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Encoding failed";
      setError(errorMsg);
      return "";
    }
  }, []);

  return {
    isLoading,
    error,
    // Read functions
    getJob,
    getAllJobs,
    // Encode functions (never execute, only return calldata)
    encodeCreateJob,
    encodeAcceptJob,
    encodeSubmitMilestone,
    encodeReleasePayment,
    encodeDisputeJob,
    encodeAutoRelease,
  };
};
