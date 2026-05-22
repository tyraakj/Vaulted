import { useState, useCallback } from "react";
import type { UGFStep } from "../types";
import { UGF_ENDPOINT } from "../lib/constants";

interface UGFFlowState {
  step: UGFStep;
  isLoading: boolean;
  error: string | null;
  txHash: string | null;
}

interface UGFQuoteResponse {
  gasEstimate: string;
  mockUsdCost: string;
}

/**
 * LAYER 8 - UGF TRANSACTION LAYER
 * 4-step flow: login -> quote -> settle -> execute
 * Every on-chain action runs through this sequence
 */
export const useUGF = () => {
  const [flowState, setFlowState] = useState<UGFFlowState>({
    step: "login",
    isLoading: false,
    error: null,
    txHash: null,
  });

  const updateStep = useCallback((
    step: UGFStep,
    isLoading: boolean,
    error: string | null = null,
    txHash: string | null = null,
  ) => {
    setFlowState({ step, isLoading, error, txHash });
  }, []);

  const login = useCallback(async (address: string): Promise<{ success: boolean; error: string | null }> => {
    updateStep("login", true);
    try {
      const response = await fetch(`${UGF_ENDPOINT}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        throw new Error(`Login failed (HTTP ${response.status})`);
      }

      updateStep("login", false, null);
      return { success: true, error: null };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      updateStep("login", false, errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [updateStep]);

  const quote = useCallback(
    async (
      address: string,
      calldata: string,
    ): Promise<{ success: boolean; data: UGFQuoteResponse | null; error: string | null }> => {
      updateStep("quote", true);
      try {
        const response = await fetch(`${UGF_ENDPOINT}/quote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, calldata }),
        });

        if (!response.ok) {
          throw new Error(`Quote failed (HTTP ${response.status})`);
        }

        const data = await response.json();
        updateStep("quote", false, null);
        return { success: true, data, error: null };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Quote failed";
        updateStep("quote", false, errorMsg);
        return { success: false, data: null, error: errorMsg };
      }
    },
    [updateStep],
  );

  const settle = useCallback(
    async (address: string, mockUsdAmount: string): Promise<{ success: boolean; signature: string | null; error: string | null }> => {
      updateStep("settle", true);
      try {
        if (typeof window !== "undefined" && (window as any).ethereum) {
          const signature = await (window as any).ethereum.request({
            method: "personal_sign",
            params: [
              `Authorize UGF to deduct ${mockUsdAmount} Mock USD`,
              address,
            ],
          });

          updateStep("settle", false, null);
          return { success: true, signature, error: null };
        }
        throw new Error("No web3 wallet provider available");
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Settlement failed";
        updateStep("settle", false, errorMsg);
        return { success: false, signature: null, error: errorMsg };
      }
    },
    [updateStep],
  );

  const execute = useCallback(
    async (
      address: string,
      calldata: string,
      signature: string,
      mockUsdAmount: string,
    ): Promise<{ success: boolean; txHash: string | null; error: string | null }> => {
      updateStep("execute", true);
      try {
        const response = await fetch(`${UGF_ENDPOINT}/execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address,
            calldata,
            signature,
            mockUsdAmount,
          }),
        });

        if (!response.ok) {
          throw new Error(`Execution failed (HTTP ${response.status})`);
        }

        const result = await response.json();
        const txHash = result.txHash || result.transactionHash;

        if (!txHash) {
          throw new Error("Relayer execution completed but returned no transaction hash");
        }

        updateStep("execute", false, null, txHash);
        return { success: true, txHash, error: null };
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Execution failed";
        updateStep("execute", false, errorMsg);
        return { success: false, txHash: null, error: errorMsg };
      }
    },
    [updateStep],
  );

  const runFlow = useCallback(
    async (
      address: string,
      calldata: string,
    ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
      // Step 1: Login
      const loginRes = await login(address);
      if (!loginRes.success) {
        return { success: false, error: loginRes.error || "Login failed" };
      }

      // Step 2: Quote
      // Transition step to quote with loading state
      updateStep("quote", true);
      const quoteRes = await quote(address, calldata);
      if (!quoteRes.success || !quoteRes.data) {
        return { success: false, error: quoteRes.error || "Quote failed" };
      }

      // Step 3: Settle
      // Transition step to settle with loading state
      updateStep("settle", true);
      const settleRes = await settle(address, quoteRes.data.mockUsdCost);
      if (!settleRes.success || !settleRes.signature) {
        return { success: false, error: settleRes.error || "Settlement failed" };
      }

      // Step 4: Execute
      // Transition step to execute with loading state
      updateStep("execute", true);
      const executeRes = await execute(
        address,
        calldata,
        settleRes.signature,
        quoteRes.data.mockUsdCost,
      );
      if (!executeRes.success || !executeRes.txHash) {
        return { success: false, error: executeRes.error || "Execution failed" };
      }

      setFlowState({
        step: "done",
        isLoading: false,
        error: null,
        txHash: executeRes.txHash,
      });
      return { success: true, txHash: executeRes.txHash };
    },
    [login, quote, settle, execute, updateStep],
  );

  return {
    flowState,
    login,
    quote,
    settle,
    execute,
    runFlow,
    updateStep,
  };
};
