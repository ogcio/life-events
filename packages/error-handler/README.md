# Error Handling

This error handler package's goal is to standardize the management of the errors across our Fastify services.

## How to use it

To use this package 2 steps are needed:
- add `"error-handler": "*",` to your dependencies

- use the `initializeErrorHandler(server)` method to set the error handlers for the `fastify` server

That's it!

## Docker

Remember to copy the package to the container in your Dockerfile!

## How to raise errors

To standardize error handling in the Fastify services, the suggested way to go is to raise exceptions by using the `LifeEvents` errors from the `shared-errors` package.

It exposes some predefined error types, like `BadRequestError` or `AuthorizationError`. If you need some specific error you can use the `CustomError` type or add a new type to the package itself.

```
import { NotFoundError } from "shared-errors";
......
throw new NotFoundError("CURRENT FLOW", "No item here!");
```

The `error-handler` package is ready to manage the `LifeEvents` errors, log them and transform them in the HTTP error you need.