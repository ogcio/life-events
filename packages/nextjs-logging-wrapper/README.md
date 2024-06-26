# NextJs Logging Wrapper

This logging wrapper goal is to standardize the records written by our NextJs services.

## How to

To use this package three steps are needed:
- add `"nextjs-logging-wrapper": "*",` to your dependencies
- based on the needs, you can use one of the two available methods:
    - `getServerLogger()`, that must be used to log entries on the server side
    - `getClientLogger()`, used to log entries on the client side

_Server example_
```
import { getServerLogger } from "nextjs-logging-wrapper";
.....
"use server"
.....
getServerLogger().debug("Welcome to the server side!");
```

_Client example_
```
"use client"
import { getClientLogger } from "nextjs-logging-wrapper";
.....
getClientLogger().debug("Welcome to the client side!");
```


## Log entries format

### Client Side
The entry for the client logger will be something similar to
```
{"level":30,"level_name":"INFO","timestamp":1719322306071,"request":{"path":"/en/the-page","params":{"locale":"en"},"query_params":{}},"message":"Welcome to the client side"}
```

### Server Side
The entry for the server logger will be something similar to
```
 {"level":30,"level_name":"INFO","hostname":"SSalvatico-ITMAC24","timestamp":1719323762474,"request_id":"50572f1b-a789-459d-9770-c525b69a221e","request":{"scheme":"http","method":"GET","path":"/en/the-backend-route","hostname":"localhost:3002","language":"en","user_agent":"the user agent"},"message":"Welcome to the server side"}
```

## Minimum Log Level

The minimum log level is decided, in order of priority, by:
- optional `minimumLevel` parameter passed when the logger instance is created
- `LOG_LEVEL` env variable
- otherwise `debug` is set as default value

## Docker

Remember to copy and build the package to the container in your Dockerfile!