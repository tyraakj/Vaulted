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
  const [isDisputing, setIsDisputing] = useState(false);
  const [isAutoReleasing, setIsAutoReleasing] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [contractOwner, setContractOwner] = useState<string | null>(null);
  const [freelancerAmountInput, setFreelancerAmountInput] = useState("");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [deliverablesText, setDeliverablesText] = useState("");
  const [deliverablesLink, setDeliverablesLink] = useState("");
  const [savedDeliverables, setSavedDeliverables] = useState<{
    description: string;
    link: string;
    submittedAt: number;
  } | null>(null);

  const {
    getJob,
    encodeAcceptJob,
    encodeSubmitMilestone,
    encodeReleasePayment,
    encodeDisputeJob,
    encodeAutoRelease,
    encodeResolveDispute,
    getContractOwner,
  } = useContract();
  const { runFlow, flowState } = useUGF();
  const { address, isConnected, isCorrectNetwork } = useWallet();
  const { role } = useRole();

  useEffect(() => {
    fetchJobDetail();
    fetchOwner();
  }, [jobId]);

  useEffect(() => {
    if (jobId) {
      const data = localStorage.getItem(`deliverables_${jobId}`);
      if (data) {
        try {
          setSavedDeliverables(JSON.parse(data));
        } catch (e) {
          console.error("Failed to parse deliverables:", e);
        }
      } else {
        setSavedDeliverables(null);
      }
    }
  }, [jobId, job?.status]);

  const handleSubmitDeliverables = async () => {
    if (!jobId) return;
    if (!isConnected || !isCorrectNetwork) return;
    if (role !== "freelancer") return;
    if (!deliverablesText.trim()) {
      alert("Please provide a description of the deliverables.");
      return;
    }

    try {
      setIsSubmittingMilestone(true);
      const calldata = encodeSubmitMilestone(jobId);
      if (!calldata) throw new Error("Failed to encode submitMilestone calldata");
      const res = await runFlow(address || "", calldata);
      if (!res.success) throw new Error(res.error || "Submit milestone failed");
      
      localStorage.setItem(
        `deliverables_${jobId}`,
        JSON.stringify({
          description: deliverablesText,
          link: deliverablesLink,
          submittedAt: Date.now(),
        })
      );
      
      setShowSubmitForm(false);
      setDeliverablesText("");
      setDeliverablesLink("");
      await fetchJobDetail();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingMilestone(false);
    }
  };

  const fetchOwner = async () => {
    try {
      const owner = await getContractOwner();
      setContractOwner(owner);
    } catch (e) {
      console.error("Failed to fetch contract owner:", e);
    }
  };

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

  const handleDispute = async () => {
    if (!jobId) return;
    if (!isConnected || !isCorrectNetwork) return;

    try {
      setIsDisputing(true);
      const calldata = encodeDisputeJob(jobId);
      if (!calldata) throw new Error("Failed to encode dispute calldata");
      const res = await runFlow(address || "", calldata);
      if (!res.success) throw new Error(res.error || "Dispute failed");
      await fetchJobDetail();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDisputing(false);
    }
  };

  const handleAutoRelease = async () => {
    if (!jobId) return;
    if (!isConnected || !isCorrectNetwork) return;

    try {
      setIsAutoReleasing(true);
      const calldata = encodeAutoRelease(jobId);
      if (!calldata) throw new Error("Failed to encode auto-release calldata");
      const res = await runFlow(address || "", calldata);
      if (!res.success) throw new Error(res.error || "Auto-release failed");
      await fetchJobDetail();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAutoReleasing(false);
    }
  };

  const handleResolveDispute = async () => {
    if (!jobId || !job) return;
    if (!isConnected || !isCorrectNetwork) return;

    try {
      const freelancerShare = Number(freelancerAmountInput);
      if (isNaN(freelancerShare) || freelancerShare < 0 || freelancerShare > job.amount) {
        alert(`Freelancer share must be a number between 0 and ${job.amount}`);
        return;
      }
      setIsResolving(true);
      const calldata = encodeResolveDispute(jobId, freelancerAmountInput);
      if (!calldata) throw new Error("Failed to encode resolveDispute calldata");
      const res = await runFlow(address || "", calldata);
      if (!res.success) throw new Error(res.error || "Resolve dispute failed");
      await fetchJobDetail();
    } catch (err) {
      console.error(err);
    } finally {
      setIsResolving(false);
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
              Amount: <strong>${job.amount} USDC</strong>
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
            {job.freelancer && job.freelancer !== "0x0000000000000000000000000000000000000000" && (
              <p>
                Freelancer: <strong>{job.freelancer}</strong>
              </p>
            )}
          </div>
          {/* Deliverables Showcase */}
          {savedDeliverables && (
            <div style={{
              marginTop: 20,
              background: "var(--bg-ch)",
              border: "1px solid var(--b2)",
              borderRadius: "var(--radius)",
              padding: "16px"
            }}>
              <h4 style={{ color: "var(--em)", fontFamily: "var(--mono)", fontSize: "13px", margin: "0 0 10px 0", letterSpacing: "0.05em" }}>
                ✓ DELIVERABLES SUBMITTED
              </h4>
              <p style={{ fontSize: "13px", color: "var(--t1)", margin: "0 0 12px 0", lineHeight: "1.4" }}>
                {savedDeliverables.description}
              </p>
              {savedDeliverables.link && (
                <div style={{ marginBottom: 12 }}>
                  <a
                    href={savedDeliverables.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px", padding: "6px 12px" }}
                  >
                    🔗 View Deliverables Link
                  </a>
                </div>
              )}
              <div style={{ fontSize: "10px", color: "var(--t3)", fontFamily: "var(--mono)" }}>
                Submitted: {new Date(savedDeliverables.submittedAt).toLocaleString()}
              </div>
            </div>
          )}

          {/* Submit deliverables form for Freelancer when job is Active */}
          {job.status === "Active" && role === "freelancer" && showSubmitForm && address && job.freelancer && address.toLowerCase() === job.freelancer.toLowerCase() && (
            <div style={{
              marginTop: 20,
              background: "var(--bg-ch)",
              border: "1px solid var(--b2)",
              borderRadius: "var(--radius)",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}>
              <h4 style={{ color: "var(--gld)", fontFamily: "var(--mono)", fontSize: "14px", margin: 0 }}>
                SUBMIT DELIVERABLES
              </h4>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="delivText" style={{ fontSize: "10px" }}>WORK DESCRIPTION / DELIVERABLES NOTES</label>
                <textarea
                  id="delivText"
                  placeholder="Describe the work done, code changes, etc..."
                  value={deliverablesText}
                  onChange={(e) => setDeliverablesText(e.target.value)}
                  style={{ minHeight: "80px", fontSize: "13px" }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="delivLink" style={{ fontSize: "10px" }}>WORK URL (GITHUB PR, HOSTED DEMO, ETC.)</label>
                <input
                  id="delivLink"
                  type="text"
                  placeholder="https://github.com/..."
                  value={deliverablesLink}
                  onChange={(e) => setDeliverablesLink(e.target.value)}
                  style={{ height: "38px", fontSize: "13px" }}
                />
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmitDeliverables}
                  disabled={isSubmittingMilestone}
                >
                  {isSubmittingMilestone ? "Submitting..." : "Submit Work & Transition Escrow"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowSubmitForm(false)}
                  disabled={isSubmittingMilestone}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            {/* Accept button or warning for freelancers when job is Open */}
            {job.status === "Open" && role === "freelancer" && (
              address && address.toLowerCase() === job.client.toLowerCase() ? (
                <div style={{
                  background: "rgba(239, 68, 68, 0.05)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "var(--radius)",
                  padding: "16px",
                  marginBottom: "16px"
                }}>
                  <h4 style={{ color: "#ef4444", fontFamily: "var(--mono)", fontSize: "14px", margin: "0 0 8px 0" }}>
                    ⚠️ Switch MetaMask Account
                  </h4>
                  <p style={{ fontSize: "13px", color: "var(--t2)", margin: 0, lineHeight: "1.4" }}>
                    Your connected wallet (<strong>{address}</strong>) is the client who created this job.
                    Clients cannot accept their own jobs. Please switch your MetaMask account to a different wallet to accept this job as a Freelancer.
                  </p>
                </div>
              ) : (
                <button className="btn btn-primary" onClick={handleAccept} disabled={isAccepting}>
                  {isAccepting ? "Accepting..." : "Accept Job"}
                </button>
              )
            )}

            {/* Submit milestone or warning for freelancers when job is Active */}
            {job.status === "Active" && role === "freelancer" && (
              address && job.freelancer && address.toLowerCase() !== job.freelancer.toLowerCase() ? (
                <div style={{
                  background: "rgba(239, 68, 68, 0.05)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "var(--radius)",
                  padding: "16px",
                  marginBottom: "16px"
                }}>
                  <h4 style={{ color: "#ef4444", fontFamily: "var(--mono)", fontSize: "14px", margin: "0 0 8px 0" }}>
                    ⚠️ Switch MetaMask Account
                  </h4>
                  <p style={{ fontSize: "13px", color: "var(--t2)", margin: 0, lineHeight: "1.4" }}>
                    You are connected with wallet <strong>{address}</strong>, but the freelancer assigned to this job is <strong>{job.freelancer}</strong>.
                    Please switch your MetaMask account to the assigned freelancer wallet to submit work.
                  </p>
                </div>
              ) : (
                !showSubmitForm && (
                  <button className="btn btn-primary" onClick={() => setShowSubmitForm(true)}>
                    Submit Milestone & Work
                  </button>
                )
              )
            )}

            {/* Release payment or warning for clients when job is Complete */}
            {job.status === "Complete" && role === "client" && (
              address && address.toLowerCase() !== job.client.toLowerCase() ? (
                <div style={{
                  background: "rgba(239, 68, 68, 0.05)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "var(--radius)",
                  padding: "16px",
                  marginBottom: "16px"
                }}>
                  <h4 style={{ color: "#ef4444", fontFamily: "var(--mono)", fontSize: "14px", margin: "0 0 8px 0" }}>
                    ⚠️ Switch MetaMask Account
                  </h4>
                  <p style={{ fontSize: "13px", color: "var(--t2)", margin: 0, lineHeight: "1.4" }}>
                    You are connected with wallet <strong>{address}</strong>, but the client who created this job is <strong>{job.client}</strong>.
                    Please switch your MetaMask account to the job client's wallet to release payment or raise a dispute.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <p style={{ fontSize: "12px", color: "var(--t2)", margin: "0 0 4px 0" }}>
                    Please review the deliverables above. If satisfied, click "Release Payment" to release the escrowed USDC.
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="btn btn-primary" onClick={handleRelease} disabled={isReleasing}>
                      {isReleasing ? "Releasing..." : "Release Payment"}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleDispute}
                      disabled={isDisputing}
                      style={{ borderColor: "rgba(248, 113, 113, 0.4)", color: "#f87171" }}
                    >
                      {isDisputing ? "Disputing..." : "Raise Dispute"}
                    </button>
                  </div>
                </div>
              )
            )}

            {/* Raise dispute button when Active (for client or freelancer) or Complete (for freelancer) */}
            {((job.status === "Active" && !showSubmitForm) || (job.status === "Complete" && role !== "client")) &&
              address &&
              ((role === "client" && address.toLowerCase() === job.client.toLowerCase()) ||
                (role === "freelancer" && job.freelancer && address.toLowerCase() === job.freelancer.toLowerCase())) && (
                <button
                  className="btn btn-secondary"
                  onClick={handleDispute}
                  disabled={isDisputing}
                  style={{ borderColor: "rgba(248, 113, 113, 0.4)", color: "#f87171" }}
                >
                  {isDisputing ? "Disputing..." : "Raise Dispute"}
                </button>
              )}

            {/* Auto release button when job is Complete and auto-release date has passed */}
            {job.status === "Complete" && Date.now() > job.autoReleaseAt && (
              <button
                className="btn btn-secondary"
                onClick={handleAutoRelease}
                disabled={isAutoReleasing}
                style={{ marginLeft: 8 }}
              >
                {isAutoReleasing ? "Releasing..." : "Trigger Auto-Release"}
              </button>
            )}

            {/* Countdown notice when auto release is pending */}
            {job.status === "Complete" && Date.now() <= job.autoReleaseAt && (
              <div style={{ marginTop: 12, fontSize: "12px", fontFamily: "var(--mono)", color: "var(--gld)" }}>
                🔒 Auto-release available in {Math.ceil((job.autoReleaseAt - Date.now()) / (1000 * 60 * 60 * 24))} days
              </div>
            )}
          </div>

          {/* Dispute details & panel */}
          {job.status === "Disputed" && (
            <div style={{
              marginTop: 20,
              background: "rgba(248, 113, 113, 0.05)",
              border: "1px solid rgba(248, 113, 113, 0.2)",
              borderRadius: "var(--radius)",
              padding: "16px"
            }}>
              {address && contractOwner && address.toLowerCase() === contractOwner.toLowerCase() ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <h4 style={{ color: "#f87171", fontFamily: "var(--mono)", fontSize: "14px", margin: 0 }}>
                    DISPUTE RESOLUTION OPERATOR
                  </h4>
                  <p style={{ fontSize: "12px", color: "var(--t2)", margin: 0 }}>
                    As the contract owner/arbitrator, you can manage the disputed status of job <strong>#{job.id}</strong>.
                  </p>
                  <div style={{
                    background: "rgba(239, 68, 68, 0.05)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "var(--radius)",
                    padding: "12px"
                  }}>
                    <p style={{ fontSize: "13px", color: "#f87171", margin: 0, lineHeight: "1.4" }}>
                      ⚠️ <strong>Feature Not Deployed:</strong> On-chain dispute resolution (`resolveDispute`) is not supported by this deployed escrow contract version on Base Sepolia.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 style={{ color: "#f87171", fontFamily: "var(--mono)", fontSize: "14px", margin: 0 }}>
                    ⚠️ CONTRACT UNDER DISPUTE
                  </h4>
                  <p style={{ fontSize: "12px", color: "var(--t2)", margin: "6px 0 0 0" }}>
                    Payment is locked in escrow. The arbitrator is reviewing the contract and will distribute funds shortly.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <MilestoneTracker status={job.status} />
      </div>
      {(flowState.isLoading || flowState.step === "done" || flowState.error) && (
        <PaymentFlow contractId={jobId || ""} totalAmount={job.amount} flowState={flowState} />
      )}
    </div>
  );
};
