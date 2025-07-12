
// monitor.js
import StellarSdk from "stellar-sdk";
import fetch from "node-fetch"; // Necesario para node 18- si no usas global fetch

// Configuración
const server = new StellarSdk.Horizon.Server(
  "https://horizon-testnet.stellar.org",
);

const accountToMonitor =
  "GANYV3KMPGVUXDRV76EVFHHYUDAP2VLF5GDESEDH5GAZFYQRMBSGU3CB"; // TU CUENTA DE RECEPCIÓN
const pollingIntervalMs = 10_000; // Cada 10 segundos

// Simulación de base de datos en memoria:
const orders = [
  {
    order_id: "ORD843",
    memo: "ORD843",
    expectedAmount: "5",
    assetType: "native",
    status: "pending",
    client: {
      name: "Juan Pérez",
      whatsappId: "5491123456789",
    },
  },
  // ...
];

// Función principal de monitoreo
async function checkPayments() {
  try {
    console.log(`Checking for payments... ${new Date().toISOString()}`);

    // Obtener los últimos 10 pagos recibidos
    const payments = await server
      .payments()
      .forAccount(accountToMonitor)
      .order("desc")
      .limit(10)
      .call();

    for (const record of payments.records) {
      // Filtrar solo pagos directos o path payments
      if (
        record.type !== "payment" &&
        record.type !== "path_payment_strict_receive"
      ) {
        continue;
      }

      // Validar que sea recibido por nuestra cuenta
      if (record.to !== accountToMonitor) {
        continue;
      }

      // Obtener el TXID
      const txId = record.transaction_hash;

      // Obtener el memo de la transacción (requiere cargar la transacción)
      const transaction = await server.transactions().transaction(txId).call();
      const memo = transaction.memo;

      if (!memo) {
        console.log(`Transacción ${txId} ignorada (sin memo)`);
        continue;
      }

      // Buscar la orden en la "DB"
      const order = orders.find(
        (o) => o.memo === memo && o.status === "pending",
      );

      if (!order) {
        console.log(`No se encontró orden pendiente con memo ${memo}.`);
        continue;
      }

      // Validar monto
      const amountReceived = record.amount;
      if (parseFloat(amountReceived) < parseFloat(order.expectedAmount)) {
        console.log(
          `Monto recibido ${amountReceived} menor al esperado ${order.expectedAmount}.`,
        );
        continue;
      }

      // Validar asset
      if (order.assetType === "native" && record.asset_type !== "native") {
        console.log(`Asset recibido diferente al esperado.`);
        continue;
      }
      if (order.assetType !== "native") {
        if (
          record.asset_type !== "credit_alphanum4" &&
          record.asset_type !== "credit_alphanum12"
        ) {
          console.log(`Asset recibido no es válido.`);
          continue;
        }
        if (record.asset_code !== order.assetCode) {
          console.log(
            `Asset recibido (${record.asset_code}) diferente al esperado (${order.assetCode}).`,
          );
          continue;
        }
      }

      // Marcar como pagado
      order.status = "paid";
      order.txid = txId;
      order.paidAt = new Date().toISOString();

      console.log(
        `✅ Pago confirmado para orden ${order.order_id}, cliente ${order.client.name}, TXID ${txId}`,
      );

      // Aquí puedes notificar a tu bot:
      await notifyBot(order, txId);
    }
  } catch (error) {
    console.error(`Error en checkPayments: ${error}`);
  }
}

// Mock de notificación al bot
async function notifyBot(order, txId) {
  const payload = {
    order_id: order.order_id,
    txid: txId,
    amount: order.expectedAmount,
    client_name: order.client.name,
    whatsapp_id: order.client.whatsappId,
  };

  console.log(`Enviando notificación al bot:`, payload);

  try {
    const res = await fetch("http://localhost:3000/payment-confirmed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`Error notificando al bot: ${res.statusText}`);
    } else {
      console.log(
        `Notificación enviada correctamente al bot para orden ${order.order_id}`,
      );
    }
  } catch (err) {
    console.error(`Error en notifyBot: ${err}`);
  }
}

// Loop de polling
setInterval(checkPayments, pollingIntervalMs);
console.log(
  `🛰️ Monitor de pagos de Stellar iniciado con polling cada ${pollingIntervalMs / 1000}s`,
);
