// LAYER 5 - TYPE LAYER
export type Role = "client" | "freelancer" | null;
export type JobStatus =
  | "Open"
  | "Active"
  | "Complete"
  | "Released"
  | "Disputed";
export type UGFStep = "login" | "quote" | "settle" | "execute" | "done";

export interface Job {
  id: string;
  title: string;
  description: string;
  client: string;
  freelancer: string;
  amount: number;
  status: JobStatus;
  createdAt: number;
  autoReleaseAt: number;
}

export interface Milestone {
  step: number;
  label: string;
  completed: boolean;
}

export interface UGFFlowState {
  step: UGFStep;
  isLoading: boolean;
  error: string | null;
  txHash: string | null;
}
