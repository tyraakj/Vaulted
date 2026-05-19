import React, { useState } from "react";

interface PaymentFlowProps {
  contractId: string;
  totalAmount: number;
  onPaymentInitiate?: (amount: number) => void;
  onPaymentConfirm?: (transactionId: string) => void;
}

export const PaymentFlow: React.FC<PaymentFlowProps> = ({
  contractId,
  totalAmount,
  onPaymentInitiate,
  onPaymentConfirm,
}) => {
  const [step, setStep] = useState<
    "review" | "confirm" | "processing" | "complete"
  >("review");
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const handleInitiate = () => {
    onPaymentInitiate?.(totalAmount);
    setStep("confirm");
  };

  const handleConfirm = () => {
    setStep("processing");
    // Simulate processing
    setTimeout(() => {
      const txId = `tx_${Date.now()}`;
      setTransactionId(txId);
      onPaymentConfirm?.(txId);
      setStep("complete");
    }, 2000);
  };

  return (
    <div className="payment-flow">
      <h3>Payment Flow</h3>
      <div className={`step step-${step}`}>
        {step === "review" && (
          <div>
            <p>Review Payment: ${totalAmount}</p>
            <button onClick={handleInitiate}>Proceed to Payment</button>
          </div>
        )}
        {step === "confirm" && (
          <div>
            <p>Confirm Payment: ${totalAmount}</p>
            <button onClick={handleConfirm}>Confirm Payment</button>
          </div>
        )}
        {step === "processing" && (
          <div>
            <p>Processing your payment...</p>
          </div>
        )}
        {step === "complete" && (
          <div>
            <p>Payment successful!</p>
            <p>Transaction ID: {transactionId}</p>
          </div>
        )}
      </div>
    </div>
  );
};
