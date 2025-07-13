export interface StellarPayment {
  amount: string;
  memo: string | null;
  to: string;
  transaction_hash: string;
  asset_code?: string;
  asset_issuer?: string;
  from?: string;
  created_at?: string;
  paging_token?: string;
}

export interface StellarTransaction {
  transaction_hash: string;
  amount: string;
  memo: string | null;
  to: string;
  from?: string;
  created_at?: string;
  successful?: boolean;
  fee_charged?: string;
  operation_count?: number;
  envelope_xdr?: string;
  result_xdr?: string;
  result_meta_xdr?: string;
  ledger?: number;
  paging_token?: string;
}

export interface StellarAccount {
  account_id: string;
  sequence: string;
  subentry_count: number;
  balances: Array<{
    balance: string;
    buying_liabilities: string;
    selling_liabilities: string;
    asset_type: string;
    asset_code?: string;
    asset_issuer?: string;
  }>;
  signers: Array<{
    weight: number;
    key: string;
    type: string;
  }>;
  data: Record<string, string>;
  flags: {
    auth_required: boolean;
    auth_revocable: boolean;
    auth_immutable: boolean;
    auth_clawback_enabled: boolean;
  };
  thresholds: {
    low_threshold: number;
    med_threshold: number;
    high_threshold: number;
  };
}

export interface StellarAsset {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
}

export interface StellarOperationRecord {
  id: string;
  type: string;
  type_i: number;
  created_at: string;
  transaction_hash: string;
  source_account: string;
  paging_token: string;
}
