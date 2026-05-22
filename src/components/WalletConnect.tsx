import React from "react";

interface WalletConnectProps {
  address?: string | null;
  isConnected: boolean;
  isLoading?: boolean;
  isCorrectNetwork?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSwitchNetwork?: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  address,
  isConnected,
  isLoading = false,
  isCorrectNetwork = true,
  onConnect,
  onDisconnect,
  onSwitchNetwork,
}) => {
  return (
    <div className="wallet-connect-wrapper" style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-start" }}>
      <div className="wallet-connect">
        {isConnected && address ? (
          <div className="wallet-connected">
            <span>
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <button onClick={onDisconnect} disabled={isLoading}>
              Disconnect
            </button>
          </div>
        ) : (
          <button onClick={onConnect} disabled={isLoading}>
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>

      {isConnected && !isCorrectNetwork && (
        <div
          className="network-warning-banner"
          style={{
            background: "rgba(248, 113, 113, 0.12)",
            border: "1px solid rgba(248, 113, 113, 0.3)",
            borderRadius: "var(--radius)",
            padding: "8px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            alignItems: "flex-start",
            width: "100%",
            maxWidth: "320px",
          }}
        >
          <span
            style={{
              color: "#f87171",
              fontFamily: "var(--mono)",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            ⚠️ WRONG_NETWORK
          </span>
          <span
            style={{
              color: "var(--t2)",
              fontFamily: "var(--mono)",
              fontSize: "10px",
              lineHeight: "1.4",
            }}
          >
            Vaulted operates on Base Sepolia. Please switch to continue.
          </span>
          {onSwitchNetwork && (
            <button
              onClick={onSwitchNetwork}
              style={{
                background: "transparent",
                color: "#f87171",
                border: "1px solid rgba(248, 113, 113, 0.4)",
                borderRadius: "var(--radius)",
                padding: "3px 8px",
                fontFamily: "var(--mono)",
                fontSize: "9px",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginTop: "2px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(248, 113, 113, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              Switch Network
            </button>
          )}
        </div>
      )}
    </div>
  );
};
