import ds from "design-system";
import { getTranslations } from "next-intl/server";
import "./ProfileForm.css";
import UserDetails from "./UserDetails";

export default async () => {
  const t = await getTranslations("AboutMe");
  return (
    <div>
      <h1 className="govie-heading-l">{t("title")}</h1>
      <p
        className="govie-body"
        style={{ display: "flex", alignItems: " center" }}
      >
        <span style={{ marginRight: "10px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25">
            <path
              d="M12.5 0C19.402 0 25 5.598 25 12.5S19.402 25 12.5 25 0 19.402 0 12.5 5.598 0 12.5 0Zm0 0"
              fill="#0b0c0c"
            />
            <path
              d="M12.875 16.887h-.75l-.578-10.461h1.906Zm-1.18 4.543v-1.614h1.61v1.614Zm0 0"
              fill="#fff"
            />
          </svg>{" "}
        </span>
        <strong>
          Fields labelled with a{" "}
          <span style={{ color: ds.colours.ogcio.red }}>*</span> are editable.
          All others are view only.
        </strong>
      </p>
      <UserDetails />
    </div>
  );
};
