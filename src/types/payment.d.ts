export interface PendingPayment {
  sender: string;
  amount: number;
  timestamp: number;
  memo?: string;
  recipient?: string;
  currency?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  transaction_id?: string;
  expires_at?: number;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  memo?: string;
  recipient: string;
  sender?: string;
}

export interface PaymentResponse {
  success: boolean;
  transaction_id?: string;
  error?: string;
  payment?: PendingPayment;
}

export interface PaymentStatus {
  transaction_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: number;
  amount: number;
  sender: string;
  recipient: string;
  memo?: string;
  error?: string;
}
