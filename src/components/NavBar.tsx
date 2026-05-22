import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import type { Role } from "../types";

// GSAP loaded via CDN in index.html — declare global
declare const gsap: any;

interface NavBarProps {
  isConnected: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  address?: string | null;
  userRole?: Role;
  onRoleChange?: (role: Role) => void;
}

export const NavBar: React.FC<NavBarProps> = ({
  isConnected,
  onConnect,
  onDisconnect,
  address,
  userRole,
  onRoleChange,
}) => {
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  // GSAP: slide navbar in on mount
  useEffect(() => {
    if (typeof gsap !== "undefined" && navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -64, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
      );
    }
  }, []);

  // GSAP: highlight active link with a quick scale ping
  useEffect(() => {
    if (typeof gsap !== "undefined") {
      const active = document.querySelector(".nav-links.active");
      if (active) {
        gsap.fromTo(
          active,
          { scale: 0.92 },
          { scale: 1, duration: 0.3, ease: "back.out(2)" },
        );
      }
    }
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const shortAddr = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          VAULTED
        </Link>

        {/* Centre nav links */}
        <ul className="nav-menu">
          <li className="nav-item">
            <Link
              to="/"
              className={`nav-links ${isActive("/") ? "active" : ""}`}
            >
              PLATFORM
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/browse"
              className={`nav-links ${isActive("/browse") ? "active" : ""}`}
            >
              ESCROW
            </Link>
          </li>
          {userRole === "client" && (
            <li className="nav-item">
              <Link
                to="/post-job"
                className={`nav-links ${isActive("/post-job") ? "active" : ""}`}
              >
                NEW CONTRACT
              </Link>
            </li>
          )}
          <li className="nav-item">
            <Link
              to="/dashboard"
              className={`nav-links ${isActive("/dashboard") ? "active" : ""}`}
            >
              DASHBOARD
            </Link>
          </li>
        </ul>

        {/* Right — network badge + wallet */}
        <div className="navbar-right">
          <div className="network-badge">BASE_SEPOLIA</div>
          <div style={{ marginRight: 12, display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className={`role-button ${userRole === "client" ? "active" : ""}`}
              onClick={() => onRoleChange && onRoleChange("client")}
              type="button"
              aria-pressed={userRole === "client"}
              title="Switch to client role"
            >
              <span style={{ fontSize: 12, opacity: 0.9 }}>Client</span>
            </button>

            <button
              className={`role-button ${userRole === "freelancer" ? "active" : ""}`}
              onClick={() => onRoleChange && onRoleChange("freelancer")}
              type="button"
              aria-pressed={userRole === "freelancer"}
              title="Switch to freelancer role"
            >
              <span style={{ fontSize: 12, opacity: 0.9 }}>Freelancer</span>
            </button>
          </div>
          {isConnected && shortAddr ? (
            <div className="wallet-pill-connected">
              <span className="wallet-pill-addr">{shortAddr}</span>
              <button className="wallet-pill-disconnect" onClick={onDisconnect}>
                ×
              </button>
            </div>
          ) : (
            <button className="nav-links-mobile" onClick={onConnect}>
              CONNECT WALLET
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
