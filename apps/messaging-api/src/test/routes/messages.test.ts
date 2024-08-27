import t from "tap";
import fp from "fastify-plugin";

t.test("messaging - /api/v1/messages schema", async (t) => {
  const { build } = await t.mockImport<typeof import("../../app.js")>(
    "../../app.js",
    {
      "api-auth": {
        default: fp(async (fastify) => {
          fastify.decorate("checkPermissions", async (req) => {
            req.userData = {
              userId: "userId",
              accessToken: "accessToken",
              organizationId: "organisationId",
            };
          });
        }),
      },
    },
  );

  const app = await build();
  t.after(async () => {
    await app.close();
  });

  const detailValidationInfo = "error detail validation";
  const bodyCodeValidationInfo = "body code validation";
  const statusCodeValidationInfo = "status code validation";

  t.test("create", async (t) => {
    t.test("with illegal preferredTransports should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          preferredTransports: ["air", "earth", "bear"],
          recipientUserId: "",
          security: "confidential",
          scheduleAt: "",
          message: {
            threadName: "name",
            subject: "subject",
            excerpt: "excerpt",
            plainText: "text",
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/preferredTransports/0 must be equal to one of the allowed values",
        detailValidationInfo,
      );
    });

    t.test("with no preferredTransports should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          recipientUserId: "",
          security: "confidential",
          scheduleAt: "",
          message: {
            threadName: "name",
            subject: "subject",
            excerpt: "excerpt",
            plainText: "text",
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body must have required property 'preferredTransports'",
        detailValidationInfo,
      );
    });

    t.test("with null preferredTransports should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "confidential",
          preferredTransports: null,
          recipientUserId: "",
          scheduleAt: "",
          message: {
            threadName: "kk",
            subject: "subject",
            excerpt: "excerpt",
            plainText: "text",
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/preferredTransports must be array",
        detailValidationInfo,
      );
    });

    t.test("with illegal security should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "illegal",
          preferredTransports: [],
          recipientUserId: "",
          scheduleAt: "",
          message: {
            threadName: "name",
            subject: "subject",
            excerpt: "excerpt",
            plainText: "text",
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/security must be equal to one of the allowed values",
        detailValidationInfo,
      );
    });

    t.test("with no security should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          preferredTransports: [],
          recipientUserId: "",
          scheduleAt: "",
          message: {
            threadName: "kk",
            subject: "subject",
            excerpt: "excerpt",
            plainText: "text",
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);

      t.match(
        body.detail,
        "body must have required property 'security'",
        detailValidationInfo,
      );
    });

    t.test("with null security should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: null,
          preferredTransports: [],
          recipientUserId: "",
          scheduleAt: "",
          message: {
            threadName: "kk",
            subject: "subject",
            excerpt: "excerpt",
            plainText: "text",
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/security must be string",
        detailValidationInfo,
      );
    });

    t.test("with null recipientUserId should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "illegal",
          preferredTransports: [],
          recipientUserId: null,
          scheduleAt: "",
          message: {
            threadName: "name",
            subject: "subject",
            excerpt: "excerpt",
            plainText: "text",
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/recipientUserId must be string",
        detailValidationInfo,
      );
    });

    t.test("with no recipientUserId should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "illegal",
          preferredTransports: [],
          scheduleAt: "",
          message: {
            threadName: "name",
            subject: "subject",
            excerpt: "excerpt",
            plainText: "text",
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body must have required property 'recipientUserId'",
        detailValidationInfo,
      );
    });

    t.test("with null scheduleAt should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "public",
          preferredTransports: [],
          recipientUserId: "id",
          scheduleAt: null,
          message: {
            threadName: "name",
            subject: "subject",
            excerpt: "excerpt",
            plainText: "text",
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/scheduleAt must be string",
        detailValidationInfo,
      );
    });

    t.test("with illegal scheduleAt should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "public",
          preferredTransports: [],
          recipientUserId: "id",
          scheduleAt: "not a date time",
          message: {
            threadName: "name",
            subject: "subject",
            excerpt: "excerpt",
            plainText: "text",
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        'body/scheduleAt must match format "date-time"',
        detailValidationInfo,
      );
    });

    t.test("with no scheduleAt should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "public",
          preferredTransports: [],
          recipientUserId: "id",
          message: {
            threadName: "name",
            subject: "subject",
            excerpt: "excerpt",
            plainText: "text",
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body must have required property 'scheduleAt'",
        detailValidationInfo,
      );
    });

    t.test("with empty message.threadName should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "public",
          preferredTransports: [],
          recipientUserId: "id",
          scheduleAt: "2024-08-27T07:46:10.290Z",
          message: {
            threadName: "",
            subject: "subject",
            excerpt: "excerpt",
            plainText: "text",
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/message/threadName must NOT have fewer than 1 characters",
        detailValidationInfo,
      );
    });

    t.test("with null message.threadName should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "public",
          preferredTransports: [],
          recipientUserId: "id",
          scheduleAt: "2024-08-27T07:46:10.290Z",
          message: {
            threadName: null,
            subject: "subject",
            excerpt: "excerpt",
            plainText: "text",
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/message/threadName must be string",
        detailValidationInfo,
      );
    });

    t.test("with null message.subject should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "public",
          preferredTransports: [],
          recipientUserId: "id",
          scheduleAt: "2024-08-27T07:46:10.290Z",
          message: {
            threadName: "thread",
            subject: null,
            excerpt: "excerpt",
            plainText: "text",
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/message/subject must be string",
        detailValidationInfo,
      );
    });

    t.test("with empty message.subject should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "public",
          preferredTransports: [],
          recipientUserId: "id",
          scheduleAt: "2024-08-27T07:46:10.290Z",
          message: {
            threadName: "thread",
            subject: "",
            excerpt: "excerpt",
            plainText: "text",
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/message/subject must NOT have fewer than 1 characters",
        detailValidationInfo,
      );
    });

    t.test("with no message.subject should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "public",
          preferredTransports: [],
          recipientUserId: "id",
          scheduleAt: "2024-08-27T07:46:10.290Z",
          message: {
            threadName: "thread",
            excerpt: "excerpt",
            plainText: "text",
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/message must have required property 'subject'",
        detailValidationInfo,
      );
    });

    t.test("with null message.excerpt should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "public",
          preferredTransports: [],
          recipientUserId: "id",
          scheduleAt: "2024-08-27T07:46:10.290Z",
          message: {
            threadName: "thread",
            subject: "subject",
            excerpt: null,
            plainText: "text",
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/message/excerpt must be string",
        detailValidationInfo,
      );
    });

    t.test("with no message.excerpt should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "public",
          preferredTransports: [],
          recipientUserId: "id",
          scheduleAt: "2024-08-27T07:46:10.290Z",
          message: {
            threadName: "thread",
            subject: "subject",
            plainText: "text",
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/message must have required property 'excerpt'",
        detailValidationInfo,
      );
    });

    t.test("with empty message.excerpt should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "public",
          preferredTransports: [],
          recipientUserId: "id",
          scheduleAt: "2024-08-27T07:46:10.290Z",
          message: {
            threadName: "thread",
            subject: "subject",
            excerpt: "",
            plainText: "text",
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/message/excerpt must NOT have fewer than 1 characters",
        detailValidationInfo,
      );
    });

    t.test("with null message.plainText should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "public",
          preferredTransports: [],
          recipientUserId: "id",
          scheduleAt: "2024-08-27T07:46:10.290Z",
          message: {
            threadName: "thread",
            subject: "subject",
            excerpt: "exc",
            plainText: null,
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/message/plainText must be string",
        detailValidationInfo,
      );
    });

    t.test("with no message.plainText should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "public",
          preferredTransports: [],
          recipientUserId: "id",
          scheduleAt: "2024-08-27T07:46:10.290Z",
          message: {
            threadName: "thread",
            subject: "subject",
            excerpt: "exc",
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/message must have required property 'plainText'",
        detailValidationInfo,
      );
    });

    t.test("with empty message.plainText should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "public",
          preferredTransports: [],
          recipientUserId: "id",
          scheduleAt: "2024-08-27T07:46:10.290Z",
          message: {
            threadName: "thread",
            subject: "subject",
            excerpt: "exc",
            plainText: "",
            richText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/message/plainText must NOT have fewer than 1 characters",
        detailValidationInfo,
      );
    });

    t.test("with null message.richText should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "public",
          preferredTransports: [],
          recipientUserId: "id",
          scheduleAt: "2024-08-27T07:46:10.290Z",
          message: {
            threadName: "thread",
            subject: "subject",
            excerpt: "exc",
            plainText: "text",
            richText: null,
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/message/richText must be string",
        detailValidationInfo,
      );
    });

    t.test("with no message.richText should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "public",
          preferredTransports: [],
          recipientUserId: "id",
          scheduleAt: "2024-08-27T07:46:10.290Z",
          message: {
            threadName: "thread",
            subject: "subject",
            excerpt: "exc",
            plainText: "text",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/message must have required property 'richText'",
        detailValidationInfo,
      );
    });

    t.test("with empty message.richText should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "public",
          preferredTransports: [],
          recipientUserId: "id",
          scheduleAt: "2024-08-27T07:46:10.290Z",
          message: {
            threadName: "thread",
            subject: "subject",
            excerpt: "exc",
            plainText: "text",
            richText: "",
            lang: "en",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/message/richText must NOT have fewer than 1 characters",
        detailValidationInfo,
      );
    });

    t.test("with null message.lang should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "public",
          preferredTransports: [],
          recipientUserId: "id",
          scheduleAt: "2024-08-27T07:46:10.290Z",
          message: {
            threadName: "thread",
            subject: "subject",
            excerpt: "exc",
            plainText: "text",
            richText: "text",
            lang: null,
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/message/lang must be string",
        detailValidationInfo,
      );
    });

    t.test("with no message.lang should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "public",
          preferredTransports: [],
          recipientUserId: "id",
          scheduleAt: "2024-08-27T07:46:10.290Z",
          message: {
            threadName: "thread",
            subject: "subject",
            excerpt: "exc",
            plainText: "text",
            richText: "text",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/message must have required property 'lang'",
        detailValidationInfo,
      );
    });

    t.test("with illegal message.lang should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/messages",
        body: {
          security: "public",
          preferredTransports: [],
          recipientUserId: "id",
          scheduleAt: "2024-08-27T07:46:10.290Z",
          message: {
            threadName: "thread",
            subject: "subject",
            excerpt: "exc",
            plainText: "text",
            richText: "text",
            lang: "sv",
          },
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/message/lang must be equal to one of the allowed values",
        detailValidationInfo,
      );
    });
  });

  t.test("get one", async (t) => {
    t.test("with illegal id url parameter", async (t) => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/messages/123",
      });

      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        'params/messageId must match format "uuid"',
        detailValidationInfo,
      );
    });
  });

  t.end();
});
