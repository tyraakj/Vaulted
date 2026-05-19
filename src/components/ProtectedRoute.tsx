import React from "react";
import { Navigate } from "react-router-dom";
import type { Role } from "../types";

interface ProtectedRouteProps {
  isConnected: boolean;
  isCorrectNetwork: boolean;
  requiredRole?: Role;
  userRole?: Role;
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
  userRole,
  children,
}) => {
  // Not connected
  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  // Wrong network
  if (!isCorrectNetwork) {
    return (
      <div className="protected-route-error">
        <h2>Wrong Network</h2>
        <p>Please switch to Base Sepolia network to continue.</p>
      </div>
    );
  }

  // Role check for client-only routes
  if (requiredRole === "client" && userRole !== "client") {
    return <Navigate to="/browse" replace />;
  }

  // Role check for freelancer-only routes
  if (requiredRole === "freelancer" && userRole !== "freelancer") {
    return <Navigate to="/post-job" replace />;
  }

  return <>{children}</>;
};
