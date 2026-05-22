import { useState, useCallback } from "react";
import { ethers } from "ethers";
import type { Job, JobStatus } from "../types";
import { BASE_SEPOLIA_RPC, MOCK_USD_ADDRESS, MOCK_USD_DECIMALS } from "../lib/constants";
import { getContract, VAULTED_CONTRACT_ABI } from "../lib/contract";

const ERC20_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
] as const;

const isMockMode = import.meta.env.VITE_UGF_MOCK === "true";
const escrowInterface = new ethers.Interface(VAULTED_CONTRACT_ABI);
const erc20Interface = new ethers.Interface([
  "function approve(address spender, uint256 amount) external returns (bool)"
]);

const initializeMockJobs = (): Job[] => {
  const existing = localStorage.getItem("vaulted_mock_jobs");
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch (e) {
      // parse error, fallback
    }
  }

  const defaultJobs: Job[] = [
    {
      id: "1",
      title: "E-Commerce Frontend Integration",
      description: "Integrate base payments page and responsive checkout flow for our new dApp storefront.",
      client: "0xClientMock1234567890abcdef1234567890abc",
      freelancer: "0x0000000000000000000000000000000000000000",
      amount: 1500,
      status: "Open",
      createdAt: Date.now() - 3 * 86400 * 1000,
      autoReleaseAt: Date.now() + 10 * 86400 * 1000,
    },
    {
      id: "2",
      title: "Smart Contract Audit",
      description: "Review and audit our gasless escrow smart contracts for Base Sepolia launch.",
      client: "0xClientMock1234567890abcdef1234567890abc",
      freelancer: "0xFreelancerMock9876543210fedcba0987654",
      amount: 3500,
      status: "Active",
      createdAt: Date.now() - 5 * 86400 * 1000,
      autoReleaseAt: Date.now() + 5 * 86400 * 1000,
    },
    {
      id: "3",
      title: "Premium landing page with Glassmorphism design",
      description: "Build a landing page featuring dark mode, glassmorphism card UI, and CSS animations.",
      client: "0xClientMock1234567890abcdef1234567890abc",
      freelancer: "0xFreelancerMock9876543210fedcba0987654",
      amount: 800,
      status: "Complete",
      createdAt: Date.now() - 8 * 86400 * 1000,
      autoReleaseAt: Date.now() + 2 * 86400 * 1000,
    },
    {
      id: "4",
      title: "AI Integration & Prompt Engineering",
      description: "Integrate Gemini API and configure structured output for automated contract generation.",
      client: "0xClientMock1234567890abcdef1234567890abc",
      freelancer: "0xFreelancerMock9876543210fedcba0987654",
      amount: 2500,
      status: "Disputed",
      createdAt: Date.now() - 12 * 86400 * 1000,
      autoReleaseAt: Date.now() + 1 * 86400 * 1000,
    }
  ];

  localStorage.setItem("vaulted_mock_jobs", JSON.stringify(defaultJobs));
  
  // Initialize mock deliverables for Job 3 if not present
  if (!localStorage.getItem("deliverables_3")) {
    localStorage.setItem(
      "deliverables_3",
      JSON.stringify({
        description: "Built with beautiful CSS transitions and glassmorphism styling. Checked responsiveness across viewport widths.",
        link: "https://github.com/TychiWallet/vaulted-demo",
        submittedAt: Date.now() - 1 * 86400 * 1000,
      })
    );
  }

  return defaultJobs;
};

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
    const amount = Number(ethers.formatUnits(amountRaw, MOCK_USD_DECIMALS));

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

  const getMockUsdContract = useCallback(() => {
    if (!MOCK_USD_ADDRESS) {
      throw new Error("Mock USD address not configured");
    }

    const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
    return new ethers.Contract(MOCK_USD_ADDRESS, ERC20_ABI, provider);
  }, []);

  const getMockUsdBalance = useCallback(async (owner: string): Promise<bigint> => {
    if (isMockMode) {
      const balances = JSON.parse(localStorage.getItem("vaulted_mock_balances") || "{}");
      const ownerLower = owner.toLowerCase();
      if (balances[ownerLower] === undefined) {
        balances[ownerLower] = ethers.parseUnits("100000", MOCK_USD_DECIMALS).toString();
        localStorage.setItem("vaulted_mock_balances", JSON.stringify(balances));
      }
      return BigInt(balances[ownerLower]);
    }
    const token = getMockUsdContract();
    return token.balanceOf(owner) as Promise<bigint>;
  }, [getMockUsdContract]);

  const getMockUsdAllowance = useCallback(async (owner: string, spender: string): Promise<bigint> => {
    if (isMockMode) {
      const allowances = JSON.parse(localStorage.getItem("vaulted_mock_allowances") || "{}");
      const key = `${owner.toLowerCase()}-${spender.toLowerCase()}`;
      return allowances[key] ? BigInt(allowances[key]) : 0n;
    }
    const token = getMockUsdContract();
    return token.allowance(owner, spender) as Promise<bigint>;
  }, [getMockUsdContract]);

  // READ: Fetch a single job by ID
  const getJob = useCallback(async (jobId: string): Promise<Job | null> => {
    setIsLoading(true);
    setError(null);
    try {
      if (isMockMode) {
        const jobs = initializeMockJobs();
        const job = jobs.find((j) => j.id === jobId);
        return job || null;
      }

      const contract = getContract();
      if (!contract) {
        throw new Error("Contract not initialized");
      }

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
      if (isMockMode) {
        return initializeMockJobs();
      }

      const contract = getContract();
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      const anyContract = contract as any;

      if (typeof anyContract.getAllJobs === "function") {
        const jobsData = await anyContract.getAllJobs();
        if (!jobsData) return [];
        return jobsData.map((job: any) => mapContractJobToJob(job));
      }

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
        const amountWei = ethers.parseUnits(amount, MOCK_USD_DECIMALS);
        return escrowInterface.encodeFunctionData("createJob", [
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
      const amountWei = ethers.parseUnits(amount, MOCK_USD_DECIMALS);
      return erc20Interface.encodeFunctionData("approve", [spender, amountWei]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Encoding failed";
      setError(errorMsg);
      return "";
    }
  }, []);

  // ENCODE: Accept job (returns calldata for UGF to execute)
  const encodeAcceptJob = useCallback((jobId: string): string => {
    try {
      return escrowInterface.encodeFunctionData("acceptJob", [BigInt(jobId)]);
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
        try {
          escrowInterface.getFunction("submitMilestone(uint256,string)");
          return escrowInterface.encodeFunctionData("submitMilestone", [BigInt(jobId), workDetails || ""]);
        } catch (e) {
          try {
            escrowInterface.getFunction("submitMilestone(uint256)");
            return escrowInterface.encodeFunctionData("submitMilestone", [BigInt(jobId)]);
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
      return escrowInterface.encodeFunctionData("releasePayment", [BigInt(jobId)]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Encoding failed";
      setError(errorMsg);
      return "";
    }
  }, []);

  // ENCODE: Dispute job (returns calldata for UGF to execute)
  const encodeDisputeJob = useCallback((jobId: string): string => {
    try {
      return escrowInterface.encodeFunctionData("disputeJob", [BigInt(jobId)]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Encoding failed";
      setError(errorMsg);
      return "";
    }
  }, []);

  // ENCODE: Auto release (returns calldata for UGF to execute)
  const encodeAutoRelease = useCallback((jobId: string): string => {
    try {
      return escrowInterface.encodeFunctionData("autoRelease", [BigInt(jobId)]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Encoding failed";
      setError(errorMsg);
      return "";
    }
  }, []);

  // ENCODE: Resolve dispute (returns calldata for UGF to execute)
  const encodeResolveDispute = useCallback(
    (jobId: string, freelancerAmount: string): string => {
      try {
        const amountWei = ethers.parseUnits(freelancerAmount, MOCK_USD_DECIMALS);
        return escrowInterface.encodeFunctionData("resolveDispute", [
          BigInt(jobId),
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

  // READ: Fetch contract owner address
  const getContractOwner = useCallback(async (): Promise<string> => {
    try {
      if (isMockMode) {
        return "0xClientMock1234567890abcdef1234567890abc";
      }
      const contract = getContract();
      if (!contract) return "";
      return await contract.owner();
    } catch (err) {
      console.error("Failed to fetch contract owner:", err);
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
    encodeResolveDispute,
    getMockUsdBalance,
    getMockUsdAllowance,
    getContractOwner,
  };
};
