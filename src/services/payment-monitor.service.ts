import "dotenv/config";
import { server } from "./stellar.service";
import { getPendingPayment, removePendingPayment } from "./payment.service";
import { sendPaymentConfirmation } from "./whatsapp.service";

const STELLAR_ADDRESS = process.env.PUBLIC_KEY!;
const NETWORK_URL =
  process.env.NETWORK_URL || "https://horizon-testnet.stellar.org";

export async function validatePayment(payment: any): Promise<void> {
  console.log(`🔍 Processing payment: ${JSON.stringify(payment, null, 2)}`);

  if (payment.to !== STELLAR_ADDRESS) {
    console.log(
      `❌ Payment not for our address: ${payment.to} (expected: ${STELLAR_ADDRESS})`,
    );
    return;
  }

  console.log(`✅ Payment is for our address`);
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

    if (parseFloat(payment.amount) >= pendingPayment.amount) {
      console.log(
        `✅ Payment confirmed for memo ${memo}. Amount: ${payment.amount}, Expected: ${pendingPayment.amount}`,
      );
      await sendPaymentConfirmation(pendingPayment, payment);
      removePendingPayment(memo.toString());
    } else {
      console.log(
        `Monto recibido ${payment.amount} menor al esperado ${pendingPayment.amount}.`,
      );
    }
  } catch (error) {
    console.error("Error validating payment:", error);
  }
}

export async function startPaymentMonitoring() {
  if (!STELLAR_ADDRESS) {
    console.error(
      "❌ Stellar PUBLIC_KEY is not set. Payment monitoring cannot start.",
    );
    return;
  }

  console.log("🛰️  Starting Stellar payment stream...");
  console.log(`📍 Monitoring account: ${STELLAR_ADDRESS}`);
  console.log(`🌐 Horizon URL: ${NETWORK_URL}`);

  try {
    // Test connection to Horizon server
    await server.loadAccount(STELLAR_ADDRESS);
    console.log(
      `✅ Successfully connected to Stellar Horizon and loaded account ${STELLAR_ADDRESS}.`,
    );
  } catch (error) {
    console.error(
      `❌ Failed to connect to Stellar Horizon or load account ${STELLAR_ADDRESS}. Error:`,
      error,
    );
    console.error(
      "Please ensure PUBLIC_KEY is correct and NETWORK_URL is accessible.",
    );
    return;
  }

  const stream = server
    .payments()
    .forAccount(STELLAR_ADDRESS)
    .cursor("now")
    .stream({
      onmessage: (payment: any) => {
        console.log("📨 Received payment:", payment);
        validatePayment(payment);
      },
      onerror: (error: any) => {
        console.error("❌ Error in Stellar stream:", error);
        // TODO! Implement error recovery mechanisms here, e.g., retry with backoff
      },
    });

  console.log("✅ Stellar payment stream started successfully.");

  // Heartbeat logging
  setInterval(() => {
    console.log("❤️ Payment monitor heartbeat: Stream is active.");
  }, 30000); // Log every 30 seconds
}
