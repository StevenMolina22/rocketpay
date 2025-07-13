const { randomBytes } = require('crypto');

// In-memory store for pending payments. Replace with a database for production.
const pendingPayments = new Map();

/**
 * Creates a new pending payment and returns a unique memo.
 * @param {string} sender - The sender's WhatsApp ID.
 * @param {number} amount - The payment amount.
 * @returns {string} A unique memo for the transaction.
 */
function createPendingPayment(sender, amount) {
  const memo = randomBytes(8).toString('hex'); // 16 characters
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
function getPendingPayment(memo) {
  return pendingPayments.get(memo);
}

/**
 * Removes a pending payment by its memo.
 * @param {string} memo - The transaction memo.
 */
function removePendingPayment(memo) {
  pendingPayments.delete(memo);
  console.log(`🗑️ Pago pendiente eliminado: ${memo}`);
}

module.exports = {
  createPendingPayment,
  getPendingPayment,
  removePendingPayment,
};