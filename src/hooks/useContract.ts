import { useState, useCallback } from "react";
import { ethers } from "ethers";
import type { Job, JobStatus } from "../types";
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

  // Helper: Map contract Result struct to TypeScript Job type
  const mapContractJobToJob = useCallback((contractJob: any): Job => {
    const statusMap: JobStatus[] = ["Open", "Active", "Complete", "Released", "Disputed"];
    
    const id = contractJob.id !== undefined ? contractJob.id.toString() : contractJob[0].toString();
    const title = contractJob.title !== undefined ? contractJob.title : contractJob[1];
    const description = contractJob.description !== undefined ? contractJob.description : contractJob[2];
    const client = contractJob.client !== undefined ? contractJob.client : contractJob[3];
    const freelancer = contractJob.freelancer !== undefined ? contractJob.freelancer : contractJob[4];
    
    const amountRaw = contractJob.amount !== undefined ? contractJob.amount : contractJob[5];
    const amount = Number(ethers.formatEther(amountRaw));

    const statusRaw = contractJob.status !== undefined ? contractJob.status : contractJob[6];
    const statusNum = Number(statusRaw);
    const status = statusMap[statusNum] || "Open";

    const createdAtRaw = contractJob.createdAt !== undefined ? contractJob.createdAt : contractJob[7];
    const createdAt = Number(createdAtRaw) * 1000;

    const autoReleaseAtRaw = contractJob.autoReleaseAt !== undefined ? contractJob.autoReleaseAt : contractJob[8];
    const autoReleaseAt = Number(autoReleaseAtRaw) * 1000;

    return {
      id,
      title,
      description,
      client,
      freelancer,
      amount,
      status,
      createdAt,
      autoReleaseAt,
    };
  }, []);

  // READ: Fetch a single job by ID
  const getJob = useCallback(async (jobId: string): Promise<Job | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = getContract();
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      // Prefer high-level getter if available, otherwise fall back to public mapping `jobs`
      const anyContract = contract as any;
      let jobData: any;

      if (typeof anyContract.getJob === "function") {
        jobData = await anyContract.getJob(BigInt(jobId));
      } else if (typeof anyContract.jobs === "function") {
        jobData = await anyContract.jobs(BigInt(jobId));
      } else {
        throw new Error("Contract does not expose getJob or jobs");
      }

      if (!jobData || (jobData[0] && jobData[0].toString && jobData[0].toString() === "0")) {
        return null;
      }

      return mapContractJobToJob(jobData);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch job";
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [mapContractJobToJob]);

  // READ: Fetch all jobs
  const getAllJobs = useCallback(async (): Promise<Job[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = getContract();
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      const anyContract = contract as any;

      // If contract provides getAllJobs, use it
      if (typeof anyContract.getAllJobs === "function") {
        const jobsData = await anyContract.getAllJobs();
        if (!jobsData) return [];
        return jobsData.map((job: any) => mapContractJobToJob(job));
      }

      // Otherwise, fall back to reading via public mapping `jobs` and `jobCount()`
      if (typeof anyContract.jobCount === "function" && typeof anyContract.jobs === "function") {
        const countRaw = await anyContract.jobCount();
        const count = Number(countRaw);
        const results: Job[] = [];
        for (let i = 1; i <= count; i++) {
          try {
            const jobData = await anyContract.jobs(BigInt(i));
            if (jobData && jobData[0] && jobData[0].toString && jobData[0].toString() !== "0") {
              results.push(mapContractJobToJob(jobData));
            }
          } catch (e) {
            // skip missing entries
          }
        }
        return results;
      }

      throw new Error("Contract does not expose getAllJobs or jobCount/jobs");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch jobs";
      setError(errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [mapContractJobToJob]);

  // ENCODE: Create job (returns calldata for UGF to execute)
  const encodeCreateJob = useCallback(
    (title: string, description: string, amount: string): string => {
      try {
        const contract = getContract();
        if (!contract) {
          throw new Error("Contract not initialized");
        }

        // Amount parsed to 18 decimal places (wei format) for standard Mock USD ERC-20 integration
        const amountWei = ethers.parseEther(amount);
        return contract.interface.encodeFunctionData("createJob", [
          title,
          description,
          amountWei,
        ]);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Encoding failed";
        setError(errorMsg);
        return "";
      }
    },
    [],
  );

    // ENCODE: Approve Mock USD to spender (ERC-20 approve)
    const encodeApprove = useCallback((spender: string, amount: string): string => {
      try {
        // ERC-20 approve ABI
        const erc20Iface = new ethers.Interface(["function approve(address spender, uint256 amount) external returns (bool)"]);
        const amountWei = ethers.parseEther(amount);
        return erc20Iface.encodeFunctionData("approve", [spender, amountWei]);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Encoding failed";
        setError(errorMsg);
        return "";
      }
    }, []);

  // ENCODE: Accept job (returns calldata for UGF to execute)
  const encodeAcceptJob = useCallback((jobId: string): string => {
    try {
      const contract = getContract();
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      return contract.interface.encodeFunctionData("acceptJob", [BigInt(jobId)]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Encoding failed";
      setError(errorMsg);
      return "";
    }
  }, []);

  // ENCODE: Submit milestone (returns calldata for UGF to execute)
  const encodeSubmitMilestone = useCallback(
    (jobId: string, workDetails?: string): string => {
      try {
        const contract = getContract();
        if (!contract) {
          throw new Error("Contract not initialized");
        }

        // Encode against the available ABI signature. Some deployed contracts
        // implement `submitMilestone(uint256 jobId, string workDetails)` while
        // others may only accept `submitMilestone(uint256 jobId)`. Detect and
        // encode accordingly to avoid guessing.
        const iface = contract.interface as any;
        try {
          // Try full signature first
          iface.getFunction("submitMilestone(uint256,string)");
          return iface.encodeFunctionData("submitMilestone", [BigInt(jobId), workDetails || ""]);
        } catch (e) {
          // Fallback to single-arg signature
          try {
            iface.getFunction("submitMilestone(uint256)");
            return iface.encodeFunctionData("submitMilestone", [BigInt(jobId)]);
          } catch (e2) {
            throw new Error("submitMilestone function not found in contract ABI");
          }
        }
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

      return contract.interface.encodeFunctionData("releasePayment", [BigInt(jobId)]);
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

      return contract.interface.encodeFunctionData("disputeJob", [BigInt(jobId)]);
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

      return contract.interface.encodeFunctionData("autoRelease", [BigInt(jobId)]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Encoding failed";
      setError(errorMsg);
      return "";
    }
  }, []);

  return {
    isLoading,
    error,
    getJob,
    getAllJobs,
    encodeCreateJob,
    encodeApprove,
    encodeAcceptJob,
    encodeSubmitMilestone,
    encodeReleasePayment,
    encodeDisputeJob,
    encodeAutoRelease,
  };
};
