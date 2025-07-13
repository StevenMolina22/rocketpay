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
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "rocketqrverify";

app.post("/webhook", async (req: Request, res: Response) => {
  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (msg?.text?.body) {
    const sender = msg.from;
    const body = msg.text.body;

    console.log(`Mensaje recibido de ${sender}: ${body}`);

    if (body.startsWith("/cobrar")) {
      const amount = parseFloat(body.split(" ")[1]) || 5.0;
      
      try {
        // 1. Create a pending payment and get a unique memo
        const memo = createPendingPayment(sender, amount);

        // 2. Create the Stellar payment URI
        const stellarUri = createPaymentUri(STELLAR_ADDRESS, amount, memo);

        // 3. Generate QR code
        const qrFilename = `qr_${Date.now()}.png`;
        const qrGenerated = await generateQRCode(stellarUri, qrFilename);

        if (qrGenerated) {
          const qrPath = path.join(process.cwd(), qrFilename);
          
          // 4. Send QR code and instructions
          await sendImage(
            sender,
            qrPath,
            `💸 Escanea con tu wallet para pagar ${amount} XLM.`
          );

          await sendTextMessage(
            sender,
            `O usa este link de pago:\n${stellarUri}`
          );

          // 5. Clean up the QR file
          fs.unlinkSync(qrPath);
        } else {
          // Fallback if QR generation fails
          await sendTextMessage(
            sender,
            `No se pudo generar el QR. Por favor, usa este link de pago:\n${stellarUri}`
          );
        }
      } catch (error) {
        console.error("Error procesando el cobro:", error);
        await sendTextMessage(
          sender,
          "Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo."
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