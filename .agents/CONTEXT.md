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
scripts/
  tunnel.ts
src/
  services/
    payment.service.ts
    stellar.service.ts
    whatsapp.service.ts
  types/
    env.d.ts
    index.ts
    payment.d.ts
    stellar.d.ts
    whatsapp.d.ts
  workers/
    payment-validator.ts
  index.ts
.env.example
.gitignore
package.json
README.md
```

# Files

## File: scripts/tunnel.ts
````typescript
import { spawn, exec } from "child_process";
import "dotenv/config";

const PORT = process.env.PORT || "3000";
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "rocketqrverify";

let url: string | null = null;
let retries = 0;
const maxRetries = 5;

function startTunnel() {
  if (retries >= maxRetries) {
    console.log("❌ Maximum retries reached. Could not establish a tunnel.");
    return;
  }

  console.log(
    `📡 Attempting to start localtunnel (Attempt ${retries + 1}/${maxRetries})...`,
  );

  const lt = spawn("npx", ["localtunnel", "--port", PORT]);

  lt.stdout.on("data", (data: Buffer) => {
    const output = data.toString();

    if (output.includes("your url is:")) {
      url = output.split("your url is:")[1].trim();
      console.log("\n✅ TUNNEL ESTABLISHED SUCCESSFULLY");
      console.log("=".repeat(60));
      console.log("🌐 Webhook URL:");
      console.log(`   ${url}/webhook`);
      console.log("\n🔑 Verify Token:");
      console.log(`   ${VERIFY_TOKEN}`);
      console.log("\n📋 Configuration for Meta Developer Console:");
      console.log("1. Go to https://developers.facebook.com/");
      console.log("2. Your App → WhatsApp → API Setup");
      console.log(`3. Webhook URL: ${url}/webhook/`);
      console.log(`4. Verify Token: ${VERIFY_TOKEN}`);
      console.log("5. Select: messages");
      console.log('6. Click "Verify and Save"');
      console.log("=".repeat(60));

      // Test the webhook
      setTimeout(() => {
        exec(
          `curl -X GET "${url}/webhook?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=test123"`,
          (error: any, stdout: string, stderr: string) => {
            if (error) {
              console.log("❌ Error testing webhook:", error.message);
            } else {
              console.log("✅ Webhook is responding correctly.");
              console.log(
                "📱 Ready to configure in the Meta Developer Console!",
              );
            }
          },
        );
      }, 3000);
    }
  });

  lt.stderr.on("data", (data: Buffer) => {
    const error = data.toString();
    if (
      error.includes("connection refused") ||
      error.includes("tunnel unavailable")
    ) {
      console.log("❌ Connection error, retrying...");
      lt.kill();
    }
  });

  lt.on("close", (code: number) => {
    if (code !== 0 && !url) {
      console.log(" Tunnel closed unexpectedly, retrying...");
      retries++;
      setTimeout(startTunnel, 2000);
    }
  });
}

startTunnel();
````

## File: src/services/payment.service.ts
````typescript
import { randomBytes } from 'crypto';

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
export function getPendingPayment(memo: string): PendingPayment | undefined {
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
````

## File: src/services/stellar.service.ts
````typescript
import * as StellarSdk from "@stellar/stellar-sdk";
import axios from "axios";
import * as QRCode from "qrcode";

const NETWORK_URL = process.env.NETWORK_URL || "https://horizon-testnet.stellar.org";
export const server = new StellarSdk.Horizon.Server(NETWORK_URL);

/**
 * Generates a Stellar payment URI.
 * @param {string} destination - The destination Stellar address.
 * @param {number} amount - The amount for the payment.
 * @param {string} memo - The memo for the transaction.
 * @returns {string} The Stellar payment URI.
 */
export function createPaymentUri(destination: string, amount: number, memo: string): string {
  return `web+stellar:pay?destination=${destination}&amount=${amount}&memo=${memo}&memo_type=text`;
}

/**
 * Generates a QR code for the given data.
 * @param {string} data - The data to encode in the QR code.
 * @param {string} filename - The path to save the QR code image.
 */
export async function generateQRCode(data: string, filename: string): Promise<boolean> {
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
````

## File: src/services/whatsapp.service.ts
````typescript
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import { Request, Response } from "express";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

/**
 * Sends an image to a WhatsApp number.
 * @param {string} to - The recipient's phone number.
 * @param {string} imagePath - The local path to the image.
 * @param {string} caption - The caption for the image.
 */
export async function sendImage(to: string, imagePath: string, caption: string): Promise<void> {
  try {
    const formData = new FormData();
    formData.append("messaging_product", "whatsapp");
    formData.append("file", fs.createReadStream(imagePath));

    const uploadResponse = await axios.post(
      `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/media`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          ...formData.getHeaders(),
        },
      }
    );

    const mediaId = uploadResponse.data.id;

    await axios.post(
      `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
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
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "Error sending image:",
      (error as any).response?.data || (error as any).message
    );
    throw error;
  }
}

/**
 * Sends a text message to a WhatsApp number.
 * @param {string} to - The recipient's phone number.
 * @param {string} text - The text message to send.
 */
export async function sendTextMessage(to: string, text: string): Promise<void> {
  try {
    await axios.post(
      `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "Error sending text message:",
      (error as any).response?.data || (error as any).message
    );
    throw error;
  }
}

/**
 * Sends a payment confirmation message.
 * @param {object} pendingPayment - The pending payment information.
 * @param {object} confirmedPayment - The confirmed payment details from Stellar.
 */
export async function sendPaymentConfirmation(pendingPayment: any, confirmedPayment: any): Promise<void> {
    const message = `✅ **PAGO CONFIRMADO**\n\n💰 Monto: ${confirmedPayment.amount} XLM\n🔗 Hash: ${confirmedPayment.transaction_hash}\n📅 Fecha: ${new Date().toLocaleString()}\n\n🎉 ¡Pago procesado exitosamente!`;
    await sendTextMessage(pendingPayment.sender, message);
    console.log(`📱 Confirmación enviada al cliente: ${pendingPayment.sender}`);
}
````

## File: src/types/env.d.ts
````typescript
declare namespace NodeJS {
  interface ProcessEnv {
    // WhatsApp API Configuration
    WHATSAPP_ACCESS_TOKEN: string;
    WHATSAPP_PHONE_NUMBER_ID: string;
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: string;
    WHATSAPP_BUSINESS_ACCOUNT_ID: string;
    
    // Stellar Network Configuration
    STELLAR_NETWORK: 'testnet' | 'mainnet';
    STELLAR_HORIZON_URL: string;
    STELLAR_SECRET_KEY: string;
    STELLAR_PUBLIC_KEY: string;
    
    // Server Configuration
    PORT: string;
    NODE_ENV: 'development' | 'production' | 'test';
    API_BASE_URL: string;
    
    // Database Configuration (if needed)
    DATABASE_URL?: string;
    REDIS_URL?: string;
    
    // Logging Configuration
    LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
    
    // Security Configuration
    JWT_SECRET?: string;
    WEBHOOK_SECRET?: string;
    
    // External Services
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
    
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS?: string;
    RATE_LIMIT_MAX_REQUESTS?: string;
    
    // Payment Configuration
    PAYMENT_TIMEOUT_MS?: string;
    MAX_PAYMENT_AMOUNT?: string;
    MIN_PAYMENT_AMOUNT?: string;
    
    // Feature Flags
    ENABLE_WEBHOOK_VALIDATION?: string;
    ENABLE_RATE_LIMITING?: string;
    ENABLE_PAYMENT_NOTIFICATIONS?: string;
  }
}

export {};
````

## File: src/types/index.ts
````typescript
// WhatsApp types
export type {
  Message,
  TextMessage,
  ImageMessage,
  Contact,
  WebhookEntry,
  WebhookPayload,
  OutboundTextMessage,
  OutboundImageMessage,
} from './whatsapp';

// Stellar types
export type {
  StellarPayment,
  StellarTransaction,
  StellarAccount,
  StellarAsset,
  StellarOperationRecord,
} from './stellar';

// Payment types
export type {
  PendingPayment,
  PaymentRequest,
  PaymentResponse,
  PaymentStatus,
} from './payment';

// Environment types are automatically available through the declaration merge
// No need to export them explicitly
````

## File: src/types/payment.d.ts
````typescript
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
````

## File: src/types/stellar.d.ts
````typescript
export interface StellarPayment {
  amount: string;
  memo: string | null;
  to: string;
  transaction_hash: string;
  asset_code?: string;
  asset_issuer?: string;
  from?: string;
  created_at?: string;
  paging_token?: string;
}

export interface StellarTransaction {
  transaction_hash: string;
  amount: string;
  memo: string | null;
  to: string;
  from?: string;
  created_at?: string;
  successful?: boolean;
  fee_charged?: string;
  operation_count?: number;
  envelope_xdr?: string;
  result_xdr?: string;
  result_meta_xdr?: string;
  ledger?: number;
  paging_token?: string;
}

export interface StellarAccount {
  account_id: string;
  sequence: string;
  subentry_count: number;
  balances: Array<{
    balance: string;
    buying_liabilities: string;
    selling_liabilities: string;
    asset_type: string;
    asset_code?: string;
    asset_issuer?: string;
  }>;
  signers: Array<{
    weight: number;
    key: string;
    type: string;
  }>;
  data: Record<string, string>;
  flags: {
    auth_required: boolean;
    auth_revocable: boolean;
    auth_immutable: boolean;
    auth_clawback_enabled: boolean;
  };
  thresholds: {
    low_threshold: number;
    med_threshold: number;
    high_threshold: number;
  };
}

export interface StellarAsset {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
}

export interface StellarOperationRecord {
  id: string;
  type: string;
  type_i: number;
  created_at: string;
  transaction_hash: string;
  source_account: string;
  paging_token: string;
}
````

## File: src/types/whatsapp.d.ts
````typescript
export interface Message {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: TextMessage;
  image?: ImageMessage;
}

export interface TextMessage {
  body: string;
}

export interface ImageMessage {
  caption?: string;
  mime_type: string;
  sha256: string;
  id: string;
}

export interface Contact {
  profile: {
    name: string;
  };
  wa_id: string;
}

export interface WebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: Contact[];
      messages?: Message[];
      statuses?: Array<{
        id: string;
        status: string;
        timestamp: string;
        recipient_id: string;
        conversation?: {
          id: string;
          expiration_timestamp?: string;
          origin: {
            type: string;
          };
        };
        pricing?: {
          billable: boolean;
          pricing_model: string;
          category: string;
        };
      }>;
    };
    field: string;
  }>;
}

export interface WebhookPayload {
  object: string;
  entry: WebhookEntry[];
}

export interface OutboundTextMessage {
  messaging_product: string;
  recipient_type: string;
  to: string;
  type: string;
  text: {
    preview_url: boolean;
    body: string;
  };
}

export interface OutboundImageMessage {
  messaging_product: string;
  recipient_type: string;
  to: string;
  type: string;
  image: {
    link: string;
    caption?: string;
  };
}
````

## File: src/workers/payment-validator.ts
````typescript
import "dotenv/config";
import { server } from "../services/stellar.service";
import { getPendingPayment, removePendingPayment } from "../services/payment.service";
import { sendPaymentConfirmation } from "../services/whatsapp.service";

const STELLAR_ADDRESS = process.env.PUBLIC_KEY!;

/**
 * Validates an incoming Stellar payment against our pending payments.
 * @param {object} payment - The payment record from the Stellar stream.
 */
async function validatePayment(payment: any): Promise<void> {
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
      onerror: (error: any) => {
        console.error("Error in Stellar stream:", error);
      },
    });
}

startMonitoring();
````

## File: src/index.ts
````typescript
import "dotenv/config";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";

import { sendImage, sendTextMessage } from "./services/whatsapp.service";
import { createPaymentUri, generateQRCode } from "./services/stellar.service";
import { createPendingPayment } from "./services/payment.service";

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || "3000";
const STELLAR_ADDRESS = process.env.PUBLIC_KEY!;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const formatNumber = (number: string): string => {
  // Remove the first "9" if the number starts with "549"
  if (number.startsWith("549")) {
    return "54" + number.substring(3);
  }
  return number;
};

app.post("/webhook", async (req: Request, res: Response) => {
  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (msg?.text?.body) {
    const sender = msg.from;
    const body = msg.text.body;
    const number = formatNumber(sender);

    console.log(`Mensaje recibido de ${number}: ${body}`);

    if (body.startsWith("/cobrar")) {
      const amount = parseFloat(body.split(" ")[1]);

      try {
        // 1. Create a pending payment and get a unique memo
        const memo = createPendingPayment(number, amount);

        // 2. Create the Stellar payment URI
        const stellarUri = createPaymentUri(STELLAR_ADDRESS, amount, memo);

        // 3. Generate QR code
        const qrFilename = `qr_${Date.now()}.png`;
        const qrGenerated = await generateQRCode(stellarUri, qrFilename);

        if (qrGenerated) {
          const qrPath = path.join(process.cwd(), qrFilename);

          // 4. Send QR code and instructions
          await sendImage(
            number,
            qrPath,
            `💸 Escanea con tu wallet para pagar ${amount} XLM.`,
          );

          await sendTextMessage(
            number,
            `O usa este link de pago:\n${stellarUri}`,
          );

          // 5. Clean up the QR file
          fs.unlinkSync(qrPath);
        } else {
          // Fallback if QR generation fails
          await sendTextMessage(
            number,
            `No se pudo generar el QR. Por favor, usa este link de pago:\n${stellarUri}`,
          );
        }
      } catch (error) {
        console.error("Error procesando el cobro:", error);
        await sendTextMessage(
          number,
          "Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.",
        );
      }
    }
  }

  res.sendStatus(200);
});

app.get("/webhook", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 RocketPay bot running on port ${PORT}`);
  // The payment validation worker should be started as a separate process
});
````

## File: .env.example
````
WHATSAPP_TOKEN=
VERIFY_TOKEN=your_secret_verify_token
PUBLIC_KEY=
PHONE_NUMBER_ID=

SERVER_URL="https://localhost:3000/"
PORT="3000"
NETWORK_URL="https://horizon-testnet.stellar.org"
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
Crea un archivo `.env` a partir de `.env.example` y complétalo con tus credenciales:

```env
WHATSAPP_TOKEN=tu_token_de_whatsapp
PHONE_NUMBER_ID=tu_phone_number_id
VERIFY_TOKEN=tu_token_de_verificacion_secreto
PUBLIC_KEY=tu_direccion_publica_de_stellar
```

### Instalación
```bash
npm install
```

### Uso

1. **Iniciar el servidor principal:**
   ```bash
   npm start
   ```

2. **Iniciar el validador de pagos (en una terminal separada):**
   ```bash
   npm run validator
   ```

3. **Exponer el puerto a internet (en una tercera terminal):**
   ```bash
   npm run tunnel
   ```

4. Configura el webhook en tu App de Meta Developers con la URL de localtunnel y tu `VERIFY_TOKEN`.

5. Envía `/cobrar [monto]` al número de WhatsApp de tu bot.

## 📱 Comandos Disponibles

- `/cobrar [monto]` - Genera un link de pago y QR para el monto especificado

## 🔗 Tecnologías

- **WhatsApp Business API** - Comunicación con usuarios
- **Stellar Blockchain** - Procesamiento de pagos
- **Node.js** - Backend del bot
- **Express.js** - Servidor web
- **QRCode** - Generación de códigos QR
````

## File: .gitignore
````
node_modules
.env
qr_*
dist/


.repomixignore
repomix.config.json
lt_url.txt
````

## File: package.json
````json
{
  "name": "rocketqr-cloudapi",
  "version": "1.0.0",
  "description": "WhatsApp bot for sending USDC payment links using Meta Cloud API",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "validator": "node dist/workers/payment-validator.js",
    "validator:dev": "ts-node src/workers/payment-validator.ts",
    "tunnel": "ts-node --esm scripts/tunnel.ts"
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
    "qrcode": "^1.5.4"
  },
  "devDependencies": {
    "@types/body-parser": "^1.19.6",
    "@types/express": "^5.0.3",
    "@types/form-data": "^2.2.1",
    "@types/fs-extra": "^11.0.4",
    "@types/node": "^24.0.13",
    "@types/qrcode": "^1.5.5",
    "@types/stellar-sdk": "^0.11.1",
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.2",
    "typescript": "^5.8.3"
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
