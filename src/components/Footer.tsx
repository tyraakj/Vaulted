import React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">Vaulted</div>
          <p>
            Secure, on-chain escrow for freelancers and clients. No middlemen.
            No platform cuts. Just work and payment.
          </p>
          <div className="footer-badge">Live on Base Sepolia</div>
        </div>

        <div className="footer-col">
          <h4>Platform</h4>
          <ul>
            <li>
              <Link to="/browse">Browse Jobs</Link>
            </li>
            <li>
              <Link to="/post-job">Post a Job</Link>
            </li>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Protocol</h4>
          <ul>
            <li>
              <a href="#">Smart Contract</a>
            </li>
            <li>
              <a href="#">UGF Gasless Tx</a>
            </li>
            <li>
              <a href="#">Base Sepolia</a>
            </li>
            <li>
              <a href="#">Audit Report</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 VAULTED_OS · Built on Base Sepolia</p>
        <div className="footer-bottom-links">
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </footer>
  );
};
