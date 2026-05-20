import React, { useState } from "react";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Encode calldata and broadcast via UGF relayer
    const payload = {
      title: formData.title,
      description: formData.description,
      amount: Number(formData.amount),
      autoReleaseAt: new Date(formData.autoReleaseAt).getTime(),
    };
    console.log("Broadcasting escrow contract payload:", payload);
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
