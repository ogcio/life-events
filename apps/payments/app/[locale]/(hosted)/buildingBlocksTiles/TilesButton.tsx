"use client";
import { useState, useEffect } from "react";
import ds from "design-system/";
import { ComponentProps } from "react";
import { useTranslations } from "next-intl";

const buildingBlocksMainLandingPage = "https://www.google.com";
const services: TileProps[] = [
  {
    url: process.env.NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT as string,
    label: "payments",
    icon: "payments-service",
  },
  {
    url: process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT as string,
    label: "messaging",
    icon: "messaging-service",
  },
  {
    url: process.env.NEXT_PUBLIC_LIFE_EVENTS_SERVICE_ENTRY_POINT as string,
    label: "lifeEvents",
    icon: "events",
  },
];

type TileProps = {
  url: string;
  label: string;
  icon: ComponentProps<typeof ds.Icon>["icon"];
};
const Tile = ({ url, label, icon }: TileProps) => {
  const tintGold = ds.hexToRgba(ds.colours.ogcio.gold, 15);
  const t = useTranslations();

  return (
    <a
      href={url}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        backgroundColor: tintGold,
      }}
    >
      <ds.Icon icon={icon} color={ds.colours.ogcio.green} size={42} />
      <p
        className="govie-heading-s"
        style={{ marginBottom: 0, marginTop: "10px" }}
      >
        {t(label)}
      </p>
    </a>
  );
};

export default function () {
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
      <a href={buildingBlocksMainLandingPage}>
        <ds.Icon icon="tiles" color={ds.colours.ogcio.white} size={22} />
      </a>
    );

  return (
    <>
      <a
        onClick={handleTilesClick}
        style={{
          cursor: "pointer",
        }}
      >
        <ds.Icon icon="tiles" color={ds.colours.ogcio.white} size={22} />
      </a>

      {isTilesBarOpen && (
        <>
          <div
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              width: "100%",
              top: "70px",
              zIndex: 100,
              display: "flex",
              gap: "20px",
              padding: "20px",
              backgroundColor: ds.colours.ogcio.white,
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
            }}
          >
            {services.map(({ url, label, icon }, index) => (
              <Tile key={index} url={url} label={label} icon={icon} />
            ))}
          </div>
          <div
            style={{
              position: "fixed",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              width: "100%",
              height: "100%",
            }}
            id="backdrop"
            onClick={closeTilesBar}
          />
        </>
      )}
    </>
  );
}
