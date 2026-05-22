import { useState, useCallback, useEffect } from "react";
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

  useEffect(() => {
    const handleRoleChange = () => {
      const savedRole = localStorage.getItem("userRole");
      if (savedRole === "client" || savedRole === "freelancer") {
        setRole(savedRole as Role);
      } else {
        setRole(null);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("roleChanged", handleRoleChange);
      window.addEventListener("storage", handleRoleChange);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("roleChanged", handleRoleChange);
        window.removeEventListener("storage", handleRoleChange);
      }
    };
  }, []);

  const initializeRole = useCallback(() => {
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("userRole");
      if (savedRole === "client" || savedRole === "freelancer") {
        setRole(savedRole as Role);
      }
    }
  }, []);

  const saveRole = useCallback((newRole: Role) => {
    setRole(newRole);
    if (newRole) {
      localStorage.setItem("userRole", newRole);
    } else {
      localStorage.removeItem("userRole");
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("roleChanged"));
    }
  }, []);

  const clearRole = useCallback(() => {
    setRole(null);
    localStorage.removeItem("userRole");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("roleChanged"));
    }
  }, []);

  return {
    role,
    saveRole,
    clearRole,
    initializeRole,
  };
};

