import t from "tap";
import fp from "fastify-plugin";

t.test("messaging - providers schema", async (t) => {
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
  const errorMsgValidationInfo = "error message validation";
  const bodyCodeValidationInfo = "body code validation";
  const statusCodeValidationInfo = "status code validation";

  t.after(async () => {
    await app.close();
  });

  t.test("create", async (t) => {
    t.test("providing no type should fail ", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/providers",
        body: {
          isPrimary: false,
          smtpHost: "host",
          smtpPort: 12345,
          username: "update user",
          password: "update password",
          providerName: "",
          fromAddress: "addr",
          ssl: false,
        },
      });

      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.validation.find(
          (v: { fieldName: string }) => v.fieldName === "type",
        )?.message,
        "must have required property 'type'",
        errorMsgValidationInfo,
      );
    });

    t.test("providing invalid type should fail ", async (t) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/providers",
        body: {
          type: "fail",
          isPrimary: false,
          smtpHost: "host",
          smtpPort: 12345,
          username: "update user",
          password: "update password",
          providerName: "name",
          fromAddress: "addr",
          ssl: false,
        },
      });

      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.validation.find(
          (v: { fieldName: string }) => v.fieldName === "type",
        )?.message,
        "must be equal to one of the allowed values",
        errorMsgValidationInfo,
      );
    });

    t.test("type email", async (t) => {
      // providerName
      t.test("providerName field schema validations", async (t) => {
        t.test("empty providerName should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "update user",
              password: "update password",
              providerName: "",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "providerName",
            )?.message,
            "must NOT have fewer than 1 characters",
            errorMsgValidationInfo,
          );
        });

        t.test("null providerName should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "update user",
              password: "update password",
              providerName: null,
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "providerName",
            )?.message,
            "must be string",
            errorMsgValidationInfo,
          );
        });

        t.test("no providerName should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "update user",
              password: "update password",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "providerName",
            )?.message,
            "must have required property 'providerName'",
            errorMsgValidationInfo,
          );
        });
      });

      // fromAddress
      t.test("fromAddress field schema validations", async (t) => {
        t.test("empty fromAddress should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "update user",
              password: "update password",
              providerName: "name",
              fromAddress: "",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "fromAddress",
            )?.message,
            "must NOT have fewer than 1 characters",
            errorMsgValidationInfo,
          );
        });

        t.test("null fromAddress should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "update user",
              password: "update password",
              providerName: "name",
              fromAddress: null,
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "fromAddress",
            )?.message,
            "must be string",
            errorMsgValidationInfo,
          );
        });

        t.test("no fromAddress should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "update user",
              password: "update password",
              providerName: "name",
              ssl: false,
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "fromAddress",
            )?.message,
            "must have required property 'fromAddress'",
            errorMsgValidationInfo,
          );
        });
      });

      // password
      t.test("password field schema validations", async (t) => {
        t.test("empty password should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "update user",
              password: "",
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "password",
            )?.message,
            "must NOT have fewer than 1 characters",
          );
        });

        t.test("null password should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "update user",
              password: null,
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "password",
            )?.message,
            "must be string",
            errorMsgValidationInfo,
          );
        });

        t.test("no password should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "update user",
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "password",
            )?.message,
            "must have required property 'password'",
          );
        });
      });

      // username
      t.test("username field schema validations", async (t) => {
        t.test("empty username should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "",
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "username",
            )?.message,
            "must NOT have fewer than 1 characters",
          );
        });

        t.test("null username should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: null,
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "username",
            )?.message,
            "must be string",
          );
        });

        t.test("no username should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "username",
            )?.message,
            "must have required property 'username'",
          );
        });
      });

      // smtpPort
      t.test("smtpPort field schema validations", async (t) => {
        t.test("non numeric smtpPort should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: "",
              username: "usr",
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "smtpPort",
            )?.message,
            "must be number",
          );
        });

        t.test("null smtpPort should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: null,
              username: "usr",
              password: "password",
              providerName: "name1",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "smtpPort",
            )?.message,
            "must be number",
            errorMsgValidationInfo,
          );
        });

        t.test("no smtpPort should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              username: "usr",
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "smtpPort",
            )?.message,
            "must have required property 'smtpPort'",
          );
        });
      });

      // smtpHost
      t.test("smtpHost field schema validations", async (t) => {
        t.test("empty smtpHost should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              isPrimary: false,
              smtpHost: "",
              smtpPort: 12345,
              username: "user",
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "smtpHost",
            )?.message,
            "must NOT have fewer than 1 characters",
          );
        });

        t.test("null smtpHost should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              isPrimary: false,
              smtpHost: null,
              smtpPort: 12345,
              username: "user",
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "smtpHost",
            )?.message,
            "must be string",
          );
        });

        t.test("no smtpHost should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              isPrimary: false,
              username: "user",
              smtpPort: 12345,
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "smtpHost",
            )?.message,
            "must have required property 'smtpHost'",
          );
        });
      });

      // ssl
      t.test("ssl field schema validations", async (t) => {
        t.test("string ssl should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "user",
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: "fail",
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "ssl",
            )?.message,
            "must be boolean",
            errorMsgValidationInfo,
          );
        });

        t.test("no ssl should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "user",
              password: "password",
              providerName: "name",
              fromAddress: "addr",
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "ssl",
            )?.message,
            "must have required property 'ssl'",
            errorMsgValidationInfo,
          );
        });
      });

      // isPrimary
      t.test("isPrimary field schema validations", async (t) => {
        t.test("string isPrimary should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              isPrimary: "fail",
              smtpHost: "host",
              smtpPort: 12345,
              username: "user",
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: true,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "isPrimary",
            )?.message,
            "must be boolean",
            errorMsgValidationInfo,
          );
        });

        t.test("no isPrimary should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "email",
              smtpHost: "host",
              smtpPort: 12345,
              username: "user",
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: true,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "isPrimary",
            )?.message,
            "must have required property 'isPrimary'",
            errorMsgValidationInfo,
          );
        });
      });
    });

    t.test("type sms", async (t) => {
      // providerName
      t.test("providerName field schema validations", async (t) => {
        t.test("empty providerName should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "sms",
              isPrimary: true,
              providerName: "",
              config: {
                type: "AWS",
                accessKey: "key",
                secretAccessKey: "secret",
                region: "region",
              },
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "providerName",
            )?.message,
            "must NOT have fewer than 1 characters",
          );
        });

        t.test("null providerName should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "sms",
              isPrimary: true,
              providerName: null,
              config: {
                type: "AWS",
                accessKey: "key",
                secretAccessKey: "secret",
                region: "region",
              },
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "providerName",
            )?.message,
            "must be string",
            errorMsgValidationInfo,
          );
        });

        t.test("no providerName should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "sms",
              isPrimary: true,
              config: {
                type: "AWS",
                accessKey: "key",
                secretAccessKey: "secret",
                region: "region",
              },
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "providerName",
            )?.message,
            "must have required property 'providerName'",
            errorMsgValidationInfo,
          );
        });
      });

      // isPrimary
      t.test("isPrimary field schema validations", async (t) => {
        t.test(
          "non boolean and non default coerce value isPrimary should fail",
          async (t) => {
            const res = await app.inject({
              method: "POST",
              url: "/api/v1/providers",
              body: {
                type: "sms",
                isPrimary: "fail",
                providerName: "name",
                config: {
                  type: "AWS",
                  accessKey: "key",
                  secretAccessKey: "secret",
                  region: "region",
                },
              },
            });

            const body = await res.json();

            t.equal(res.statusCode, 422, statusCodeValidationInfo);
            t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
            t.equal(
              body.validation.find(
                (v: { fieldName: string }) => v.fieldName === "isPrimary",
              )?.message,
              "must be boolean",
              errorMsgValidationInfo,
            );
          },
        );

        t.test("no isPrimary should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "sms",
              providerName: "",
              config: {
                type: "AWS",
                accessKey: "key",
                secretAccessKey: "secret",
                region: "region",
              },
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "isPrimary",
            )?.message,
            "must have required property 'isPrimary'",
            errorMsgValidationInfo,
          );
        });
      });

      // config
      t.test("config field schema validations", async (t) => {
        t.test("no config should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "sms",
              providerName: "name",
              isPrimary: true,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "config",
            )?.message,
            "must have required property 'config'",
            errorMsgValidationInfo,
          );
        });

        t.test("unsupported config type should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                type: "illegal",
                accessKey: "key",
                secretAccessKey: "secret",
                region: "region",
              },
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "type",
            )?.message,
            "must be equal to one of the allowed values",
            errorMsgValidationInfo,
          );
        });

        t.test("no config type should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                accessKey: "key",
                secretAccessKey: "secret",
                region: "region",
              },
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "type",
            )?.message,
            "must have required property 'type'",
            errorMsgValidationInfo,
          );
        });

        t.test("empty config accessKey should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                type: "AWS",
                accessKey: "",
                secretAccessKey: "secret",
                region: "region",
              },
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "accessKey",
            )?.message,
            "must NOT have fewer than 1 characters",
            errorMsgValidationInfo,
          );
        });

        t.test("no config accessKey should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                type: "AWS",
                secretAccessKey: "secret",
                region: "region",
              },
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "accessKey",
            )?.message,
            "must have required property 'accessKey'",
            errorMsgValidationInfo,
          );
        });

        t.test("null config accessKey should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                type: "AWS",
                accessKey: null,
                secretAccessKey: "secret",
                region: "region",
              },
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "accessKey",
            )?.message,
            "must be string",
            errorMsgValidationInfo,
          );
        });

        t.test("empty config secretAccessKey should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                type: "AWS",
                accessKey: "key",
                secretAccessKey: "",
                region: "region",
              },
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "secretAccessKey",
            )?.message,
            "must NOT have fewer than 1 characters",
            errorMsgValidationInfo,
          );
        });

        t.test("no config secretAccessKey should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                type: "AWS",
                accessKey: "key",
                region: "region",
              },
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "secretAccessKey",
            )?.message,
            "must have required property 'secretAccessKey'",
            errorMsgValidationInfo,
          );
        });

        t.test("null config secretAccessKey should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                type: "AWS",
                accessKey: "key",
                secretAccessKey: null,
                region: "region",
              },
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "secretAccessKey",
            )?.message,
            "must be string",
            errorMsgValidationInfo,
          );
        });

        t.test("empty config region should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                type: "AWS",
                accessKey: "key",
                secretAccessKey: "secret",
                region: "",
              },
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "region",
            )?.message,
            "must NOT have fewer than 1 characters",
            errorMsgValidationInfo,
          );
        });

        t.test("no config region should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                type: "AWS",
                accessKey: "key",
                secretAccessKey: "secret",
              },
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "region",
            )?.message,
            "must have required property 'region'",
            errorMsgValidationInfo,
          );
        });

        t.test("null config region should fail", async (t) => {
          const res = await app.inject({
            method: "POST",
            url: "/api/v1/providers",
            body: {
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                type: "AWS",
                accessKey: "key",
                secretAccessKey: "secret",
                region: null,
              },
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "region",
            )?.message,
            "must be string",
            errorMsgValidationInfo,
          );
        });
      });
    });
  });

  t.test("update", async (t) => {
    t.test("providing no type should fail ", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          isPrimary: false,
          smtpHost: "host",
          smtpPort: 12345,
          username: "update user",
          password: "update password",
          providerName: "",
          fromAddress: "addr",
          ssl: false,
        },
      });

      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.validation.find(
          (v: { fieldName: string }) => v.fieldName === "type",
        )?.message,
        "must have required property 'type'",
      );
    });

    t.test("providing invalid type should fail ", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
        body: {
          id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          type: "fail",
          isPrimary: false,
          smtpHost: "host",
          smtpPort: 12345,
          username: "update user",
          password: "update password",
          providerName: "name",
          fromAddress: "addr",
          ssl: false,
        },
      });

      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.validation.find(
          (v: { fieldName: string }) => v.fieldName === "type",
        )?.message,
        "must be equal to one of the allowed values",
        errorMsgValidationInfo,
      );
    });

    t.test("non uuid id in url parameter should fail", async (t) => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/providers/123",
        body: {
          id: "123",
          type: "fail",
          isPrimary: false,
          smtpHost: "host",
          smtpPort: 12345,
          username: "update user",
          password: "update password",
          providerName: "name",
          fromAddress: "addr",
          ssl: false,
        },
      });

      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.validation.find(
          (v: { fieldName: string }) => v.fieldName === "providerId",
        )?.message,
        'must match format "uuid"',
        errorMsgValidationInfo,
      );
    });

    t.test(
      "id in url parameter mismatch with body id should fail",
      async (t) => {
        const res = await app.inject({
          method: "PUT",
          url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
          body: {
            id: "da3b108f-7b9a-487e-b40a-eb535e6056ca",
            type: "fail",
            isPrimary: false,
            smtpHost: "host",
            smtpPort: 12345,
            username: "update user",
            password: "update password",
            providerName: "name",
            fromAddress: "addr",
            ssl: false,
          },
        });

        const body = await res.json();

        t.equal(res.statusCode, 422, statusCodeValidationInfo);
        t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "type",
          )?.message,
          "must be equal to one of the allowed values",
          errorMsgValidationInfo,
        );
      },
    );

    t.test("type email", async (t) => {
      // providerName
      t.test("providerName field schema validations", async (t) => {
        t.test("empty providerName should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "update user",
              password: "update password",
              providerName: "",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "providerName",
            )?.message,
            "must NOT have fewer than 1 characters",
          );
        });

        t.test("null providerName should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "update user",
              password: "update password",
              providerName: null,
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "providerName",
            )?.message,
            "must be string",
            errorMsgValidationInfo,
          );
        });

        t.test("no providerName should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "update user",
              password: "update password",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "providerName",
            )?.message,
            "must have required property 'providerName'",
          );
        });
      });

      // fromAddress
      t.test("fromAddress field schema validations", async (t) => {
        t.test("empty fromAddress should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "update user",
              password: "update password",
              providerName: "name",
              fromAddress: "",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "fromAddress",
            )?.message,
            "must NOT have fewer than 1 characters",
          );
        });

        t.test("null fromAddress should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "update user",
              password: "update password",
              providerName: "name",
              fromAddress: null,
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "fromAddress",
            )?.message,
            "must be string",
            errorMsgValidationInfo,
          );
        });

        t.test("no fromAddress should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "update user",
              password: "update password",
              providerName: "name",
              ssl: false,
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "fromAddress",
            )?.message,
            "must have required property 'fromAddress'",
          );
        });
      });

      // password
      t.test("password field schema validations", async (t) => {
        t.test("empty password should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "update user",
              password: "",
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "password",
            )?.message,
            "must NOT have fewer than 1 characters",
            errorMsgValidationInfo,
          );
        });

        t.test("null password should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "update user",
              password: null,
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "password",
            )?.message,
            "must be string",
            errorMsgValidationInfo,
          );
        });

        t.test("no password should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "update user",
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "password",
            )?.message,
            "must have required property 'password'",
            errorMsgValidationInfo,
          );
        });
      });

      // username
      t.test("username field schema validations", async (t) => {
        t.test("empty username should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "",
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "username",
            )?.message,
            "must NOT have fewer than 1 characters",
            errorMsgValidationInfo,
          );
        });

        t.test("null username should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: null,
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "username",
            )?.message,
            "must be string",
            errorMsgValidationInfo,
          );
        });

        t.test("no username should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "username",
            )?.message,
            "must have required property 'username'",
            errorMsgValidationInfo,
          );
        });
      });

      // smtpPort
      t.test("smtpPort field schema validations", async (t) => {
        t.test("empty string smtpPort should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: "",
              username: "usr",
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "smtpPort",
            )?.message,
            "must be number",
            errorMsgValidationInfo,
          );
        });

        t.test("null smtpPort should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: null,
              username: "usr",
              password: "password",
              providerName: "name1",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "smtpPort",
            )?.message,
            "must be number",
            errorMsgValidationInfo,
          );
        });

        t.test("no smtpPort should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              username: "usr",
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "smtpPort",
            )?.message,
            "must have required property 'smtpPort'",
            errorMsgValidationInfo,
          );
        });
      });

      // smtpHost
      t.test("smtpHost field schema validations", async (t) => {
        t.test("empty smtpHost should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              isPrimary: false,
              smtpHost: "",
              smtpPort: 12345,
              username: "user",
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "smtpHost",
            )?.message,
            "must NOT have fewer than 1 characters",
            errorMsgValidationInfo,
          );
        });

        t.test("null smtpHost should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              isPrimary: false,
              smtpHost: null,
              smtpPort: 12345,
              username: "user",
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "smtpHost",
            )?.message,
            "must be string",
            errorMsgValidationInfo,
          );
        });

        t.test("no smtpHost should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              isPrimary: false,
              username: "user",
              smtpPort: 12345,
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: false,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "smtpHost",
            )?.message,
            "must have required property 'smtpHost'",
            errorMsgValidationInfo,
          );
        });
      });

      // ssl
      t.test("ssl field schema validations", async (t) => {
        t.test("string ssl should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "user",
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: "fail",
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "ssl",
            )?.message,
            "must be boolean",
            errorMsgValidationInfo,
          );
        });

        t.test("no ssl should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              isPrimary: false,
              smtpHost: "host",
              smtpPort: 12345,
              username: "user",
              password: "password",
              providerName: "name",
              fromAddress: "addr",
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "ssl",
            )?.message,
            "must have required property 'ssl'",
            errorMsgValidationInfo,
          );
        });
      });

      // isPrimary
      t.test("isPrimary field schema validations", async (t) => {
        t.test("string isPrimary should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              isPrimary: "fail",
              smtpHost: "host",
              smtpPort: 12345,
              username: "user",
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: true,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "isPrimary",
            )?.message,
            "must be boolean",
            errorMsgValidationInfo,
          );
        });

        t.test("no isPrimary should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "email",
              smtpHost: "host",
              smtpPort: 12345,
              username: "user",
              password: "password",
              providerName: "name",
              fromAddress: "addr",
              ssl: true,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "isPrimary",
            )?.message,
            "must have required property 'isPrimary'",
            errorMsgValidationInfo,
          );
        });
      });
    });

    t.test("type sms", async (t) => {
      // providerName
      t.test("providerName field schema validations", async (t) => {
        t.test("empty providerName should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "sms",
              isPrimary: true,
              providerName: "",
              config: {
                type: "AWS",
                accessKey: "key",
                secretAccessKey: "secret",
                region: "region",
              },
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "providerName",
            )?.message,
            "must NOT have fewer than 1 characters",
          );
        });

        t.test("null providerName should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "sms",
              isPrimary: true,
              providerName: null,
              config: {
                type: "AWS",
                accessKey: "key",
                secretAccessKey: "secret",
                region: "region",
              },
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "providerName",
            )?.message,
            "must be string",
            errorMsgValidationInfo,
          );
        });

        t.test("no providerName should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "sms",
              isPrimary: true,
              config: {
                type: "AWS",
                accessKey: "key",
                secretAccessKey: "secret",
                region: "region",
              },
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "providerName",
            )?.message,
            "must have required property 'providerName'",
            errorMsgValidationInfo,
          );
        });
      });

      // isPrimary
      t.test("isPrimary field schema validations", async (t) => {
        t.test(
          "non boolean and non default coerce value isPrimary should fail",
          async (t) => {
            const res = await app.inject({
              method: "PUT",
              url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              body: {
                id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
                type: "sms",
                isPrimary: "fail",
                providerName: "name",
                config: {
                  type: "AWS",
                  accessKey: "key",
                  secretAccessKey: "secret",
                  region: "region",
                },
              },
            });

            const body = await res.json();

            t.equal(res.statusCode, 422, statusCodeValidationInfo);
            t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
            t.equal(
              body.validation.find(
                (v: { fieldName: string }) => v.fieldName === "isPrimary",
              )?.message,
              "must be boolean",
              errorMsgValidationInfo,
            );
          },
        );

        t.test("no isPrimary should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "sms",
              providerName: "",
              config: {
                type: "AWS",
                accessKey: "key",
                secretAccessKey: "secret",
                region: "region",
              },
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "isPrimary",
            )?.message,
            "must have required property 'isPrimary'",
            errorMsgValidationInfo,
          );
        });
      });

      // config
      t.test("config field schema validations", async (t) => {
        t.test("no config should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "sms",
              providerName: "name",
              isPrimary: true,
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "config",
            )?.message,
            "must have required property 'config'",
            errorMsgValidationInfo,
          );
        });

        t.test("unsupported config type should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                type: "illegal",
                accessKey: "key",
                secretAccessKey: "secret",
                region: "region",
              },
            },
          });

          const body = await res.json();
          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "type",
            )?.message,
            "must be equal to one of the allowed values",
            errorMsgValidationInfo,
          );
        });

        t.test("no config type should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                accessKey: "key",
                secretAccessKey: "secret",
                region: "region",
              },
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "type",
            )?.message,
            "must have required property 'type'",
            errorMsgValidationInfo,
          );
        });

        t.test("empty config accessKey should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                type: "AWS",
                accessKey: "",
                secretAccessKey: "secret",
                region: "region",
              },
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "accessKey",
            )?.message,
            "must NOT have fewer than 1 characters",
            errorMsgValidationInfo,
          );
        });

        t.test("no config accessKey should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                type: "AWS",
                secretAccessKey: "secret",
                region: "region",
              },
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "accessKey",
            )?.message,
            "must have required property 'accessKey'",
            errorMsgValidationInfo,
          );
        });

        t.test("null config accessKey should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                type: "AWS",
                accessKey: null,
                secretAccessKey: "secret",
                region: "region",
              },
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "accessKey",
            )?.message,
            "must be string",
            errorMsgValidationInfo,
          );
        });

        t.test("empty config secretAccessKey should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                type: "AWS",
                accessKey: "key",
                secretAccessKey: "",
                region: "region",
              },
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "secretAccessKey",
            )?.message,
            "must NOT have fewer than 1 characters",
            errorMsgValidationInfo,
          );
        });

        t.test("no config secretAccessKey should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                type: "AWS",
                accessKey: "key",
                region: "region",
              },
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "secretAccessKey",
            )?.message,
            "must have required property 'secretAccessKey'",
            errorMsgValidationInfo,
          );
        });

        t.test("null config secretAccessKey should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                type: "AWS",
                accessKey: "key",
                secretAccessKey: null,
                region: "region",
              },
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "secretAccessKey",
            )?.message,
            "must be string",
            errorMsgValidationInfo,
          );
        });

        t.test("empty config region should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                type: "AWS",
                accessKey: "key",
                secretAccessKey: "secret",
                region: "",
              },
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "region",
            )?.message,
            "must NOT have fewer than 1 characters",
            errorMsgValidationInfo,
          );
        });

        t.test("no config region should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                type: "AWS",
                accessKey: "key",
                secretAccessKey: "secret",
              },
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "region",
            )?.message,
            "must have required property 'region'",
            errorMsgValidationInfo,
          );
        });

        t.test("null config region should fail", async (t) => {
          const res = await app.inject({
            method: "PUT",
            url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
            body: {
              id: "ca3b108f-7b9a-487e-b40a-eb535e6056ca",
              type: "sms",
              providerName: "name",
              isPrimary: true,
              config: {
                type: "AWS",
                accessKey: "key",
                secretAccessKey: "secret",
                region: null,
              },
            },
          });

          const body = await res.json();

          t.equal(res.statusCode, 422, statusCodeValidationInfo);
          t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "region",
            )?.message,
            "must be string",
            errorMsgValidationInfo,
          );
        });
      });
    });
  });

  t.test("get one", async (t) => {
    t.test("non uuid id url param should fail", async (t) => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/providers/fail",
      });

      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.validation.find(
          (v: { fieldName: string }) => v.fieldName === "providerId",
        )?.message,
        'must match format "uuid"',
        errorMsgValidationInfo,
      );
    });

    t.test("no type search query should fail", async (t) => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca",
      });

      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.validation.find(
          (v: { fieldName: string }) => v.fieldName === "type",
        )?.message,
        "must have required property 'type'",
        errorMsgValidationInfo,
      );
    });

    t.test("invalid type search query should fail", async (t) => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/providers/ca3b108f-7b9a-487e-b40a-eb535e6056ca?type=fail",
      });

      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.validation.find(
          (v: { fieldName: string }) => v.fieldName === "type",
        )?.message,
        "must be equal to one of the allowed values",
        errorMsgValidationInfo,
      );
    });
  });

  t.test("get many", async (t) => {
    t.test("no type search query should fail", async (t) => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/providers",
      });

      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.validation.find(
          (v: { fieldName: string }) => v.fieldName === "type",
        )?.message,
        "must have required property 'type'",
        errorMsgValidationInfo,
      );
    });

    t.test("invalid type search query should fail", async (t) => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/providers?type=fail",
      });

      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.validation.find(
          (v: { fieldName: string }) => v.fieldName === "type",
        )?.message,
        "must be equal to one of the allowed values",
        errorMsgValidationInfo,
      );
    });
  });

  t.test("delete", async (t) => {
    t.test("non uuid id url param should fail", async (t) => {
      const res = await app.inject({
        method: "DELETE",
        url: "/api/v1/providers/fail",
      });

      const body = await res.json();

      t.equal(res.statusCode, 422, statusCodeValidationInfo);
      t.equal(body.code, "VALIDATION_ERROR", bodyCodeValidationInfo);
      t.equal(
        body.validation.find(
          (v: { fieldName: string }) => v.fieldName === "providerId",
        )?.message,
        'must match format "uuid"',
        errorMsgValidationInfo,
      );
    });
  });

  t.end();
});
