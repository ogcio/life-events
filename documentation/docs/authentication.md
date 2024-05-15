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
    AuthService->>-User Browser: Set Cookie SessionId Redirect to ogcio.app
    User Browser->>+OGCIO App: GET ogcio.app Cookie SessionID
    OGCIO App->>-User Browser: Return data
```

To implement authentication in a NextJS app, you can use the `auth` package and call `PgSessions.get()`. This function will handle retrieving session data using the `sessionID` cookie or redirecting to the `AuthService` specified by the `AUTH_SERVICE_URL` environment variable.

To log out, simply make a GET request to `/auth/logout`. Make sure to include the `redirectUrl` query parameter to specify where users should be redirected after logging out and potentially logging back in.

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
