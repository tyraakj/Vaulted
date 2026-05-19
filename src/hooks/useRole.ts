import { useState, useCallback } from "react";
import type { Role } from "../types";

export const useRole = () => {
  const [role, setRole] = useState<Role>(null);

  const saveRole = useCallback((newRole: Role) => {
    setRole(newRole);
    if (newRole) {
      localStorage.setItem("userRole", newRole);
    }
  }, []);

  const clearRole = useCallback(() => {
    setRole(null);
    localStorage.removeItem("userRole");
  }, []);

  const initializeRole = useCallback(() => {
    const savedRole = localStorage.getItem("userRole") as Role;
    if (savedRole === "client" || savedRole === "freelancer") {
      setRole(savedRole);
    }
  }, []);

  return {
    role,
    saveRole,
    clearRole,
    initializeRole,
  };
};
