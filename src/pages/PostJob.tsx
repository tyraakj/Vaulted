import React, { useState } from "react";
import { useContract } from "../hooks/useContract";
import { useUGF } from "../hooks/useUGF";
import { useWallet } from "../hooks/useWallet";
import { CONTRACT_ADDRESS } from "../lib/constants";

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

  const { encodeApprove, encodeCreateJob } = useContract();
  const { runFlow, flowState } = useUGF();
  const { address, isConnected, isCorrectNetwork } = useWallet();

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
      // Encode and run approve via UGF
      const approveCalldata = encodeApprove(CONTRACT_ADDRESS, formData.amount);
      if (!approveCalldata) throw new Error("Failed to encode approve calldata");

      const approveRes = await runFlow(address || "", approveCalldata);
      if (!approveRes.success) {
        setErrorMessage(approveRes.error || "Approve failed");
        return;
      }

      // Encode and run createJob via UGF
      const createCalldata = encodeCreateJob(formData.title, formData.description, formData.amount);
      if (!createCalldata) throw new Error("Failed to encode createJob calldata");

      const createRes = await runFlow(address || "", createCalldata);
      if (!createRes.success) {
        setErrorMessage(createRes.error || "Create job failed");
        return;
      }

      setSuccessMessage(`Job created — tx: ${createRes.txHash}`);
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
        </div>
      </div>
    </div>
  );
};
