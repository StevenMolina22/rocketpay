import { randomBytes } from "crypto";

// In-memory store for pending payments. Replace with a database for production.
interface PendingPayment {
  sender: string;
  amount: number;
  timestamp: number;
}

// In-memory store for pending payments. Replace with a database for production.
const pendingPayments = new Map<string, PendingPayment>();

/**
 * Creates a new pending payment and returns a unique memo.
 * @param {string} sender - The sender's WhatsApp ID.
 * @param {number} amount - The payment amount.
 * @returns {string} A unique memo for the transaction.
 */
export function createPendingPayment(sender: string, amount: number): string {
  const memo = randomBytes(8).toString("hex"); // 16 characters
  const paymentKey = memo; // Use memo as the unique key

  pendingPayments.set(paymentKey, {
    sender,
    amount,
    timestamp: Date.now(),
  });

  console.log(`📝 Pago pendiente registrado: ${paymentKey}`);
  return memo;
}

/**
 * Retrieves a pending payment by its memo.
 * @param {string} memo - The transaction memo.
 * @returns {object | undefined} The pending payment object or undefined if not found.
 */
export function getPendingPayment(memo: string): PendingPayment | undefined {
  console.log("Pending payments:", pendingPayments);
  return pendingPayments.get(memo);
}

/**
 * Removes a pending payment by its memo.
 * @param {string} memo - The transaction memo.
 */
export function removePendingPayment(memo: string): void {
  pendingPayments.delete(memo);
  console.log(`🗑️ Pago pendiente eliminado: ${memo}`);
}
