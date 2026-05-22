/**
 * LAYER 4 - CONFIGURATION LAYER
 * UGF Client initialization
 */

import {
  UGF_ENDPOINT,
  MOCK_USD_ADDRESS,
  BASE_SEPOLIA_CHAIN_ID,
} from "./constants";

/**
 * UGF Client Singleton
 * Initialized with chain ID and Mock USD address
 * Exported for use across the app
 */
export const UGFClient = {
  endpoint: UGF_ENDPOINT,
  chainId: BASE_SEPOLIA_CHAIN_ID,
  mockUsdAddress: MOCK_USD_ADDRESS,

  isConfigured: (): boolean => {
    const ok = !!UGF_ENDPOINT && !!MOCK_USD_ADDRESS;
    if (!ok) {
      console.error("UGFClient not configured: please set VITE_UGF_ENDPOINT and VITE_MOCK_USD_ADDRESS in your .env and ensure BASE_SEPOLIA_CHAIN_ID is correct.");
    }
    return ok;
  },

  getConfig: () => ({
    endpoint: UGF_ENDPOINT,
    chainId: BASE_SEPOLIA_CHAIN_ID,
    mockUsdAddress: MOCK_USD_ADDRESS,
  }),
};

export default UGFClient;
