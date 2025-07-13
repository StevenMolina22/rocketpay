This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
4. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

## Additional Info

# Directory Structure
```
.gitignore
index.js
package.json
Procfile
README.md
validation.js
```

# Files

## File: Procfile
````
web: node index.js
worker: node validation.js
````

## File: .gitignore
````
node_modules
.env
qr_*
````

## File: README.md
````markdown
# 🚀 RocketPay

**RocketPAY** es un sistema de cobro automatizado vía WhatsApp que permite a trabajadores informales y pequeños comerciantes recibir pagos en XLM (Lumens) de forma simple, sin fricción y con verificación automática en la blockchain de Stellar.

Millones de personas sin acceso a infraestructura bancaria necesitan una forma simple y directa de cobrar digitalmente.

**RocketPAY convierte WhatsApp en una herramienta de cobro.** Con un solo mensaje, el bot genera un link de pago, un código QR y verifica la transacción en Stellar.

## ✨ Características

- **Bot de WhatsApp** con API oficial (WABA)
- **URI de pago** `web+stellar:pay`
- **Código QR automático**
- **Verificación on-chain** vía Horizon
- **Notificación instantánea**
- **Generación automática de facturas**

## 🔄 Flujo del Usuario

1. El vendedor escribe a modo de mensaje el comando `/cobrar` y a continuación el monto, como por ejemplo `100` en WhatsApp
2. El bot responde con el URI de pago y una imagen JPG con un QR
3. El comprador paga
4. El bot verifica el pago, notifica al vendedor y le crea una factura para enviarle al comprador

## 💡 ¿Por qué XLM?

- **Rápido** (<5 seg)
- **Barato** (<0.00001 XLM)
- **Accesible y global**

## 📊 Estado actual

- ✅ **MVP funcional** con WhatsApp + Stellar
- 🔄 **En validación** con usuarios reales

## 🚀 Próximos pasos

- 📋 Historial de pagos
- 🏆 Reputación e identidad descentralizada
- 📦 Generación automática de etiqueta con información para envío de productos

---

**RocketPAY permite cobrar en cripto desde WhatsApp, sin apps ni bancos. Es simple, rápido y está pensado para quienes más lo necesitan.**

## 🛠️ Instalación y Configuración

### Requisitos
- Node.js
- Cuenta de WhatsApp Business API
- Dirección Stellar para recibir pagos

### Variables de Entorno
```env
WHATSAPP_TOKEN=tu_token_de_whatsapp
PHONE_NUMBER_ID=tu_phone_number_id
VERIFY_TOKEN=tu_token_de_verificacion
ADMIN_PHONE_NUMBER=tu_numero_para_notificaciones
```

### Instalación
```bash
npm install
node index.js
```

### Uso
1. Inicia el bot: `node index.js`
2. Expón el puerto: `npx localtunnel --port 3000`
3. Configura el webhook en WhatsApp Business API
4. Envía `/cobrar [monto]` al bot

## 📱 Comandos Disponibles

- `/cobrar [monto]` - Genera un link de pago y QR para el monto especificado

## 🔗 Tecnologías

- **WhatsApp Business API** - Comunicación con usuarios
- **Stellar Blockchain** - Procesamiento de pagos
- **Node.js** - Backend del bot
- **Express.js** - Servidor web
- **QRCode** - Generación de códigos QR
````

## File: package.json
````json
{
  "name": "rocketqr-cloudapi",
  "version": "1.0.0",
  "description": "WhatsApp bot for sending USDC payment links using Meta Cloud API",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "@stellar/stellar-sdk": "^13.3.0",
    "axios": "^1.6.0",
    "body-parser": "^1.20.2",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "form-data": "^4.0.3",
    "node-fetch": "^3.3.2",
    "puppeteer": "^24.12.1",
    "qrcode": "^1.5.4",
    "stellar-sdk": "^13.3.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "keywords": [
    "whatsapp",
    "stellar",
    "usdc",
    "payment",
    "bot"
  ],
  "author": "",
  "license": "MIT"
}
````

## File: validation.js
````javascript
// monitor.js
import StellarSdk from "stellar-sdk";
import fetch from "node-fetch"; // Necesario para node 18- si no usas global fetch
import fs from "fs";

// Configuración
const server = new StellarSdk.Horizon.Server(
  "https://horizon-testnet.stellar.org",
);

const SERVER_URL = process.env.SERVER_URL;

// Leer la dirección desde la variable de entorno
const accountToMonitor = process.env.PUBLIC_KEY;
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
      console.log(txId);

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
    const res = await fetch(`${SERVER_URL}/payment-confirmed1`, {
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
````

## File: index.js
````javascript
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

// Configurar Stellar (temporalmente deshabilitado)
// const StellarSdk = require('stellar-sdk');
// const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const STELLAR_ADDRESS = process.env.PUBLIC_KEY;

// Almacenar pagos pendientes
const pendingPayments = new Map();

const SERVER_URL = process.env.SERVER_URL;

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

// Función para monitorear transacciones Stellar (temporalmente deshabilitada)
/*
async function monitorTransactions() {
  try {
    console.log('🔍 Monitoreando transacciones Stellar...');

    // Obtener transacciones recientes
    const payments = await server.payments()
      .forAccount(STELLAR_ADDRESS)
      .order('desc')
      .limit(10)
      .call();

    for (const payment of payments.records) {
      if (payment.type === 'payment' &&
          payment.to === STELLAR_ADDRESS &&
          payment.asset_type === 'native') { // XLM

        const paymentKey = `${payment.from}_${payment.amount}_RocketQR_Payment`;

        // Verificar si es un pago pendiente
        if (pendingPayments.has(paymentKey)) {
          const pendingPayment = pendingPayments.get(paymentKey);

          console.log(`✅ Pago confirmado: ${payment.amount} XLM de ${payment.from}`);

          // Generar factura
          const invoicePath = await generateInvoice({
            amount: payment.amount,
            sender: payment.from,
            transactionHash: payment.transaction_hash,
            timestamp: new Date().toISOString(),
            memo: payment.memo
          });

          // Enviar notificación al administrador
          await sendPaymentNotification(pendingPayment, payment, invoicePath);

          // Remover de pagos pendientes
          pendingPayments.delete(paymentKey);
        }
      }
    }
  } catch (error) {
    console.log('Error monitoreando transacciones:', error.message);
  }
}
*/

// Función para enviar notificación de pago confirmado (temporalmente deshabilitada)
/*
async function sendPaymentNotification(pendingPayment, confirmedPayment, invoicePath) {
  try {
    const adminNumber = process.env.ADMIN_PHONE_NUMBER;
    if (!adminNumber) {
      console.log('⚠️ ADMIN_PHONE_NUMBER no configurado');
      return;
    }

    // Mensaje de confirmación
    const message = `✅ **PAGO CONFIRMADO**\n\n💰 Monto: ${confirmedPayment.amount} XLM\n👤 Remitente: ${confirmedPayment.from}\n🔗 Hash: ${confirmedPayment.transaction_hash}\n📅 Fecha: ${new Date().toLocaleString()}\n\n🎉 ¡Pago procesado exitosamente!`;

    // Enviar mensaje de texto
    await axios.post(`https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`, {
      messaging_product: "whatsapp",
      to: adminNumber,
      type: "text",
      text: { body: message }
    }, {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`📱 Notificación enviada al administrador: ${adminNumber}`);

    // Si hay factura, enviarla como imagen
    if (invoicePath && fs.existsSync(invoicePath)) {
      const formData = new FormData();
      formData.append('messaging_product', 'whatsapp');
      formData.append('to', adminNumber);
      formData.append('type', 'image');
      formData.append('image', fs.createReadStream(invoicePath));

      await axios.post(`https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`, formData, {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          ...formData.getHeaders()
        }
      });

      console.log(`📄 Factura enviada al administrador`);

      // Limpiar archivo temporal
      setTimeout(() => {
        if (fs.existsSync(invoicePath)) {
          fs.unlinkSync(invoicePath);
        }
      }, 60000); // Eliminar después de 1 minuto
    }

  } catch (error) {
    console.error('Error enviando notificación:', error);
  }
}
*/

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

  if (mode && token === process.env.VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.listen(3000, () => {
  console.log("RocketQR bot running on http://localhost:3000");

  // Iniciar monitoreo de transacciones cada 30 segundos
  // setInterval(monitorTransactions, 30000); // Deshabilitado temporalmente

  // Monitoreo inicial
  // monitorTransactions(); // Deshabilitado temporalmente
});
````
