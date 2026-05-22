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
  const statusStyles: Record<
    JobStatus,
    { background: string; color: string; border: string }
  > = {
    Open: {
      background: "rgba(16, 185, 129, 0.13)",
      color: "#10b981",
      border: "1px solid rgba(16, 185, 129, 0.35)",
    },
    Active: {
      background: "rgba(99, 102, 241, 0.13)",
      color: "#6366f1",
      border: "1px solid rgba(99, 102, 241, 0.3)",
    },
    Complete: {
      background: "rgba(245, 158, 11, 0.12)",
      color: "#f59e0b",
      border: "1px solid rgba(245, 158, 11, 0.35)",
    },
    Released: {
      background: "rgba(168, 85, 247, 0.12)",
      color: "#a855f7",
      border: "1px solid rgba(168, 85, 247, 0.3)",
    },
    Disputed: {
      background: "rgba(248, 113, 113, 0.12)",
      color: "#f87171",
      border: "1px solid rgba(248, 113, 113, 0.3)",
    },
  };

  const style = statusStyles[status] || statusStyles.Open;

  return (
    <span
      className={`status-badge status-badge-${size} status-${status}`}
      style={style}
    >
      {status.toUpperCase()}
    </span>
  );
};
