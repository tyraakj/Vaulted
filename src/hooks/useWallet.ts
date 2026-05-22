import { useState, useEffect } from "react";
import { BASE_SEPOLIA_CHAIN_ID } from "../lib/constants";

export const useWallet = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkConnection = async () => {
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
          setIsCorrectNetwork(parseInt(chainId, 16) === BASE_SEPOLIA_CHAIN_ID);
        } else {
          setAddress(null);
          setIsConnected(false);
          setIsCorrectNetwork(false);
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
        } else {
          setAddress(null);
          setIsConnected(false);
          setIsCorrectNetwork(false);
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        setIsCorrectNetwork(parseInt(chainIdHex, 16) === BASE_SEPOLIA_CHAIN_ID);
      };

      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      (window as any).ethereum.on("chainChanged", handleChainChanged);

      return () => {
        (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
        (window as any).ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  const switchNetwork = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}` }],
        });
        setIsCorrectNetwork(true);
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

        const chainId = await (window as any).ethereum.request({
          method: "eth_chainId",
        });
        const onCorrect = parseInt(chainId, 16) === BASE_SEPOLIA_CHAIN_ID;
        setIsCorrectNetwork(onCorrect);
        
        if (!onCorrect) {
          await switchNetwork();
        }
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
