import React, { useState } from "react";
import { ethers } from "ethers";
import { useContract } from "../hooks/useContract";
import { useUGF } from "../hooks/useUGF";
import { useWallet } from "../hooks/useWallet";
import { CONTRACT_ADDRESS, MOCK_USD_ADDRESS } from "../lib/constants";
import { VAULTED_CONTRACT_ABI } from "../lib/contract";
import { BASE_SEPOLIA_RPC } from "../lib/constants";
import { Interface, ethers as ethersLib } from "ethers";
import { useNavigate } from "react-router-dom";

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

  const handleSubmit = async () => {
    console.log("PostJob.handleSubmit called");
    setErrorMessage(null);
    setSuccessMessage(null);

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
        const approveRes = await runFlow(address, approveCalldata, MOCK_USD_ADDRESS);
        if (!approveRes.success) {
          setErrorMessage(approveRes.error || "Token approval failed");
          return;
        }
      }

      // Encode and run createJob via UGF
      const createCalldata = encodeCreateJob(formData.title, formData.description, formData.amount);
      if (!createCalldata) throw new Error("Failed to encode createJob calldata");

      const createRes = await runFlow(address, createCalldata, CONTRACT_ADDRESS);
      if (!createRes.success) {
        setErrorMessage(createRes.error || "Create job failed");
        return;
      }

      setSuccessMessage(`Job created — tx: ${createRes.txHash}`);

      // If we have a txHash, try to fetch the receipt and parse JobCreated
      if (createRes.txHash) {
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
          <label htmlFor="amount">ESCROW_BUDGET (USDC)</label>
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
            required
          />
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting || flowState.isLoading}>
            {isSubmitting || flowState.isLoading ? `${flowState.step.toUpperCase()}...` : "DEPLOY_CONTRACT →"}
          </button>
          {errorMessage && <div className="form-error" style={{ color: "#f87171" }}>{errorMessage}</div>}
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
      </div>
    </div>
  );
};
