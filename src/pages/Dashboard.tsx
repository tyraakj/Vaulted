import React, { useState, useEffect } from "react";
import { useWallet } from "../hooks/useWallet";
import { useRole } from "../hooks/useRole";
import { MilestoneTracker } from "../components/MilestoneTracker";

export const Dashboard: React.FC = () => {
  const { address, isConnected } = useWallet();
  const { role } = useRole();
  const [stats, setStats] = useState({
    activeContracts: 0,
    completedJobs: 0,
    earnings: 0,
    reputation: 0,
  });

  useEffect(() => {
    if (isConnected && address) {
      loadDashboardData();
    }
  }, [isConnected, address]);

  const loadDashboardData = async () => {
    try {
      // TODO: Load dashboard data from contract
      console.log("Loading dashboard data...");
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    }
  };

  if (!isConnected) {
    return (
      <div className="dashboard">
        <p>Please connect your wallet</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Role: {role}</p>
      <p>Wallet: {address}</p>
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
          <h3>Earnings</h3>
          <p className="stat-value">${stats.earnings}</p>
        </div>
        <div className="stat-card">
          <h3>Reputation</h3>
          <p className="stat-value">{stats.reputation}</p>
        </div>
      </div>
      <MilestoneTracker milestones={[]} />
    </div>
  );
};
