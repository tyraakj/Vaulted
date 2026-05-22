import { UGFClient } from "@tychilabs/ugf-sdk";

export const ugfClient = new UGFClient({
  baseUrl:
    import.meta.env.VITE_UGF_ENDPOINT ||
    "https://gateway.universalgasframework.com",
});

export const isUGFConfigured = (): boolean => {
  return !!import.meta.env.VITE_UGF_ENDPOINT;
};

export default ugfClient;