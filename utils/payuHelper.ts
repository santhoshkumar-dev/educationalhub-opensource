import crypto from "crypto";
import { PayUHashData, PayUVerifyData } from "@/types/payment";

export const generateHash = (data: PayUHashData): string => {
  const {
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
  } = data;

  // CRITICAL: Salt must come from environment variable
  const salt = process.env.PAYU_MERCHANT_SALT;

  if (!salt) {
    throw new Error("PayU merchant salt not configured");
  }

  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;

  return crypto.createHash("sha512").update(hashString).digest("hex");
};

export const verifyHash = (data: PayUVerifyData): boolean => {
  const {
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    status,
    salt,
    hash,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
  } = data;

  // Correct reverse hash sequence
  const hashString = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;

  const generatedHash = crypto
    .createHash("sha512")
    .update(hashString)
    .digest("hex");

  return generatedHash === hash;
};

export const generateTxnId = (): string => {
  return "TXN" + Date.now() + Math.floor(Math.random() * 1000);
};
