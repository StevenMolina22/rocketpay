import "dotenv/config";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { startPaymentMonitoring } from "./services/payment-monitor.service";
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

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 RocketPay bot running on port ${PORT}`);
  startPaymentMonitoring(); // Start the payment monitoring service
});
