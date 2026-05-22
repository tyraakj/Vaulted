import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Job } from "../types";
import { MilestoneTracker } from "../components/MilestoneTracker";
import { PaymentFlow } from "../components/PaymentFlow";
import { StatusBadge } from "../components/StatusBadge";
import { useContract } from "../hooks/useContract";
import { useUGF } from "../hooks/useUGF";
import { useWallet } from "../hooks/useWallet";
import { useRole } from "../hooks/useRole";

export const JobDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isSubmittingMilestone, setIsSubmittingMilestone] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);

  const { getJob, encodeAcceptJob, encodeSubmitMilestone, encodeReleasePayment } = useContract();
  const { runFlow } = useUGF();
  const { address, isConnected, isCorrectNetwork } = useWallet();
  const { role } = useRole();

  useEffect(() => {
    fetchJobDetail();
  }, [jobId]);

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      if (!jobId) return;
      const result = await getJob(jobId);
      setJob(result);
    } catch (error) {
      console.error("Failed to fetch job:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!jobId) return;
    if (!isConnected || !isCorrectNetwork) return;
    if (role !== "freelancer") return;

    try {
      setIsAccepting(true);
      const calldata = encodeAcceptJob(jobId);
      if (!calldata) throw new Error("Failed to encode accept calldata");
      const res = await runFlow(address || "", calldata);
      if (!res.success) throw new Error(res.error || "Accept failed");
      // Refresh job
      await fetchJobDetail();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleSubmitMilestone = async () => {
    if (!jobId) return;
    if (!isConnected || !isCorrectNetwork) return;
    if (role !== "freelancer") return;

    try {
      setIsSubmittingMilestone(true);
      const calldata = encodeSubmitMilestone(jobId);
      if (!calldata) throw new Error("Failed to encode submitMilestone calldata");
      const res = await runFlow(address || "", calldata);
      if (!res.success) throw new Error(res.error || "Submit milestone failed");
      await fetchJobDetail();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingMilestone(false);
    }
  };

  const handleRelease = async () => {
    if (!jobId) return;
    if (!isConnected || !isCorrectNetwork) return;
    if (role !== "client") return;

    try {
      setIsReleasing(true);
      const calldata = encodeReleasePayment(jobId);
      if (!calldata) throw new Error("Failed to encode release calldata");
      const res = await runFlow(address || "", calldata);
      if (!res.success) throw new Error(res.error || "Release failed");
      await fetchJobDetail();
    } catch (err) {
      console.error(err);
    } finally {
      setIsReleasing(false);
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
          <div style={{ marginTop: 16 }}>
            {/* Accept button for freelancers when job is Open */}
            {job.status === "Open" && role === "freelancer" && (
              <button className="btn btn-primary" onClick={handleAccept} disabled={isAccepting}>
                {isAccepting ? "Accepting..." : "Accept Job"}
              </button>
            )}

            {/* Submit milestone for freelancers when job is Active */}
            {job.status === "Active" && role === "freelancer" && (
              <button className="btn btn-primary" onClick={handleSubmitMilestone} disabled={isSubmittingMilestone} style={{ marginLeft: 8 }}>
                {isSubmittingMilestone ? "Submitting..." : "Submit Milestone"}
              </button>
            )}

            {/* Release payment for clients when job is Complete */}
            {job.status === "Complete" && role === "client" && (
              <button className="btn btn-primary" onClick={handleRelease} disabled={isReleasing} style={{ marginLeft: 8 }}>
                {isReleasing ? "Releasing..." : "Release Payment"}
              </button>
            )}
          </div>
        </div>
        <MilestoneTracker milestones={[]} />
      </div>
      <PaymentFlow contractId={jobId || ""} totalAmount={job.amount} />
    </div>
  );
};
