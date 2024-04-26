import { t } from "tap";
import {
  DEFAULT_METHOD,
  DEFAULT_PATH,
  initializeServer,
} from "./helpers/fastify-test-helpers";

t.test("Common error is managed as expected", async () => {
  const { server } = initializeServer();
  t.teardown(() => server.close());
  const response = await server.inject({
    method: DEFAULT_METHOD,
    url: DEFAULT_PATH,
    query: { status_code: "500", error_message: "error message" },
  });

  t.ok(typeof response !== "undefined");
  t.equal(response?.statusCode, 500);
  t.same(response.json(), {
    code: "SERVER_ERROR",
    detail: "error message",
    request_id: "req-1",
    name: "FastifyError",
  });

  t.end();
});

t.test("Validation error is managed as expected", async () => {
  const { server } = initializeServer();
  t.teardown(() => server.close());
  const response = await server.inject({
    method: DEFAULT_METHOD,
    url: "/validation",
    query: { error_message: "error message" },
  });

  t.ok(typeof response !== "undefined");
  t.equal(response?.statusCode, 423);
  t.same(response.headers.error_header, "value");
  t.same(response.json(), {
    code: "VALIDATION_ERROR",
    detail: "error message",
    request_id: "req-1",
    name: "FastifyError",
    validation: [
      {
        keyword: "field",
        instancePath: "the.instance.path",
        schemaPath: "the.schema.path",
        params: {
          field: "one",
          property: "two",
        },
        message: "error message",
      },
    ],
    validationContext: "body",
  });

  t.end();
});

t.test(
  "If an error with status 200 is raised, it is managed as an unknown one",
  async () => {
    const { server } = initializeServer();
    t.teardown(() => server.close());
    const response = await server.inject({
      method: DEFAULT_METHOD,
      url: DEFAULT_PATH,
      query: { status_code: "200", error_message: "error message" },
    });

    t.ok(typeof response !== "undefined");
    t.equal(response?.statusCode, 500);
    t.same(response.json(), {
      code: "UNKNOWN_ERROR",
      detail: "error message",
      request_id: "req-1",
      name: "FastifyError",
    });

    t.end();
  },
);

t.test("404 error is managed as expected", async () => {
  const { server } = initializeServer();
  t.teardown(() => server.close());
  const response = await server.inject({
    method: DEFAULT_METHOD,
    url: "/this-path-does-not-exist",
  });

  t.ok(typeof response !== "undefined");
  t.equal(response?.statusCode, 404);
  t.same(response.json(), {
    code: "REQUEST_ERROR",
    detail: "Not Found",
    request_id: "req-1",
    name: "FastifyError",
  });

  t.end();
});
