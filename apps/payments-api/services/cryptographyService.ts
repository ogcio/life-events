import crypto from "crypto";

class CryptographyService {
  private algorithm: string;
  private key: Buffer;

  constructor() {
    const encryptionKeyBase64 = process.env.PAYMENTS_PROVIDERS_ENCRYPTION_KEY;
    if (!encryptionKeyBase64)
      throw Error("Missing env var PAYMENTS_PROVIDERS_ENCRYPTION_KEY");

    this.key = Buffer.from(encryptionKeyBase64, "base64");
    this.algorithm = "aes-256-cbc";
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + encrypted;
  }

  decrypt(encryptedText: string): string {
    const iv = Buffer.from(encryptedText.slice(0, 32), "hex");
    const encrypted = encryptedText.slice(32);
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
}

export default CryptographyService;
