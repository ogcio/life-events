import sgMail from "@sendgrid/mail";
import { SendEmail } from "../../types";

export const send: SendEmail = (data) => {
  if (typeof process.env.SENDGRID_API_KEY === "undefined") {
    return console.log(
      "Warning - SENDGRID_API_KEY env variable missing. Printing request: ",
      data,
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
