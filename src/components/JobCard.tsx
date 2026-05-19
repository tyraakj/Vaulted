import React from "react";
import { Job } from "../types";

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
        <span className="budget">${job.amount}</span>
        <span className={`status status-${job.status}`}>{job.status}</span>
      </div>
      <p className="deadline">
        Auto-release: {new Date(job.autoReleaseAt).toLocaleDateString()}
      </p>
    </div>
  );
};
