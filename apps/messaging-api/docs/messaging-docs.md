# OGCIO Messaging API Documentation

## Overview

This document describes the API for the OGCIO Messaging Building Block. The API version is 1.0.0.

## Authentication

Follow these instructions to obtain and use tokens for API access.

Step 1: Receive Your Credentials
--------------------------------

To get started, contact our support team to request the credentials to use. These values are required for the authentication process.

Once you have requested access, we will provide you with the following:

-   **Basic Authentication Code**: The base64 string you must use to request the tokens.
-   **Token Endpoint URL**: The URL where you can request your tokens.
-   **Department Id**: The identifier assigned to the department you are part of.
-   **List of available scopes**: The available permissions for your application

Step 2: Request Tokens
----------------------

With your credentials in hand, you can now request tokens.

```curl

curl -X POST {GET_TOKEN_URL} \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "Authorization: Basic {BASIC AUTHENTICATION CODE}" \
-d "grant_type=client_credentials&scope={SCOPES}&organization_id={DEPARTMENT_ID}"
```

### Expected Response

Upon a successful request, you will receive a JSON response containing:

-   `access_token`: The token you will use to authenticate API requests.
-   `expires_in`: The number of seconds before the token expires.
-   `scope`: The scope of access granted by the token.

Step 3: Use the Token to Authenticate API Requests
--------------------------------------------------

The API uses bearer token authentication. Include a token in the *Authorization* header of your requests.

```
Authorization: Bearer <access_token_here>
```

<div style="page-break-after: always;"></div>

## Endpoints

### Messages

#### Get Messages

Retrieves all messages for the requested organization or recipient.

```
GET /api/v1/messages/
```

Query Parameters:
- `status` (optional): Filter by status. Possible value: "delivered"
- `recipientUserId` (optional): Filter by recipient user ID
- `organisationId` (optional): Filter by organization ID
- `offset` (optional, default: 0): Number of records to skip
- `limit` (optional, default: 20, max: 100): Maximum number of records to return

Note: Either `recipientUserId` or `organisationId` must be provided.

Response (200 OK):
```json
{
  "data": [
    {
      "id": "string",  // Unique Id of the message
      "subject": "string",  // Subject
      "createdAt": "string",  // Creation date time
      "threadName": "string",  // Thread Name used to group messages
      "organisationId": "string",  // Organisation sender id
      "recipientUserId": "string"  // Unique id of the recipient
    }
  ],
  "metadata": {
    "links": {
      "self": { "href": "string" },  // URL pointing to the request itself
      "next": { "href": "string" },  // URL pointing to the next page of results
      "prev": { "href": "string" },  // URL pointing to the previous page of results
      "first": { "href": "string" },  // URL pointing to the first page of results
      "last": { "href": "string" },  // URL pointing to the last page of results
      "pages": {
        "additionalProp": { "href": "string" }  // May contain other useful URLs
      }
    },
    "totalCount": 0  // Total number of available items
  }
}
```

#### Create Message

Creates a new message.

```
POST /api/v1/messages/
```

Request Body:
```json
{
  "preferredTransports": ["sms", "email", "lifeEvent"],  // List of preferred transports to use
  "recipientUserId": "string",  // Unique user id of the recipient
  "security": "public",  // Confidentiality level of the message
  "bypassConsent": false,  // If true, the message will be sent even if the recipient didn't accept the organisation's invitation
  "scheduleAt": "2023-08-09T12:00:00Z",  // Date and time to schedule the message
  "message": {
    "threadName": "string",  // Thread Name used to group messages
    "subject": "string",  // Subject. This is the only part that will be seen outside of the messaging platform if security is 'confidential'
    "excerpt": "string",  // Brief description of the message
    "plainText": "string",  // Plain text version of the message
    "richText": "string",  // Rich text version of the message
    "lang": "string"  // Language used to send the message
  }
}
```

Response (201 Created):
```json
{
  "data": {
    "id": "uuid"  // The unique id of the created message
  }
}
```

<div style="page-break-after: always;"></div>

#### Get Message

Retrieves a specific message by ID.

```
GET /api/v1/messages/{messageId}
```

Path Parameters:
- `messageId`: UUID of the message

Response (200 OK):
```json
{
  "data": {
    "subject": "string",  // Subject
    "createdAt": "string",  // Creation date time
    "threadName": "string",  // Thread Name used to group messages
    "organisationId": "string",  // Organisation sender id
    "recipientUserId": "string",  // Unique id of the recipient
    "excerpt": "string",  // Brief description of the message
    "plainText": "string",  // Plain text version of the message
    "richText": "string",  // Rich text version of the message
    "isSeen": boolean,  // True if the message has already been seen by the recipient
    "security": "public",  // Confidentiality level of the message
    "senderUserProfileId": "string"  // Unique id of the sender from the Life Events building block
  },
  "metadata": {
    // Similar to GET /api/v1/messages/ metadata
  }
}
```

<div style="page-break-after: always;"></div>

### Providers

#### Get Providers

Retrieves providers matching the requested query.

```
GET /api/v1/providers/
```

Query Parameters:
- `primary` (optional): If set, returns only primary (true) or non-primary (false) providers
- `type` (required): Provider type. Possible values: "sms", "email"
- `offset` (optional, default: 0): Number of records to skip
- `limit` (optional, default: 20, max: 100): Maximum number of records to return

Response (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",  // Unique id of the provider
      "providerName": "string",  // Name of the provider
      "isPrimary": boolean,  // If true, the provider is set as primary for the selected type for the current organisation
      "type": "sms"  // Provider type
    }
  ],
  "metadata": {
    // Similar to GET /api/v1/messages/ metadata
  }
}
```

<div style="page-break-after: always;"></div>

#### Create Provider

Creates a new provider.

```
POST /api/v1/providers/
```

Request Body (Email Provider):
```json
{
  "providerName": "string",  // Name of the provider
  "isPrimary": boolean,  // If true, the provider is set as primary for the selected type for the current organisation
  "type": "email",  // Provider type
  "smtpHost": "string",  // Address of the SMTP host
  "smtpPort": 0,  // Port of the SMTP host
  "username": "string",  // Username to use to log into the SMTP server
  "password": "string",  // Password to use to log into the SMTP server
  "throttle": 0,  // Optional field to adjust how long time between each mail, in milliseconds
  "fromAddress": "string",  // Email address to use as sender
  "ssl": boolean  // Is connection to the SMTP server secure?
}
```

Request Body (SMS Provider):
```json
{
  "providerName": "string",  // Name of the provider
  "isPrimary": boolean,  // If true, the provider is set as primary for the selected type for the current organisation
  "type": "sms",  // Provider type
  "config": {
    "type": "AWS",  // Provider configuration type
    "accessKey": "string",  // AWS access key
    "secretAccessKey": "string",  // AWS secret access key
    "region": "string"  // AWS region
  }
}
```

Response (200 OK):
```json
{
  "data": {
    "id": "uuid"  // Unique id of the created provider
  }
}
```

<div style="page-break-after: always;"></div>

#### Get Provider

Retrieves a specific provider by ID.

```
GET /api/v1/providers/{providerId}
```

Path Parameters:
- `providerId`: UUID of the provider

Query Parameters:
- `type` (required): Provider type. Possible values: "sms", "email"

Response (200 OK):
```json
{
  "data": {
    // Provider details (structure depends on the provider type)
  },
  "metadata": {
    // Similar to GET /api/v1/messages/ metadata
  }
}
```

The structure of the `data` object in the response depends on the provider type:

For Email Providers:
```json
{
  "data": {
    "id": "uuid",
    "providerName": "string",
    "isPrimary": boolean,
    "type": "email",
    "smtpHost": "string",
    "smtpPort": number,
    "username": "string",
    "password": "string",
    "throttle": number,
    "fromAddress": "string",
    "ssl": boolean
  }
}
```

For SMS Providers:
```json
{
  "data": {
    "id": "uuid",
    "providerName": "string",
    "isPrimary": boolean,
    "type": "sms",
    "config": {
      "type": "AWS",
      "accessKey": "string",
      "secretAccessKey": "string",
      "region": "string"
    }
  }
}
```

#### Update Provider

Updates an existing provider.

```
PUT /api/v1/providers/{providerId}
```

Path Parameters:
- `providerId`: UUID of the provider

Request Body: Similar to the Create Provider endpoint, including the `id` field.

Response (200 OK): No content

#### Delete Provider

Deletes a specific provider.

```
DELETE /api/v1/providers/{providerId}
```

Path Parameters:
- `providerId`: UUID of the provider to be deleted

Response (200 OK): No content

<div style="page-break-after: always;"></div>

### Templates

#### Get Templates

Retrieves templates matching the requested query.

```
GET /api/v1/templates/
```

Query Parameters:
- `lang` (optional): If set, returns templates with the requested language

Response (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",  // Unique id of the template
      "contents": [
        {
          "lang": "string",  // Selected language
          "templateName": "string"  // Template name for the related language
        }
      ]
    }
  ],
  "metadata": {
    // Similar to GET /api/v1/messages/ metadata
  }
}
```

<div style="page-break-after: always;"></div>

#### Create Template

Creates a new template.

```
POST /api/v1/templates/
```

Request Body:
```json
{
  "contents": [
    {
      "templateName": "string",  // Template name for the related language
      "lang": "string",  // Current language
      "subject": "string",  // Subject of the template
      "excerpt": "string",  // Brief description of the template content
      "plainText": "string",  // Plain text version of the template
      "richText": "string"  // Rich text version of the template
    }
  ],
  "variables": [
    {
      "name": "string",  // Variable name
      "type": "string",  // Variable type
      "languages": ["string"]  // Languages for which this variable is applicable
    }
  ]
}
```

Response (201 Created):
```json
{
  "data": {
    "id": "uuid"  // Unique id of the created template
  }
}
```

<div style="page-break-after: always;"></div>

#### Get Template

Retrieves a specific template by ID.

```
GET /api/v1/templates/{templateId}
```

Path Parameters:
- `templateId`: UUID of the template

Response (200 OK):
```json
{
  "data": {
    "contents": [
      {
        "templateName": "string",  // Template name for the related language
        "lang": "string",  // Current language
        "subject": "string",  // Subject of the template
        "excerpt": "string",  // Brief description of the template content
        "plainText": "string",  // Plain text version of the template
        "richText": "string"  // Rich text version of the template
      }
    ],
    "fields": [
      {
        "fieldName": "string",  // Name of the variable field
        "fieldType": "string"  // Type of the variable field
      }
    ]
  },
  "metadata": {
    // Similar to GET /api/v1/messages/ metadata
  }
}
```

<div style="page-break-after: always;"></div>

#### Update Template

Updates an existing template.

```
PUT /api/v1/templates/{templateId}
```

Path Parameters:
- `templateId`: UUID of the template

Request Body:
```json
{
  "contents": [
    {
      "id": "uuid",  // Unique id of the template content
      "templateName": "string",  // Template name for the related language
      "lang": "string",  // Current language
      "subject": "string",  // Subject of the template
      "excerpt": "string",  // Brief description of the template content
      "plainText": "string",  // Plain text version of the template
      "richText": "string"  // Rich text version of the template
    }
  ],
  "variables": [
    {
      "name": "string",  // Variable name
      "type": "string"  // Variable type
    }
  ]
}
```

Response (200 OK): No content

#### Delete Template

Deletes a specific template.

```
DELETE /api/v1/templates/{templateId}
```

Path Parameters:
- `templateId`: UUID of the template to be deleted

Response (200 OK): No content


<div style="page-break-after: always;"></div>

### Organisation Settings

#### Get Organisation Settings

Retrieves the organisation settings for the logged in user.

```
GET /api/v1/organisation-settings/
```

Response (200 OK):
```json
{
  "data": [
    {
      "id": "string",  // Unique id of the organisation setting
      "userId": "string",  // Unique id of the related user
      "userProfileId": "string",  // User profile id, if available
      "phoneNumber": "string",  // Phone number of the user
      "emailAddress": "string",  // Email address of the user
      "organisationId": "string",  // Unique id of the related organisation
      "organisationInvitationStatus": "pending",  // Current status of the invitation to the messaging building block
      "organisationInvitationSentAt": "string",  // Date and time describing when the organisation invitation has been sent
      "organisationInvitationFeedbackAt": "string",  // Date and time describing when the user has gave a feedback to the organisation invitation
      "organisationPreferredTransports": ["sms", "email"],  // The list of the preferred transports to use
      "correlationQuality": "full",  // Quality of correlation with Life Events platform
      "userStatus": "pending",  // Status of the user
      "details": {
        "publicIdentityId": "string",  // PPSN of the imported user
        "firstName": "string",  // First name of the imported user
        "lastName": "string",  // Last name of the imported user
        "birthDate": "string",  // Birth date of the imported user
        "address": {
          "city": "string",
          "zipCode": "string",
          "street": "string",
          "country": "string",
          "region": "string"
        },
        "collectedConsent": false  // If false, an invitation to the user asking to accept to receive messages from the organisation will be sent
      }
    }
  ],
  "metadata": {
    // Similar to other endpoints' metadata
  }
}
```

<div style="page-break-after: always;"></div>

#### Get Specific Organisation Setting

Retrieves a specific organisation setting.

```
GET /api/v1/organisation-settings/{organisationSettingId}
```

Path Parameters:
- `organisationSettingId`: ID of the organisation setting

Response (200 OK):
```json
{
  "data": {
    // Similar structure to the item in the array from GET /api/v1/organisation-settings/
  },
  "metadata": {
    // Similar to other endpoints' metadata
  }
}
```

<div style="page-break-after: always;"></div>

#### Update Organisation Setting

Updates a specific organisation setting.

```
PATCH /api/v1/organisation-settings/{organisationSettingId}
```

Path Parameters:
- `organisationSettingId`: ID of the organisation setting

Request Body:
```json
{
  "invitationStatusFeedback": "accepted",  // Current status of the invitation to receive messages from the organisation
  "preferredTransports": ["sms", "email"]  // The list of the preferred transports to use
}
```

Response (202 Accepted):
```json
{
  "data": {
    // Updated organisation setting, similar structure to GET response
  },
  "metadata": {
    // Similar to other endpoints' metadata
  }
}
```

<div style="page-break-after: always;"></div>

### User Imports

#### Get User Imports

Retrieves the user import batches related to the current organisation.

```
GET /api/v1/user-imports/
```

Response (200 OK):
```json
{
  "data": [
    {
      "organisationId": "string",
      "importedAt": "2023-08-09T12:00:00Z",
      "importChannel": "api",  // Channel through which the users have been imported
      "retryCount": 0,
      "lastRetryAt": "2023-08-09T12:00:00Z",
      "importId": "string"
    }
  ],
  "metadata": {
    // Similar to other endpoints' metadata
  }
}
```

<div style="page-break-after: always;"></div>

#### Import Users

Imports a new batch of users. Accepts either a CSV file (if Content-Type is multipart/form-data) or an array of users.

```
POST /api/v1/user-imports/
```

Request Body:
```json
[
  {
    "importIndex": 0,  // Numeric index of the user to import
    "publicIdentityId": "string",  // PPSN of the user to be imported
    "firstName": "string",  // First name of the user to be imported
    "lastName": "string",  // Last name of the user to be imported
    "phoneNumber": "string",  // Phone number of the user to be imported
    "birthDate": "string",  // Birth date of the user to be imported
    "emailAddress": "string",  // Email address of the user to be imported
    "addressCity": "string",  // City of the user to be imported
    "addressZipCode": "string",  // Zip Code of the user to be imported
    "addressStreet": "string",  // Street of the user to be imported
    "addressCountry": "string",  // Country of the user to be imported
    "addressRegion": "string",  // Region of the user to be imported
    "tags": "string",  // Tags of the user to be imported
    "collectedConsent": "string"  // If false, an invitation to the user asking to accept to receive messages from the organisation will be sent
  }
]
```

Response (202 Accepted): No content

<div style="page-break-after: always;"></div>

#### Get Specific User Import

Retrieves a specific user import batch.

```
GET /api/v1/user-imports/{importId}
```

Path Parameters:
- `importId`: ID of the import batch

Query Parameters:
- `includeImportedData` (required): If true, returns the data of the users sent in the import batch

Response (200 OK):
```json
{
  "data": {
    "organisationId": "string",
    "importedAt": "2023-08-09T12:00:00Z",
    "usersData": [
      {
        "importIndex": 0,
        "phoneNumber": "string",  // Phone number of the user
        "emailAddress": "string",  // Email address of the user
        "importStatus": "pending",  // Result of the import for the user
        "importError": "string",  // The error raised during the import, if set
        "relatedUserProfileId": "string",  // Related user profile id from the Life Events building block, if available
        "relatedUserId": "string",  // Related user id from the Messaging building block, if available
        "tags": ["string"],  // Tags related to the user
        "publicIdentityId": "string",  // PPSN of the imported user
        "firstName": "string",  // First name of the imported user
        "lastName": "string",  // Last name of the imported user
        "birthDate": "string",  // Birth date of the imported user
        "address": {
          "city": "string",
          "zipCode": "string",
          "street": "string",
          "country": "string",
          "region": "string"
        },
        "collectedConsent": false  // If false, an invitation to the user asking to accept to receive messages from the organisation will be sent
      }
    ],
    "importChannel": "api",  // Channel through which the users have been imported
    "retryCount": 0,
    "lastRetryAt": "2023-08-09T12:00:00Z",
    "importId": "string"
  },
  "metadata": {
    // Similar to other endpoints' metadata
  }
}
```

<div style="page-break-after: always;"></div>

#### Get User Import Template

Returns a string containing the template with the CSV that will be used to import users.

```
GET /api/v1/user-imports/template-download
```

Response (200 OK):
```
Content-Type: text/csv

// CSV content with header and one example line
```

<div style="page-break-after: always;"></div>

### Users

#### Get Users

Retrieves users based on the specified criteria.

```
GET /api/v1/users/
```

Query Parameters:
- `organisationId` (optional): If set, returns users who have an accepted relation with the organization ID
- `search` (optional): If set, searches for users who contain this value in either the name, surname, or email address
- `transports` (optional): If set, must contain a list of transports divided by ',' and searches for users who have selected at least one of them as preferred for the organization
- `importId` (optional): If set, returns users who have been imported by that specific batch
- `activeOnly` (optional): If true, returns active users only
- `offset` (optional, default: 0): Number of records to skip
- `limit` (optional, default: 20, max: 100): Maximum number of records to return

Response (200 OK):
```json
{
  "data": [
    {
      "organisationSettingId": "uuid",  // Unique id of the organisation setting
      "firstName": "string",  // First name of the user
      "lastName": "string",  // Last name of the user
      "birthDate": "string",  // Birth date of the user
      "lang": "string",  // Preferred language of the user
      "ppsn": "string",  // PPSN of the user
      "userId": "uuid",  // Unique id of the related user
      "userProfileId": "string",  // User profile id, if available
      "phoneNumber": "string",  // Phone number of the user
      "emailAddress": "string",  // Email address of the user
      "organisationId": "string",  // Unique id of the related organisation
      "organisationInvitationStatus": "pending",  // Current status of the invitation to the messaging building block
      "organisationInvitationSentAt": "string",  // Date and time when the organisation invitation was sent
      "organisationInvitationFeedbackAt": "string",  // Date and time when the user gave feedback to the organisation invitation
      "organisationPreferredTransports": ["sms", "email"],  // List of preferred transports to use
      "correlationQuality": "full",  // Quality of user correlation with Life Events platform
      "userStatus": "pending",  // Current status of the user
      "details": {
        "publicIdentityId": "string",  // PPSN of the imported user
        "firstName": "string",  // First name of the imported user
        "lastName": "string",  // Last name of the imported user
        "birthDate": "string",  // Birth date of the imported user
        "address": {
          "city": "string",
          "zipCode": "string",
          "street": "string",
          "country": "string",
          "region": "string"
        },
        "collectedConsent": false  // If false, an invitation will be sent to ask for permissions
      }
    }
  ],
  "metadata": {
    // Similar to GET /api/v1/messages/ metadata
  }
}
```

<div style="page-break-after: always;"></div>

#### Get User

Retrieves a specific user by ID.

```
GET /api/v1/users/{userId}
```

Path Parameters:
- `userId`: UUID of the user

Query Parameters:
- `activeOnly` (optional): If true, returns active users only

Response (200 OK):
```json
{
  "data": {
    // User details (structure same as in Get Users response)
  },
  "metadata": {
    // Similar to GET /api/v1/messages/ metadata
  }
}
```

<div style="page-break-after: always;"></div>

### Message Events

#### Get Message Events

Retrieves message events that match the requested query.

```
GET /api/v1/message-events/
```

Query Parameters:
- `search` (optional): Filters events for messages containing the set value in subject
- `offset` (optional, default: 0): Number of records to skip
- `limit` (optional, default: 20, max: 100): Maximum number of records to return

Response (200 OK):
```json
{
  "data": [
    {
      "eventId": "uuid",  // Unique id of the event
      "messageId": "uuid",  // Unique id of the related message
      "subject": "string",  // Subject of the related message
      "receiverFullName": "string",  // Full name of the recipient
      "eventType": "string",  // Event type description
      "eventStatus": "string",  // Status for event type
      "scheduledAt": "string"  // Date and time when the message is scheduled to be sent
    }
  ],
  "metadata": {
    // Similar to GET /api/v1/messages/ metadata
  }
}
```

<div style="page-break-after: always;"></div>

#### Get Message Event

Retrieves a specific message event by ID.

```
GET /api/v1/message-events/{eventId}
```

Path Parameters:
- `eventId`: UUID of the event

Response (200 OK):
```json
{
  "data": [
    {
      "eventType": "string",  // Event type description
      "eventStatus": "string",  // Status for event type
      "data": {
        // Event-specific data (structure varies based on event type)
      },
      "createdAt": "2023-08-09T12:00:00Z"  // Date and time when the event was recorded
    }
  ]
}
```

<div style="page-break-after: always;"></div>

### Jobs

#### Execute Job

Executes a specific job.

```
POST /api/v1/jobs/{id}
```

Path Parameters:
- `id`: ID of the job to execute

Request Body:
```json
{
  "token": "string"  // The security token used to ensure you are allowed to execute this job
}
```

Response (202 Accepted): No content

<div style="page-break-after: always;"></div>

## Error Responses

All endpoints may return the following error response structure for 4XX and 5XX status codes:

```json
{
  "code": "string",  // Code used to categorize the error
  "detail": "string",  // Description of the error
  "requestId": "string",  // Unique request id. This one will be used to troubleshoot the problems
  "name": "string",  // Name of the error type
  "validation": [
    {
      "fieldName": "string",  // Name of the field with validation error
      "message": "string"  // Validation error message
    }
  ],
  "validationContext": "string"  // Context of the validation error
}
```