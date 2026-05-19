import React from "react";

interface WalletConnectProps {
  address?: string | null;
  isConnected: boolean;
  isLoading?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  address,
  isConnected,
  isLoading = false,
  onConnect,
  onDisconnect,
}) => {
  return (
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
  );
};
