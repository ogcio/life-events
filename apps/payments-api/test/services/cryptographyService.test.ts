import CryptographyService from "../../services/cryptographyService";
import t from "tap";
import crypto from "crypto";

t.test("CryptographyService", async (t) => {
  process.env.PAYMENTS_PROVIDERS_ENCRYPTION_KEY = crypto
    .randomBytes(32)
    .toString("base64");

  const cryptographyService = new CryptographyService();
  const data = "Hello, World!";
  const encryptedData = cryptographyService.encrypt(data);
  const decryptedData = cryptographyService.decrypt(encryptedData);

  t.equal(decryptedData, data);
  t.end();
});
