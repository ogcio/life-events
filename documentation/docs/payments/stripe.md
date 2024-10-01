---
sidebar_position: 2
sidebar_label: Stripe Setup
---

# Stripe Setup
In order to use Stripe integration locally, you will need to fill these env variables:

```bash
STRIPE_SECRET_KEY=your_stripe_account_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_account_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_signing_key
```

1. Create a [Stripe account](https://dashboard.stripe.com/register)
2. Find your test keys in the [dashboard](https://dashboard.stripe.com/test/apikeys) and fill in these env variables:
3. Make sure your desired payment methods are enable in the [dashboard](https://dashboard.stripe.com/test/settings/payment_methods)

## Set up webhooks locally
Because Stripe can't reach your locally hosted API, you can't register your webhook callback into your Stripe account. In order to test the webhook integration and allow the system to update Stripe transactions' statuses, you either expose your local API to a public domain (by using ngrok or any other tool like that) or use the Stripe CLI client.

### Stripe CLI
Stripe CLI allows you to test different transaction scenarios from your terminal easily. It can also listen to events in your Stripe account and forward them to your locally hosted webhook callback.

- Install [Stripe CLI](https://docs.stripe.com/stripe-cli): `brew install stripe/stripe-cli/stripe`
- Log in to the CLI using your credentials or your API key.

Run `stripe login` and continue the login process in your browser (two-step verification might be required).

Or

Use the `--api-key` flag and use your API key in the login command
`stripe login --api-key sk_test_51OzFkUK1VL0xyyr2R2BgmPDDKJkE08SzaLfVndazsCmIGOjc69OZsm7pegOLj9jA2zpogLdgJNScFoAkXk2GLPr500MsTOnb5Z`

- Run `stripe listen` to start listening to the incoming events. To forward the incoming calls to your locally hosted API, you have to set the `--forward-to` flag and your local endpoint (without specifying the protocol): `stipre listen --forward-to localhost:8000/api/v1/YOUR_WEBHOOK`

## Testing Google Pay and PayPal locally
To use Google Pay or PayPal you need to register and verify an HTTPS domain, even for testing.

- Use [ngrok](https://ngrok.com/) or a similar tool get an HTTPS domain. If you're using ngrok you can follow [this guide](https://ngrok.com/docs/getting-started/) to create a static domain and a tunnel.
- Register your fixed domain on your Stripe [dashboard](https://dashboard.stripe.com/settings/payment_method_domains?enabled=true) as explained [here](https://docs.stripe.com/payments/payment-methods/pmd-registration?dashboard-or-api=dashboard#register-your-domain)
- Set the `HOST_URL` environment variable to your fixed domain, so you'll get redirected there after logging in
- Register a real, active card on Google Pay wallet. No amount will be charged when using the card in test environment.
- If you want to test the integration with life events change [this redirect](https://github.com/ogcio/life-events/blob/dev/apps/web/app/%5Blocale%5D/%5Bevent%5D/%5B...action%5D/RenewDriversLicence/PaymentPlaceholder.tsx#L5) to point to your fixed domain

## Testing Apple Pay locally
To use Apple Pay you need to register and verify an HTTPS domain, even for testing. 

- Use [ngrok](https://ngrok.com/) or a similar tool get an HTTPS domain. If you're using ngrok you can follow [this guide](https://ngrok.com/docs/getting-started/) to create a static domain and a tunnel.
- Register your fixed domain on your Stripe [dashboard](https://dashboard.stripe.com/settings/payment_method_domains?enabled=true) as explained [here](https://docs.stripe.com/payments/payment-methods/pmd-registration?dashboard-or-api=dashboard#register-your-domain)
- Follow [these steps](https://docs.stripe.com/payments/payment-methods/pmd-registration?dashboard-or-api=dashboard#verify-your-domain-with-apple-pay) to verify the domain with Apple Pay
- Set the `HOST_URL` environment variable to your fixed domain, so you'll get redirected there after logging in
- Register a real, active card on Apple Pay wallet. No amount will be charged when using the card in test environment.
- Use Safari browser when testing the integration
- If you want to test the integration with life events change [this redirect](https://github.com/ogcio/life-events/blob/dev/apps/web/app/%5Blocale%5D/%5Bevent%5D/%5B...action%5D/RenewDriversLicence/PaymentPlaceholder.tsx#L5) to point to your fixed domain
