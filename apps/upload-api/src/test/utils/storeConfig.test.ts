import t from "tap";
import { Pool } from "pg";
import {
  CONFIG_TYPE,
  getConfigValue,
  storeConfig,
} from "../../utils/storeConfig.js";

t.test("storeConfig", async (t) => {
  t.test(
    "should execute store config query with the correct params",
    async (t) => {
      const params: string[] = [];

      const poolMock = {
        query: (...values: string[]) => {
          params.push(...values);
        },
      } as unknown as Pool;
      await storeConfig(
        poolMock,
        "key",
        "value",
        "a test key to store",
        CONFIG_TYPE.STRING,
      );

      t.match(params[1], ["key", "value", "string", "a test key to store"]);
    },
  );

  t.test(
    "should return undefined when a config key is not found",
    async (t) => {
      const poolMock = {
        query: () =>
          Promise.resolve({
            rows: [],
          }),
      } as unknown as Pool;
      const value = await getConfigValue(poolMock, "key");

      t.match(value, undefined);
    },
  );

  t.test("should return a string value", async (t) => {
    const poolMock = {
      query: () =>
        Promise.resolve({
          rows: [{ value: "value", type: "string" }],
        }),
    } as unknown as Pool;
    const value = await getConfigValue(poolMock, "key");

    t.match(value, "value");
    t.match(typeof value, "string");
  });

  t.test("should return a numeric value", async (t) => {
    const poolMock = {
      query: () =>
        Promise.resolve({
          rows: [{ value: "1", type: "number" }],
        }),
    } as unknown as Pool;
    const value = await getConfigValue(poolMock, "key");

    t.match(value, 1);
    t.match(typeof value, "number");
  });

  t.test("should return a boolean value", async (t) => {
    const poolMock = {
      query: () =>
        Promise.resolve({
          rows: [{ value: "true", type: "boolean" }],
        }),
    } as unknown as Pool;
    const value = await getConfigValue(poolMock, "key");

    t.match(value, true);
    t.match(typeof value, "boolean");
  });
});
