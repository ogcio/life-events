import t from "tap";
import { Messaging } from "../../services/messaging/index.js";

t.test("Messaging.buildMessage", async (t) => {
  const service = new Messaging("");
  t.test(
    "should return correct without any variables in message nor replacement parameter with multiple template messages",
    async () => {
      const expected = {
        excerpt: "text",
        lang: "en",
        plainText: "text",
        richText: "text",
        subject: "text",
        threadName: "text",
      };

      const actual = await service.buildMessage(
        [
          {
            excerpt: "text",
            lang: "en",
            plainText: "text",
            richText: "text",
            subject: "text",
            threadName: "text",
          },
          {
            excerpt: "text2",
            lang: "ga",
            plainText: "text2",
            richText: "text2",
            subject: "text2",
            threadName: "text2",
          },
        ],
        "en",
        {},
      );

      t.matchOnly(actual, expected);
    },
  );

  t.test(
    "should replace variables correctly on all relevant fields, even when empty",
    async () => {
      const expected = {
        excerpt: "text 1",
        lang: "en",
        plainText: "text 2",
        richText: "text 3",
        subject: "text 4",
        threadName: "text",
      };

      const actual = await service.buildMessage(
        [
          {
            excerpt: "text {{a}}",
            lang: "en",
            plainText: "text {{b}} {{e}}",
            richText: "text {{c}}",
            subject: "text {{d}}",
            threadName: "text",
          },
          {
            excerpt: "text2",
            lang: "ga",
            plainText: "text2",
            richText: "text2",
            subject: "text2",
            threadName: "text2",
          },
        ],
        "en",
        { a: "1", b: "2", c: "3", d: "4", e: "" },
      );

      t.matchOnly(actual, expected);
    },
  );

  t.test(
    "should throw error when any variable has null or undefined values",
    async () => {
      try {
        await service.buildMessage(
          [
            {
              excerpt: "text",
              lang: "en",
              plainText: "text",
              richText: "text",
              subject: "text",
              threadName: "text",
            },
          ],
          "en",
          { a: null, b: undefined, c: "c" },
        );
        t.fail();
      } catch (err) {
        t.match(err.message, "illegal empty variables a, b");
      }
      t.end();
    },
  );

  t.test(
    "should throw error when language variable is missing from messages",
    async () => {
      try {
        await service.buildMessage(
          [
            {
              excerpt: "text",
              lang: "ga",
              plainText: "text",
              richText: "text",
              subject: "text",
              threadName: "text",
            },
          ],
          "en",
          {},
        );
        t.fail();
      } catch (err) {
        t.match(err.message, "template not found for language en");
        t.ok(err);
      }

      t.end();
    },
  );

  t.test("should throw error if messages are empty", async () => {
    try {
      await service.buildMessage([], "en", {});
      t.fail();
    } catch (err) {
      t.ok(err);
    }
    t.end();
  });

  t.test(
    "should throw error when message contains other variables than provided by parameter",
    async () => {
      try {
        await service.buildMessage(
          [
            {
              excerpt: "text",
              lang: "en",
              plainText: "text {{illegal1}}",
              richText: "text {{illegal2}}",
              subject: "text",
              threadName: "text",
            },
          ],
          "en",
          {},
        );
        t.fail();
      } catch (err) {
        t.match(err.message, "illegal template variables illegal2, illegal1");
      }
      t.end();
    },
  );

  t.test("should throw error with empty lang parameter", async () => {
    try {
      await service.buildMessage(
        [
          {
            excerpt: "text",
            lang: "en",
            plainText: "text {{illegal1}}",
            richText: "text {{illegal2}}",
            subject: "text",
            threadName: "text",
          },
        ],
        "",
        {},
      );
      t.fail();
    } catch (err) {
      t.match(err.message, "no language provided");
    }
    t.end();
  });
});
