
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// console.log("SID:", process.env.TWILIO_ACCOUNT_SID);
// console.log("TOKEN:", process.env.TWILIO_AUTH_TOKEN);
// console.log("PHONE:", process.env.TWILIO_PHONE);

export const sendSMS = async (phone, message) => {
  try {

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: phone
    });

    // console.log("SMS sent to", phone);

  } catch (err) {
    console.log("SMS error:", err.message);
  }
};