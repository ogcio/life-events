# Error Handling

This error handler package's goal is to standardize the management of the errors across our services.

## How to

To use this package 2 steps are needed:
- add `"error-handling": "*",` to your dependencies

- use the `initializeErrorHandling(server)` method to set the error handlers for the `fastify` server

That's it!

## Docker

Remember to copy the package to the container in your Dockerfile!