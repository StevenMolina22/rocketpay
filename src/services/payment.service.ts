import { randomBytes } from "crypto";

// In-memory store for pending payments. Replace with a database for production.
interface PendingPayment {
  sender: string;
  amount: number;
  timestamp: number;
  expires_at: number;
}

// In-memory store for pending payments. Replace with a database for production.
const pendingPayments = new Map<string, PendingPayment>();

const PAYMENT_TIMEOUT_MS = parseInt(process.env.PAYMENT_TIMEOUT_MS || "3600000"); // Default to 1 hour

/**
 * Creates a new pending payment and returns a unique memo.
 * @param {string} sender - The sender's WhatsApp ID.
 * @param {number} amount - The payment amount.
 * @returns {string} A unique memo for the transaction.
 */
export function createPendingPayment(sender: string, amount: number): string {
  const memo = randomBytes(8).toString("hex"); // 16 characters
  const paymentKey = memo; // Use memo as the unique key
  const expires_at = Date.now() + PAYMENT_TIMEOUT_MS;

  pendingPayments.set(paymentKey, {
    sender,
    amount,
    timestamp: Date.now(),
    expires_at,
  });

  console.log(`📝 Pago pendiente registrado: ${paymentKey}. Expira en: ${new Date(expires_at).toLocaleString()}`);
  console.log(`📊 Total pagos pendientes: ${pendingPayments.size}`);
  return memo;
}

/**
 * Retrieves a pending payment by its memo.
 * @param {string} memo - The transaction memo.
 * @returns {object | undefined} The pending payment object or undefined if not found.
 */
export function getPendingPayment(memo: string): PendingPayment | undefined {
  const payment = pendingPayments.get(memo);
  if (payment && payment.expires_at < Date.now()) {
    console.log(`🗑️ Pago pendiente expirado y eliminado: ${memo}`);
    pendingPayments.delete(memo);
    return undefined;
  }
  return payment;
}

/**
 * Removes a pending payment by its memo.
 * @param {string} memo - The transaction memo.
 */
export function removePendingPayment(memo: string): void {
  pendingPayments.delete(memo);
  console.log(`🗑️ Pago pendiente eliminado: ${memo}`);
  console.log(`📊 Total pagos pendientes: ${pendingPayments.size}`);
}

/**
 * Cleans up expired pending payments.
 */
export function cleanupExpiredPayments(): void {
  const now = Date.now();
  let cleanedCount = 0;
  for (const [memo, payment] of pendingPayments.entries()) {
    if (payment.expires_at < now) {
      console.log(`🗑️ Pago pendiente expirado y eliminado durante limpieza: ${memo}`);
      pendingPayments.delete(memo);
      cleanedCount++;
    }
  }
  if (cleanedCount > 0) {
    console.log(`🧹 Limpieza de pagos expirados completada. Eliminados: ${cleanedCount}. Total restantes: ${pendingPayments.size}`);
  }
}

// Schedule periodic cleanup of expired payments
setInterval(cleanupExpiredPayments, 60000); // Run every minute
