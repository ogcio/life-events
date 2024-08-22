import t from "tap";
import fp from "fastify-plugin";

t.test("messaging - providers", async (t) => {
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

    t.equal(res.statusCode, 422);
    t.equal(body.code, "VALIDATION_ERROR");
    t.equal(
      body.validation.find((v: { fieldName: string }) => v.fieldName === "type")
        ?.message,
      "must have required property 'type'",
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

    t.equal(res.statusCode, 422);
    t.equal(body.code, "VALIDATION_ERROR");
    t.equal(
      body.validation.find((v: { fieldName: string }) => v.fieldName === "type")
        ?.message,
      "must be equal to one of the allowed values",
    );
  });

  t.test("type email", async (t) => {
    // providerName
    t.test("providerName field schema validations", async (t) => {
      t.test("creating with empty providerName should fail", async (t) => {
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
        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "providerName",
          )?.message,
          "must NOT have fewer than 1 characters",
        );
      });

      t.test("creating with null providerName should fail", async (t) => {
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
        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "providerName",
          )?.message,
          "must NOT have fewer than 1 characters",
        );
      });

      t.test("creating with no providerName should fail", async (t) => {
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
        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
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
      t.test("creating with empty fromAddress should fail", async (t) => {
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
        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "fromAddress",
          )?.message,
          "must NOT have fewer than 1 characters",
        );
      });

      t.test("creating with no fromAddress should fail", async (t) => {
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

        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
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
      t.test("creating with empty password should fail", async (t) => {
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
        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "password",
          )?.message,
          "must NOT have fewer than 1 characters",
        );
      });

      t.test("creating with no password should fail", async (t) => {
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
        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
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
      t.test("creating with empty username should fail", async (t) => {
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
        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "username",
          )?.message,
          "must NOT have fewer than 1 characters",
        );
      });

      t.test("creating with no username should fail", async (t) => {
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
        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
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
      t.test("creating with non numeric smtpPort should fail", async (t) => {
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
        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "smtpPort",
          )?.message,
          "must be number",
        );
      });

      t.test("creating with null smtpPort should fail", async (t) => {
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

        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "smtpPort",
          )?.message,
          "must be >= 1",
        );
      });

      t.test("creating with no smtpPort should fail", async (t) => {
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

        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
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
      t.test("creating with empty smtpHost should fail", async (t) => {
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
        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "smtpHost",
          )?.message,
          "must NOT have fewer than 1 characters",
        );
      });

      t.test("creating with no smtpHost should fail", async (t) => {
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
        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
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
      t.test(
        "creating with non boolean and non default coerce value ssl should fail",
        async (t) => {
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
          t.equal(res.statusCode, 422);
          t.equal(body.code, "VALIDATION_ERROR");
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "ssl",
            )?.message,
            "must be boolean",
          );
        },
      );

      t.test("creating with no ssl should fail", async (t) => {
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
        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "ssl",
          )?.message,
          "must have required property 'ssl'",
        );
      });
    });

    // isPrimary
    t.test("isPrimary field schema validations", async (t) => {
      t.test(
        "creating with non boolean and non default coerce value isPrimary should fail",
        async (t) => {
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
          t.equal(res.statusCode, 422);
          t.equal(body.code, "VALIDATION_ERROR");
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "isPrimary",
            )?.message,
            "must be boolean",
          );
        },
      );

      t.test("creating with no isPrimary should fail", async (t) => {
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
        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "isPrimary",
          )?.message,
          "must have required property 'isPrimary'",
        );
      });
    });
  });

  // fixa lagg till typ "create"
  t.test("type sms", async (t) => {
    // providerName
    t.test("providerName field schema validations", async (t) => {
      t.test("creating  providerName should fail", async (t) => {
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
        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "providerName",
          )?.message,
          "must NOT have fewer than 1 characters",
        );
      });

      t.test("creating with null providerName should fail", async (t) => {
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
        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "providerName",
          )?.message,
          "must NOT have fewer than 1 characters",
        );
      });

      t.test("creating with no providerName should fail", async (t) => {
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
        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "providerName",
          )?.message,
          "must have required property 'providerName'",
        );
      });
    });

    // isPrimary
    t.test("isPrimary field schema validations", async (t) => {
      t.test(
        "creating with non boolean and non default coerce value isPrimary should fail",
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

          t.equal(res.statusCode, 422);
          t.equal(body.code, "VALIDATION_ERROR");
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "isPrimary",
            )?.message,
            "must be boolean",
          );
        },
      );

      t.test("creating with no isPrimary should fail", async (t) => {
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
        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "isPrimary",
          )?.message,
          "must have required property 'isPrimary'",
        );
      });
    });

    // config
    t.test("config field schema validations", async (t) => {
      t.test("creating with no config should fail", async (t) => {
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
        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "config",
          )?.message,
          "must have required property 'config'",
        );
      });

      t.test("creating with unsupported config type should fail", async (t) => {
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
        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "type",
          )?.message,
          "must be equal to one of the allowed values",
        );
      });

      t.test("creating with no config type should fail", async (t) => {
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

        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "type",
          )?.message,
          "must have required property 'type'",
        );
      });

      t.test("creating with no config accessKey should fail", async (t) => {
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

        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "accessKey",
          )?.message,
          "must have required property 'accessKey'",
        );
      });

      t.test("creating with null config accessKey should fail", async (t) => {
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

        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "accessKey",
          )?.message,
          "must NOT have fewer than 1 characters",
        );
      });

      t.test(
        "creating with no config secretAccessKey should fail",
        async (t) => {
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

          t.equal(res.statusCode, 422);
          t.equal(body.code, "VALIDATION_ERROR");
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "secretAccessKey",
            )?.message,
            "must have required property 'secretAccessKey'",
          );
        },
      );

      t.test(
        "creating with null config secretAccessKey should fail",
        async (t) => {
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

          t.equal(res.statusCode, 422);
          t.equal(body.code, "VALIDATION_ERROR");
          t.equal(
            body.validation.find(
              (v: { fieldName: string }) => v.fieldName === "secretAccessKey",
            )?.message,
            "must NOT have fewer than 1 characters",
          );
        },
      );

      t.test("creating with no config region should fail", async (t) => {
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

        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "region",
          )?.message,
          "must have required property 'region'",
        );
      });

      t.test("creating with null config region should fail", async (t) => {
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

        t.equal(res.statusCode, 422);
        t.equal(body.code, "VALIDATION_ERROR");
        t.equal(
          body.validation.find(
            (v: { fieldName: string }) => v.fieldName === "region",
          )?.message,
          "must NOT have fewer than 1 characters",
        );
      });
    });
  });

  t.end();
});
