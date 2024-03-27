import sgMail from "@sendgrid/mail";
import { SendEmail } from "../../types";

export const send: SendEmail = async (data) => {
  if (typeof process.env.SENDGRID_API_KEY === "undefined") {
    throw new Error(
      `Warning - SENDGRID_API_KEY env variable missing. Printing request: ${JSON.stringify(
        data,
        null,
        4,
      )}`,
    );
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
