import { useState, useCallback } from "react";
import { ethers, Interface } from "ethers";
import type { QuoteResponse } from "@tychilabs/ugf-testnet-js";
import type { UGFStep, UGFFlowState } from "../types";
import { CONTRACT_ADDRESS, MOCK_USD_ADDRESS, MOCK_USD_DECIMALS } from "../lib/constants";
import { VAULTED_CONTRACT_ABI } from "../lib/contract";
import ugfClient, { isUGFConfigured } from "../lib/ugf";

const isMockMode = import.meta.env.VITE_UGF_MOCK === "true";

const escrowInterface = new Interface(VAULTED_CONTRACT_ABI);
const erc20Interface = new Interface([
  "function approve(address spender, uint256 amount) external returns (bool)"
]);

const executeMockCalldata = (address: string, calldata: string, targetAddress: string) => {
  try {
    let parsedTx: any = null;
    const isToken = targetAddress.toLowerCase() === MOCK_USD_ADDRESS.toLowerCase();

    if (isToken) {
      parsedTx = erc20Interface.parseTransaction({ data: calldata });
    } else {
      parsedTx = escrowInterface.parseTransaction({ data: calldata });
    }

    if (!parsedTx) return;

    const { name, args } = parsedTx;
    console.log("Mock executing function:", name, args);

    if (isToken && name === "approve") {
      const spender = args[0];
      const amountWei = args[1];
      const allowances = JSON.parse(localStorage.getItem("vaulted_mock_allowances") || "{}");
      const key = `${address.toLowerCase()}-${spender.toLowerCase()}`;
      allowances[key] = amountWei.toString();
      localStorage.setItem("vaulted_mock_allowances", JSON.stringify(allowances));
    } else if (!isToken) {
      const jobs = JSON.parse(localStorage.getItem("vaulted_mock_jobs") || "[]");
      const balances = JSON.parse(localStorage.getItem("vaulted_mock_balances") || "{}");
      const userLower = address.toLowerCase();

      if (name === "createJob") {
        const title = args[0];
        const description = args[1];
        const amountWei = args[2];
        const autoReleaseDuration = 7 * 86400; // Hardcoded to 7 days
        const jobAmount = Number(ethers.formatUnits(amountWei, MOCK_USD_DECIMALS));

        // Deduct budget
        const currentBal = BigInt(balances[userLower] || ethers.parseUnits("100000", MOCK_USD_DECIMALS).toString());
        balances[userLower] = (currentBal - amountWei).toString();
        localStorage.setItem("vaulted_mock_balances", JSON.stringify(balances));

        // Add job
        const newJob = {
          id: (jobs.length + 1).toString(),
          title,
          description,
          client: address,
          freelancer: "0x0000000000000000000000000000000000000000",
          amount: jobAmount,
          status: "Open",
          createdAt: Date.now(),
          autoReleaseAt: Date.now() + autoReleaseDuration * 1000
        };
        jobs.push(newJob);
        localStorage.setItem("vaulted_mock_jobs", JSON.stringify(jobs));
      } else if (name === "acceptJob") {
        const jobId = args[0].toString();
        const job = jobs.find((j: any) => j.id === jobId);
        if (job) {
          job.status = "Active";
          job.freelancer = address;
          localStorage.setItem("vaulted_mock_jobs", JSON.stringify(jobs));
        }
      } else if (name === "submitMilestone") {
        const jobId = args[0].toString();
        const job = jobs.find((j: any) => j.id === jobId);
        if (job) {
          job.status = "Complete";
          job.autoReleaseAt = Date.now() + 7 * 86400 * 1000;
          localStorage.setItem("vaulted_mock_jobs", JSON.stringify(jobs));
        }
      } else if (name === "releasePayment") {
        const jobId = args[0].toString();
        const job = jobs.find((j: any) => j.id === jobId);
        if (job && job.status === "Complete") {
          job.status = "Released";
          const amountWei = ethers.parseUnits(job.amount.toString(), MOCK_USD_DECIMALS);
          const freeLower = job.freelancer.toLowerCase();
          
          const currentBal = BigInt(balances[freeLower] || ethers.parseUnits("100000", MOCK_USD_DECIMALS).toString());
          const gasDeduction = ethers.parseUnits("1.2", MOCK_USD_DECIMALS);
          const finalTransfer = amountWei - gasDeduction;

          balances[freeLower] = (currentBal + finalTransfer).toString();
          localStorage.setItem("vaulted_mock_balances", JSON.stringify(balances));
          localStorage.setItem("vaulted_mock_jobs", JSON.stringify(jobs));
        }
      } else if (name === "disputeJob") {
        const jobId = args[0].toString();
        const job = jobs.find((j: any) => j.id === jobId);
        if (job) {
          job.status = "Disputed";
          localStorage.setItem("vaulted_mock_jobs", JSON.stringify(jobs));
        }
      } else if (name === "autoRelease") {
        const jobId = args[0].toString();
        const job = jobs.find((j: any) => j.id === jobId);
        if (job && job.status === "Complete") {
          job.status = "Released";
          const amountWei = ethers.parseUnits(job.amount.toString(), MOCK_USD_DECIMALS);
          const freeLower = job.freelancer.toLowerCase();
          const currentBal = BigInt(balances[freeLower] || ethers.parseUnits("100000", MOCK_USD_DECIMALS).toString());
          const gasDeduction = ethers.parseUnits("1.2", MOCK_USD_DECIMALS);
          const finalTransfer = amountWei - gasDeduction;

          balances[freeLower] = (currentBal + finalTransfer).toString();
          localStorage.setItem("vaulted_mock_balances", JSON.stringify(balances));
          localStorage.setItem("vaulted_mock_jobs", JSON.stringify(jobs));
        }
      } else if (name === "resolveDispute") {
        const jobId = args[0].toString();
        const freelancerAmountWei = args[1];
        const job = jobs.find((j: any) => j.id === jobId);
        if (job && job.status === "Disputed") {
          job.status = "Released";
          const freelancerAmount = Number(ethers.formatUnits(freelancerAmountWei, MOCK_USD_DECIMALS));
          const clientAmount = job.amount - freelancerAmount;
          
          const freeLower = job.freelancer.toLowerCase();
          const clientLower = job.client.toLowerCase();

          // Payout freelancer
          if (freelancerAmount > 0) {
            const currentFreeBal = BigInt(balances[freeLower] || ethers.parseUnits("100000", MOCK_USD_DECIMALS).toString());
            balances[freeLower] = (currentFreeBal + freelancerAmountWei).toString();
          }
          // Refund client
          if (clientAmount > 0) {
            const currentClientBal = BigInt(balances[clientLower] || ethers.parseUnits("100000", MOCK_USD_DECIMALS).toString());
            const refundWei = ethers.parseUnits(clientAmount.toString(), MOCK_USD_DECIMALS);
            balances[clientLower] = (currentClientBal + refundWei).toString();
          }

          localStorage.setItem("vaulted_mock_balances", JSON.stringify(balances));
          localStorage.setItem("vaulted_mock_jobs", JSON.stringify(jobs));
        }
      }
    }
  } catch (error) {
    console.error("Error executing mock calldata:", error);
  }
};

export const useUGF = () => {
  const [flowState, setFlowState] = useState<UGFFlowState>({
    step: "login",
    isLoading: false,
    error: null,
    txHash: null,
  });

  const updateStep = useCallback(
    (
      step: UGFStep,
      isLoading: boolean,
      error: string | null = null,
      txHash: string | null = null,
    ) => {
      setFlowState({ step, isLoading, error, txHash });
    },
    [],
  );

  const getSigner = useCallback(async (): Promise<ethers.Signer> => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      throw new Error("No web3 wallet provider available");
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    return provider.getSigner();
  }, []);

  const login = useCallback(
    async (address: string): Promise<{ success: boolean; error: string | null }> => {
      updateStep("login", true);
      try {
        if (isMockMode) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          updateStep("login", false, null);
          return { success: true, error: null };
        }
        const signer = await getSigner();
        const signerAddress = await signer.getAddress();

        if (address && signerAddress.toLowerCase() !== address.toLowerCase()) {
          console.warn("UGF login signer address differs from provided address", {
            signerAddress,
            address,
          });
        }

        await ugfClient.auth.login(signer);
        updateStep("login", false, null);
        return { success: true, error: null };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Login failed";
        updateStep("login", false, errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    [getSigner, updateStep],
  );

  const quote = useCallback(
    async (
      address: string,
      calldata: string,
      targetAddress: string = CONTRACT_ADDRESS,
    ): Promise<{ success: boolean; data: QuoteResponse | null; error: string | null }> => {
      updateStep("quote", true);
      try {
        if (isMockMode) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          updateStep("quote", false, null);
          return { success: true, data: {} as any, error: null };
        }
        const response = await ugfClient.quote.get({
          payer_address: address,
          tx_object: JSON.stringify({
            from: address,
            to: targetAddress,
            data: calldata,
            value: "0",
          }),
        });

        updateStep("quote", false, null);
        return { success: true, data: response, error: null };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Quote failed";
        updateStep("quote", false, errorMsg);
        return { success: false, data: null, error: errorMsg };
      }
    },
    [updateStep],
  );

  const settle = useCallback(
    async (
      quoteResponse: QuoteResponse,
    ): Promise<{ success: boolean; signature: string | null; error: string | null }> => {
      updateStep("settle", true);
      try {
        if (isMockMode) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          updateStep("settle", false, null);
          return { success: true, signature: "mock-sig", error: null };
        }
        const signer = await getSigner();
        const paymentResponse = await ugfClient.payment.x402.execute({
          quote: quoteResponse,
          signer,
        });

        updateStep("settle", false, null);
        return {
          success: true,
          signature: paymentResponse.status,
          error: null,
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Settlement failed";
        updateStep("settle", false, errorMsg);
        return { success: false, signature: null, error: errorMsg };
      }
    },
    [getSigner, updateStep],
  );

  const execute = useCallback(
    async (
      quoteResponse: QuoteResponse,
      calldata: string,
      targetAddress: string = CONTRACT_ADDRESS,
    ): Promise<{ success: boolean; txHash: string | null; error: string | null }> => {
      updateStep("execute", true);
      try {
        if (isMockMode) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const mockTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
          executeMockCalldata(localStorage.getItem("mockWalletAddress") || localStorage.getItem("walletAddress") || "", calldata, targetAddress);
          updateStep("execute", false, null, mockTxHash);
          window.dispatchEvent(new Event("balanceUpdated"));
          return { success: true, txHash: mockTxHash, error: null };
        }
        const signer = await getSigner();
        const { userTxHash } = await ugfClient.chains.evm.sponsorAndExecute(
          quoteResponse.digest,
          signer,
          async () => ({
            to: targetAddress,
            data: calldata,
            value: 0n,
          }),
        );

        // Wait for transaction to be mined to prevent race conditions
        try {
          const provider = signer.provider;
          if (provider) {
            console.log("Waiting for transaction to be mined:", userTxHash);
            await provider.waitForTransaction(userTxHash, 1);
            console.log("Transaction mined:", userTxHash);
          }
        } catch (confirmErr) {
          console.warn("Failed to wait for transaction confirmation:", confirmErr);
        }

        updateStep("execute", false, null, userTxHash);
        window.dispatchEvent(new Event("balanceUpdated"));
        return { success: true, txHash: userTxHash, error: null };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Execution failed";
        updateStep("execute", false, errorMsg);
        return { success: false, txHash: null, error: errorMsg };
      }
    },
    [getSigner, updateStep],
  );

  const runFlow = useCallback(
    async (
      address: string,
      calldata: string,
      targetAddress: string = CONTRACT_ADDRESS,
    ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
      if (isMockMode) {
        try {
          updateStep("login", true);
          await new Promise((resolve) => setTimeout(resolve, 800));
          updateStep("quote", true);
          await new Promise((resolve) => setTimeout(resolve, 800));
          updateStep("settle", true);
          await new Promise((resolve) => setTimeout(resolve, 800));
          updateStep("execute", true);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          const mockTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
          executeMockCalldata(address, calldata, targetAddress);
          
          updateStep("execute", false, null, mockTxHash);
          setFlowState({
            step: "done",
            isLoading: false,
            error: null,
            txHash: mockTxHash,
          });
          window.dispatchEvent(new Event("balanceUpdated"));
          return { success: true, txHash: mockTxHash };
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : "Mock transaction failed";
          setFlowState((prev) => ({ ...prev, isLoading: false, error: errorMsg }));
          return { success: false, error: errorMsg };
        }
      }

      if (!isUGFConfigured()) {
        return { success: false, error: "UGF endpoint not configured" };
      }

      try {
        // Step 1: Login
        updateStep("login", true);
        const signer = await getSigner();
        await ugfClient.auth.login(signer);
        updateStep("login", false);

        // Step 2: Quote
        updateStep("quote", true);
        const quote = await ugfClient.quote.get({
          payer_address: address,
          tx_object: JSON.stringify({
            from: address,
            to: targetAddress,
            data: calldata,
            value: "0",
          }),
        });
        updateStep("quote", false);

        // Step 3: Settle
        updateStep("settle", true);
        await ugfClient.payment.x402.execute({ quote, signer });
        updateStep("settle", false);

        // Step 4: Execute
        updateStep("execute", true);
        const { userTxHash } = await ugfClient.chains.evm.sponsorAndExecute(
          quote.digest,
          signer,
          async () => ({
            to: targetAddress,
            data: calldata,
            value: 0n,
          }),
        );

        // Wait for transaction to be mined to prevent race conditions
        try {
          const provider = signer.provider;
          if (provider) {
            console.log("Waiting for transaction to be mined:", userTxHash);
            await provider.waitForTransaction(userTxHash, 1);
            console.log("Transaction mined:", userTxHash);
          }
        } catch (confirmErr) {
          console.warn("Failed to wait for transaction confirmation:", confirmErr);
        }

        updateStep("execute", false, null, userTxHash);
        window.dispatchEvent(new Event("balanceUpdated"));

        setFlowState({
          step: "done",
          isLoading: false,
          error: null,
          txHash: userTxHash,
        });
        return { success: true, txHash: userTxHash };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Transaction failed";
        setFlowState((prev) => ({ ...prev, isLoading: false, error: errorMsg }));
        return { success: false, error: errorMsg };
      }
    },
    [getSigner, updateStep],
  );

  return { flowState, runFlow, updateStep, login, quote, settle, execute };
};