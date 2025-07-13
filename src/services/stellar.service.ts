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

