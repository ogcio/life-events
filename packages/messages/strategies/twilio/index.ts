import sgMail from "@sendgrid/mail";
import { SendEmail } from "../../types";

if (typeof process.env.SENDGRID_API_KEY === "undefined")
  throw new Error("SENDGRID_API_KEY env variable cannot be undefined");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const send: SendEmail = (data) => {
  return sgMail.send({
    ...data,
    mailSettings: {
      // Using sandbox mode during development
      sandboxMode: {
        enable: true,
      },
    },
  });
};
