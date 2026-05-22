import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import type { Role } from "../types";
import { useContract } from "../hooks/useContract";
import { ethers } from "ethers";

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

const isMockMode = import.meta.env.VITE_UGF_MOCK === "true";

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
  
  const { getMockUsdBalance } = useContract();
  const [balance, setBalance] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (isConnected && address) {
      try {
        const bal = await getMockUsdBalance(address);
        setBalance(
          Number(ethers.formatUnits(bal, 6)).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      } catch (e) {
        console.error("Failed to fetch balance in NavBar:", e);
      }
    } else {
      setBalance(null);
    }
  }, [isConnected, address, getMockUsdBalance]);

  // Handle click on Faucet
  const handleFaucetClick = async (e: React.MouseEvent) => {
    if (isMockMode) {
      e.preventDefault();
      if (!isConnected || !address) {
        alert("Please connect your wallet first.");
        return;
      }
      try {
        const balances = JSON.parse(localStorage.getItem("vaulted_mock_balances") || "{}");
        const addrLower = address.toLowerCase();
        const currentBal = BigInt(balances[addrLower] || "0");
        const faucetAmount = ethers.parseUnits("10000", 6);
        balances[addrLower] = (currentBal + faucetAmount).toString();
        localStorage.setItem("vaulted_mock_balances", JSON.stringify(balances));
        
        window.dispatchEvent(new Event("balanceUpdated"));
        alert("Faucet success! Added 10,000 Mock USD to your wallet balance.");
      } catch (err) {
        console.error("Faucet error:", err);
      }
    }
  };

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

  // Sync balance
  useEffect(() => {
    fetchBalance();

    const handleUpdate = () => {
      fetchBalance();
    };

    window.addEventListener("balanceUpdated", handleUpdate);
    window.addEventListener("roleChanged", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("balanceUpdated", handleUpdate);
      window.removeEventListener("roleChanged", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [isConnected, address, fetchBalance]);

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
          <a
            href="https://universalgasframework.com/faucets"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleFaucetClick}
            style={{
              fontFamily: "var(--mono)",
              fontSize: "12px",
              color: "var(--gld)",
              border: "1px solid var(--gld-b)",
              borderRadius: "var(--radius)",
              padding: "4px 10px",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginRight: "8px",
              textDecoration: "none"
            }}
          >
            🚰 Faucet
          </a>
          <div style={{ marginRight: 12, display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className={`nav-role-button ${userRole === "client" ? "active" : ""}`}
              onClick={() => onRoleChange && onRoleChange("client")}
              type="button"
              aria-pressed={userRole === "client"}
              title="Switch to client role"
            >
              <span style={{ fontSize: 12, opacity: 0.9 }}>Client</span>
            </button>

            <button
              className={`nav-role-button ${userRole === "freelancer" ? "active" : ""}`}
              onClick={() => onRoleChange && onRoleChange("freelancer")}
              type="button"
              aria-pressed={userRole === "freelancer"}
              title="Switch to freelancer role"
            >
              <span style={{ fontSize: 12, opacity: 0.9 }}>Freelancer</span>
            </button>
          </div>
          {isConnected && shortAddr ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {balance !== null && (
                <span className="wallet-balance" style={{
                  fontFamily: "var(--mono)",
                  fontSize: "12px",
                  color: "var(--em)",
                  background: "var(--bg-ch)",
                  border: "1px solid var(--b2)",
                  borderRadius: "var(--radius)",
                  padding: "4px 8px"
                }}>
                  {balance} MockUSD
                </span>
              )}
              <div className="wallet-pill-connected">
                <span className="wallet-pill-addr">{shortAddr}</span>
                <button className="wallet-pill-disconnect" onClick={onDisconnect}>
                  ×
                </button>
              </div>
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
