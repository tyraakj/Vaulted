import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { JobCard } from "../components/JobCard";
import { Job } from "../types";
import { useContract } from "../hooks/useContract";
import { useWallet } from "../hooks/useWallet";

export const BrowseJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [stackFilter, setStackFilter] = useState("all-stacks");
  const [budgetFilter, setBudgetFilter] = useState("any-budget");
  
  const { getAllJobs } = useContract();
  const { isConnected, connect } = useWallet();

  useEffect(() => {
    if (isConnected) fetchJobs();
  }, [isConnected]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const all = await getAllJobs();
      setJobs(all || []);
    } catch (error) {
      console.error("Failed to fetch contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    // Status filter
    if (filter !== "All" && job.status !== filter) {
      return false;
    }

    // Stack filter (simple description/title check)
    if (stackFilter !== "all-stacks") {
      const text = `${job.title} ${job.description}`.toLowerCase();
      if (stackFilter === "solidity" && !text.includes("solidity")) return false;
      if (stackFilter === "rust" && !text.includes("rust")) return false;
      if (stackFilter === "react" && !text.includes("react") && !text.includes("next.js")) return false;
      if (stackFilter === "cairo" && !text.includes("cairo")) return false;
    }

    // Budget filter
    if (budgetFilter !== "any-budget") {
      const amount = job.amount;
      if (budgetFilter === "0-5k" && amount > 5000) return false;
      if (budgetFilter === "5k-25k" && (amount < 5000 || amount > 25000)) return false;
      if (budgetFilter === "25k+" && amount < 25000) return false;
    }

    return true;
  });

  return (
    <div className="browse-jobs">
      <div className="page-header">
        <h1>Escrow Market Feed</h1>
      </div>

      <div className="filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All Contracts</option>
          <option value="Open">Open</option>
          <option value="Active">Active</option>
          <option value="Complete">Complete</option>
        </select>
        <select value={stackFilter} onChange={(e) => setStackFilter(e.target.value)}>
          <option value="all-stacks">Tech Stack: All</option>
          <option value="solidity">Solidity</option>
          <option value="rust">Rust</option>
          <option value="react">React / Next.js</option>
          <option value="cairo">Cairo</option>
        </select>
        <select value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)}>
          <option value="any-budget">Budget: Any</option>
          <option value="0-5k">$0 – $5k USDC</option>
          <option value="5k-25k">$5k – $25k USDC</option>
          <option value="25k+">$25k+ USDC</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="processing-spinner" />
          LOADING_CONTRACTS...
        </div>
      ) : !isConnected ? (
        <div className="empty-state" style={{
          background: "var(--bg-c)",
          border: "1px dashed var(--b2)",
          borderRadius: "var(--radius-lg)",
          padding: "48px",
          textAlign: "center",
          marginTop: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px"
        }}>
          <p style={{ color: "var(--t2)", margin: 0, fontSize: "15px" }}>Please connect your wallet to view on-chain contracts.</p>
          <button className="btn btn-primary" onClick={() => connect()}>Connect Wallet</button>
        </div>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <Link key={job.id} to={`/job/${job.id}`}>
                <JobCard job={job} />
              </Link>
            ))
          ) : (
            <div className="empty-state" style={{
              gridColumn: "1 / -1",
              background: "var(--bg-c)",
              border: "1px dashed var(--b2)",
              borderRadius: "var(--radius-lg)",
              padding: "48px",
              textAlign: "center"
            }}>
              <p style={{ color: "var(--t2)", margin: 0, fontSize: "15px" }}>No matching contracts on Base Sepolia</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
