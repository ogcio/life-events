import crypto from "crypto";

class CryptographyService {
  private encryptionAlgorithm: string;
  private hashAlgorithm: string;
  private encryptionKey: Buffer;

  constructor() {
    const encryptionKeyBase64 = process.env.PAYMENTS_PROVIDERS_ENCRYPTION_KEY;
    if (!encryptionKeyBase64)
      throw Error("Missing env var PAYMENTS_PROVIDERS_ENCRYPTION_KEY");

    this.encryptionKey = Buffer.from(encryptionKeyBase64, "base64");
    this.encryptionAlgorithm = "aes-256-cbc";
    this.hashAlgorithm = "sha256";
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      this.encryptionAlgorithm,
      this.encryptionKey,
      iv,
    );
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + encrypted;
  }

  decrypt(encryptedText: string): string {
    const iv = Buffer.from(encryptedText.slice(0, 32), "hex");
    const encrypted = encryptedText.slice(32);
    const decipher = crypto.createDecipheriv(
      this.encryptionAlgorithm,
      this.encryptionKey,
      iv,
    );
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  hash(text: string): string {
    const hash = crypto.createHash(this.hashAlgorithm);
    hash.update(text);
    return hash.digest("hex");
  }
}

export default CryptographyService;
