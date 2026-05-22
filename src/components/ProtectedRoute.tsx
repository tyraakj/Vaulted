import React from "react";
import type { Role } from "../types";
import { useRole } from "../hooks/useRole";
import { useWallet } from "../hooks/useWallet";

interface ProtectedRouteProps {
  isConnected: boolean;
  isCorrectNetwork: boolean;
  requiredRole?: Role;
  children: React.ReactNode;
}

/**
 * LAYER 7 - SECURITY LAYER
 * Frontend role-based route protection
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isConnected,
  isCorrectNetwork,
  requiredRole,
  children,
}) => {
  const { role, saveRole } = useRole();
  const { connect, isLoading } = useWallet();

  // 1. Not connected
  if (!isConnected) {
    return (
      <div className="container" style={{ maxWidth: "600px", margin: "80px auto", padding: "0 20px" }}>
        <div style={{
          background: "var(--bg-c)",
          border: "1px solid var(--b2)",
          borderRadius: "var(--radius-lg)",
          padding: "40px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 16px var(--em-glow)"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔌</div>
          <h2 style={{ fontFamily: "var(--display)", textTransform: "uppercase", fontSize: "20px", color: "var(--em)", marginBottom: "12px" }}>
            Wallet Connection Required
          </h2>
          <p style={{ color: "var(--t2)", fontSize: "14px", marginBottom: "24px", lineHeight: "1.5" }}>
            Please connect your Web3 wallet (Base Sepolia) to access this page.
          </p>
          <button className="btn btn-primary" onClick={connect} disabled={isLoading}>
            {isLoading ? "Connecting..." : "CONNECT WALLET"}
          </button>
        </div>
      </div>
    );
  }

  // 2. Wrong network
  if (!isCorrectNetwork) {
    return (
      <div className="container" style={{ maxWidth: "600px", margin: "80px auto", padding: "0 20px" }}>
        <div style={{
          background: "var(--bg-c)",
          border: "1px solid var(--b2)",
          borderRadius: "var(--radius-lg)",
          padding: "40px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 16px var(--em-glow)"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <h2 style={{ fontFamily: "var(--display)", textTransform: "uppercase", fontSize: "20px", color: "#f87171", marginBottom: "12px" }}>
            Wrong Network
          </h2>
          <p style={{ color: "var(--t2)", fontSize: "14px", marginBottom: "24px", lineHeight: "1.5" }}>
            Your wallet is on the wrong network. Vaulted runs on Base Sepolia.
          </p>
          <button className="btn btn-primary" onClick={() => {
            const w = (window as any).ethereum;
            if (w) {
              w.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: `0x${(84532).toString(16)}` }],
              }).catch(() => {});
            }
          }}>
            SWITCH TO BASE SEPOLIA
          </button>
        </div>
      </div>
    );
  }

  // 3. No role selected
  if (requiredRole && !role) {
    return (
      <div className="container" style={{ maxWidth: "600px", margin: "80px auto", padding: "0 20px" }}>
        <div style={{
          background: "var(--bg-c)",
          border: "1px solid var(--b2)",
          borderRadius: "var(--radius-lg)",
          padding: "40px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 16px var(--em-glow)"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>👤</div>
          <h2 style={{ fontFamily: "var(--display)", textTransform: "uppercase", fontSize: "20px", color: "var(--gld)", marginBottom: "12px" }}>
            Select Your Role Profile
          </h2>
          <p style={{ color: "var(--t2)", fontSize: "14px", marginBottom: "24px", lineHeight: "1.5" }}>
            Choose how you want to interact with Vaulted.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={() => saveRole("client")}>
              Client Profile
            </button>
            <button className="btn btn-secondary" onClick={() => saveRole("freelancer")}>
              Freelancer Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Role mismatch
  if (requiredRole === "client" && role !== "client") {
    return (
      <div className="container" style={{ maxWidth: "600px", margin: "80px auto", padding: "0 20px" }}>
        <div style={{
          background: "var(--bg-c)",
          border: "1px solid var(--b2)",
          borderRadius: "var(--radius-lg)",
          padding: "40px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 16px var(--em-glow)"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>💼</div>
          <h2 style={{ fontFamily: "var(--display)", textTransform: "uppercase", fontSize: "20px", color: "var(--gld)", marginBottom: "12px" }}>
            Client Access Only
          </h2>
          <p style={{ color: "var(--t2)", fontSize: "14px", marginBottom: "24px", lineHeight: "1.5" }}>
            This page is reserved for clients to deploy escrow contracts. Your current active profile is set to Freelancer.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={() => saveRole("client")}>
              SWITCH TO CLIENT PROFILE
            </button>
            <button className="btn btn-secondary" onClick={() => window.history.back()}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (requiredRole === "freelancer" && role !== "freelancer") {
    return (
      <div className="container" style={{ maxWidth: "600px", margin: "80px auto", padding: "0 20px" }}>
        <div style={{
          background: "var(--bg-c)",
          border: "1px solid var(--b2)",
          borderRadius: "var(--radius-lg)",
          padding: "40px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 16px var(--em-glow)"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🛠️</div>
          <h2 style={{ fontFamily: "var(--display)", textTransform: "uppercase", fontSize: "20px", color: "var(--gld)", marginBottom: "12px" }}>
            Freelancer Access Only
          </h2>
          <p style={{ color: "var(--t2)", fontSize: "14px", marginBottom: "24px", lineHeight: "1.5" }}>
            This page is reserved for freelancers. Your current active profile is set to Client.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={() => saveRole("freelancer")}>
              SWITCH TO FREELANCER PROFILE
            </button>
            <button className="btn btn-secondary" onClick={() => window.history.back()}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
