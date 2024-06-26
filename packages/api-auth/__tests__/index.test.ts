import { validatePermission, getMapFromScope, ScopeMap } from "../index.js";
import t from "tap";

const mapFromScopeTestCases: {
  description: string;
  scope: string;
  expected: ScopeMap;
}[] = [
  {
    description: "getMapFromScope: Single scope",
    scope: "payments:payment:create",
    expected: new Map([
      ["payments", new Map([["payment", new Map([["create", true]])]])],
    ]),
  },
  {
    description: "getMapFromScope: Single scope with wildcard",
    scope: "payments:payment:*",
    expected: new Map([["payments", new Map([["payment", true]])]]),
  },
  {
    description: "getMapFromScope: Multiple scopes",
    scope: "payments:payment:create payments:transaction:read",
    expected: new Map([
      [
        "payments",
        new Map([
          ["payment", new Map([["create", true]])],
          ["transaction", new Map([["read", true]])],
        ]),
      ],
    ]),
  },
  {
    description: "getMapFromScope: Multiple scopes with resource wildcard",
    scope: "payments:payment:create payments:* payments:transaction:read",
    expected: new Map([["payments", true]]),
  },
  {
    description: "getMapFromScope: Multiple scopes with action wildcard",
    scope:
      "payments:payment:create payments:transaction:* payments:transaction:read",
    expected: new Map([
      [
        "payments",
        new Map([
          ["payment", new Map([["create", true]])],
          ["transaction", true],
        ]),
      ],
    ]),
  },
];

mapFromScopeTestCases.forEach(({ description, scope, expected }) => {
  t.test(description, (t) => {
    const result = getMapFromScope(scope);
    t.match(result, expected);
    t.end();
  });
});

t.test("validatePermission: passes with wildcard scope", (t) => {
  const scope = "payments:payment:create payments:* payments:transaction:read";
  const permission = "payments:transaction:read";

  const result = validatePermission(permission, getMapFromScope(scope));
  t.equal(result, true);
  t.end();
});

t.test("validatePermission: does not pass", (t) => {
  const scope = "payments:payment:create payments:transaction:read";
  const permission = "payments:transaction:create";

  const result = validatePermission(permission, getMapFromScope(scope));
  t.equal(result, false);
  t.end();
});

t.test("validatePermission: passes with exact match", (t) => {
  const scope = "payments:payment:create payments:transaction:read";
  const permission = "payments:transaction:read";

  const result = validatePermission(permission, getMapFromScope(scope));
  t.equal(result, true);
  t.end();
});
