import { describe, test } from "node:test";
import assert from "node:assert";
import { RealexService } from "../../services/realexService";
import crypto from "crypto";

describe("RealexService", () => {
  test("generateTimestamp", () => {
    process.env.PAYMENTS_PROVIDERS_ENCRYPTION_KEY = crypto
      .randomBytes(32)
      .toString("base64");

    const realexService = new RealexService("secret");

    const timestamp = realexService.generateTimestamp(
      new Date("2024-05-01T11:22:34"),
    );

    assert.strictEqual(timestamp, "20240501112234");
  });

  test("generateHash", () => {
    const realexService = new RealexService("secret");

    const text = "text";
    const hash = realexService.generateHash(text);

    assert.strictEqual(
      hash,
      "37f88324f41d305283cac0f70d2e633bbc00e245c0392f82661015cbe0eb9b23",
    );
  });
});
