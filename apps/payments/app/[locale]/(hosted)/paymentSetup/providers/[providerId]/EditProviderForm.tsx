"use client";
import type { Provider } from "../types";
import { createElement, type PropsWithChildren } from "react";
import { useTranslations } from "next-intl";
import { useFormState } from "react-dom";

type Props = {
  provider: Provider;
  action: (
    prevState: FormData,
    formData: FormData,
  ) => Promise<{
    errors: {
      [key: string]: string;
    };
  }>;
  formComponent: (state: any) => JSX.Element;
  defaultState?: any;
};

export default ({
  provider,
  action,
  formComponent,
  defaultState,
  children,
}: PropsWithChildren<Props>) => {
  const t = useTranslations("Providers.edit");
  const [state, serverAction] = useFormState(action, {
    defaultState,
    errors: {},
  });

  return (
    <form action={serverAction}>
      {children}
      {createElement(formComponent, { state })}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          paddingTop: ".5rem",
        }}
      >
        <button
          type="submit"
          name="action"
          value="update"
          data-module="govie-button"
          className="govie-button"
        >
          {t("save")}
        </button>
        {provider.status === "connected" && (
          <button
            type="submit"
            name="action"
            value="disable"
            data-module="govie-button"
            className="govie-button govie-button--tertiary"
          >
            {t("disable")}
          </button>
        )}
        {provider.status === "disconnected" && (
          <button
            type="submit"
            name="action"
            value="enable"
            data-module="govie-button"
            className="govie-button govie-button--secondary"
          >
            {t("enable")}
          </button>
        )}
      </div>
    </form>
  );
};
