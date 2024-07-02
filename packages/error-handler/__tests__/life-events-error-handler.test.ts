import { t } from "tap";
import {
  DEFAULT_METHOD,
  initializeServer,
} from "./helpers/fastify-test-helpers.js";
import * as sharedErrors from "shared-errors";

const errorsProvider: {
  errorType: typeof sharedErrors.LifeEventsError;
  expectedStatusCode: number;
}[] = [
  { errorType: sharedErrors.AuthenticationError, expectedStatusCode: 401 },
  { errorType: sharedErrors.AuthorizationError, expectedStatusCode: 403 },
  { errorType: sharedErrors.LifeEventsError, expectedStatusCode: 500 },
  { errorType: sharedErrors.NotFoundError, expectedStatusCode: 404 },
  { errorType: sharedErrors.NotImplementedError, expectedStatusCode: 500 },
  { errorType: sharedErrors.ServerError, expectedStatusCode: 500 },
  { errorType: sharedErrors.ThirdPartyError, expectedStatusCode: 502 },
];

errorsProvider.forEach((errorProv) =>
  t.test(
    `Error is managed in the correct way - ${errorProv.errorType.name}`,
    async (t) => {
      const { server } = initializeServer();
      t.teardown(() => server.close());

      const errorConstructor = eval(
        `sharedErrors.${errorProv.errorType.name}`,
      ) as typeof sharedErrors.LifeEventsError;
      const errorInstance = new errorConstructor("MOCK", "message");

      const response = await server.inject({
        method: DEFAULT_METHOD,
        url: `/life-events/${errorProv.errorType.name}`,
      });

      t.ok(typeof response !== "undefined");
      t.equal(response?.statusCode, errorProv.expectedStatusCode);
      t.same(response.json(), {
        code: sharedErrors.parseHttpErrorClass(errorProv.expectedStatusCode),
        detail: "Failed Correctly!",
        request_id: "req-1",
        name: errorInstance.name,
        process: "TESTING",
      });

      t.end();
    },
  ),
);

t.test(`Custom error is managed based on parameters`, async (t) => {
  const { server } = initializeServer();
  t.teardown(() => server.close());

  const response = await server.inject({
    method: DEFAULT_METHOD,
    url: `/life-events/custom`,
    query: { status_code: "503" },
  });

  t.ok(typeof response !== "undefined");
  t.equal(response?.statusCode, 503);
  t.same(response.json(), {
    code: sharedErrors.parseHttpErrorClass(503),
    detail: "message",
    request_id: "req-1",
    name: new sharedErrors.CustomError("MOCK", "mock", 503).name,
    process: "CUSTOM_PROCESS",
  });

  t.end();
});

t.test(`Validation error is managed as expected`, async (t) => {
  const { server } = initializeServer();
  t.teardown(() => server.close());

  const response = await server.inject({
    method: DEFAULT_METHOD,
    url: `/life-events/validation`,
  });

  t.ok(typeof response !== "undefined");
  t.equal(response?.statusCode, 422);
  t.same(response.json(), {
    code: sharedErrors.parseHttpErrorClass(422),
    detail: "message",
    request_id: "req-1",
    name: new sharedErrors.ValidationError("MOCK", "mock").name,
    process: "VALIDATION_PROCESS",
    validation: [{ fieldName: "field", message: "error" }],
  });

  t.end();
});
