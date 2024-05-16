"use client";
import { useState, useEffect } from "react";
import ds from "design-system/";
import { ComponentProps } from "react";
import { useTranslations } from "next-intl";

import styles from "./Tiles.module.scss";

const buildingBlocksMainLandingPage =
  (process.env.NEXT_PUBLIC_BUILDING_BLOCKS_LANDING_PAGE as string) ?? "#";
const services: TileProps[] = [
  {
    url: process.env.NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT ?? "#",
    label: "payments",
    icon: "payments-service",
  },
  {
    url: process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT ?? "#",
    label: "messaging",
    icon: "messaging-service",
  },
  {
    url: process.env.NEXT_PUBLIC_LIFE_EVENTS_SERVICE_ENTRY_POINT ?? "#",
    label: "lifeEvents",
    icon: "events",
  },
];

const availableServices = services.filter((service) => service.url !== "#");

type TileProps = {
  url: string;
  label: string;
  icon: ComponentProps<typeof ds.Icon>["icon"];
};
const Tile = ({ url, label, icon }: TileProps) => {
  const tintGold = ds.hexToRgba(ds.colours.ogcio.gold, 15);
  const t = useTranslations();

  return (
    <a href={url} className={styles.tile} style={{ backgroundColor: tintGold }}>
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
          position: "relative",
          display: "inline-block",
        }}
      >
        <ds.Icon icon="tiles" color={ds.colours.ogcio.white} size={22} />
        {/* White triangle to show on the bottom of the button */}
        {isTilesBarOpen && <div className={styles.triangle}></div>}
      </a>

      {isTilesBarOpen && (
        <>
          <div
            className={styles.tilesContainer}
            style={{ backgroundColor: ds.colours.ogcio.white }}
          >
            {availableServices.map(({ url, label, icon }, index) => (
              <Tile key={index} url={url} label={label} icon={icon} />
            ))}
          </div>
          <div
            className={styles.backdrop}
            id="backdrop"
            onClick={closeTilesBar}
          />
        </>
      )}
    </>
  );
}
