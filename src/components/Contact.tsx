import React, { useEffect } from "react";
import { BASE_SEPOLIA_CHAIN_ID } from "../lib/constants";

export const Contact: React.FC = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="legal-page">
      <div className="legal-header">
        <div className="sec-label">Support</div>
        <h1 className="sec-title">
          Get in <span className="em">Touch</span>
        </h1>
        <p className="legal-meta">
          We're here to help · Typically responds within 24 hours
        </p>
      </div>

      <div className="legal-body">
        <div className="legal-notice">
          For on-chain transaction issues, the Base explorer gives you real-time
          status on any transaction using your wallet address or tx hash.
        </div>

        <div className="contact-grid">
          <div className="contact-card">
            <div className="contact-icon">⛓</div>
            <h3>On-Chain Issues</h3>
            <p>
              Transaction not confirming? Check the Base explorer with your tx
              hash for real-time status and block confirmations.
            </p>
            <a
              href="https://basescan.org"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              Open Basescan →
            </a>
          </div>

          <div className="contact-card">
            <div className="contact-icon">⚡</div>
            <h3>Gasless Transaction Help</h3>
            <p>
              Issues with the UGF flow — login, quote, settle, or execute? The
              UGF documentation covers all supported methods and error codes.
            </p>
            <a
              href="https://docs.ugf.tychilabs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              UGF Docs →
            </a>
          </div>

          <div className="contact-card">
            <div className="contact-icon">💬</div>
            <h3>General Enquiries</h3>
            <p>
              Questions about the platform, integrations, or partnership
              opportunities? Drop us a message and we'll get back to you.
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
                Once a client approves your milestone, the payment releases
                within seconds. If there's a delay, check the transaction on
                Basescan. If the client takes no action within 7 days of
                completion, the auto-release triggers automatically — your
                payment is always protected.
              </p>
            </div>
            <div className="faq-item">
              <h4>I connected the wrong wallet — can I switch?</h4>
              <p>
                Disconnect your current wallet, switch accounts in MetaMask, and
                reconnect. Job ownership is tied to your wallet address
                on-chain. Make sure you're using the correct wallet before
                accepting or posting a job.
              </p>
            </div>
            <div className="faq-item">
              <h4>Why does it say "Wrong Network"?</h4>
              <p>
                Vaulted runs securely on Base (Chain ID: {BASE_SEPOLIA_CHAIN_ID}). Open MetaMask,
                switch to the Base network, and refresh the page. All features
                will be available once you're on the correct network.
              </p>
            </div>
            <div className="faq-item">
              <h4>Which tokens are supported?</h4>
              <p>
                Vaulted currently supports USDC for escrow payments to ensure
                stable, predictable value for both clients and freelancers.
              </p>
            </div>
            <div className="faq-item">
              <h4>Is my escrow safe if something goes wrong?</h4>
              <p>
                Yes. Funds are held entirely by the smart contract — not by
                Vaulted. Even if this frontend goes offline, your escrow remains
                intact on-chain and can be accessed directly through the
                contract. The 7-day auto-release also ensures funds can never be
                held indefinitely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
