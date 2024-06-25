import { validateScopes } from "../index.js";
import t from "tap";

const testCases = [
  {
    description: "Single permission matches one of the scopes",
    permissions: [["payments", "read", "payment"]],
    scopes: [
      ["payments", "read", "*"],
      ["payments", "create", "payment"],
    ],
    expected: true,
  },
  {
    description: "Single permission does not match any of the scopes",
    permissions: [["payments", "delete", "payment"]],
    scopes: [
      ["payments", "read", "*"],
      ["payments", "create", "payment"],
    ],
    expected: false,
  },
  {
    description: "Multiple permissions, all matching",
    permissions: [
      ["payments", "read", "payment"],
      ["payments", "create", "payment"],
    ],
    scopes: [
      ["payments", "read", "*"],
      ["payments", "create", "payment"],
    ],
    expected: true,
  },
  {
    description: "Multiple permissions, only one matches",
    permissions: [
      ["payments", "read", "payment"],
      ["payments", "delete", "payment"],
    ],
    scopes: [
      ["payments", "read", "*"],
      ["payments", "create", "payment"],
    ],
    expected: false,
  },
];

testCases.forEach(({ description, permissions, scopes, expected }) => {
  t.test(description, (t) => {
    const matches = permissions.map((permission) =>
      validateScopes(permission, scopes),
    );
    const validationPasses = matches.every((m) => m);

    t.equal(validationPasses, expected);
    t.end();
  });
});
