import * as StellarSdk from "@stellar/stellar-sdk";
import axios from "axios";
import * as QRCode from "qrcode";

const NETWORK_URL =
  process.env.NETWORK_URL || "https://horizon-testnet.stellar.org";
export const server = new StellarSdk.Horizon.Server(NETWORK_URL);

export function createPaymentUri(
  destination: string,
  amount: number,
  memo: string,
): string {
  return `web+stellar:pay?destination=${destination}&amount=${amount}&memo=${memo}&memo_type=text`;
}

export async function generateQRCode(
  data: string,
  filename: string,
): Promise<boolean> {
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
