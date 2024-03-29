---
sidebar_position: 1
sidebar_label: TrueLayer Setup
---

# TrueLayer Setup

TrueLayer is a leading European open banking payments network that leverages open banking technology to connect banks, people, and businesses with big aspirations, both in Europe and the United Kingdom.

It simplifies payments through its products, allowing for the acceptance and sending of instant bank payments on any app or website. TrueLayer provides a suite of integration tools designed for rapid development, including embedded payment interfaces, plugins for online stores, mobile SDKs, and backend libraries for various programming languages.

Visit the [documentation](https://docs.truelayer.com/docs/welcome) for more info.

---

In order to use the True Layer integration locally, you will need to fill these env variables:

```bash
TL_CLIENT_ID=your_client_id
TL_CLIENT_SECRET=your_client_secret
TL_CERTIFICATE_ID=your_certificate_id
TL_PRIVATE_KEY=your_private_key_with_line_breaks_joined_by_'\n'
```

1. Follow the instructions to setup a console account and create an app [here](https://docs.truelayer.com/docs/quickstart-create-a-console-account)
2. You should now have your `client_id` and `client_secret` values. Copy them in the `TL_CLIENT_ID` and `TL_CLIENT_SECRET` env variables
3. Then follow [these steps](https://docs.truelayer.com/docs/quickstart-make-a-payment#generate-keys) to generate your public and private keys
4. Upload your public key to the True Layer Console and create a Merchant account by following [this guide](https://docs.truelayer.com/docs/quickstart-make-a-payment#upload-your-public-key-to-console-and-create-a-merchant-account)
5. In the Settings > App Settings > Allowed redirect URIs, add our redirect URI to the True layer console - `http://localhost:3001/en/paymentRequest/complete`
6. Follow [these steps](https://docs.truelayer.com/docs/quickstart-make-a-payment#format-your-private-key) to format your private key so it can be used within an environment variable. Copy the formatted key in the `TL_PRIVATE_KEY` environment variable
7. You can get the value for the `TL_CERTIFICATE_ID` variable under Payments > Settings > Signing keys. Copy the `KID` fied of your signing key and paste it in your .env file.
