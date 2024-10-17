import ds from "design-system";

type Props = {
  initials: string;
};

export default async ({ initials }: Props) => (
  <div
    style={{
      height: 30,
      width: 30,
      fontSize: "14px",
      fontWeight: 600,
      background: ds.colours.ogcio.white,
      borderRadius: "100%",
      color: ds.colours.ogcio.darkGreen,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {initials}
  </div>
);
