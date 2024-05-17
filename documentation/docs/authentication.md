---
sidebar_position: 3
sidebar_label: Authentication
---

# Authentication

This part is still under costruction and changes are due when MyGovID integration will be complete.
Also Logto is going to expand/replace `AuthService` in the future.

The Authentication flow is outlined in the following sequence diagram.

The Authservice for now is responsbile to mock the MyGovID authentication flow, hence `AuthService` and `MyGovID`
are to be considered a single entity at the present time

```mermaid
sequenceDiagram
    User Browser->>+OGCIO App: GET ogcio.app
    OGCIO App->>-User Browser: Unauthorized
    User Browser->>+AuthService: AuthService/auth?redirectUrl=ogcio.app
    AuthService->>-User Browser: Set Cookie redirectUrl=ogcio.app
    User Browser->>+MyGovID: POST MyGovID { username password }
    MyGovID->>-User Browser: MyGovID Token
    User Browser->>+AuthService: POST AuthService/callback Cookie redirectUrl
    AuthService->>-User Browser: Set Cookie SessionId Redirect to ogcio.app/api/auth
    User Browser->>+OGCIO App: POST ogcio.app/api/auth sessionId
    OGCIO App->>-User Browser: Set Cookie sessionId
    User Browser->>+OGCIO App: GET ogcio.app
    OGCIO App->>-User Browser: return Data
```

## Integrating Auth service in your webapp

Auth service checklist integration:

- [ ] ENV VARS: HOST_URL set to the current application URL and AUTH_SERVICE_URL pointing to the auth service
- [ ] Expose an API route for logging in /app/api/auth/route.ts

Ideally this file should contain

```typescript
import route from "auth/route";
export const POST = route;
```

- [ ] Logout URL set to `AUTH_SERVICE_URL/auth/logout?redirectUrl=HOST_URL`
- [ ] Protect routes with `PgSessions.get()`, this API will return session data or redirect to Login

## old flow

```mermaid
sequenceDiagram
    User Browser->>+OGCIO App: GET /
    OGCIO App->>-User Browser: Unauthorized
    User Browser->>+AuthService: Login
    AuthService->>+MyGovID: Auth redirect to MyGovID
    MyGovID->>-AuthService: MyGovID Token
    AuthService->>AuthService: Map MyGovID use to Local User
    AuthService->>-User Browser: Return AuthService Token
    User Browser->>+OGCIO App: GET/ with AuthserviceToken
    OGCIO App->>+AuthService: Get User data with AuthserviceToken
    AuthService->>AuthService: Map Authservice Token to MyGovID Token
    AuthService->>+MyGovID: Fetch UserData with MyGovID Token
    MyGovID->>-AuthService: Return UserData
    AuthService->>-OGCIO App: Return UserData
    OGCIO App->>-User Browser: Display user data
```
