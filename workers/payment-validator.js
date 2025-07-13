require("dotenv").config();
const { server } = require("./services/stellar.service");
const { getPendingPayment, removePendingPayment } = require("./services/payment.service");
const { sendPaymentConfirmation } = require("./services/whatsapp.service");

const STELLAR_ADDRESS = process.env.PUBLIC_KEY;

/**
 * Validates an incoming Stellar payment against our pending payments.
 * @param {object} payment - The payment record from the Stellar stream.
 */
async function validatePayment(payment) {
  // We only care about payments sent to our address
  if (payment.to !== STELLAR_ADDRESS) {
    return;
  }

  try {
    const transaction = await payment.transaction();
    const memo = transaction.memo;

    if (!memo) {
      console.log(`Ignoring transaction ${transaction.id} (no memo).`);
      return;
    }

    const pendingPayment = getPendingPayment(memo.toString());

    if (!pendingPayment) {
      console.log(`No pending payment found for memo: ${memo}`);
      return;
    }

    // Basic validation: check if the received amount is sufficient
    if (parseFloat(payment.amount) >= pendingPayment.amount) {
      console.log(`✅ Payment confirmed for memo ${memo}`);

      // Notify the user
      await sendPaymentConfirmation(pendingPayment, payment);

      // Clean up the pending payment
      removePendingPayment(memo.toString());
    } else {
        console.log(`Monto recibido ${payment.amount} menor al esperado ${pendingPayment.amount}.`)
    }
  } catch (error) {
    console.error("Error validating payment:", error);
  }
}

/**
 * Starts the real-time monitoring of Stellar payments.
 */
function startMonitoring() {
  console.log("🛰️  Starting Stellar payment stream...");

  server.payments()
    .forAccount(STELLAR_ADDRESS)
    .cursor("now")
    .stream({
      onmessage: validatePayment,
      onerror: (error) => {
        console.error("Error in Stellar stream:", error);
      },
    });
}

startMonitoring();