/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  coverageProvider: "v8",
  preset: "ts-jest",
  testMatch: ["**/__tests__/**/*.(spec|test).[jt]s?(x)"],
};

module.exports = config;
