import http from "k6/http";
import { sleep } from "k6";

import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

const logtoAPIUrl = "https://authorization.dev.blocks.gov.ie/";
//const logtoAPIUrl = "http://host.docker.internal:3301/";
const baseAPIUrl = "https://messaging-api.dev.blocks.gov.ie/";
//const baseAPIUrl = "http://host.docker.internal:8002/";

export const options = {
  // A number specifying the number of VUs to run concurrently.
  vus: 10,
  // A string specifying the total duration of the test run.
  duration: "30s",
};

export function setup() {
  let payload = JSON.stringify({
    grant_type: "client_credentials",
    scope: "all",
    resource: "https://default.logto.app/api",
  });

  let params = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Bearer {{process.env.BRUNO_CITIZEN_BASIC_M2M_TOKEN}}",
    },
  };

  let res = http.post(logtoAPIUrl + "api/subject-tokens", payload, params);

  const managementAccessToken = res.body.access_token;

  payload = JSON.stringify({
    grant_type: "client_credentials",
    scope:
      "profile:user:read messaging:provider:* messaging:event:read messaging:citizen:* messaging:template:*",
    organization_id: "first-testing",
    userId: "{{process.env.CITIZEN_USER_PROFILE_ID}}",
  });

  params = {
    auth: "bearer { token: " + managementAccessToken + " }",
  };

  res = http.post(logtoAPIUrl + "api/subject-tokens", payload, params);

  const subjectToken = res.body.subjectToken;

  payload = JSON.stringify({
    grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
    scope:
      "messaging:message.self:read messaging:citizen.self:read messaging:citizen.self:write",
    resource: "{{process.env.MESSAGING_API_RESOURCE_INDICATOR}}",
    client_id: "{{process.env.BRUNO_MESSAGING_APP_ID}}",
    subject_token: subjectToken,
    subject_token_type: "urn:ietf:params:oauth:token-type:access_token",
  });

  params = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Bearer {{process.env.BRUNO_BASIC_MESSAGING_APP_TOKEN}}",
    },
  };

  res = http.post(logtoAPIUrl + "oidc/token", payload, params);

  return { accessToken: res.body.access_token };
}

export default function (accessToken) {
  const params = {
    auth: "bearer { token: " + accessToken + " }",
  };

  http.get(
    baseAPIUrl + "api/v1/messages?recipientUserId=e2e-user-1&status=delivered",
    params,
  );
  sleep(1);
}

export function handleSummary(data) {
  return {
    "LoadTestReport.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
