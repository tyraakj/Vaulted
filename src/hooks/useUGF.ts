import { useState, useCallback } from "react";
import { ethers } from "ethers";
import type { QuoteResponse } from "@tychilabs/ugf-testnet-js";
import type { UGFStep, UGFFlowState } from "../types";
import { CONTRACT_ADDRESS } from "../lib/constants";
import ugfClient, { isUGFConfigured } from "../lib/ugf";

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
      targetAddress: string = CONTRACT_ADDRESS,
    ): Promise<{ success: boolean; data: QuoteResponse | null; error: string | null }> => {
      updateStep("quote", true);
      try {
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

        updateStep("execute", false, null, userTxHash);
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
        updateStep("execute", false, null, userTxHash);

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