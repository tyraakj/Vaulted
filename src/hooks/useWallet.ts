import { useState, useEffect } from "react";
import { BASE_SEPOLIA_CHAIN_ID } from "../lib/constants";

const isMockMode = import.meta.env.VITE_UGF_MOCK === "true";

export const useWallet = () => {
  const [address, setAddress] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      if (isMockMode) {
        const savedMock = localStorage.getItem("mockWalletConnected");
        if (savedMock === "true") {
          return localStorage.getItem("mockWalletAddress") || "0xClientMock1234567890abcdef1234567890abc";
        }
      }
      return localStorage.getItem("walletAddress");
    }
    return null;
  });

  const [isConnected, setIsConnected] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      if (isMockMode) {
        return localStorage.getItem("mockWalletConnected") === "true";
      }
      return localStorage.getItem("walletConnected") === "true";
    }
    return false;
  });

  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      if (isMockMode) {
        return localStorage.getItem("mockWalletConnected") === "true";
      }
      return localStorage.getItem("walletConnected") === "true" && localStorage.getItem("walletNetworkCorrect") === "true";
    }
    return false;
  });

  const [isLoading, setIsLoading] = useState(false);

  const checkConnection = async () => {
    if (isMockMode && localStorage.getItem("mockWalletConnected") === "true") {
      setIsConnected(true);
      setIsCorrectNetwork(true);
      const role = localStorage.getItem("userRole") || "client";
      const mockAddr = role === "client" 
        ? "0xClientMock1234567890abcdef1234567890abc"
        : "0xFreelancerMock9876543210fedcba0987654";
      setAddress(mockAddr);
      return;
    }

    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_accounts",
        });
        const chainId = await (window as any).ethereum.request({
          method: "eth_chainId",
        });

        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          const isCorrect = parseInt(chainId, 16) === BASE_SEPOLIA_CHAIN_ID;
          setIsCorrectNetwork(isCorrect);
          localStorage.setItem("walletAddress", accounts[0]);
          localStorage.setItem("walletConnected", "true");
          localStorage.setItem("walletNetworkCorrect", isCorrect ? "true" : "false");
        } else {
          setAddress(null);
          setIsConnected(false);
          setIsCorrectNetwork(false);
          localStorage.removeItem("walletAddress");
          localStorage.removeItem("walletConnected");
          localStorage.removeItem("walletNetworkCorrect");
        }
      } catch (error) {
        console.error("Failed to check wallet connection:", error);
      }
    }
  };

  useEffect(() => {
    checkConnection();

    if (typeof window !== "undefined" && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          localStorage.setItem("walletAddress", accounts[0]);
          localStorage.setItem("walletConnected", "true");
        } else {
          setAddress(null);
          setIsConnected(false);
          setIsCorrectNetwork(false);
          localStorage.removeItem("walletAddress");
          localStorage.removeItem("walletConnected");
          localStorage.removeItem("walletNetworkCorrect");
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        const isCorrect = parseInt(chainIdHex, 16) === BASE_SEPOLIA_CHAIN_ID;
        setIsCorrectNetwork(isCorrect);
        localStorage.setItem("walletNetworkCorrect", isCorrect ? "true" : "false");
      };

      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      (window as any).ethereum.on("chainChanged", handleChainChanged);

      return () => {
        (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
        (window as any).ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  // Listen to role changes to dynamically update mock address
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleRoleChanged = () => {
        if (isMockMode && localStorage.getItem("mockWalletConnected") === "true") {
          const role = localStorage.getItem("userRole") || "client";
          const mockAddr = role === "client" 
            ? "0xClientMock1234567890abcdef1234567890abc"
            : "0xFreelancerMock9876543210fedcba0987654";
          setAddress(mockAddr);
          localStorage.setItem("mockWalletAddress", mockAddr);
        }
      };

      window.addEventListener("roleChanged", handleRoleChanged);
      return () => {
        window.removeEventListener("roleChanged", handleRoleChanged);
      };
    }
  }, []);

  const switchNetwork = async () => {
    if (isMockMode) {
      setIsCorrectNetwork(true);
      return;
    }

    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}` }],
        });
        setIsCorrectNetwork(true);
        localStorage.setItem("walletNetworkCorrect", "true");
      } catch (error: any) {
        if (error.code === 4902) {
          try {
            await (window as any).ethereum.request({
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
            localStorage.setItem("walletNetworkCorrect", "true");
          } catch (addError) {
            console.error("Failed to add network:", addError);
          }
        } else {
          console.error("Failed to switch network:", error);
        }
      }
    }
  };

  const connect = async () => {
    setIsLoading(true);
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        setAddress(accounts[0]);
        setIsConnected(true);
        localStorage.setItem("walletAddress", accounts[0]);
        localStorage.setItem("walletConnected", "true");

        const chainId = await (window as any).ethereum.request({
          method: "eth_chainId",
        });
        const onCorrect = parseInt(chainId, 16) === BASE_SEPOLIA_CHAIN_ID;
        setIsCorrectNetwork(onCorrect);
        localStorage.setItem("walletNetworkCorrect", onCorrect ? "true" : "false");
        
        if (!onCorrect && !isMockMode) {
          await switchNetwork();
        }
      } else if (isMockMode) {
        const role = localStorage.getItem("userRole") || "client";
        const mockAddr = role === "client" 
          ? "0xClientMock1234567890abcdef1234567890abc"
          : "0xFreelancerMock9876543210fedcba0987654";
        
        setAddress(mockAddr);
        setIsConnected(true);
        setIsCorrectNetwork(true);
        localStorage.setItem("mockWalletConnected", "true");
        localStorage.setItem("mockWalletAddress", mockAddr);
      } else {
        alert("MetaMask (or a compatible Web3 wallet) was not detected. Please install the MetaMask extension to use Vaulted in real network mode.");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    setIsCorrectNetwork(false);
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("walletConnected");
    localStorage.removeItem("walletNetworkCorrect");
    localStorage.removeItem("mockWalletConnected");
    localStorage.removeItem("mockWalletAddress");
  };

  return {
    address,
    isConnected,
    isCorrectNetwork,
    isLoading,
    connect,
    switchNetwork,
    disconnect,
  };
};

