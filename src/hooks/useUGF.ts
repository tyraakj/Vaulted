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

  const updateStep = (
    step: UGFStep,
    isLoading: boolean,
    error: string | null = null,
    txHash: string | null = null,
  ) => {
    setFlowState({ step, isLoading, error, txHash });
  };

  const login = useCallback(async (address: string): Promise<boolean> => {
    updateStep("login", true);
    try {
      const response = await fetch(`${UGF_ENDPOINT}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      updateStep("login", false, null);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      updateStep("login", false, errorMsg);
      return false;
    }
  }, []);

  const quote = useCallback(
    async (
      address: string,
      calldata: string,
    ): Promise<UGFQuoteResponse | null> => {
      updateStep("quote", true);
      try {
        const response = await fetch(`${UGF_ENDPOINT}/quote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, calldata }),
        });

        if (!response.ok) {
          throw new Error("Quote failed");
        }

        const quote = await response.json();
        updateStep("quote", false, null);
        return quote;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Quote failed";
        updateStep("quote", false, errorMsg);
        return null;
      }
    },
    [],
  );

  const settle = useCallback(
    async (address: string, mockUsdAmount: string): Promise<string | null> => {
      updateStep("settle", true);
      try {
        // Sign ERC-3009 authorization
        if (typeof window !== "undefined" && window.ethereum) {
          const signature = await window.ethereum.request({
            method: "personal_sign",
            params: [
              `Authorize UGF to deduct ${mockUsdAmount} Mock USD`,
              address,
            ],
          });

          updateStep("settle", false, null);
          return signature;
        }
        // If no wallet is available, mark step as not loading and return null
        updateStep("settle", false, "No wallet available");
        return null;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Settlement failed";
        updateStep("settle", false, errorMsg);
        return null;
      }
    },
    [],
  );

  const execute = useCallback(
    async (
      address: string,
      calldata: string,
      signature: string,
      mockUsdAmount: string,
    ): Promise<string | null> => {
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
          throw new Error("Execution failed");
        }

        const result = await response.json();
        const txHash = result.txHash || result.transactionHash;

        updateStep("execute", false, null, txHash);
        return txHash;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Execution failed";
        updateStep("execute", false, errorMsg);
        return null;
      }
    },
    [],
  );

  const runFlow = useCallback(
    async (
      address: string,
      calldata: string,
    ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
      // Step 1: Login
      const loginSuccess = await login(address);
      if (!loginSuccess) {
        return { success: false, error: flowState.error || "Login failed" };
      }

      // Step 2: Quote
      const quoteData = await quote(address, calldata);
      if (!quoteData) {
        return { success: false, error: flowState.error || "Quote failed" };
      }

      // Step 3: Settle
      const signature = await settle(address, quoteData.mockUsdCost);
      if (!signature) {
        return {
          success: false,
          error: flowState.error || "Settlement failed",
        };
      }

      // Step 4: Execute
      const txHash = await execute(
        address,
        calldata,
        signature,
        quoteData.mockUsdCost,
      );
      if (!txHash) {
        return { success: false, error: flowState.error || "Execution failed" };
      }

      return { success: true, txHash };
    },
    [login, quote, settle, execute, flowState.error],
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
