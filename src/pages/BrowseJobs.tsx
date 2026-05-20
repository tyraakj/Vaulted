import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { JobCard } from "../components/JobCard";
import { Job } from "../types";

export const BrowseJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // TODO: Fetch escrow contracts from protocol
      console.log("Fetching escrow market feed...");
      setJobs([]);
    } catch (error) {
      console.error("Failed to fetch contracts:", error);
    } finally {
      setLoading(false);
    }
  };

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
        <select defaultValue="all-stacks">
          <option value="all-stacks">Tech Stack: All</option>
          <option value="solidity">Solidity</option>
          <option value="rust">Rust</option>
          <option value="react">React / Next.js</option>
          <option value="cairo">Cairo</option>
        </select>
        <select defaultValue="any-budget">
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
      ) : (
        <div className="jobs-grid">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <Link key={job.id} to={`/job/${job.id}`}>
                <JobCard job={job} />
              </Link>
            ))
          ) : (
            <div className="empty-state">No open contracts on Base Sepolia</div>
          )}
        </div>
      )}
    </div>
  );
};
