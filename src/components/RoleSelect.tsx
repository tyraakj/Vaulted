import React from "react";
import type { Role } from "../types";

interface RoleSelectProps {
  currentRole?: Role;
  onRoleChange?: (role: Role) => void;
  saveRole?: (role: Role) => void;
}

export const RoleSelect: React.FC<RoleSelectProps> = ({
  currentRole,
  onRoleChange,
  saveRole,
}) => {
  const handleRoleSelect = (role: Role) => {
    if (saveRole) saveRole(role);
    if (onRoleChange) onRoleChange(role);
  };

  return (
    <div className="role-select">
      <h3>Select Your Role</h3>
      <div className="role-options">
        <button
          className={`role-button ${currentRole === "client" ? "active" : ""}`}
          onClick={() => handleRoleSelect("client")}
          type="button"
        >
          <span>👔</span>
          <h4>Client</h4>
          <p>Post jobs and hire freelancers</p>
        </button>
        <button
          className={`role-button ${currentRole === "freelancer" ? "active" : ""}`}
          onClick={() => handleRoleSelect("freelancer")}
          type="button"
        >
          <span>💼</span>
          <h4>Freelancer</h4>
          <p>Find jobs and earn</p>
        </button>
      </div>
    </div>
  );
};
