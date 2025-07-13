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


