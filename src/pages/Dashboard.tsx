import React, { useState, useEffect } from "react";
import { useWallet } from "../hooks/useWallet";
import { useRole } from "../hooks/useRole";
import { MilestoneTracker } from "../components/MilestoneTracker";
import { useContract } from "../hooks/useContract";

export const Dashboard: React.FC = () => {
  const { address, isConnected } = useWallet();
  const { role } = useRole();
  const [stats, setStats] = useState({
    activeContracts: 0,
    completedJobs: 0,
    earnings: 0,
    reputation: 0,
  });
  const { getAllJobs } = useContract();

  useEffect(() => {
    if (isConnected && address) {
      loadDashboardData();
    }
  }, [isConnected, address]);

  const loadDashboardData = async () => {
    try {
      // Load on-chain job data and summarize
      const jobs = await getAllJobs();
      const activeContracts = jobs.filter((j) => j.status === "Open" || j.status === "Active").length;
      const completedJobs = jobs.filter((j) => j.status === "Complete" || j.status === "Released").length;
      const earnings = jobs
        .filter((j) => j.status === "Released")
        .reduce((sum, j) => sum + Number(j.amount || 0), 0);

      setStats({
        activeContracts,
        completedJobs,
        earnings,
        reputation: 0,
      });
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    }
  };

  if (!isConnected) {
    return (
      <div className="dashboard">
        <div className="empty-state">
          <p>Connect your wallet to access the operator dashboard.</p>
        </div>
      </div>
    );
  }

  const shortAddr = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "—";

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="dash-sub">
        {role?.toUpperCase() ?? "OPERATOR"} · {shortAddr} · BASE_SEPOLIA
      </p>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Active Contracts</h3>
          <p className="stat-value">{stats.activeContracts}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Jobs</h3>
          <p className="stat-value">{stats.completedJobs}</p>
        </div>
        <div className="stat-card">
          <h3>Earnings (USDC)</h3>
          <p className="stat-value">{stats.earnings.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Reputation</h3>
          <p className="stat-value">{stats.reputation}</p>
        </div>
      </div>

      {/* Milestones */}
      <MilestoneTracker milestones={[]} />
    </div>
  );
};
