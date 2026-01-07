import crypto from "crypto";

//  Generate a proper AES-256 key
// Run this in terminal:
// node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.AES_SECRET_KEY, "hex");

export function encrypt(text) {
  const iv = crypto.randomBytes(16);   // initialization vector
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

export function decrypt(data) {
  const [ivHex, encryptedText] = data.split(":");
  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
