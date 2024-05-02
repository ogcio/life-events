---
sidebar_position: 1
sidebar_label: Realex Setup
---

# Realex Setup
In order to use Realex integration locally, you will need to fill these env variables in the .env file for payments app (used for seeding the Realex provider):

```bash
REALEX_MERCHANT_ID=your_realex_merchant_id
REALEX_SHARED_SECRET=your_realex_shared_secret
```

And these env variables in the .env file for payments-api app:

```bash
REALEX_PAYMENT_ACCOUNT=internet
REALEX_PAYMENT_URL="https://pay.sandbox.realexpayments.com/pay"
PAYMENTS_HOST_URL=http://localhost:3001
```

Test credentials can be found in the [dashboard](https://developer.globalpay.com/).

## Testing the integration locally
For the whole flow to work the endpoint called by Realex upon payment completion needs to be publicly available. If you don't follow these steps the integration will work only partially when testing it locally. It will be possible to initiate a payment and simulate a transaction but the HPP will fail to redirect the user to our application.

- Use [ngrok](https://ngrok.com/) or a similar tool get an HTTPS domain. If you're using ngrok you can follow [this guide](https://ngrok.com/docs/getting-started/) to create a static domain and a tunnel.
- Register your fixed domain 
- Set the `BACKEND_URL` environment variable in payments app to your fixed domain, so Realex will be able to reach the endpoint it has to call
- Remember to start the agent with your fixed domain before testing. If you're using ngrok you can run the following command
```bash
ngrok http 8001 --domain your-registered-domain
```

## Completed payments
Transactions on Realex side are available at [this dashboard](https://realcontrol.sandbox.realexpayments.com/) for sandbox environment and at [this dashboard](https://realcontrol.realexpayments.com/) for production environment.

## Test cards
Transactions can be simulated against Realex sandbox environment using the test cards listed [here](https://developer.globalpay.com/resources/test-card-numbers).
