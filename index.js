require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const app = express();

app.use(bodyParser.json());

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000/";
const PORT = process.env.PORT || "3000";
const NETWORK_URL =
  process.env.SERVER_URL || "https://horizon-testnet.stellar.org";

// Configurar Stellar
const StellarSdk = require("stellar-sdk");
const server = new StellarSdk.Horizon.Server(NETWORK_URL);
const STELLAR_ADDRESS = process.env.PUBLIC_KEY;

// Almacenar pagos pendientes
const pendingPayments = new Map();

// Función para generar QR code
async function generateQRCode(data, filename) {
  try {
    await QRCode.toFile(filename, data, {
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      width: 300,
      margin: 2,
    });
    return true;
  } catch (error) {
    console.error("Error generando QR:", error);
    return false;
  }
}

// Función para crear link clickeable usando tinyurl
async function createClickableLink(stellarUri) {
  try {
    // Crear un link de redirección usando tinyurl
    const response = await axios.post(
      "https://tinyurl.com/api-create.php",
      null,
      {
        params: {
          url: stellarUri,
        },
      },
    );

    if (response.data && response.data.startsWith("http")) {
      return response.data;
    }

    // Fallback: usar un servicio alternativo
    const fallbackResponse = await axios.post(
      "https://api.short.io/links",
      {
        originalURL: stellarUri,
        domain: "tiny.one",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return fallbackResponse.data.shortURL || stellarUri;
  } catch (error) {
    console.error("Error creando link clickeable:", error.message);
    // Si falla, devolver el URI original
    return stellarUri;
  }
}

// Función para enviar imagen a WhatsApp
async function sendImageToWhatsApp(phoneNumberId, to, imagePath, caption) {
  try {
    // Primero subir la imagen a WhatsApp
    const formData = new FormData();
    formData.append("messaging_product", "whatsapp");
    formData.append("file", fs.createReadStream(imagePath));

    const uploadResponse = await axios.post(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/media`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          ...formData.getHeaders(),
        },
      },
    );

    const mediaId = uploadResponse.data.id;

    // Luego enviar la imagen con caption
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "image",
        image: {
          id: mediaId,
          caption: caption,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error enviando imagen:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

// Función para generar factura/ticket (temporalmente deshabilitada)
/*
async function generateInvoice(paymentData) {
  const { amount, sender, transactionHash, timestamp, memo } = paymentData;

  // Crear contenido HTML para la factura
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Courier New', monospace;
          width: 400px;
          margin: 20px;
          background: white;
          color: black;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }
        .subtitle {
          font-size: 14px;
          margin: 5px 0;
        }
        .details {
          margin: 15px 0;
        }
        .row {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
        }
        .total {
          border-top: 1px solid #000;
          margin-top: 15px;
          padding-top: 10px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">🚀 ROCKETPAY</div>
        <div class="subtitle">Sistema de Cobro Digital</div>
        <div class="subtitle">${new Date(timestamp).toLocaleString()}</div>
      </div>

      <div class="details">
        <div class="row">
          <span>Monto:</span>
          <span>${amount} XLM</span>
        </div>
        <div class="row">
          <span>Remitente:</span>
          <span>${sender}</span>
        </div>
        <div class="row">
          <span>Hash:</span>
          <span>${transactionHash}</span>
        </div>
        <div class="row">
          <span>Memo:</span>
          <span>${memo}</span>
        </div>
      </div>

      <div class="total">
        <div class="row">
          <span>TOTAL:</span>
          <span>${amount} XLM</span>
        </div>
      </div>

      <div class="footer">
        <p>¡Gracias por usar RocketPay!</p>
        <p>Pago procesado en blockchain Stellar</p>
      </div>
    </body>
    </html>
  `;

  const invoiceFilename = `invoice_${Date.now()}.png`;
  const invoicePath = path.join(__dirname, invoiceFilename);

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    await page.screenshot({
      path: invoicePath,
      width: 400,
      height: 600
    });
    await browser.close();

    console.log(`📄 Factura generada: ${invoicePath}`);
    return invoicePath;
  } catch (error) {
    console.error('Error generando factura:', error);
    return null;
  }
}
*/

// Función para monitorear transacciones Stellar
async function monitorTransactions() {
  try {
    console.log("🔍 Monitoreando transacciones Stellar...");

    // Obtener transacciones recientes
    const payments = await server
      .payments()
      .forAccount(STELLAR_ADDRESS)
      .order("desc")
      .limit(10)
      .call();

    for (const payment of payments.records) {
      if (
        payment.type === "payment" &&
        payment.to === STELLAR_ADDRESS &&
        payment.asset_type === "native"
      ) {
        // XLM

        // Obtener el memo de la transacción
        const transaction = await server
          .transactions()
          .transaction(payment.transaction_hash)
          .call();

        const memo = transaction.memo || "";

        console.log(
          `🔍 Revisando pago: ${payment.amount} XLM, memo: "${memo}"`,
        );

        // Buscar pagos pendientes que coincidan con el monto y memo
        for (const [paymentKey, pendingPayment] of pendingPayments.entries()) {
          console.log(`🔍 Comparando con pago pendiente: ${paymentKey}`);
          console.log(
            `   - Pending amount: ${pendingPayment.amount}, type: ${typeof pendingPayment.amount}`,
          );
          console.log(
            `   - Payment amount: ${payment.amount}, type: ${typeof payment.amount}`,
          );
          console.log(`   - Pending memo: "${pendingPayment.memo}"`);
          console.log(`   - Payment memo: "${memo}"`);

          if (
            parseFloat(payment.amount) === pendingPayment.amount &&
            memo === pendingPayment.memo
          ) {
            console.log(
              `✅ Pago confirmado: ${payment.amount} XLM de ${payment.from}`,
            );
            console.log(`📝 Coincide con pago pendiente: ${paymentKey}`);

            // Enviar notificación al cliente
            await sendPaymentConfirmation(pendingPayment, payment);

            // Remover de pagos pendientes
            pendingPayments.delete(paymentKey);
            break; // Solo procesar el primer pago que coincida
          } else {
            console.log(`❌ No coincide`);
          }
        }
      }
    }
  } catch (error) {
    console.log("Error monitoreando transacciones:", error.message);
  }
}

// Función para enviar confirmación de pago al cliente
async function sendPaymentConfirmation(pendingPayment, confirmedPayment) {
  try {
    // Convertir el número al formato correcto
    let formattedNumber = pendingPayment.sender;
    if (pendingPayment.sender === "5492235397307") {
      formattedNumber = "54223155397307";
    } else if (pendingPayment.sender === "5491162216633") {
      formattedNumber = "541162216633";
    }

    const message = `✅ **PAGO CONFIRMADO**\n\n💰 Monto: ${confirmedPayment.amount} XLM\n🔗 Hash: ${confirmedPayment.transaction_hash}\n📅 Fecha: ${new Date().toLocaleString()}\n\n🎉 ¡Pago procesado exitosamente!`;

    // Enviar mensaje de confirmación al cliente
    await axios.post(
      `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: formattedNumber,
        type: "text",
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(`📱 Confirmación enviada al cliente: ${formattedNumber}`);
  } catch (error) {
    console.error("Error enviando confirmación:", error);
  }
}

app.post("/webhook", async (req, res) => {
  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (msg?.text?.body) {
    const sender = msg.from;
    const body = msg.text.body;

    console.log(`Mensaje recibido de ${sender}: ${body}`);

    if (body.startsWith("/cobrar")) {
      const monto = parseFloat(body.split(" ")[1]) || 5.0;

      // URI Stellar estándar que Lobster reconoce automáticamente para XLM
      const stellarUri = `web+stellar:pay?destination=${STELLAR_ADDRESS}&amount=${monto}&memo_type=text&memo=RocketQR_Payment`;

      // Link web que redirige al URI Stellar (para navegadores)
      const webRedirectUri = `https://stellar.expert/explorer/public/account/${STELLAR_ADDRESS}?tab=payments&amount=${monto}`;

      // Convertir el número al formato que funcionó en curl
      let formattedNumber = sender;
      if (sender === "5492235397307") {
        formattedNumber = "54223155397307";
      } else if (sender === "5491162216633") {
        formattedNumber = "541162216633";
      }

      console.log(`Enviando respuesta a ${formattedNumber} con monto ${monto}`);
      console.log(
        `Número original: "${sender}" -> Formateado: "${formattedNumber}"`,
      );

      try {
        // Crear link clickeable usando el URI Stellar
        const clickableLink = await createClickableLink(stellarUri);
        console.log(`Link clickeable creado: ${clickableLink}`);

        // Registrar pago pendiente
        const paymentKey = `${sender}_${monto}_RocketQR_Payment`;
        pendingPayments.set(paymentKey, {
          amount: monto,
          sender: sender,
          timestamp: Date.now(),
          memo: "RocketQR_Payment",
        });
        console.log(`📝 Pago pendiente registrado: ${paymentKey}`);

        // Generar QR code con el URI Stellar (esto es lo importante para Lobster)
        const qrFilename = `qr_${Date.now()}.png`;
        const qrGenerated = await generateQRCode(stellarUri, qrFilename);

        if (qrGenerated) {
          // Enviar imagen con QR del URI Stellar
          await sendImageToWhatsApp(
            process.env.PHONE_NUMBER_ID,
            formattedNumber,
            qrFilename,
            `💸 QR para Lobster:\nEscanea con Lobster para pago automático`,
          );

          // Enviar mensaje de texto con el URI Stellar
          const textResponse = await axios.post(
            `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`,
            {
              messaging_product: "whatsapp",
              to: formattedNumber,
              type: "text",
              text: {
                body: `💸 URI Stellar (para Lobster):\n${stellarUri}\n\n💰 Monto: ${monto} XLM\n📍 Destino: ${STELLAR_ADDRESS}\n\n📱 Instrucciones:\n1. Copia el URI Stellar\n2. Pégalo en Lobster\n3. O escanea el QR con Lobster`,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                "Content-Type": "application/json",
              },
            },
          );

          console.log("QR y mensaje enviados exitosamente");

          // Limpiar archivo QR
          fs.unlinkSync(qrFilename);
        } else {
          // Si falla el QR, enviar solo texto
          const response = await axios.post(
            `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`,
            {
              messaging_product: "whatsapp",
              to: formattedNumber,
              type: "text",
              text: {
                body: `💸 URI Stellar (para Lobster):\n${stellarUri}\n\n💰 Monto: ${monto} XLM\n📍 Destino: ${STELLAR_ADDRESS}\n\n📱 Instrucciones:\n1. Copia el URI Stellar\n2. Pégalo en Lobster\n3. O escanea el QR con Lobster`,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                "Content-Type": "application/json",
              },
            },
          );

          console.log("Mensaje de texto enviado exitosamente:", response.data);
        }
      } catch (error) {
        console.error(
          "Error enviando mensaje:",
          error.response?.data || error.message,
        );
        console.error("Request data:", {
          to: formattedNumber,
          phone_number_id: process.env.PHONE_NUMBER_ID,
        });
      }
    }
  }

  res.sendStatus(200);
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === "rocketqrverify") {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.listen(PORT, () => {
  console.log("RocketQR bot running on ", SERVER_URL);

  // Iniciar monitoreo de transacciones cada 30 segundos
  setInterval(monitorTransactions, 30000);

  // Monitoreo inicial
  // monitorTransactions(); // Deshabilitado temporalmente
});
