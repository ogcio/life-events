import { ServerError } from "shared-errors";
import { utils } from "../../utils.js";
import t from "tap";

t.test("apiV1Url", async (t) => {
  const base = "http://test";
  t.test("shuld return correct url with empty path param", (t) => {
    const expected = `${base}/api/v1`;

    const actual = utils.apiV1Url({ base, resoucePath: "" });

    t.equal(expected, actual.href);
    t.end();
  });

  t.test(
    "should return correct url with resource path param without slash",
    (t) => {
      const expected = `${base}/api/v1/something`;

      const actual = utils.apiV1Url({ base, resoucePath: "something" });

      t.equal(expected, actual.href);
      t.end();
    },
  );

  t.test(
    "should return correct url with resource path param with forward slash",
    (t) => {
      const expected = `${base}/api/v1/something`;

      const actual = utils.apiV1Url({ base, resoucePath: "/something" });

      t.equal(expected, actual.href);
      t.end();
    },
  );

  t.test("should throw with non url base", (t) => {
    t.throws(() => utils.apiV1Url({ base: "", resoucePath: "" }), TypeError);
    t.end();
  });
});
