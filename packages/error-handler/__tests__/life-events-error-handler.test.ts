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
