import { UGFClient } from "@tychilabs/ugf-testnet-js";

export const ugfClient = new UGFClient();

export const isUGFConfigured = (): boolean => {
  return !!import.meta.env.VITE_UGF_ENDPOINT;
};

export default ugfClient;