export type Role = "employee" | "partner" | "admin";

export type View =
  | "login"
  | "employee-dashboard"
  | "employee-pay"
  | "employee-history"
  | "employee-catalog"
  | "partner-dashboard"
  | "partner-profile"
  | "admin-dashboard"
  | "admin-partner-detail";

export type PartnerStatus =
  | "pending"
  | "active"
  | "suspended"
  | "rejected"
  | "closed";

export interface Decision {
  id: string;
  from_status: PartnerStatus;
  to_status: PartnerStatus;
  reason: string;
  decided_by: string;
  decided_at: string;
}

export interface Partner {
  id: string;
  name: string;
  siren: string;
  objet_social: string;
  category: string;
  address: string;
  city: string;
  status: PartnerStatus;
  submitted_at: string;
  decisions: Decision[];
}

export interface WalletEntry {
  id: string;
  direction: "credit" | "debit";
  amount_cents: number;
  kind: string;
  partner_name?: string;
  occurred_at: string;
}
