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
  const { runFlow } = useUGF();
  const { address, isConnected, isCorrectNetwork } = useWallet();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      // Ensure wallet and network
      if (!isConnected || !isCorrectNetwork) {
        console.error("Wallet not connected or wrong network");
        return;
      }

      try {
        // Approve Mock USD to transfer tokens to escrow contract
        const approveCalldata = encodeApprove(CONTRACT_ADDRESS, formData.amount);
        if (!approveCalldata) throw new Error("Failed to encode approve calldata");

        const approveRes = await runFlow(address || "", approveCalldata);
        if (!approveRes.success) {
          console.error("Approve failed:", approveRes.error);
          return;
        }

        // Create job
        const createCalldata = encodeCreateJob(formData.title, formData.description, formData.amount);
        if (!createCalldata) throw new Error("Failed to encode createJob calldata");

        const createRes = await runFlow(address || "", createCalldata);
        if (!createRes.success) {
          console.error("Create job failed:", createRes.error);
          return;
        }

        console.log("Contract deployed / job created, tx:", createRes.txHash);
      } catch (err) {
        console.error(err);
      }
    })();
  };

  return (
    <div className="post-job">
      <h1>Deploy New Contract</h1>

      <form onSubmit={handleSubmit} className="job-form">
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

        <button type="submit" className="btn btn-primary">
          DEPLOY_CONTRACT →
        </button>
      </form>
    </div>
  );
};
