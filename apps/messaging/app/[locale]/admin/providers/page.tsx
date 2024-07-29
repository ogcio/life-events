import { CSSProperties } from "react";
import FlexMenuWrapper from "../PageWithMenuFlexWrapper";
import ds from "design-system";
import Link from "next/link";
import { providerRoutes } from "../../../utils/routes";
import SmsProviders from "./SmsProviders";
import { redirect } from "next/navigation";
import ConfirmDeleteModal from "../ConfirmDeleteModal";

import EmailProviders from "./EmailProviders";
import { getTranslations } from "next-intl/server";
import {
  searchKeyProvider,
  searchValueEmail,
  searchValueSms,
} from "../../../utils/messaging";
import { AuthenticationFactory } from "../../../utils/authentication-factory";

export const linkStyle = (selected: boolean): CSSProperties => {
  const props: CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "4px 4px 0 0",
    padding: "10px 20px 10px 20px",
    background: selected ? "transparent" : ds.colours.ogcio.lightGrey,
  };
  if (selected) {
    props.border = `1px solid ${ds.colours.ogcio.midGrey}`;
    props.borderStyle = "solid solid none solid";
  }

  return props;
};

export const linkClassName = (selected: boolean): string =>
  `govie-link govie-!-font-size-19 govie-link--no-visited-state ${
    selected ? "govie-link--no-underline" : ""
  }`.trim();

export default async (props: {
  params: { locale: string };
  searchParams?: { provider?: string; deleteId?: string };
}) => {
  const t = await getTranslations("settings.Page");
  const provider = props.searchParams?.provider;
  const isEmail = provider === searchValueEmail || !provider;
  const isSms = provider === searchValueSms;

  async function handleAddProvider(formData: FormData) {
    "use server";
    const provider = formData.get("provider")?.toString();

    switch (provider) {
      case "email": {
        const url = new URL(
          `${props.params.locale}/${providerRoutes.url}/email`,
          process.env.HOST_URL,
        );
        redirect(url.href);
      }
      case "sms": {
        const url = new URL(
          `${props.params.locale}/${providerRoutes.url}/sms`,
          process.env.HOST_URL,
        );
        redirect(url.href);
      }
      default:
        break;
    }
  }

  let toDelete: string | undefined;
  if (props.searchParams?.deleteId) {
    const client = await AuthenticationFactory.getMessagingClient();

    if (props.searchParams.provider === searchValueSms) {
      const { data } = await client.getSmsProvider(
        props.searchParams?.deleteId,
      );
      toDelete = data?.providerName;
    } else {
      // make more dynamic if we need to
      const { data } = await client.getEmailProvider(
        props.searchParams?.deleteId,
      );
      toDelete = data?.providerName;
    }
  }

  async function handleCancelDelete() {
    "use server";
    const url = new URL(
      `${props.params.locale}/${providerRoutes.url}`,
      process.env.HOST_URL,
    );
    url.searchParams.append(
      searchKeyProvider,
      isEmail ? searchValueEmail : isSms ? searchValueSms : "",
    );
    redirect(url.href);
  }

  async function handleDeleteProvider(formData: FormData) {
    "use server";

    const client = await AuthenticationFactory.getMessagingClient();

    if (!props.searchParams?.deleteId) {
      return;
    }
    let error:
      | Awaited<ReturnType<typeof client.deleteSmsProvider>>["error"]
      | undefined;

    let providerSearchValue = "";
    if (props.searchParams?.provider === searchValueSms) {
      const { error: err } = await client.deleteSmsProvider(
        props.searchParams?.deleteId,
      );
      error = err;
      providerSearchValue = searchValueSms;
    } else {
      // make more dynamic if we need to
      providerSearchValue = searchValueEmail;
      const { error: err } = await client.deleteEmailProvider(
        props.searchParams?.deleteId,
      );
      error = err;
    }

    if (error) {
      console.log(error);
      return;
    }

    const url = new URL(
      `${props.params.locale}/${providerRoutes.url}`,
      process.env.HOST_URL,
    );
    url.searchParams.append("provider", providerSearchValue);
    redirect(url.href);
  }

  return (
    <FlexMenuWrapper>
      {toDelete && props.searchParams?.deleteId && (
        <ConfirmDeleteModal
          resourceDescription="the provider"
          id={props.searchParams.deleteId}
          onCancelAction={handleCancelDelete}
          onDeleteAction={handleDeleteProvider}
          toDelete={toDelete}
        />
      )}
      <h1>
        <span style={{ margin: "unset" }} className="govie-heading-xl">
          {t("header")}
        </span>
      </h1>
      <form action={handleAddProvider}>
        <input
          type="hidden"
          name="provider"
          value={isEmail ? searchValueEmail : isSms ? searchValueSms : ""}
        />
        <button className="govie-button">{t("addProvider")}</button>
      </form>
      <nav style={{ display: "flex", width: "fit-content", gap: "15px" }}>
        <div style={linkStyle(isEmail)}>
          <Link
            href={(() => {
              const url = new URL(
                `${props.params.locale}/${providerRoutes.url}`,
                process.env.HOST_URL,
              );
              url.searchParams.append(searchKeyProvider, searchValueEmail);
              return url.href;
            })()}
            className={linkClassName(isEmail)}
          >
            {t("emailsLink")}
          </Link>
        </div>
        <div style={linkStyle(isSms)}>
          <Link
            href={(() => {
              const url = new URL(
                `${props.params.locale}/${providerRoutes.url}`,
                process.env.HOST_URL,
              );
              url.searchParams.append(searchKeyProvider, searchValueSms);
              return url.href;
            })()}
            className={linkClassName(isSms)}
          >
            {t("smsLink")}
          </Link>
        </div>
      </nav>
      <div>
        {isEmail && <EmailProviders />}
        {isSms && <SmsProviders />}
      </div>
    </FlexMenuWrapper>
  );
};
