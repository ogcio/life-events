---
sidebar_position: 1
sidebar_label: Stripe Setup
---

# Stripe Setup
In order to use Stripe integration locally, you will need to fill these env variables:

```bash
STRIPE_SECRET_KEY=your_stripe_account_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_account_publishable_key
```

1. Create a [Stripe account](https://dashboard.stripe.com/register)
2. Find your test keys in the [dashboard](https://dashboard.stripe.com/test/apikeys) and fill in these env variables:
3. Make sure your desired payment methods are enable in the [dashboard](https://dashboard.stripe.com/test/settings/payment_methods)


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
