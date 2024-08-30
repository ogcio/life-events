import t from "tap";
import fp from "fastify-plugin";

t.test("messaging - /api/v1/templates schema", async (t) => {
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
  const detailValidationInfo = "error detail validation";
  const bodyCodeValidationInfo = "body code validation";
  const statusCodeValidationInfo = "status code validation";

  t.test("create", async (t) => {
    t.test("with null contents should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: null,
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(body.detail, "body/contents must be array", detailValidationInfo);
    });
    t.test("without contents should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {},
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body must have required property 'contents'",
        detailValidationInfo,
      );
    });
    t.test("with empty contents should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents must NOT have fewer than 1 items",
        detailValidationInfo,
      );
    });

    t.test("with null contents[].templateName should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: null,
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/templateName must be string",
        detailValidationInfo,
      );
    });
    t.test("without contents[].templateName should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0 must have required property 'templateName'",
        detailValidationInfo,
      );
    });
    t.test("with empty contents[].templateName should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/templateName must NOT have fewer than 1 characters",
        detailValidationInfo,
      );
    });

    t.test("with null contents[].language should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "name",
              language: null,
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/language must be string",
        detailValidationInfo,
      );
    });
    t.test("without contents[].language should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "name",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0 must have required property 'language'",
        detailValidationInfo,
      );
    });
    t.test("with empty contents[].language should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "name",
              language: "",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/language must be equal to one of the allowed values",
        detailValidationInfo,
      );
    });
    t.test("with illegal contents[].language should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "name",
              language: "sv",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/language must be equal to one of the allowed values",
        detailValidationInfo,
      );
    });

    t.test("with null contents[].subject should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: null,
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/subject must be string",
        detailValidationInfo,
      );
    });
    t.test("without contents[].subject should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "name",
              language: "en",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0 must have required property 'subject'",
        detailValidationInfo,
      );
    });
    t.test("with empty contents[].subject should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/subject must NOT have fewer than 1 characters",
        detailValidationInfo,
      );
    });

    t.test("with null contents[].excerpt should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: null,
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/excerpt must be string",
        detailValidationInfo,
      );
    });
    t.test("without contents[].excerpt should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0 must have required property 'excerpt'",
        detailValidationInfo,
      );
    });
    t.test("with empty contents[].excerpt should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/excerpt must NOT have fewer than 1 characters",
        detailValidationInfo,
      );
    });

    t.test("with null contents[].plainText should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: null,
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/plainText must be string",
        detailValidationInfo,
      );
    });
    t.test("without contents[].plainText should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0 must have required property 'plainText'",
        detailValidationInfo,
      );
    });
    t.test("with empty contents[].plainText should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/plainText must NOT have fewer than 1 characters",
        detailValidationInfo,
      );
    });

    t.test("with null contents[].richText should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: null,
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/richText must be string",
        detailValidationInfo,
      );
    });
    t.test("without contents[].richText should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0 must have required property 'richText'",
        detailValidationInfo,
      );
    });
    t.test("with empty contents[].richText should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/richText must NOT have fewer than 1 characters",
        detailValidationInfo,
      );
    });

    // variables
    t.test("with null variables should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
          variables: null,
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/variables must be array",
        detailValidationInfo,
      );
    });
    t.test("with empty variables should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
          variables: [],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/variables must NOT have fewer than 1 items",
        detailValidationInfo,
      );
    });

    t.test("without variables[].name should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
          variables: [{}],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/variables/0 must have required property 'name'",
        detailValidationInfo,
      );
    });
    t.test("with null variables[].name should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
          variables: [{ name: null }],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/variables/0/name must be string",
        detailValidationInfo,
      );
    });
    t.test("with empty variables[].name should fail", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/templates",
        body: {
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
          variables: [{ name: "" }],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/variables/0/name must NOT have fewer than 1 characters",
        detailValidationInfo,
      );
    });

    t.end();
  });

  t.test("update", async (t) => {
    t.test("with illegal url param id should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/123",
        body: {},
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        'params/templateId must match format "uuid"',
        detailValidationInfo,
      );
    });

    t.test("without body id should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          contents: null,
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body must have required property 'id'",
        detailValidationInfo,
      );
    });

    t.test("with null contents should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: null,
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(body.detail, "body/contents must be array", detailValidationInfo);
    });

    t.test("without contents should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body must have required property 'contents'",
        detailValidationInfo,
      );
    });
    t.test("with empty contents should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents must NOT have fewer than 1 items",
        detailValidationInfo,
      );
    });

    t.test("with null contents[].templateName should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: null,
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/templateName must be string",
        detailValidationInfo,
      );
    });
    t.test("without contents[].templateName should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0 must have required property 'templateName'",
        detailValidationInfo,
      );
    });
    t.test("with empty contents[].templateName should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/templateName must NOT have fewer than 1 characters",
        detailValidationInfo,
      );
    });

    t.test("with null contents[].language should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "name",
              language: null,
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/language must be string",
        detailValidationInfo,
      );
    });
    t.test("without contents[].language should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "name",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0 must have required property 'language'",
        detailValidationInfo,
      );
    });
    t.test("with empty contents[].language should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "name",
              language: "",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/language must be equal to one of the allowed values",
        detailValidationInfo,
      );
    });
    t.test("with illegal contents[].language should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "name",
              language: "sv",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/language must be equal to one of the allowed values",
        detailValidationInfo,
      );
    });

    t.test("with null contents[].subject should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: null,
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/subject must be string",
        detailValidationInfo,
      );
    });
    t.test("without contents[].subject should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "name",
              language: "en",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0 must have required property 'subject'",
        detailValidationInfo,
      );
    });
    t.test("with empty contents[].subject should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/subject must NOT have fewer than 1 characters",
        detailValidationInfo,
      );
    });

    t.test("with null contents[].excerpt should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: null,
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/excerpt must be string",
        detailValidationInfo,
      );
    });
    t.test("without contents[].excerpt should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0 must have required property 'excerpt'",
        detailValidationInfo,
      );
    });
    t.test("with empty contents[].excerpt should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/excerpt must NOT have fewer than 1 characters",
        detailValidationInfo,
      );
    });

    t.test("with null contents[].plainText should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: null,
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/plainText must be string",
        detailValidationInfo,
      );
    });
    t.test("without contents[].plainText should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0 must have required property 'plainText'",
        detailValidationInfo,
      );
    });
    t.test("with empty contents[].plainText should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "",
              richText: "rich text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/plainText must NOT have fewer than 1 characters",
        detailValidationInfo,
      );
    });

    t.test("with null contents[].richText should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: null,
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/richText must be string",
        detailValidationInfo,
      );
    });
    t.test("without contents[].richText should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0 must have required property 'richText'",
        detailValidationInfo,
      );
    });
    t.test("with empty contents[].richText should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "",
            },
          ],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/contents/0/richText must NOT have fewer than 1 characters",
        detailValidationInfo,
      );
    });

    // variables
    t.test("with null variables should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
          variables: null,
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/variables must be array",
        detailValidationInfo,
      );
    });
    t.test("with empty variables should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
          variables: [],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/variables must NOT have fewer than 1 items",
        detailValidationInfo,
      );
    });

    t.test("without variables[].name should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
          variables: [{}],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/variables/0 must have required property 'name'",
        detailValidationInfo,
      );
    });
    t.test("with null variables[].name should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
          variables: [{ name: null }],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/variables/0/name must be string",
        detailValidationInfo,
      );
    });
    t.test("with empty variables[].name should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/templates/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          contents: [
            {
              templateName: "name",
              language: "en",
              subject: "subject",
              excerpt: "excerpt",
              plainText: "plain text",
              richText: "rich text",
            },
          ],
          variables: [{ name: "" }],
        },
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        "body/variables/0/name must NOT have fewer than 1 characters",
        detailValidationInfo,
      );
    });

    t.end();
  });

  t.test("delete", async (t) => {
    t.test("with illegal url param id should fail", async (t) => {
      const res = await app.inject({
        method: "DELETE",
        url: "/api/v1/templates/123",
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        'params/templateId must match format "uuid"',
        detailValidationInfo,
      );
    });
  });

  t.test("get one", async (t) => {
    t.test("with illegal url param id should fail", async (t) => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/templates/123",
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        'params/templateId must match format "uuid"',
        detailValidationInfo,
      );
    });
  });

  t.test("get many", async (t) => {
    t.test("with illegal limit query params should fail", async (t) => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/templates?limit=-10",
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        'querystring/limit must match pattern "^([1-9]|100)|undefined$"',
        detailValidationInfo,
      );
    });

    t.test("with illegal offset query params should fail", async (t) => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/templates?offset=-10",
      });
      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.detail,
        'querystring/offset must match pattern "^[0-9][0-9]*|undefined$"',
        detailValidationInfo,
      );
    });
  });
  t.end();
});
