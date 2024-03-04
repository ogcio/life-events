import 'server-only'
import * as tlSigning from "truelayer-signing";
import { randomUUID } from "node:crypto";

let authToken: { expires_at: number; access_token: string };

const CERTIFICATE_ID = process.env.TL_CERTIFICATE_ID ?? "";
const PRIVATE_KEY = process.env.TL_PRIVATE_KEY ?? "";

async function fetchNewAccessToken() {
  const res = await fetch(`${process.env.TL_AUTH_SERVER_URI}/connect/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.TL_CLIENT_ID ?? "",
      client_secret: process.env.TL_CLIENT_SECRET ?? "",
      grant_type: "client_credentials",
      scope: "payments",
    }),
  });

  return res.json();
}

export async function getAccessToken() {
  if (!authToken || authToken.expires_at < Date.now()) {
    const newToken = await fetchNewAccessToken();

    authToken = {
      access_token: newToken.access_token,
      expires_at: Date.now() + newToken.expires_in * 1000,
    };
  }

  return authToken.access_token;
}

export async function createPaymentRequest(paymentRequest) {
  const body = JSON.stringify({
    amount_in_minor: paymentRequest.amount,
    currency: "GBP",
    payment_method: {
      provider_selection: {
        type: "user_selected",
      },
      type: "bank_transfer",
      beneficiary: {
        type: "external_account",
        account_holder_name: paymentRequest.provider_data.accountHolderName,
        reference: paymentRequest.reference,
        account_identifier: {
          type: "sort_code_account_number",
          sort_code: paymentRequest.provider_data.sortCode.replace(/-/g, ""),
          account_number: paymentRequest.provider_data.accountNumber,
        },
      },
    },
    user: {
      name: paymentRequest.user_name,
      email: paymentRequest.govid_email,
    },
  });

  const idempotencyKey = randomUUID();

  const signature = tlSigning.sign({
    kid: CERTIFICATE_ID,
    privateKeyPem: PRIVATE_KEY,
    // @ts-expect-error unable to use the correct ENUM due to TSconfig
    method: 'POST',
    path: "/v3/payments",
    body,
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
  });

  const url = `${process.env.TL_ENVIRONMENT_URI}/v3/payments`

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await getAccessToken()}`,
      "Idempotency-Key": idempotencyKey,
      "Tl-Signature": signature,
      "Content-Type": "application/json",
    },
    body,
  });

  if (!res.ok) {
    console.error('Error creating payment request', await res.text())
    return
  }

  const json = await res.json();

  return json;
}
