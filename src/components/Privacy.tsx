import React from "react";

export const Privacy: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <div className="sec-label">Legal</div>
        <h1 className="sec-title">
          Privacy <span className="em">Policy</span>
        </h1>
        <p className="legal-meta">
          Last updated: May 2025 · Effective immediately
        </p>
      </div>

      <div className="legal-body">
        <div className="legal-notice">
          Vaulted is a non-custodial, decentralized protocol. We do not collect
          personal information, require sign-up, or store user data on any
          server.
        </div>

        <div className="legal-section">
          <h2>1. No Account Required</h2>
          <p>
            Vaulted does not require you to create an account, provide an email
            address, or submit any personal information. Access to the platform
            is granted solely via your Web3 wallet. Your wallet address is your
            identity on Vaulted.
          </p>
        </div>

        <div className="legal-section">
          <h2>2. Data We Do Not Collect</h2>
          <p>We do not collect, store, or process:</p>
          <ul>
            <li>Names, email addresses, or contact information</li>
            <li>IP addresses or device fingerprints</li>
            <li>Cookies or tracking identifiers</li>
            <li>Payment card or banking information</li>
            <li>Location data</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>3. On-Chain Data</h2>
          <p>
            All transactions you perform on Vaulted — posting jobs, accepting
            work, releasing payments — are recorded on Base Sepolia blockchain.
            This data is public, immutable, and not controlled by Vaulted. Your
            wallet address and transaction history are visible to anyone on the
            blockchain. This is the nature of public blockchains and is outside
            our control.
          </p>
        </div>

        <div className="legal-section">
          <h2>4. Local Storage</h2>
          <p>
            Vaulted stores your selected role (Client or Freelancer) in your
            browser's local storage. This data never leaves your device and is
            not transmitted to any server. You can clear it at any time by
            disconnecting your wallet or clearing your browser data.
          </p>
        </div>

        <div className="legal-section">
          <h2>5. Third-Party Services</h2>
          <p>Vaulted interacts with the following third-party services:</p>
          <ul>
            <li>
              <strong>MetaMask</strong> — wallet connection. Subject to
              MetaMask's own privacy policy.
            </li>
            <li>
              <strong>UGF (Tychi Labs)</strong> — gasless transaction relay.
              Your wallet address is shared with UGF to process transactions. No
              personal data is shared.
            </li>
            <li>
              <strong>Base Sepolia RPC</strong> — blockchain read/write.
              Standard RPC requests may log your IP address per the RPC
              provider's policy.
            </li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>6. Analytics</h2>
          <p>
            Vaulted does not use any analytics tools, tracking pixels, or
            third-party scripts that collect user behavior data. There are no
            ads on this platform.
          </p>
        </div>

        <div className="legal-section">
          <h2>7. Data Retention</h2>
          <p>
            Since we do not collect personal data, there is nothing for us to
            retain or delete. On-chain data is permanent by nature of the
            blockchain and cannot be removed by Vaulted or anyone else.
          </p>
        </div>

        <div className="legal-section">
          <h2>8. Children's Privacy</h2>
          <p>
            Vaulted is not intended for users under the age of 18. We do not
            knowingly collect any information from minors. If you believe a
            minor has used the platform, please contact us.
          </p>
        </div>

        <div className="legal-section">
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy as the platform evolves. We will
            update the "Last updated" date at the top of this page. Continued
            use of Vaulted after changes constitutes acceptance of the updated
            policy.
          </p>
        </div>
      </div>
    </div>
  );
};
