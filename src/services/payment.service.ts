import { randomBytes } from "crypto";

interface PendingPayment {
  sender: string;
  amount: number;
  timestamp: number;
  expires_at: number;
}

const pendingPayments = new Map<string, PendingPayment>();

const PAYMENT_TIMEOUT_MS = parseInt(
  process.env.PAYMENT_TIMEOUT_MS || "3600000", // 1 hr
);

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

  console.log(
    `📝 Pago pendiente registrado: ${paymentKey}. Expira en: ${new Date(expires_at).toLocaleString()}`,
  );
  console.log(`📊 Total pagos pendientes: ${pendingPayments.size}`);
  return memo;
}

export function getPendingPayment(memo: string): PendingPayment | undefined {
  const payment = pendingPayments.get(memo);
  if (payment && payment.expires_at < Date.now()) {
    console.log(`🗑️ Pago pendiente expirado y eliminado: ${memo}`);
    pendingPayments.delete(memo);
    return undefined;
  }
  return payment;
}

export function removePendingPayment(memo: string): void {
  pendingPayments.delete(memo);
  console.log(`🗑️ Pago pendiente eliminado: ${memo}`);
  console.log(`📊 Total pagos pendientes: ${pendingPayments.size}`);
}

export function cleanupExpiredPayments(): void {
  const now = Date.now();
  let cleanedCount = 0;
  for (const [memo, payment] of pendingPayments.entries()) {
    if (payment.expires_at < now) {
      console.log(
        `🗑️ Pago pendiente expirado y eliminado durante limpieza: ${memo}`,
      );
      pendingPayments.delete(memo);
      cleanedCount++;
    }
  }
  if (cleanedCount > 0) {
    console.log(
      `🧹 Limpieza de pagos expirados completada. Eliminados: ${cleanedCount}. Total restantes: ${pendingPayments.size}`,
    );
  }
}

setInterval(cleanupExpiredPayments, 60000); // Run every minute
