import React from "react";

export const Contact: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <div className="sec-label">Support</div>
        <h1 className="sec-title">
          Get in <span className="em">Touch</span>
        </h1>
        <p className="legal-meta">
          Built for the UGF Hackathon · Base Sepolia Testnet
        </p>
      </div>

      <div className="legal-body">
        <div className="legal-notice">
          Vaulted is a hackathon project. Support is best-effort. For urgent
          contract issues, check the Base Sepolia explorer directly using your
          transaction hash.
        </div>

        <div className="contact-grid">
          <div className="contact-card">
            <div className="contact-icon">⛓</div>
            <h3>On-Chain Issues</h3>
            <p>
              Transaction stuck or failed? Check the Base Sepolia explorer with
              your tx hash. Most issues resolve within a few blocks.
            </p>
            <a
              href="https://sepolia.basescan.org"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              Open Basescan →
            </a>
          </div>

          <div className="contact-card">
            <div className="contact-icon">💬</div>
            <h3>General Enquiries</h3>
            <p>
              Questions about the project, hackathon submission, or potential
              collaboration? Reach out via email.
            </p>
            <a href="mailto:hello@vaulted.dev" className="contact-link">
              hello@vaulted.dev →
            </a>
          </div>
        </div>

        <div className="legal-section" style={{ marginTop: "48px" }}>
          <h2>Frequently Asked Questions</h2>

          <div className="faq-list">
            <div className="faq-item">
              <h4>My payment isn't releasing — what do I do?</h4>
              <p>
                If the client has approved your work, the payment should release
                within a few seconds. If it's stuck, check the transaction on
                Basescan. If no action is taken by the client within 7 days, the
                auto-release will trigger automatically.
              </p>
            </div>
            <div className="faq-item">
              <h4>I connected the wrong wallet — can I fix it?</h4>
              <p>
                Disconnect your wallet from the app, switch accounts in
                MetaMask, and reconnect. Job ownership is tied to wallet address
                on-chain and cannot be transferred.
              </p>
            </div>
            <div className="faq-item">
              <h4>Why does it say "Wrong Network"?</h4>
              <p>
                Vaulted only works on Base Sepolia (Chain ID: 84532). Open
                MetaMask, switch to Base Sepolia, and refresh the page.
              </p>
            </div>
            <div className="faq-item">
              <h4>Where do I get Mock USD tokens?</h4>
              <p>
                Mock USD (TYI_MOCK_USD) is provided by the UGF testnet. Check
                the UGF documentation for the faucet address and instructions.
              </p>
            </div>
            <div className="faq-item">
              <h4>Is this a real product?</h4>
              <p>
                Vaulted is a hackathon prototype built for the UGF Hackathon on
                Base Sepolia. It uses test tokens with no real monetary value.
                It is not production-ready and should not be used with real
                funds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
