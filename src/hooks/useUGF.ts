import { useState, useCallback } from "react";
import { ethers } from "ethers";
import type { QuoteResponse } from "@tychilabs/ugf-sdk";
import type { UGFStep, UGFFlowState } from "../types";
import { CONTRACT_ADDRESS } from "../lib/constants";
import ugfClient, { isUGFConfigured } from "../lib/ugf";

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
    ): Promise<{ success: boolean; data: QuoteResponse | null; error: string | null }> => {
      updateStep("quote", true);
      try {
        const response = await ugfClient.quote.get({
          payment_coin: "USDC",
          payer_address: address,
          payment_chain: "84532",
          payment_chain_type: "evm",
          tx_object: JSON.stringify({
            from: address,
            to: CONTRACT_ADDRESS,
            data: calldata,
            value: "0",
          }),
          dest_chain_id: "84532",
          dest_chain_type: "evm",
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
        const signer = await getSigner();

        if (quoteResponse.payment_mode === "x402") {
          const paymentResponse = await ugfClient.payment.x402.execute({
            quote: quoteResponse,
            signer,
            token: "USDC",
          });

          updateStep("settle", false, null);
          return {
            success: true,
            signature: paymentResponse.status,
            error: null,
          };
        }

        if (quoteResponse.payment_mode === "vault") {
          const paymentResponse = await ugfClient.payment.vault.payAndSubmit(
            quoteResponse,
            signer,
            "84532",
            "USDC",
          );

          updateStep("settle", false, null);
          return {
            success: true,
            signature: paymentResponse.status,
            error: null,
          };
        }

        throw new Error(`Unsupported payment mode: ${quoteResponse.payment_mode}`);
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
    ): Promise<{ success: boolean; txHash: string | null; error: string | null }> => {
      updateStep("execute", true);
      try {
        const signer = await getSigner();
        const result = await ugfClient.chains.evm.sponsorAndExecute(
          quoteResponse.digest,
          signer,
          async (s) => {
            return s.sendTransaction({
              to: CONTRACT_ADDRESS,
              data: calldata,
            });
          },
          {},
        );

        updateStep("execute", false, null, result.userTxHash);
        return { success: true, txHash: result.userTxHash, error: null };
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
    ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
      if (!isUGFConfigured()) {
        console.error("UGF endpoint not configured. Aborting runFlow.");
        return { success: false, error: "UGF endpoint not configured" };
      }

      const loginRes = await login(address);
      if (!loginRes.success) {
        return { success: false, error: loginRes.error || "Login failed" };
      }

      const quoteRes = await quote(address, calldata);
      if (!quoteRes.success || !quoteRes.data) {
        return { success: false, error: quoteRes.error || "Quote failed" };
      }

      const settleRes = await settle(quoteRes.data);
      if (!settleRes.success || !settleRes.signature) {
        return { success: false, error: settleRes.error || "Settlement failed" };
      }

      const executeRes = await execute(quoteRes.data, calldata);
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
    [login, quote, settle, execute],
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