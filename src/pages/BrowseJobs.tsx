import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { JobCard } from "../components/JobCard";
import { Job } from "../types";

export const BrowseJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // TODO: Fetch jobs from contract
      console.log("Fetching jobs...");
      setJobs([]);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="browse-jobs">
      <h1>Browse Jobs</h1>
      <div className="filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All Jobs</option>
          <option value="Open">Open</option>
          <option value="Active">Active</option>
          <option value="Complete">Complete</option>
        </select>
      </div>
      {loading ? (
        <p>Loading jobs...</p>
      ) : (
        <div className="jobs-grid">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <Link key={job.id} to={`/job/${job.id}`}>
                <JobCard job={job} />
              </Link>
            ))
          ) : (
            <p>No jobs found</p>
          )}
        </div>
      )}
    </div>
  );
};
