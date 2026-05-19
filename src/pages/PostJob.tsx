import React, { useState } from "react";
import { Job } from "../types";

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
    // TODO: Encode calldata and send via UGF
    const payload = {
      title: formData.title,
      description: formData.description,
      amount: Number(formData.amount),
      autoReleaseAt: new Date(formData.autoReleaseAt).getTime(),
    };
    console.log("Submitting job payload:", payload);
  };

  return (
    <div className="post-job">
      <h1>Post a New Job</h1>
      <form onSubmit={handleSubmit} className="job-form">
        <div className="form-group">
          <label htmlFor="title">Job Title</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="amount">Amount (USD)</label>
          <input
            id="amount"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="autoReleaseAt">Auto-release Date</label>
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
          Post Job
        </button>
      </form>
    </div>
  );
};
