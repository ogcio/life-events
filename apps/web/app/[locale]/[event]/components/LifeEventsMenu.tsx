import Link from "next/link";
import ds from "design-system";
import Timeline from "./Timeline";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { isFeatureFlagEnabled } from "feature-flags/utils";

const Icon = ds.Icon;

type Props = {
  options: {
    key: string;
    url: string;
    icon: string;
    label: string;
  }[];
  selected: string;
  userName: string;
  ppsn: string;
  locale: string;
};

export default async (props: Props) => {
  const tintGold = ds.hexToRgba(ds.colours.ogcio.gold, 15);

  const messages = await getMessages({ locale: props.locale });
  const timelineMessages = messages.Timeline as AbstractIntlMessages;

  const showEventsMenu = await isFeatureFlagEnabled("eventsMenu");

  return (
    <ol
      className="govie-list govie-list--spaced"
      style={{
        width: "200px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <li
        key="userinfo"
        style={{
          background: tintGold,
          display: "flex",
          alignItems: "center",
          paddingLeft: "12px",
          height: "65px",
        }}
      >
        <label className="govie-label--s govie-!-font-size-16">
          {props.userName}
        </label>
      </li>
      {showEventsMenu ? (
        <>
          {props.options.map((option) => (
            <li key={`lem_${option.url}`} tabIndex={0}>
              <Link
                className="govie-button govie-button--icon govie-button--flat govie-button--icon govie-!-font-size-16"
                href={`${option.url}`}
                style={{
                  margin: "unset",
                  paddingLeft: "12px",
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-start",
                  background: props.selected === option.key ? tintGold : "",
                }}
              >
                <Icon
                  // make option typeof the icons
                  icon={option.icon as any}
                  className="govie-button__icon-left"
                  color={ds.colours.ogcio.darkGreen}
                />
                {option.label}
              </Link>
            </li>
          ))}
        </>
      ) : (
        <NextIntlClientProvider messages={timelineMessages}>
          <Timeline />
        </NextIntlClientProvider>
      )}
    </ol>
  );
};
