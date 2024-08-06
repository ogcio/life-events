import { getTranslations } from "next-intl/server";
import ds from "design-system/";
import { ComponentProps } from "react";

import "./dashboard.css";

type Props = {
  locale: string;
  userRoles: string[];
};

const services: {
  url: string;
  labelKey: "forms" | "payments" | "messaging" | "lifeEvents" | "designSystem";
  icon: ComponentProps<typeof ds.Icon>["icon"];
  role: string;
}[] = [
  {
    url: process.env.NEXT_PUBLIC_FORMS_SERVICE_ENTRY_POINT ?? "#",
    labelKey: "forms",
    icon: "tiles",
    role: "*",
  },
  {
    url: process.env.NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT ?? "#",
    labelKey: "payments",
    icon: "payments-service",
    role: "Payments Public Servant",
  },
  {
    url: process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT ?? "#",
    labelKey: "messaging",
    icon: "messaging-service",
    role: "Messaging Public Servant",
  },
  {
    url: process.env.NEXT_PUBLIC_DESIGN_SYSTEM_SERVICE_ENTRY_POINT ?? "#",
    labelKey: "designSystem",
    icon: "tiles",
    role: "*",
  },
  {
    url: process.env.NEXT_PUBLIC_LIFE_EVENTS_SERVICE_ENTRY_POINT ?? "#",
    labelKey: "lifeEvents",
    icon: "events",
    role: "Life Events Public Servant",
  },
];

type TileProps = {
  url: string;
  label: string;
  icon: ComponentProps<typeof ds.Icon>["icon"];
};

const Tile = ({ url, label, icon }: TileProps) => {
  const tintGold = ds.hexToRgba(ds.colours.ogcio.gold, 15);

  return (
    <a href={url} className="tile" style={{ backgroundColor: tintGold }}>
      <ds.Icon icon={icon} color={ds.colours.ogcio.green} size={42} />
      <p
        className="govie-heading-s"
        style={{
          marginBottom: 0,
          marginTop: "10px",
          textAlign: "center",
          fontWeight: "400",
        }}
      >
        {label}
      </p>
    </a>
  );
};

export default async function ({ locale, userRoles }: Props) {
  const t = await getTranslations("Dashboard");

  const availableServices = services.filter((service) => {
    return (
      service.url !== "#" &&
      (userRoles.includes(service.role) || service.role === "*")
    );
  });

  return (
    <>
      <div className="govie-width-container" style={{ width: "100%" }}>
        <h1 className="govie-heading-l">{t("title")}</h1>
        <p className="govie-body">{t("description")}</p>
        <div className="govie-body tilesLabel">{t("tilesLabel")}</div>
        <div
          className="tilesContainer"
          style={{ backgroundColor: ds.colours.ogcio.white }}
        >
          {availableServices.map(({ url, labelKey, icon }, index) => (
            <Tile
              key={index}
              url={url}
              label={t(`services.${labelKey}`)}
              icon={icon}
            />
          ))}
        </div>
      </div>
    </>
  );
}
