import CryptographyService from "../../services/cryptographyService";
import { test } from "node:test";
import assert from "node:assert";
import crypto from "crypto";

test("CryptographyService", async (t) => {
  process.env.PAYMENTS_PROVIDERS_ENCRYPTION_KEY = crypto
    .randomBytes(32)
    .toString("base64");

  const cryptographyService = new CryptographyService();
  const data = "Hello, World!";
  const encryptedData = cryptographyService.encrypt(data);
  const decryptedData = cryptographyService.decrypt(encryptedData);

  assert.strictEqual(decryptedData, data);
});
