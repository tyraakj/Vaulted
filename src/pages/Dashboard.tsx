import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import { useRole } from "../hooks/useRole";
import { useContract } from "../hooks/useContract";
import { RoleSelect } from "../components/RoleSelect";
import { JobCard } from "../components/JobCard";
import type { Job } from "../types";
import { ethers } from "ethers";

export const Dashboard: React.FC = () => {
  const { address, isConnected } = useWallet();
  const { role, saveRole } = useRole();
  const [stats, setStats] = useState({
    activeContracts: 0,
    completedJobs: 0,
    earnings: 0,
    reputation: 0,
  });
  const [walletBalance, setWalletBalance] = useState("0");
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const { getAllJobs, getMockUsdBalance } = useContract();

  useEffect(() => {
    if (isConnected && address) {
      loadDashboardData();
    }

    const handleUpdate = () => {
      if (isConnected && address) {
        loadDashboardData();
      }
    };

    window.addEventListener("balanceUpdated", handleUpdate);
    return () => {
      window.removeEventListener("balanceUpdated", handleUpdate);
    };
  }, [isConnected, address, role]);

  const loadDashboardData = async () => {
    try {
      if (!address || !role) return;
      // Load on-chain job data and summarize
      const [jobs, bal] = await Promise.all([
        getAllJobs(),
        getMockUsdBalance(address),
      ]);
      
      const balFormatted = Number(ethers.formatUnits(bal, 6)).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setWalletBalance(balFormatted);

      const userAddress = address.toLowerCase();

      // Filter jobs based on role
      const userJobs = jobs.filter((j) => {
        if (role === "client") {
          return j.client.toLowerCase() === userAddress;
        } else {
          return j.freelancer && j.freelancer.toLowerCase() === userAddress;
        }
      });

      const activeContracts = userJobs.filter(
        (j) => j.status === "Open" || j.status === "Active" || j.status === "Disputed"
      ).length;

      const completedJobs = userJobs.filter(
        (j) => j.status === "Complete" || j.status === "Released"
      ).length;

      let earnings = 0;
      if (role === "client") {
        // total funded amount by client
        earnings = userJobs.reduce((sum, j) => sum + Number(j.amount || 0), 0);
      } else {
        // freelancer earnings (only released jobs)
        earnings = userJobs
          .filter((j) => j.status === "Released")
          .reduce((sum, j) => sum + Number(j.amount || 0), 0);
      }

      const reputation = completedJobs * 10;

      setStats({
        activeContracts,
        completedJobs,
        earnings,
        reputation,
      });
      setMyJobs(userJobs);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    }
  };

  if (!isConnected) {
    return (
      <div className="dashboard">
        <div className="empty-state" style={{
          background: "var(--bg-c)",
          border: "1px dashed var(--b1)",
          borderRadius: "var(--radius-lg)",
          padding: "48px",
          textAlign: "center",
          marginTop: "24px"
        }}>
          <p style={{ color: "var(--t2)", marginBottom: "16px" }}>Connect your wallet to access the operator dashboard.</p>
        </div>
      </div>
    );
  }

  if (role === null) {
    return (
      <div className="dashboard">
        <h1>Dashboard</h1>
        <p className="dash-sub">
          Please select your active role profile to view metrics.
        </p>
        <div style={{ marginTop: 24, maxWidth: 500 }}>
          <RoleSelect currentRole={role} onRoleChange={saveRole} saveRole={saveRole} />
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
        {role.toUpperCase()} · {shortAddr} · BASE_SEPOLIA
      </p>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Wallet Balance</h3>
          <p className="stat-value" style={{ color: "var(--em)" }}>{walletBalance} USDC</p>
        </div>
        <div className="stat-card">
          <h3>Active Contracts</h3>
          <p className="stat-value">{stats.activeContracts}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Jobs</h3>
          <p className="stat-value">{stats.completedJobs}</p>
        </div>
        <div className="stat-card">
          <h3>{role === "client" ? "Total Funded (USDC)" : "Earnings (USDC)"}</h3>
          <p className="stat-value">{stats.earnings.toLocaleString()} USDC</p>
        </div>
        <div className="stat-card">
          <h3>Reputation Score</h3>
          <p className="stat-value" style={{ color: "var(--gld)" }}>{stats.reputation}</p>
        </div>
      </div>

      {/* Dynamic Contracts feed */}
      <div style={{ marginTop: "40px" }}>
        <h2 style={{
          fontFamily: "var(--display)",
          fontSize: "24px",
          fontWeight: 900,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginBottom: "20px",
          borderBottom: "1px solid var(--b2)",
          paddingBottom: "10px"
        }}>
          Your Contracts
        </h2>

        {myJobs.length > 0 ? (
          <div className="jobs-grid">
            {myJobs.map((job) => (
              <Link key={job.id} to={`/job/${job.id}`} style={{ textDecoration: "none" }}>
                <JobCard job={job} />
              </Link>
            ))}
          </div>
        ) : (
          <div style={{
            background: "var(--bg-c)",
            border: "1px dashed var(--b2)",
            borderRadius: "var(--radius-lg)",
            padding: "48px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px"
          }}>
            <p style={{ color: "var(--t2)", margin: 0, fontSize: "15px" }}>
              {role === "client" 
                ? "You have not deployed any escrow contracts yet." 
                : "You have not accepted any escrow contracts yet."}
            </p>
            {role === "client" ? (
              <Link to="/post-job" className="btn btn-primary" style={{ display: "inline-flex" }}>
                Deploy New Contract
              </Link>
            ) : (
              <Link to="/browse" className="btn btn-primary" style={{ display: "inline-flex" }}>
                Browse Contract Feed
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

