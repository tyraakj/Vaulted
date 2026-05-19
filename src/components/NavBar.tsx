import React from "react";
import { Link } from "react-router-dom";

import type { Role } from "../types";

interface NavBarProps {
  isConnected: boolean;
  onConnect?: () => void;
  userRole?: Role;
}

export const NavBar: React.FC<NavBarProps> = ({
  isConnected,
  onConnect,
  userRole,
}) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Vaulted
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-links">
              Home
            </Link>
          </li>
          <li className="nav-item">
            {userRole === "client" ? (
              <Link to="/post-job" className="nav-links">
                Post Job
              </Link>
            ) : (
              <Link to="/browse" className="nav-links">
                Browse Jobs
              </Link>
            )}
          </li>
          <li className="nav-item">
            <Link to="/dashboard" className="nav-links">
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            {isConnected ? (
              <button className="nav-links-mobile">Connected</button>
            ) : (
              <button className="nav-links-mobile" onClick={onConnect}>
                Connect Wallet
              </button>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};
