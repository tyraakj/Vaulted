import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useContract } from "../hooks/useContract";
import { useUGF } from "../hooks/useUGF";
import { useWallet } from "../hooks/useWallet";
import { CONTRACT_ADDRESS, MOCK_USD_ADDRESS } from "../lib/constants";
import { VAULTED_CONTRACT_ABI } from "../lib/contract";
import { BASE_SEPOLIA_RPC } from "../lib/constants";
import { Interface, ethers as ethersLib } from "ethers";
import { useNavigate } from "react-router-dom";
import { PaymentFlow } from "../components/PaymentFlow";

export const PostJob: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    autoReleaseAt: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const { encodeCreateJob, encodeApprove, getMockUsdBalance, getMockUsdAllowance } = useContract();
  const { runFlow, flowState } = useUGF();
  const { address, isConnected, isCorrectNetwork } = useWallet();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<"approve" | "create" | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>("0.00");

  const fetchBalance = useCallback(async () => {
    if (isConnected && address) {
      try {
        const bal = await getMockUsdBalance(address);
        setWalletBalance(
          Number(ethers.formatUnits(bal, 6)).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      } catch (e) {
        console.error("Failed to fetch balance in PostJob:", e);
      }
    } else {
      setWalletBalance("0.00");
    }
  }, [isConnected, address, getMockUsdBalance]);

  useEffect(() => {
    fetchBalance();

    // Set autoReleaseAt to 7 days from today
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const dateString = sevenDaysFromNow.toISOString().split("T")[0]; // YYYY-MM-DD format
    setFormData((prev) => ({ ...prev, autoReleaseAt: dateString }));

    const handleUpdate = () => {
      fetchBalance();
    };

    window.addEventListener("balanceUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("balanceUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [fetchBalance]);

  const handleSubmit = async () => {
    console.log("PostJob.handleSubmit called");
    setErrorMessage(null);
    setSuccessMessage(null);
    setCurrentPhase(null);

    // Wallet/network guards with visible feedback
    if (!isConnected) {
      setErrorMessage("Please connect your wallet before deploying a contract.");
      return;
    }
    if (!isCorrectNetwork) {
      setErrorMessage("Please switch your wallet to Base Sepolia network.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (!address) {
        throw new Error("Wallet address unavailable");
      }

      const budgetWei = ethers.parseUnits(formData.amount, 6);
      const [balanceWei, allowanceWei] = await Promise.all([
        getMockUsdBalance(address),
        getMockUsdAllowance(address, CONTRACT_ADDRESS),
      ]);

      if (balanceWei < budgetWei) {
        throw new Error(
          `Insufficient TYI_MOCK_USD balance. Need ${formData.amount} USDC but only have ${ethers.formatUnits(balanceWei, 6)}.`,
        );
      }

      const approveCalldata = encodeApprove(CONTRACT_ADDRESS, formData.amount);
      if (!approveCalldata) throw new Error("Failed to encode approve calldata");

      if (allowanceWei < budgetWei) {
        setCurrentPhase("approve");
        const approveRes = await runFlow(address, approveCalldata, MOCK_USD_ADDRESS);
        if (!approveRes.success) {
          setErrorMessage(approveRes.error || "Token approval failed");
          return;
        }
      }

      // Encode and run createJob via UGF
      const createCalldata = encodeCreateJob(
        formData.title,
        formData.description,
        formData.amount
      );
      if (!createCalldata) throw new Error("Failed to encode createJob calldata");

      setCurrentPhase("create");
      const createRes = await runFlow(address, createCalldata, CONTRACT_ADDRESS);
      if (!createRes.success) {
        setErrorMessage(createRes.error || "Create job failed");
        return;
      }

      setSuccessMessage(`Job created — tx: ${createRes.txHash}`);

      // If we have a txHash, try to fetch the receipt and parse JobCreated
      if (createRes.txHash) {
        if (import.meta.env.VITE_UGF_MOCK === "true") {
          try {
            const mockJobs = JSON.parse(localStorage.getItem("vaulted_mock_jobs") || "[]");
            if (mockJobs.length > 0) {
              const lastJob = mockJobs[mockJobs.length - 1];
              localStorage.setItem("lastJobTx", createRes.txHash || "");
              localStorage.setItem("lastJobId", lastJob.id);
            }
          } catch (e) {
            console.error("Error reading last mock job ID:", e);
          }
        } else {
          try {
            const provider = new ethersLib.JsonRpcProvider(BASE_SEPOLIA_RPC);
            const receipt = await provider.getTransactionReceipt(createRes.txHash);
            if (receipt && receipt.logs && receipt.logs.length > 0) {
              const iface = new Interface(VAULTED_CONTRACT_ABI as any);
              for (const log of receipt.logs) {
                if (log.address.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) continue;
                try {
                  const parsed = iface.parseLog(log);
                  if (parsed && parsed.name === "JobCreated") {
                    const jobId = parsed.args[0].toString();
                    // store last tx/job so UI can link to it
                    localStorage.setItem("lastJobTx", createRes.txHash || "");
                    localStorage.setItem("lastJobId", jobId);
                    break;
                  }
                } catch (e) {
                  // ignore parse errors
                }
              }
            }
          } catch (e) {
            // ignore receipt fetch errors
          }
        }
      }

      // After creation, navigate to browse so the new job is visible
      navigate("/browse");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-job">
      <h1>Deploy New Contract</h1>

      <div className="job-form">
        <div className="form-group">
          <label htmlFor="title">CONTRACT_TITLE</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Zk-Rollup Bridge Integration"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">SCOPE_OF_WORK</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the deliverables, tech stack, and acceptance criteria..."
            required
          />
        </div>

        <div className="form-group">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label htmlFor="amount" style={{ marginBottom: 0 }}>ESCROW_BUDGET (USDC)</label>
            <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--t2)" }}>
              Wallet Balance: <span style={{ color: "var(--em)" }}>{walletBalance} MockUSD</span>
            </span>
          </div>
          <input
            id="amount"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="autoReleaseAt">AUTO_RELEASE_DATE</label>
          <input
            id="autoReleaseAt"
            type="date"
            name="autoReleaseAt"
            value={formData.autoReleaseAt}
            onChange={handleChange}
            disabled={true}
            style={{ opacity: 0.6, cursor: "not-allowed", border: "1px dashed var(--b2)" }}
            required
          />
          <small style={{ color: "var(--t2)", fontSize: "11px", marginTop: "4px", display: "block" }}>
            * Auto-release is locked to 7 days after milestone submission as per the smart contract escrow policy.
          </small>
        </div>

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting || flowState.isLoading}>
              {isSubmitting || flowState.isLoading ? `${flowState.step.toUpperCase()}...` : "DEPLOY_CONTRACT →"}
            </button>
            {successMessage && <div className="form-success" style={{ color: "#10b981" }}>{successMessage}</div>}
            {typeof window !== "undefined" && localStorage.getItem("lastJobTx") && (
              <a
                href={`https://sepolia.basescan.org/tx/${localStorage.getItem("lastJobTx")}`}
                target="_blank"
                rel="noreferrer"
                style={{ marginLeft: 12, color: "#06b6d4" }}
              >
                View on BaseScan
              </a>
            )}
          </div>
          {errorMessage && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div className="form-error" style={{ color: "#f87171", fontSize: "14px" }}>{errorMessage}</div>
              {errorMessage.includes("Insufficient TYI_MOCK_USD balance") && (
                <a
                  href="https://universalgasframework.com/faucets"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{
                    borderColor: "var(--gld-b)",
                    color: "var(--gld)",
                    fontSize: "12px",
                    padding: "6px 12px",
                    alignSelf: "flex-start",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    textDecoration: "none"
                  }}
                >
                  🚰 Get Mock USD from UGF Faucet
                </a>
              )}
            </div>
          )}
        </div>

        {currentPhase && (
          <div style={{ marginTop: 24, borderTop: "1px solid var(--b2)", paddingTop: 20 }}>
            <h4 style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--gld)", marginBottom: 12, letterSpacing: "0.05em" }}>
              {currentPhase === "approve" ? "PHASE 1/2: ESCROW ALLOWANCE SETUP" : "PHASE 2/2: SMART CONTRACT CREATION"}
            </h4>
            <PaymentFlow
              contractId="new-escrow"
              totalAmount={Number(formData.amount) || 0}
              flowState={flowState}
            />
          </div>
        )}
      </div>
    </div>
  );
};
