import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Job } from "../types";
import { MilestoneTracker } from "../components/MilestoneTracker";
import { PaymentFlow } from "../components/PaymentFlow";
import { StatusBadge } from "../components/StatusBadge";

export const JobDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobDetail();
  }, [jobId]);

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      // TODO: Fetch job detail from contract
      console.log("Fetching job:", jobId);
    } catch (error) {
      console.error("Failed to fetch job:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="job-detail">
        <p>Loading...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-detail">
        <p>Job not found</p>
      </div>
    );
  }

  return (
    <div className="job-detail">
      <div className="job-header">
        <h1>{job.title}</h1>
        <StatusBadge status={job.status} size="large" />
      </div>
      <div className="job-content">
        <div className="job-info">
          <p className="description">{job.description}</p>
          <div className="meta-info">
            <p>
              Amount: <strong>${job.amount}</strong>
            </p>
            <p>
              Auto-release:{" "}
              <strong>
                {new Date(job.autoReleaseAt).toLocaleDateString()}
              </strong>
            </p>
            <p>
              Client: <strong>{job.client}</strong>
            </p>
          </div>
        </div>
        <MilestoneTracker milestones={[]} />
      </div>
      <PaymentFlow contractId={jobId || ""} totalAmount={job.amount} />
    </div>
  );
};
