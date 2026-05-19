import React from "react";
import { Link } from "react-router-dom";

export const Home: React.FC = () => {
  return (
    <div className="home">
      <div className="hero">
        <h1>Welcome to Vaulted</h1>
        <p>
          Secure, blockchain-based freelance marketplace with escrow protection
        </p>
        <div className="cta-buttons">
          <Link to="/jobs" className="btn btn-primary">
            Browse Jobs
          </Link>
          <Link to="/post-job" className="btn btn-secondary">
            Post a Job
          </Link>
        </div>
      </div>
      <div className="features">
        <section className="feature">
          <h3>🔒 Secure Escrow</h3>
          <p>Your funds are safely held until work is completed</p>
        </section>
        <section className="feature">
          <h3>💬 Transparent Communication</h3>
          <p>Track all milestones and payments in real-time</p>
        </section>
        <section className="feature">
          <h3>⚡ Blockchain Verified</h3>
          <p>Every contract is recorded on the blockchain for permanence</p>
        </section>
      </div>
    </div>
  );
};
