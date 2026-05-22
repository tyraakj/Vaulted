import React from "react";

export const Terms: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <div className="sec-label">Legal</div>
        <h1 className="sec-title">
          Terms of <span className="em">Service</span>
        </h1>
        <p className="legal-meta">
          Last updated: May 2026 · Effective immediately
        </p>
      </div>

      <div className="legal-body">
        <div className="legal-notice">
          Vaulted is a hackathon prototype deployed on Base Sepolia Testnet. All
          transactions use test tokens with no real monetary value. Do not use
          real funds.
        </div>

        <div className="legal-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By connecting your wallet and using Vaulted, you agree to be bound
            by these Terms of Service. If you do not agree, do not use the
            platform. These terms apply to all users including clients,
            freelancers, and visitors.
          </p>
        </div>

        <div className="legal-section">
          <h2>2. Nature of the Platform</h2>
          <p>
            Vaulted is a decentralized escrow protocol. We do not hold your
            funds, process your payments, or act as an intermediary. All
            transactions are executed by smart contracts deployed on Base
            Sepolia. Vaulted has no ability to freeze, reverse, or modify
            on-chain transactions once submitted.
          </p>
        </div>

        <div className="legal-section">
          <h2>3. Testnet Use Only</h2>
          <p>
            This version of Vaulted operates exclusively on Base Sepolia Testnet
            using Mock USD tokens. These tokens have no real-world monetary
            value. Any amounts displayed are for demonstration purposes only.
            Never send real ETH or real USD to this platform.
          </p>
        </div>

        <div className="legal-section">
          <h2>4. User Responsibilities</h2>
          <p>You are solely responsible for:</p>
          <ul>
            <li>Securing your wallet and private keys</li>
            <li>
              Ensuring you are connected to the correct network (Base Sepolia,
              Chain ID 84532)
            </li>
            <li>
              Verifying all job details, amounts, and counterparty addresses
              before signing
            </li>
            <li>
              Any disputes arising from work quality or contract disagreements
            </li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>5. Smart Contract Risk</h2>
          <p>
            Smart contracts may contain bugs or vulnerabilities. While Vaulted
            uses audited OpenZeppelin base contracts, we make no guarantee of
            the absence of errors. Interact with the protocol at your own risk.
            Vaulted is not liable for any loss of funds resulting from smart
            contract failures.
          </p>
        </div>

        <div className="legal-section">
          <h2>6. No Custodial Relationship</h2>
          <p>
            Vaulted is non-custodial. We do not hold, manage, or have access to
            your funds at any point. Escrow is held entirely by the smart
            contract. The platform interface is a frontend only — the actual
            logic lives on-chain.
          </p>
        </div>

        <div className="legal-section">
          <h2>7. Dispute Resolution</h2>
          <p>
            Disputes between clients and freelancers are handled by the smart
            contract's dispute mechanism. Vaulted does not arbitrate disputes,
            intervene in transactions, or enforce outcomes. The 7-day
            auto-release is a protocol-level rule that cannot be overridden.
          </p>
        </div>

        <div className="legal-section">
          <h2>8. Prohibited Use</h2>
          <p>You may not use Vaulted to:</p>
          <ul>
            <li>Facilitate illegal transactions or money laundering</li>
            <li>Attempt to exploit or attack the smart contract</li>
            <li>Impersonate other users or provide false wallet identities</li>
            <li>Use automated scripts to manipulate job listings</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Vaulted and its contributors
            are not liable for any indirect, incidental, or consequential
            damages arising from your use of the platform. This includes but is
            not limited to loss of funds, lost earnings, or failed transactions.
          </p>
        </div>

        <div className="legal-section">
          <h2>10. Changes to Terms</h2>
          <p>
            We reserve the right to update these terms at any time. Continued
            use of the platform after changes constitutes acceptance of the new
            terms. We will update the "Last updated" date at the top of this
            page when changes are made.
          </p>
        </div>
      </div>
    </div>
  );
};
