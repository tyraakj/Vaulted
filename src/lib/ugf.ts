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
    return (
      !!UGF_ENDPOINT && !!MOCK_USD_ADDRESS && BASE_SEPOLIA_CHAIN_ID === 84532
    );
  },

  getConfig: () => ({
    endpoint: UGF_ENDPOINT,
    chainId: BASE_SEPOLIA_CHAIN_ID,
    mockUsdAddress: MOCK_USD_ADDRESS,
  }),
};

export default UGFClient;
