import React from "react";
import { Navigate } from "react-router-dom";
import type { Role } from "../types";
import { useRole } from "../hooks/useRole";

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
  // Role MUST come exclusively from the `useRole()` hook
  const { role } = useRole();
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
  // If role not selected, send user to role selection (home)
  if (!role) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === "client" && role !== "client") {
    return <Navigate to="/browse" replace />;
  }

  // Role check for freelancer-only routes
  if (requiredRole === "freelancer" && role !== "freelancer") {
    return <Navigate to="/post-job" replace />;
  }

  return <>{children}</>;
};
