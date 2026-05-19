import React from "react";
import type { JobStatus } from "../types";

interface StatusBadgeProps {
  status: JobStatus;
  size?: "small" | "medium" | "large";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "medium",
}) => {
  const statusColors: Record<JobStatus, string> = {
    Open: "#4CAF50",
    Active: "#2196F3",
    Complete: "#8BC34A",
    Released: "#4CAF50",
    Disputed: "#FF9800",
  };

  const statusLabels: Record<JobStatus, string> = {
    Open: "Open",
    Active: "Active",
    Complete: "Complete",
    Released: "Released",
    Disputed: "Disputed",
  };

  return (
    <span
      className={`status-badge status-badge-${size}`}
      style={{ backgroundColor: statusColors[status] }}
    >
      {statusLabels[status]}
    </span>
  );
};
