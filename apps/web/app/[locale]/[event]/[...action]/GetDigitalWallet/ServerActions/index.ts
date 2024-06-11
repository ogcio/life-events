"use server";
import nodemailer from "nodemailer";
import { getTranslations } from "next-intl/server";
import { get } from "http";

const buildTransport = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

// currently unused
export const sendConfirmationEmail = async (
  email: string,
  firstName: string,
  lastName: string,
) => {
  const transport = buildTransport();
  const t = await getTranslations("GetDigitalWallet.emails.needToBeVerified");

  const title = `${t("title")} ${firstName} ${lastName},`;
  const paragraphs = await getTranslations(
    "GetDigitalWallet.emails.needToBeVerified.paragraphs",
  );

  await transport.sendMail({
    to: email,
    subject: t("subject"),
    html: `
        <p>${title}</p>
        <p>${paragraphs("p1")}</p>
        <p>${paragraphs("p2")}</p>
        <p>${paragraphs.rich("p3", { link: (chunks) => `<a href="#">${chunks}</a>` })}</p>
        <p>${paragraphs("p4")}</p>
        <p>${paragraphs("p5")}</p>
        <p>${paragraphs("p6")}</p>
    `,
  });
};

export const sendEmailConfirmationCompleteEmail = async (
  email: string,
  firstName: string,
  lastName: string,
) => {
  const transport = buildTransport();
  const t = await getTranslations(
    "GetDigitalWallet.emails.verificationComplete",
  );

  const title = `${t("title")} ${firstName} ${lastName},`;
  const paragraphs = await getTranslations(
    "GetDigitalWallet.emails.verificationComplete.paragraphs",
  );

  await transport.sendMail({
    to: email,
    subject: t("subject"),
    html: `
        <p>${title}</p>
        <p>${paragraphs("p1")}</p>
        <p>${paragraphs("p2")}</p>
    `,
  });
};

export const sendGovAddressConfirmationEmail = async (
  email: string,
  firstName: string,
  lastName: string,
  verifyUrl: string,
) => {
  const transport = buildTransport();
  const t = await getTranslations(
    "GetDigitalWallet.emails.verifyGovEmailAddress",
  );

  const title = `${t("title")} ${firstName} ${lastName},`;
  const paragraphs = await getTranslations(
    "GetDigitalWallet.emails.verifyGovEmailAddress.paragraphs",
  );

  await transport.sendMail({
    to: email,
    subject: t("subject"),
    html: `
        <p>${title}</p>
        <p>${paragraphs("p1")}</p>
        <p>${paragraphs.rich("p2", { link: (chunks) => `<a href="${verifyUrl}">${chunks}</a>` })}</p>
        <p>${paragraphs("p3")}</p>
        <p>${paragraphs("p4")}</p>
    `,
  });
};

export const sendAppOnboardingEmail = async (
  email: string,
  firstName: string,
  lastName: string,
  deviceType: "ios" | "android",
) => {
  const transport = buildTransport();
  const t = await getTranslations("GetDigitalWallet.emails.AppOnboardingEmail");

  const title = `${t("title")} ${firstName} ${lastName},`;
  const paragraphs = await getTranslations(
    "GetDigitalWallet.emails.AppOnboardingEmail.paragraphs",
  );

  const deviceParagraphs = await getTranslations(
    `GetDigitalWallet.emails.AppOnboardingEmail.paragraphs.${deviceType}`,
  );
  if (deviceType === "ios") {
    await transport.sendMail({
      to: email,
      subject: t("subject"),
      html: `
        <p>${title}</p>
        <p>${paragraphs("p1")}</p>
        <p>${paragraphs.rich("p2", { important: (chunk) => `<strong>${chunk}</strong>` })}</p>
        <p>${deviceParagraphs("p1")}</p>
        <p>${deviceParagraphs("p2")}</p>
        <p>${deviceParagraphs("p3")}</p>
        <p>${deviceParagraphs("p4")}</p>
        <p>${deviceParagraphs("p5")}</p>
        <p>${deviceParagraphs("p6")}</p>
    `,
    });
  } else {
    // <p>${paragraphs.rich("p2", { strong: (chunk) => `<strong>${chunk}</strong>` })}</p>
    await transport.sendMail({
      to: email,
      subject: t("subject"),
      html: `
        <p>${title}</p>
        <p>${paragraphs("p1")}</p>
        <p>${paragraphs.rich("p2", { important: (chunk) => `<strong>${chunk}</strong>` })}</p>
        <p>${deviceParagraphs("p1")}</p>
        <p>${deviceParagraphs.rich("p2", { important: (chunk) => `<strong>${chunk}</strong>` })}</p>
        <p>${deviceParagraphs.rich("p3", { link: (chunk) => `<a href="https://play.google.com/store/apps/details?id=com.ogcio.digitalwallet">${chunk}</a>` })}</p>
        <p>${deviceParagraphs("p4")}</p>
        <p>${deviceParagraphs("p5")}</p>
        <p>${deviceParagraphs("p6")}</p>
        <p>${deviceParagraphs("p7")}</p>
    `,
    });
  }
};
