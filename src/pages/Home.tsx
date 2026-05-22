import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { CONTRACT_ADDRESS, MOCK_USD_ADDRESS } from "../lib/constants";

export const Home: React.FC = () => {
  const spineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (spineRef.current) spineRef.current.style.transform = "scaleY(1)";
    const steps = document.querySelectorAll<HTMLElement>(".wf-step");
    const nodes = document.querySelectorAll<HTMLElement>(".wf-node");
    const visuals = document.querySelectorAll<HTMLElement>(".wf-visual");
    const fcards = document.querySelectorAll<HTMLElement>(".feature");
    steps.forEach((el, i) => {
      setTimeout(
        () => {
          el.style.opacity = "1";
          el.style.transform = "translateX(0)";
        },
        200 + i * 150,
      );
    });
    nodes.forEach((el, i) => {
      setTimeout(
        () => {
          el.style.transform = "scale(1)";
        },
        250 + i * 150,
      );
    });
    visuals.forEach((el, i) => {
      setTimeout(
        () => {
          el.style.opacity = "1";
          el.style.transform = "translateX(0)";
        },
        350 + i * 150,
      );
    });
    fcards.forEach((el, i) => {
      setTimeout(
        () => {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        },
        100 + i * 80,
      );
    });
  }, []);

  return (
    <div className="home">
      {/* ── HERO ── */}
      <div className="hero">
        <div className="hero-float-cards">
          <div className="hfc hfc-1">
            <div className="hfc-label">ESCROW_LOCKED</div>
            <div className="hfc-val gld">+15,000 USDC</div>
            <div className="hfc-addr">{CONTRACT_ADDRESS ? `${CONTRACT_ADDRESS.slice(0,6)}...${CONTRACT_ADDRESS.slice(-4)}` : "Contract"} → Contract</div>
            <div className="hfc-bar">
              <div className="hfc-bar-fill gld" style={{ width: "100%" }}></div>
            </div>
            <div className="hfc-badges">
              <span className="hfc-badge em">CONFIRMED</span>
              <span className="hfc-badge gld">LOCKED</span>
            </div>
          </div>
          <div className="hfc hfc-2">
            <div className="hfc-label">SETTLEMENT_EXEC</div>
            <div className="hfc-val gld">+6,000 USDC</div>
            <div className="hfc-addr">→ {MOCK_USD_ADDRESS ? `${MOCK_USD_ADDRESS.slice(0,6)}...${MOCK_USD_ADDRESS.slice(-4)}` : "Token"}</div>
            <div className="hfc-bar">
              <div className="hfc-bar-fill gld" style={{ width: "100%" }}></div>
            </div>
            <div className="hfc-badges">
              <span className="hfc-badge gld">COMPLETE</span>
              <span className="hfc-badge em">GASLESS</span>
            </div>
          </div>
          <div className="hfc hfc-3">
            <div className="hfc-label">MILESTONE 3/5</div>
            <div className="hfc-val sap">60%</div>
            <div className="hfc-addr">9,000 of 15,000 USDC</div>
            <div className="hfc-bar">
              <div className="hfc-bar-fill sap" style={{ width: "60%" }}></div>
            </div>
            <div className="hfc-badges">
              <span className="hfc-badge sap">ACTIVE</span>
            </div>
          </div>
          <div className="hfc hfc-4">
            <div className="hfc-label">GAS_FEES</div>
            <div className="hfc-val em">0 ETH</div>
            <div className="hfc-addr">UGF absorbs all costs</div>
            <div className="hfc-bar">
              <div className="hfc-bar-fill em" style={{ width: "0%" }}></div>
            </div>
            <div className="hfc-badges">
              <span className="hfc-badge em">META-TX</span>
            </div>
          </div>
        </div>

        <div className="hero-tag">VAULTED_OS v1.0 · Base Sepolia</div>
        <h1>
          Post. Work. Get Paid.
          <br />
          <span className="highlight">No Middlemen.</span>
        </h1>
        <p>
          No cuts. No holds. No gatekeepers.
          <br />
          Your payment is locked the moment work starts — released the moment
          it's done.
        </p>
        <div className="cta-buttons">
          <Link to="/browse" className="btn btn-primary">
            Browse Jobs
          </Link>
          <Link to="/post-job" className="btn btn-secondary">
            Post a Job
          </Link>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div className="sec-label">Core Capabilities</div>
      <h2 className="sec-title">
        Built <span className="gold">Different</span>
      </h2>
      <p className="sec-sub">
        Every layer of Vaulted is engineered for one purpose — a payment
        infrastructure that traditional platforms simply can't match.
      </p>

      <div className="features">
        <div className="feature">
          <div className="feature-icon">⛓</div>
          <div className="feature-stat">0%</div>
          <div className="feature-stat-label">Gas Fees</div>
          <h3>Zero-Cost Payouts</h3>
          <p>
            UGF's relayer network absorbs every gas fee. Freelancers receive
            exactly what they earned — nothing deducted.
          </p>
          <span className="feature-tag">Meta-TX Enabled</span>
        </div>
        <div className="feature">
          <div className="feature-icon gold">🔒</div>
          <div className="feature-stat gold">100%</div>
          <div className="feature-stat-label">Non-Custodial</div>
          <h3>Payment that keeps its promise</h3>
          <p>
            Funds never touch our servers. Smart contracts hold escrow
            autonomously — no platform approval required.
          </p>
          <span className="feature-tag gold">On-Chain Verified</span>
        </div>
        <div className="feature">
          <div className="feature-icon sap">⚡</div>
          <div className="feature-stat sap">&lt;2s</div>
          <div className="feature-stat-label">Settlement Time</div>
          <h3>Instant Finality</h3>
          <p>
            Base L2 infrastructure delivers sub-second confirmation. Funds move
            in the same block as approval.
          </p>
          <span className="feature-tag sap">Base L2 Powered</span>
        </div>
      </div>

      <div className="features-wide">
        <div className="feature">
          <div
            style={{ display: "flex", alignItems: "flex-start", gap: "18px" }}
          >
            <div className="feature-icon" style={{ flexShrink: 0 }}>
              🛡
            </div>
            <div>
              <h3>Decentralized Dispute Resolution</h3>
              <p>
                No support tickets. No biased arbitrators. On-chain dispute
                logic — immutable, transparent, and final.
              </p>
              <span
                className="feature-tag"
                style={{ marginTop: "14px", display: "inline-flex" }}
              >
                DAO Governed
              </span>
            </div>
          </div>
        </div>
        <div className="feature">
          <div
            style={{ display: "flex", alignItems: "flex-start", gap: "18px" }}
          >
            <div className="feature-icon gold" style={{ flexShrink: 0 }}>
              ⏱
            </div>
            <div>
              <h3>7-Day Auto-Release</h3>
              <p>
                Clients can't hold payment hostage. If no action is taken after
                approval, funds release automatically.
              </p>
              <span
                className="feature-tag gold"
                style={{ marginTop: "14px", display: "inline-flex" }}
              >
                Automated
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="section-divider"></div>

      {/* ── WORKFLOW ── */}
      <div className="sec-label">End-to-End Flow</div>
      <h2 className="sec-title">
        How It <span className="em">Works</span>
      </h2>
      <p className="sec-sub">
        From posting a contract to getting paid — every step is transparent and
        settled on-chain.
      </p>

      <div className="workflow">
        <div className="wf-spine" ref={spineRef}></div>
        <div className="wf-steps">
          <div className="wf-step">
            <div className="wf-node wn-em">1</div>
            <div className="wf-step-inner">
              <div className="wf-content">
                <span className="wf-tag wt-em">Deploy</span>
                <h3>Client Posts a Contract</h3>
                <p>
                  The client defines scope, milestones, and budget in Mock USD.
                  A single transaction deploys the smart contract and locks
                  funds — no ETH needed, no intermediary approval.
                </p>
                <div className="wf-chip">
                  <div className="dot dot-em"></div>Contract deployed on Base
                  Sepolia · avg 1.4s
                </div>
              </div>
              <div className="wf-visual">
                <div className="wf-visual-label">ESCROW LOCKED</div>
                <div className="wf-visual-val gld">15,000 USDC</div>
                  <div className="wf-addr">{CONTRACT_ADDRESS ? `${CONTRACT_ADDRESS.slice(0,6)}...${CONTRACT_ADDRESS.slice(-4)}` : "Contract"} → Contract</div>
                <div className="wf-bar">
                  <div
                    className="wf-bar-fill wfb-gld"
                    style={{ width: "100%" }}
                  ></div>
                </div>
                <div className="badge-row">
                  <span className="wbdg wb-em">CONFIRMED</span>
                  <span className="wbdg wb-gld">LOCKED</span>
                </div>
              </div>
            </div>
          </div>

          <div className="wf-step">
            <div className="wf-node wn-gld">2</div>
            <div className="wf-step-inner">
              <div className="wf-content">
                <span className="wf-tag wt-gld">Discover</span>
                <h3>Freelancer Accepts the Job</h3>
                <p>
                  Freelancers browse the open job feed and accept directly
                  on-chain. No emails, no platform taking a cut — the smart
                  contract records the match immutably.
                </p>
                <div className="wf-chip">
                  <div className="dot dot-gld"></div>Acceptance stored on-chain
                  · gas covered automatically
                </div>
              </div>
              <div className="wf-visual">
                <div className="wf-visual-label">FREELANCER</div>
                <div className="wf-visual-val em">OPERATOR_01</div>
                <div className="wf-addr">Rep: Elite · Score 98</div>
                <div className="wf-bar">
                  <div
                    className="wf-bar-fill wfb-em"
                    style={{ width: "88%" }}
                  ></div>
                </div>
                <div className="badge-row">
                  <span className="wbdg wb-sap">JOB ACCEPTED</span>
                </div>
              </div>
            </div>
          </div>

          <div className="wf-step">
            <div className="wf-node wn-em">3</div>
            <div className="wf-step-inner">
              <div className="wf-content">
                <span className="wf-tag wt-em">Execute</span>
                <h3>Work Submitted, Milestones Unlock</h3>
                <p>
                  The freelancer submits work and marks milestones complete.
                  Each submission is a single signature — no ETH, no friction.
                  Progress is tracked on-chain in real time.
                </p>
                <div className="wf-chip">
                  <div className="dot dot-em"></div>3 of 5 milestones cleared ·
                  9,000 USDC released
                </div>
              </div>
              <div className="wf-visual">
                <div className="wf-visual-label">MILESTONE PROGRESS</div>
                <div className="wf-visual-val em">3 / 5</div>
                <div className="wf-addr">9,000 of 15,000 USDC</div>
                <div className="wf-bar">
                  <div
                    className="wf-bar-fill wfb-em"
                    style={{ width: "60%" }}
                  ></div>
                </div>
                <div className="badge-row">
                  <span className="wbdg wb-em">ACTIVE</span>
                  <span className="wbdg wb-gld">PARTIAL RELEASE</span>
                </div>
              </div>
            </div>
          </div>

          <div className="wf-step">
            <div className="wf-node wn-gld">4</div>
            <div className="wf-step-inner">
              <div className="wf-content">
                <span className="wf-tag wt-gld">Settle</span>
                <h3>Approved. Payment Released.</h3>
                <p>
                  On final approval — or when the 7-day auto-release fires — the
                  remaining escrow transfers instantly to the freelancer's
                  wallet. No waiting, no withdrawal requests.
                </p>
                <div className="wf-chip">
                  <div className="dot dot-gld"></div>Settlement confirmed ·
                  6,000 USDC transferred · 0 ETH gas
                </div>
              </div>
              <div className="wf-visual">
                <div className="wf-visual-label">SETTLEMENT_EXEC</div>
                <div className="wf-visual-val gld">+6,000 USDC</div>
                <div className="wf-addr">→ {MOCK_USD_ADDRESS ? `${MOCK_USD_ADDRESS.slice(0,6)}...${MOCK_USD_ADDRESS.slice(-4)}` : "Token"}</div>
                <div className="wf-bar">
                  <div
                    className="wf-bar-fill wfb-gld"
                    style={{ width: "100%" }}
                  ></div>
                </div>
                <div className="badge-row">
                  <span className="wbdg wb-gld">COMPLETE</span>
                  <span className="wbdg wb-em">GASLESS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-divider"></div>

      {/* ── CTA ── */}
      <div className="cta-section">
        <h2>
          Ready to Get <span className="highlight">Paid?</span>
        </h2>
        <p>
          Join the freelancers and clients already using Vaulted. No account
          needed — just connect your wallet and go.
        </p>
        <div className="cta-buttons-wrap">
          <Link to="/browse" className="btn btn-primary">
            Find Work
          </Link>
          <Link to="/post-job" className="btn btn-secondary">
            Hire a Freelancer
          </Link>
        </div>
      </div>
    </div>
  );
};
