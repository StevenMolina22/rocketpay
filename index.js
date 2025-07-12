require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const StellarSdk = require('stellar-sdk');
const puppeteer = require('puppeteer');
const app = express();

app.use(bodyParser.json());

// Configurar Stellar SDK
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const STELLAR_ADDRESS = 'GC44BXE3H7GCKN3PZ4VDJIOYB7XOH3C4XLVYG7MFKURMNQLNZKLII5D4';

// Almacenar pagos pendientes
const pendingPayments = new Map();

// Función para generar QR code
async function generateQRCode(data, filename) {
  try {
    await QRCode.toFile(filename, data, {
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300,
      margin: 2
    });
    return true;
  } catch (error) {
    console.error('Error generando QR:', error);
    return false;
  }
}

// Función para crear link clickeable usando tinyurl
async function createClickableLink(stellarUri) {
  try {
    // Crear un link de redirección usando tinyurl
    const response = await axios.post('https://tinyurl.com/api-create.php', null, {
      params: {
        url: stellarUri
      }
    });
    
    if (response.data && response.data.startsWith('http')) {
      return response.data;
    }
    
    // Fallback: usar un servicio alternativo
    const fallbackResponse = await axios.post('https://api.short.io/links', {
      originalURL: stellarUri,
      domain: 'tiny.one'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return fallbackResponse.data.shortURL || stellarUri;
  } catch (error) {
    console.error('Error creando link clickeable:', error.message);
    // Si falla, devolver el URI original
    return stellarUri;
  }
}

// Función para enviar imagen a WhatsApp
async function sendImageToWhatsApp(phoneNumberId, to, imagePath, caption) {
  try {
    // Primero subir la imagen a WhatsApp
    const formData = new FormData();
    formData.append('messaging_product', 'whatsapp');
    formData.append('file', fs.createReadStream(imagePath));

    const uploadResponse = await axios.post(
      `https://graph.facebook.com/v22.0/${phoneNumberId}/media`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
          ...formData.getHeaders()
        }
      }
    );

    const mediaId = uploadResponse.data.id;

    // Luego enviar la imagen con caption
    const response = await axios.post(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
      messaging_product: "whatsapp",
      to: to,
      type: "image",
      image: {
        id: mediaId,
        caption: caption
      }
    }, {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error enviando imagen:', error.response?.data || error.message);
    throw error;
  }
}

// Función para generar factura/ticket
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
        .row { 
          display: flex; 
          justify-content: space-between; 
          margin: 8px 0;
          font-size: 14px;
        }
        .total { 
          border-top: 1px solid #000; 
          font-weight: bold; 
          font-size: 16px;
          margin-top: 15px;
          padding-top: 10px;
        }
        .footer { 
          text-align: center; 
          margin-top: 30px; 
          font-size: 12px;
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }
        .hash { 
          font-size: 10px; 
          word-break: break-all;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">🚀 ROCKET QR</div>
        <div class="subtitle">Pago Confirmado</div>
        <div class="subtitle">${new Date(timestamp).toLocaleString('es-AR')}</div>
      </div>
      
      <div class="row">
        <span>Servicio:</span>
        <span>Pago XLM</span>
      </div>
      <div class="row">
        <span>Monto:</span>
        <span>${amount} XLM</span>
      </div>
      <div class="row">
        <span>Remitente:</span>
        <span>${sender}</span>
      </div>
      <div class="row">
        <span>Memo:</span>
        <span>${memo || 'RocketQR_Payment'}</span>
      </div>
      
      <div class="total">
        <div class="row">
          <span>TOTAL:</span>
          <span>${amount} XLM</span>
        </div>
      </div>
      
      <div class="footer">
        <div>✅ PAGO CONFIRMADO</div>
        <div>Gracias por usar RocketQR</div>
        <div class="hash">Hash: ${transactionHash}</div>
      </div>
    </body>
    </html>
  `;

  const filename = `invoice_${Date.now()}.png`;
  
  try {
    // Usar Puppeteer para convertir HTML a imagen PNG
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    await page.setViewport({ width: 440, height: 600 });
    
    // Generar la imagen
    await page.screenshot({
      path: filename,
      type: 'png',
      fullPage: true
    });
    
    await browser.close();
    console.log(`🧾 Factura generada: ${filename}`);
    return filename;
  } catch (error) {
    console.error('Error generando factura:', error);
    // Fallback: crear archivo de texto
    const textFilename = `invoice_${Date.now()}.txt`;
    fs.writeFileSync(textFilename, htmlContent);
    return textFilename;
  }
}

// Función para monitorear transacciones Stellar
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
          
          console.log(`✅ Pago confirmado: ${paymentKey}`);
          console.log(`💰 Monto: ${payment.amount} XLM`);
          console.log(`👤 Remitente: ${payment.from}`);
          console.log(`🔗 Hash: ${payment.transaction_hash}`);
          
          // Generar factura
          const invoicePath = await generateInvoice({
            amount: payment.amount,
            sender: payment.from,
            transactionHash: payment.transaction_hash,
            timestamp: new Date(payment.created_at).getTime(),
            memo: payment.memo || 'RocketQR_Payment'
          });
          
          // Enviar notificación al administrador
          await sendPaymentNotification(pendingPayment, payment, invoicePath);
          
          // Remover de pagos pendientes
          pendingPayments.delete(paymentKey);
        }
      }
    }
  } catch (error) {
    console.error('Error monitoreando transacciones:', error);
  }
}

// Función para enviar notificación de pago confirmado
async function sendPaymentNotification(pendingPayment, confirmedPayment, invoicePath) {
  try {
    const adminNumber = process.env.ADMIN_PHONE_NUMBER;
    if (!adminNumber) {
      console.log('⚠️ ADMIN_PHONE_NUMBER no configurado');
      return;
    }
    
    // Formatear número del administrador
    let formattedAdminNumber = adminNumber;
    if (adminNumber === '5492235397307') {
      formattedAdminNumber = '54223155397307';
    }
    
    // Mensaje de confirmación
    const confirmationMessage = `✅ **PAGO CONFIRMADO**\n\n💰 Monto: ${confirmedPayment.amount} XLM\n👤 Remitente: ${confirmedPayment.from}\n🔗 Hash: ${confirmedPayment.transaction_hash}\n⏰ Fecha: ${new Date(confirmedPayment.created_at).toLocaleString('es-AR')}\n\n📝 Factura generada y lista para enviar`;
    
    // Enviar mensaje de confirmación
    await axios.post(`https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`, {
      messaging_product: "whatsapp",
      to: formattedAdminNumber,
      type: "text",
      text: { body: confirmationMessage }
    }, {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Si hay factura, enviarla también
    if (invoicePath && fs.existsSync(invoicePath)) {
      await sendImageToWhatsApp(
        process.env.PHONE_NUMBER_ID,
        formattedAdminNumber,
        invoicePath,
        `🧾 Factura - Pago de ${confirmedPayment.amount} XLM`
      );
      
      // Limpiar archivo de factura
      setTimeout(() => {
        if (fs.existsSync(invoicePath)) {
          fs.unlinkSync(invoicePath);
        }
      }, 60000); // Eliminar después de 1 minuto
    }
    
    console.log('📱 Notificación de pago enviada al administrador');
    
  } catch (error) {
    console.error('Error enviando notificación:', error);
  }
}

app.post('/webhook', async (req, res) => {
  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (msg?.text?.body) {
    const sender = msg.from;
    const body = msg.text.body;

    console.log(`Mensaje recibido de ${sender}: ${body}`);

    if (body.startsWith('/cobrar')) {
      const monto = parseFloat(body.split(' ')[1]) || 5.0;
      
      // URI Stellar estándar que Lobster reconoce automáticamente para XLM
      const stellarUri = `web+stellar:pay?destination=GC44BXE3H7GCKN3PZ4VDJIOYB7XOH3C4XLVYG7MFKURMNQLNZKLII5D4&amount=${monto}&memo_type=text&memo=RocketQR_Payment`;
      
      // Link web que redirige al URI Stellar (para navegadores)
      const webRedirectUri = `https://stellar.expert/explorer/public/account/GC44BXE3H7GCKN3PZ4VDJIOYB7XOH3C4XLVYG7MFKURMNQLNZKLII5D4?tab=payments&amount=${monto}`;

      // Convertir el número al formato que funcionó en curl
      let formattedNumber = sender;
      if (sender === '5492235397307') {
        formattedNumber = '54223155397307';
      }

      console.log(`Enviando respuesta a ${formattedNumber} con monto ${monto}`);
      console.log(`Número original: "${sender}" -> Formateado: "${formattedNumber}"`);

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
          memo: 'RocketQR_Payment'
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
            `💸 QR para Lobster:\nEscanea con Lobster para pago automático`
          );

          // Enviar mensaje de texto con el URI Stellar
          const textResponse = await axios.post(`https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`, {
            messaging_product: "whatsapp",
            to: formattedNumber,
            type: "text",
            text: { body: `💸 URI Stellar (para Lobster):\n${stellarUri}\n\n💰 Monto: ${monto} XLM\n📍 Destino: GC44BXE3H7GCKN3PZ4VDJIOYB7XOH3C4XLVYG7MFKURMNQLNZKLII5D4\n\n📱 Instrucciones:\n1. Copia el URI Stellar\n2. Pégalo en Lobster\n3. O escanea el QR con Lobster` }
          }, {
            headers: {
              Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('QR y mensaje enviados exitosamente');
          
          // Limpiar archivo QR
          fs.unlinkSync(qrFilename);
        } else {
          // Si falla el QR, enviar solo texto
          const response = await axios.post(`https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`, {
            messaging_product: "whatsapp",
            to: formattedNumber,
            type: "text",
            text: { body: `💸 URI Stellar (para Lobster):\n${stellarUri}\n\n💰 Monto: ${monto} XLM\n📍 Destino: GC44BXE3H7GCKN3PZ4VDJIOYB7XOH3C4XLVYG7MFKURMNQLNZKLII5D4\n\n📱 Instrucciones:\n1. Copia el URI Stellar\n2. Pégalo en Lobster\n3. O escanea el QR con Lobster` }
          }, {
            headers: {
              Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('Mensaje de texto enviado exitosamente:', response.data);
        }
      } catch (error) {
        console.error('Error enviando mensaje:', error.response?.data || error.message);
        console.error('Request data:', {
          to: formattedNumber,
          phone_number_id: process.env.PHONE_NUMBER_ID
        });
      }
    }
  }

  res.sendStatus(200);
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === process.env.VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.listen(3000, () => {
  console.log('RocketQR bot running on http://localhost:3000');
  
  // Iniciar monitoreo de transacciones cada 30 segundos
  setInterval(monitorTransactions, 30000);
  
  // Monitoreo inicial
  monitorTransactions();
});
