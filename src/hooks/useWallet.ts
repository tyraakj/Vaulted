import { useState, useEffect } from "react";
import { BASE_SEPOLIA_CHAIN_ID } from "../lib/constants";

export const useWallet = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });

        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          setIsCorrectNetwork(parseInt(chainId, 16) === BASE_SEPOLIA_CHAIN_ID);
        }
      } catch (error) {
        console.error("Failed to check wallet connection:", error);
      }
    }
  };

  const switchNetwork = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}` }],
        });
        setIsCorrectNetwork(true);
      } catch (error: any) {
        if (error.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}`,
                chainName: "Base Sepolia",
                rpcUrls: ["https://sepolia.base.org"],
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                blockExplorerUrls: ["https://sepolia.basescan.org"],
              },
            ],
          });
          setIsCorrectNetwork(true);
        }
      }
    }
  };

  const connect = async () => {
    setLoading(true);
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAddress(accounts[0]);
        setIsConnected(true);
        await switchNetwork();
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    setIsCorrectNetwork(false);
  };

  return {
    address,
    isConnected,
    isCorrectNetwork,
    loading,
    connect,
    switchNetwork,
    disconnect,
  };
};
