import ds from "design-system/";
import { getTranslations } from "next-intl/server";

type IconProps = React.ComponentProps<typeof ds.Icon>;

type EptyStatusProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: IconProps["icon"];
};

export const EmptyStatus = async ({
  title,
  description,
  action,
  icon,
}: EptyStatusProps) => {
  const t = await getTranslations("EmptyStatus");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div>
        <ds.Icon
          icon={icon || "search"}
          color={ds.colours.ogcio.green}
          size={42}
        />
      </div>
      <h2 className="govie-heading-m">{title || t("title")}</h2>
      <p className="govie-body">{description || t("description")} </p>
      {action}
    </div>
  );
};
