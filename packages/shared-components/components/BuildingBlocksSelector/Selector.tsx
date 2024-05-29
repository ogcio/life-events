"use client";
import React, { useState, useEffect } from "react";
import ds from "design-system/";
import { ComponentProps } from "react";

import "./selector.css";

const buildingBlocksMainLandingPage =
  (process.env.NEXT_PUBLIC_BUILDING_BLOCKS_LANDING_PAGE as string) ?? "#";
const services: {
  url: string;
  labelKey: "payments" | "messaging" | "lifeEvents";
  icon: ComponentProps<typeof ds.Icon>["icon"];
}[] = [
  {
    url: process.env.NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT ?? "#",
    labelKey: "payments",
    icon: "payments-service",
  },
  {
    url: process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT ?? "#",
    labelKey: "messaging",
    icon: "messaging-service",
  },
  {
    url: process.env.NEXT_PUBLIC_LIFE_EVENTS_SERVICE_ENTRY_POINT ?? "#",
    labelKey: "lifeEvents",
    icon: "events",
  },
];

const translations = {
  en: {
    payments: "Payments",
    messaging: "Messaging",
    lifeEvents: "Life Events",
  },
  ga: {
    payments: "Payments",
    messaging: "Messaging",
    lifeEvents: "Life Events",
  },
};

const availableServices = services.filter((service) => service.url !== "#");

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

export default function ({ locale }: { locale: "en" | "ga" }) {
  const [isJsEnabled, setIsJsEnabled] = useState(false);
  const [isTilesBarOpen, setIsTilesBarOpen] = useState(false);
  const handleTilesClick = () => setIsTilesBarOpen((status) => !status);
  const closeTilesBar = () => setIsTilesBarOpen(false);

  useEffect(() => {
    setIsJsEnabled(true);
  }, []);

  // In case JS is not enabled, the tiles are just a link to the main building blocks landing page
  if (!isJsEnabled)
    return (
      <a href={buildingBlocksMainLandingPage} className="tileIcon">
        <ds.Icon icon="tiles" color={ds.colours.ogcio.white} size={22} />
      </a>
    );

  return (
    <>
      <a className="tileIcon" onClick={handleTilesClick}>
        <ds.Icon icon="tiles" color={ds.colours.ogcio.white} size={22} />
      </a>

      {isTilesBarOpen && (
        <>
          <div
            className="tilesContainer"
            style={{ backgroundColor: ds.colours.ogcio.white }}
          >
            {availableServices.map(({ url, labelKey, icon }, index) => (
              <Tile
                key={index}
                url={url}
                label={translations[locale][labelKey]}
                icon={icon}
              />
            ))}
          </div>
          <div className="backdrop" id="backdrop" onClick={closeTilesBar} />
        </>
      )}
    </>
  );
}
