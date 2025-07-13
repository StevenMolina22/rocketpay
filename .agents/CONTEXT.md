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
.agents/
  AGENT.md
.env.example
.gitignore
.repomixignore
get_current_url.js
get_url.js
index.js
lt_url.txt
package.json
Procfile
README.md
repomix.config.json
simple_tunnel.js
stable_tunnel.js
start_tunnel.js
validation.js
```

# Files

## File: .agents/AGENT.md
````markdown
# 🤖 Agent Guide

This document defines how an agent should operate within this project. **Follow these instructions strictly.**

---

### 🧭 Project Awareness & Context

- **Always read `.agents/PLANNING.md`** at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
- **Check `.agents/TASKS.md`** before starting a new task. If the task isn’t listed, add it with a brief description and today's date.
- **Check `.agents/RULES.md`** for any rules the project has.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `.agents/PLANNING.md`.

---

### 🧱 Code Structure & Modularity

- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
- **Use clear, consistent imports** (prefer relative imports within packages).

---

### ✅ Task Completion

- **Mark completed tasks in `.agents/TASKS.md`** immediately after finishing them.
- **Add discovered bugs or sub-tasks** during development under “Discovered During Work” in `.agents/TASKS.md`.
- **Focus ONLY on the requested problem or feature**.
  - If unrelated issues are found, log them under “Discovered During Work.”
  - Do not fix unrelated issues unless they block the current task.

---

### 📚 Documentation & Explainability

- **Update `README.md`** when new features are added, dependencies change, or setup steps are modified.
- **Update `.agents/`** when new features are added, tasks are done or there is any relevant change on the codebase, **ALWAYS** make sure the `.agents/` folder is up to date with the codebase
- **For complex logic, add inline `# Reason:` comment** explaining the why, not just the what.

---

### 🧠 AI Behavior Rules

- **Never assume missing context. Ask questions if uncertain.**
- **Always confirm file paths and module names** exist before referencing them in code.
- **Never delete or overwrite existing code** unless explicitly instructed to or if part of a task from `.agents/TASKS.md`.
- **Focus ONLY on the problem and prompt at hand** Do not build unrelated features
- **ALWAYS plan before codign complex tasks** Wait for approval before proceeding with implementation
- When planning, analyze options first — don’t implement until requested
- Install new dependencies only if absolutely required by the task.
- If an error occurs during execution or installation, document the error in `.agents/TASKS.md` and propose a resolution before proceeding.
- Use environment variables over hard-coded keys

---

### Coding Rules

- Use `pnpm` on node if possible, except if other package manager is being used.
- Always use `uv` as a python manager. Run libraries with `uv run ...`.
- For `python` testing use `assert` when enough or `pytes` when necessary
- Always use function components in `react`
- Always use modern type hints in python (3.13+).

---

## ✔️ Summary

**Stick to these principles.**
Keep `.agents/` and the codebase in sync.
Communicate context, plan carefully, commit small, test everything.
If you’re unsure — ask.
No assumptions.
No shortcuts.

---
````

## File: .repomixignore
````
# Add patterns to ignore here, one per line
# Example:
# *.log
# tmp/


repomix
````

## File: repomix.config.json
````json
{
  "input": {
    "maxFileSize": 52428800
  },
  "output": {
    "filePath": ".agents/ROCKETPAY.md",
    "style": "markdown",
    "parsableStyle": false,
    "fileSummary": true,
    "directoryStructure": true,
    "files": true,
    "removeComments": false,
    "removeEmptyLines": false,
    "compress": false,
    "topFilesLength": 5,
    "showLineNumbers": false,
    "copyToClipboard": false,
    "git": {
      "sortByChanges": true,
      "sortByChangesMaxCommits": 100
    }
  },
  "include": [],
  "ignore": {
    "useGitignore": true,
    "useDefaultPatterns": true,
    "customPatterns": []
  },
  "security": {
    "enableSecurityCheck": true
  },
  "tokenCount": {
    "encoding": "o200k_base"
  }
}
````

## File: .env.example
````
WHATSAPP_TOKEN=
VERIFY_TOKEN=
PUBLIC_KEY=
PHONE_NUMBER_ID=

SERVER_URL="https://localhost:3000/"
PORT="3000"
NETWORK_URL="https://horizon-testnet.stellar.org"
````

## File: get_current_url.js
````javascript
const { spawn } = require('child_process');

console.log('🔍 Obteniendo URL actual de localtunnel...');

// Intentar obtener la URL del API de localtunnel
const { exec } = require('child_process');

exec('curl -s http://localhost:4040/api/tunnels', (error, stdout, stderr) => {
  if (error || !stdout) {
    console.log('❌ No se pudo obtener la URL del API');
    console.log('💡 Iniciando localtunnel manualmente...');
    
    const lt = spawn('npx', ['localtunnel', '--port', '3000']);
    
    lt.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('your url is:')) {
        const url = output.split('your url is:')[1].trim();
        console.log('\n✅ URL OBTENIDA:');
        console.log('='.repeat(50));
        console.log('🌐 Webhook URL:');
        console.log(`${url}/webhook`);
        console.log('\n🔑 Verify Token:');
        console.log('RocketQR_2024');
        console.log('='.repeat(50));
        
        // Probar el webhook
        setTimeout(() => {
          exec(`curl -X GET "${url}/webhook?hub.mode=subscribe&hub.verify_token=RocketQR_2024&hub.challenge=test123"`, (error, stdout, stderr) => {
            if (error) {
              console.log('❌ Error probando webhook:', error.message);
            } else {
              console.log('✅ Webhook funcionando correctamente');
              console.log('📱 ¡Listo para configurar en Meta Developer Console!');
            }
          });
        }, 2000);
      }
    });
  } else {
    try {
      const tunnels = JSON.parse(stdout);
      if (tunnels.tunnels && tunnels.tunnels.length > 0) {
        const url = tunnels.tunnels[0].public_url;
        console.log('\n✅ URL OBTENIDA:');
        console.log('='.repeat(50));
        console.log('🌐 Webhook URL:');
        console.log(`${url}/webhook`);
        console.log('\n🔑 Verify Token:');
        console.log('RocketQR_2024');
        console.log('='.repeat(50));
        
        // Probar el webhook
        exec(`curl -X GET "${url}/webhook?hub.mode=subscribe&hub.verify_token=RocketQR_2024&hub.challenge=test123"`, (error, stdout, stderr) => {
          if (error) {
            console.log('❌ Error probando webhook:', error.message);
          } else {
            console.log('✅ Webhook funcionando correctamente');
            console.log('📱 ¡Listo para configurar en Meta Developer Console!');
          }
        });
      }
    } catch (e) {
      console.log('❌ Error parseando respuesta del API');
    }
  }
});
````

## File: get_url.js
````javascript
const { spawn } = require('child_process');

console.log('Iniciando localtunnel...');

const lt = spawn('npx', ['localtunnel', '--port', '3000']);

lt.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  if (output.includes('your url is:')) {
    const url = output.split('your url is:')[1].trim();
    console.log('\n🌐 URL del Webhook:');
    console.log(`${url}/webhook`);
    console.log('\n🔑 Verify Token:');
    console.log('RocketQR_2024');
    
    // Probar el webhook
    const { exec } = require('child_process');
    exec(`curl -X GET "${url}/webhook?hub.mode=subscribe&hub.verify_token=RocketQR_2024&hub.challenge=test123"`, (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Error probando webhook:', error.message);
      } else {
        console.log('✅ Webhook funcionando correctamente');
      }
    });
  }
});

lt.stderr.on('data', (data) => {
  console.error('Error:', data.toString());
});

lt.on('close', (code) => {
  console.log(`Localtunnel terminado con código ${code}`);
});
````

## File: lt_url.txt
````
your url is: https://legal-cars-pay.loca.lt
````

## File: Procfile
````
web: node index.js
worker: node validation.js
````

## File: simple_tunnel.js
````javascript
const { spawn } = require('child_process');

console.log('🚀 Configurando RocketQR Bot...');

// Intentar con diferentes subdominios
const subdomains = ['rocketqr-bot', 'rocketqr', 'stellar-bot', 'whatsapp-bot'];

function trySubdomain(index) {
  if (index >= subdomains.length) {
    console.log('❌ No se pudo establecer conexión con localtunnel');
    console.log('💡 Intenta usar ngrok o un servicio similar');
    return;
  }

  const subdomain = subdomains[index];
  console.log(`📡 Intentando con subdominio: ${subdomain}`);
  
  const lt = spawn('npx', ['localtunnel', '--port', '3000', '--subdomain', subdomain]);
  
  let url = null;
  
  lt.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
    
    if (output.includes('your url is:')) {
      url = output.split('your url is:')[1].trim();
      console.log('\n✅ TÚNEL CONFIGURADO EXITOSAMENTE');
      console.log('='.repeat(50));
      console.log('🌐 Webhook URL:');
      console.log(`${url}/webhook`);
      console.log('\n🔑 Verify Token:');
      console.log('RocketQR_2024');
      console.log('\n📋 Configuración para Meta Developer Console:');
      console.log('1. Ve a https://developers.facebook.com/');
      console.log('2. Tu app → WhatsApp → API Setup');
      console.log('3. Webhook URL: ' + url + '/webhook');
      console.log('4. Verify Token: RocketQR_2024');
      console.log('5. Selecciona: messages, message_deliveries');
      console.log('6. Haz clic en "Verify and Save"');
      console.log('='.repeat(50));
    }
  });
  
  lt.stderr.on('data', (data) => {
    const error = data.toString();
    if (error.includes('subdomain')) {
      console.log(`❌ Subdominio ${subdomain} no disponible, probando siguiente...`);
      lt.kill();
      setTimeout(() => trySubdomain(index + 1), 1000);
    }
  });
  
  lt.on('close', (code) => {
    if (code !== 0 && !url) {
      setTimeout(() => trySubdomain(index + 1), 1000);
    }
  });
}

trySubdomain(0);
````

## File: stable_tunnel.js
````javascript
const { spawn } = require('child_process');

console.log('🚀 Iniciando túnel estable para RocketQR...');

let url = null;
let retries = 0;
const maxRetries = 5;

function startTunnel() {
  if (retries >= maxRetries) {
    console.log('❌ Máximo de intentos alcanzado');
    return;
  }

  console.log(`📡 Intento ${retries + 1}/${maxRetries}...`);
  
  const lt = spawn('npx', ['localtunnel', '--port', '3000']);
  
  lt.stdout.on('data', (data) => {
    const output = data.toString();
    
    if (output.includes('your url is:')) {
      url = output.split('your url is:')[1].trim();
      console.log('\n✅ TÚNEL ESTABLE CONFIGURADO');
      console.log('='.repeat(60));
      console.log('🌐 Webhook URL:');
      console.log(`${url}/webhook`);
      console.log('\n🔑 Verify Token:');
      console.log('rocketqrverify');
      console.log('\n📋 Configuración para Meta Developer Console:');
      console.log('1. Ve a https://developers.facebook.com/');
      console.log('2. Tu app → WhatsApp → API Setup');
      console.log('3. Webhook URL: ' + url + '/webhook');
      console.log('4. Verify Token: rocketqrverify');
      console.log('5. Selecciona: messages, message_deliveries');
      console.log('6. Haz clic en "Verify and Save"');
      console.log('='.repeat(60));
      
      // Probar el webhook
      setTimeout(() => {
        const { exec } = require('child_process');
        exec(`curl -X GET "${url}/webhook?hub.mode=subscribe&hub.verify_token=rocketqrverify&hub.challenge=test123"`, (error, stdout, stderr) => {
          if (error) {
            console.log('❌ Error probando webhook:', error.message);
          } else {
            console.log('✅ Webhook funcionando correctamente');
            console.log('📱 ¡Listo para configurar en Meta Developer Console!');
          }
        });
      }, 3000);
    }
  });
  
  lt.stderr.on('data', (data) => {
    const error = data.toString();
    if (error.includes('connection refused') || error.includes('tunnel unavailable')) {
      console.log('❌ Error de conexión, reintentando...');
      lt.kill();
      retries++;
      setTimeout(startTunnel, 2000);
    }
  });
  
  lt.on('close', (code) => {
    if (code !== 0 && !url) {
      console.log('❌ Túnel cerrado inesperadamente, reintentando...');
      retries++;
      setTimeout(startTunnel, 2000);
    }
  });
}

startTunnel();
````

## File: start_tunnel.js
````javascript
const { spawn } = require('child_process');

console.log('🚀 Iniciando RocketQR Bot...');
console.log('📡 Configurando túnel público...');

// Iniciar localtunnel
const lt = spawn('npx', ['localtunnel', '--port', '3000']);

let url = null;

lt.stdout.on('data', (data) => {
  const output = data.toString();
  
  if (output.includes('your url is:')) {
    url = output.split('your url is:')[1].trim();
    
    console.log('\n✅ TÚNEL CONFIGURADO EXITOSAMENTE');
    console.log('='.repeat(50));
    console.log('🌐 Webhook URL:');
    console.log(`${url}/webhook`);
    console.log('\n🔑 Verify Token:');
    console.log('RocketQR_2024');
    console.log('\n📋 Configuración para Meta Developer Console:');
    console.log('1. Ve a https://developers.facebook.com/');
    console.log('2. Tu app → WhatsApp → API Setup');
    console.log('3. Webhook URL: ' + url + '/webhook');
    console.log('4. Verify Token: RocketQR_2024');
    console.log('5. Selecciona: messages, message_deliveries');
    console.log('6. Haz clic en "Verify and Save"');
    console.log('='.repeat(50));
    
    // Probar el webhook
    setTimeout(() => {
      const { exec } = require('child_process');
      exec(`curl -X GET "${url}/webhook?hub.mode=subscribe&hub.verify_token=RocketQR_2024&hub.challenge=test123"`, (error, stdout, stderr) => {
        if (error) {
          console.log('❌ Error probando webhook:', error.message);
        } else {
          console.log('✅ Webhook funcionando correctamente');
          console.log('📱 ¡Listo para recibir mensajes de WhatsApp!');
        }
      });
    }, 2000);
  }
});

lt.stderr.on('data', (data) => {
  console.error('Error:', data.toString());
});

lt.on('close', (code) => {
  console.log(`\n❌ Túnel cerrado con código ${code}`);
  console.log('Reinicia el script si necesitas continuar');
});
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

const SERVER_URL = process.env.SERVER_URL;
const NETWORK_URL =
  process.env.SERVER_URL || "https://horizon-testnet.stellar.org";

// Configuración
const server = new StellarSdk.Horizon.Server(NETWORK_URL);

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
````
