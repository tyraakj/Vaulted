import React from "react";
import { Job } from "../types";
import { StatusBadge } from "./StatusBadge";

interface JobCardProps {
  job: Job;
  onClick?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  return (
    <div className="job-card" onClick={onClick}>
      <h3>{job.title}</h3>
      <p className="description">{job.description.slice(0, 100)}...</p>
      <div className="job-meta">
        <span className="budget">${job.amount.toLocaleString()} USDC</span>
        <StatusBadge status={job.status} size="small" />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", borderTop: "1px solid var(--b1)", paddingTop: "12px" }}>
        <p className="deadline" style={{ margin: 0 }}>
          Auto-release: {new Date(job.autoReleaseAt).toLocaleDateString()}
        </p>
        <span
          className="btn btn-secondary"
          style={{
            fontSize: "9px",
            padding: "4px 10px",
            fontFamily: "var(--mono)",
            letterSpacing: "0.05em",
            pointerEvents: "none",
          }}
        >
          VIEW CONTRACT
        </span>
      </div>
    </div>
  );
};
