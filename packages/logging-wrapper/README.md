# Logging Wrapper

This logging wrapper goal is to standardize the records written by our services.

## How to

To use this package three steps are needed:
- add `"logging-wrapper": "*",` to your dependencies

- use the `getLoggingConfiguration()` method to get the configuration for the `fastify` server
```
const server = fastify({
    ...getLoggingConfiguration()
});
```

- after the server is initialized, invoke the `initializeLoggingHooks(server)` to setup the needed `fastify` hooks
```
initializeLoggingHooks(server);
```

That's it! Just log as you usually do!

## Default records

We will have 3 mandatory log entries that will be written for each request the service manages.

Those 3 records are:
- **New Request**, written when a request is received
```
{"level":30,"level_name":"INFO","hostname":"hostname","request_id":"q9Y6NwwbRimle4TxcXRPkQ-0000000000","timestamp":1713868947766,"request":{"scheme":"http","method":"GET","path":"/ping","hostname":"localhost:80","query_params":{},"headers":{"user-agent":"lightMyRequest","host":"localhost:80"},"client_ip":"127.0.0.1","user_agent":"lightMyRequest"},"message":"NEW_REQUEST"}
```
- **Response**, containing most of the response data
```
{"level":30,"level_name":"INFO","hostname":"hostname","request_id":"q9Y6NwwbRimle4TxcXRPkQ-0000000000","timestamp":1713868947769,"request":{"scheme":"http","method":"GET","path":"/ping","hostname":"localhost:80","query_params":{}},"response":{"status_code":200,"headers":{"content-type":"application/json; charset=utf-8","content-length":"17"}},"message":"RESPONSE"}
```
- **API Track**, it contains data about the lifecycle of the request, including errors, if any
```
{"level":30,"level_name":"INFO","hostname":"hostname","request_id":"5c_RLAnSS4y9-Q5STsJyiQ-0000000008","timestamp":1713869128434,"request":{"scheme":"http","method":"GET","path":"/this-path-must-not-exist","hostname":"localhost:80","query_params":{"status_code":"404","error_message":"Not Found"}},"response":{"status_code":404,"headers":{"content-type":"application/json; charset=utf-8","content-length":"107"}},"error":{"class":"REQUEST_ERROR","message":"Not Found","code":"FST_ERR_NOT_FOUND"},"message":"API_TRACK"}
```

### Error record

If an error is thrown, a log entry is automatically written.

```
{"level":50,"level_name":"ERROR","hostname":"hostname","request_id":"1kPptKhMSeyZ9OwcSwBxhg-0000000008","timestamp":1713869258238,"request":{"scheme":"http","method":"GET","path":"/this-path-must-not-exist","hostname":"localhost:80","query_params":{"status_code":"404","error_message":"Not Found"}},"error":{"class":"REQUEST_ERROR","message":"Not Found","trace":"FastifyError: Not Found..... The whole trace here","code":"FST_ERR_NOT_FOUND"},"message":"ERROR"}
```

## Additional entries

Additional log entries can be added as needed, but they will include, thanks to this package, common info about the request context that will be useful for future troubleshooting.
