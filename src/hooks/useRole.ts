import { useState, useCallback } from "react";
import type { Role } from "../types";

export const useRole = () => {
  const [role, setRole] = useState<Role>(() => {
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("userRole");
      if (savedRole === "client" || savedRole === "freelancer") {
        return savedRole as Role;
      }
    }
    return null;
  });

  const saveRole = useCallback((newRole: Role) => {
    setRole(newRole);
    if (newRole) {
      localStorage.setItem("userRole", newRole);
    } else {
      localStorage.removeItem("userRole");
    }
  }, []);

  const clearRole = useCallback(() => {
    setRole(null);
    localStorage.removeItem("userRole");
  }, []);

  return {
    role,
    saveRole,
    clearRole,
  };
  };
};
