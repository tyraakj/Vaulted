import React, { useState } from "react";
import type { UGFStep, UGFFlowState } from "../types";

interface PaymentFlowProps {
  contractId: string;
  totalAmount: number;
  flowState?: UGFFlowState;
  onInitiate?: () => void;
  onPaymentInitiate?: (amount: number) => void;
  onPaymentConfirm?: (transactionId: string) => void;
}

const STEPS_ORDER: UGFStep[] = ["login", "quote", "settle", "execute", "done"];

export const PaymentFlow: React.FC<PaymentFlowProps> = ({
  contractId,
  totalAmount,
  flowState,
  onInitiate,
  onPaymentInitiate,
  onPaymentConfirm,
}) => {
  const [localFlowState, setLocalFlowState] = useState<UGFFlowState>({
    step: "login",
    isLoading: false,
    error: null,
    txHash: null,
  });

  const [hasStarted, setHasStarted] = useState(false);

  const activeState = flowState || localFlowState;

  const handleInitiate = async () => {
    setHasStarted(true);
    if (onPaymentInitiate) {
      onPaymentInitiate(totalAmount);
    }
    if (onInitiate) {
      onInitiate();
      return;
    }

    // Mock interactive flow if no props passed
    const steps: UGFStep[] = ["login", "quote", "settle", "execute"];
    let currentLocalState = { step: "login" as UGFStep, isLoading: true, error: null as string | null, txHash: null as string | null };
    
    for (const step of steps) {
      currentLocalState = { step, isLoading: true, error: null, txHash: null };
      setLocalFlowState(currentLocalState);
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
    
    const mockTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    currentLocalState = { step: "done", isLoading: false, error: null, txHash: mockTxHash };
    setLocalFlowState(currentLocalState);
    
    if (onPaymentConfirm) {
      onPaymentConfirm(mockTxHash);
    }
  };

  const handleReset = () => {
    setHasStarted(false);
    setLocalFlowState({
      step: "login",
      isLoading: false,
      error: null,
      txHash: null,
    });
  };

  const ugfSteps: { key: UGFStep; label: string; desc: string }[] = [
    { key: "login", label: "AUTH SESSION", desc: "Authorize relayer connection" },
    { key: "quote", label: "RELAY QUOTE", desc: "Obtain sponsored gas pricing" },
    { key: "settle", label: "SIGN MUTATION", desc: "Sign transaction request payload" },
    { key: "execute", label: "BROADCAST meta-tx", desc: "Execute settlement on Base Sepolia" },
  ];

  const getStepStatus = (stepKey: UGFStep) => {
    if (activeState.step === "done") {
      return "completed";
    }
    const currentIdx = STEPS_ORDER.indexOf(activeState.step);
    const stepIdx = STEPS_ORDER.indexOf(stepKey);

    if (currentIdx > stepIdx) return "completed";
    if (currentIdx === stepIdx) {
      if (activeState.error) return "error";
      if (activeState.isLoading) return "processing";
      return "active";
    }
    return "pending";
  };

  return (
    <div className="payment-flow">
      <h3>PAYMENT SETTLEMENT ENGINE</h3>
      
      {!hasStarted && !flowState ? (
        <div className="step-review" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: "14px", color: "var(--t1)" }}>
            Review Escrow Settlement
          </p>
          <div style={{
            background: "var(--bg-ch)",
            border: "1px solid var(--b2)",
            borderRadius: "var(--radius)",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: "12px" }}>
              <span style={{ color: "var(--t2)" }}>Contract ID:</span>
              <span style={{ color: "var(--em)", fontWeight: 600 }}>{contractId}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: "12px" }}>
              <span style={{ color: "var(--t2)" }}>Settlement Amount:</span>
              <span style={{ color: "var(--gld)", fontWeight: 600 }}>${totalAmount.toLocaleString()} USDC</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: "12px" }}>
              <span style={{ color: "var(--t2)" }}>Gas Fee Sponsor:</span>
              <span style={{ color: "var(--em)", fontWeight: 600 }}>UGF (100% Free)</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleInitiate}>
            Settle Gasless Payment
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Visual Checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {ugfSteps.map((s, index) => {
              const status = getStepStatus(s.key);
              
              let color = "var(--t3)";
              let icon = "○";
              let animation = "none";
              
              if (status === "completed") {
                color = "var(--em)";
                icon = "●";
              } else if (status === "processing") {
                color = "var(--gld)";
                icon = "⚙";
                animation = "spin 2s linear infinite";
              } else if (status === "error") {
                color = "#f87171";
                icon = "✕";
              } else if (status === "active") {
                color = "var(--t1)";
                icon = "●";
              }

              return (
                <div 
                  key={s.key} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "14px",
                    background: status === "completed" ? "var(--em-d)" : status === "processing" ? "var(--gld-d)" : "transparent",
                    border: `1px solid ${status === "completed" ? "var(--em-b)" : status === "processing" ? "var(--gld-b)" : "transparent"}`,
                    borderRadius: "var(--radius)",
                    padding: "10px 14px",
                    transition: "all var(--tr)"
                  }}
                >
                  <span style={{ 
                    fontFamily: "var(--mono)", 
                    fontSize: "14px", 
                    color, 
                    display: "inline-block", 
                    animation,
                    width: "16px",
                    textAlign: "center"
                  }}>
                    {icon}
                  </span>
                  <div>
                    <span style={{ 
                      fontFamily: "var(--mono)", 
                      fontSize: "11px", 
                      fontWeight: 600, 
                      color,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase"
                    }}>
                      Step {index + 1}: {s.label}
                    </span>
                    <p style={{ 
                      margin: 0, 
                      fontSize: "10px", 
                      color: status === "completed" ? "var(--em-s)" : "var(--t3)", 
                      fontFamily: "var(--mono)" 
                    }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Error state */}
          {activeState.error && (
            <div style={{
              background: "rgba(248, 113, 113, 0.12)",
              border: "1px solid rgba(248, 113, 113, 0.3)",
              borderRadius: "var(--radius)",
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}>
              <span style={{ color: "#f87171", fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 600 }}>
                ⚠️ TRANSACTION FAILURE
              </span>
              <p style={{ color: "var(--t2)", fontFamily: "var(--mono)", fontSize: "11px", margin: 0 }}>
                {activeState.error}
              </p>
              {!flowState && (
                <button 
                  className="btn btn-secondary" 
                  onClick={handleInitiate} 
                  style={{ color: "#f87171", borderColor: "rgba(248, 113, 113, 0.4)", fontSize: "10px", padding: "4px 12px", alignSelf: "flex-start" }}
                >
                  Retry Transaction
                </button>
              )}
            </div>
          )}

          {/* Active Completion state */}
          {activeState.step === "done" && (
            <div style={{
              background: "var(--em-d)",
              border: "1px solid var(--em-b)",
              borderRadius: "var(--radius)",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}>
              <span style={{ color: "var(--em)", fontFamily: "var(--mono)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em" }}>
                ✓ SETTLEMENT CONFIRMED
              </span>
              <p style={{ color: "var(--t2)", fontFamily: "var(--mono)", fontSize: "11px", margin: 0, wordBreak: "break-all" }}>
                Relayed successfully. Gas sponsored by UGF.
              </p>
              {activeState.txHash && (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                  <span style={{ fontSize: "9px", color: "var(--t3)", fontFamily: "var(--mono)" }}>TRANSACTION HASH:</span>
                  <a 
                    href={`https://sepolia.basescan.org/tx/${activeState.txHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ fontSize: "10px", fontFamily: "var(--mono)", color: "var(--em-s)", textDecoration: "underline", wordBreak: "break-all" }}
                  >
                    {activeState.txHash}
                  </a>
                </div>
              )}
              {!flowState && (
                <button 
                  className="btn btn-secondary" 
                  onClick={handleReset} 
                  style={{ fontSize: "9px", padding: "4px 12px", alignSelf: "flex-start", marginTop: "8px" }}
                >
                  New Payment
                </button>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* CSS Spin Keyframes Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
