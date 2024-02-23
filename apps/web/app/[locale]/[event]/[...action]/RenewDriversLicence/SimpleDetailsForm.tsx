import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";
import { pgpool } from "../../../../sessions";
import {
  emptyRenewDriversLicenceFlow,
  RenewDriversLicenceFlow,
} from "../types";

export default (
  props: Pick<
    RenewDriversLicenceFlow,
    | "dayOfBirth"
    | "monthOfBirth"
    | "yearOfBirth"
    | "email"
    | "mobile"
    | "sex"
    | "userName"
  > & { userId: string; urlBase: string }
) => {
  const t = useTranslations("CheckYourDetailsForm");

  async function submitAction(event: FormData) {
    "use server";

    const data: Pick<
      RenewDriversLicenceFlow,
      | "dayOfBirth"
      | "monthOfBirth"
      | "yearOfBirth"
      | "email"
      | "mobile"
      | "sex"
      | "userName"
    > = {
      dayOfBirth: "",
      email: "",
      mobile: "",
      monthOfBirth: "",
      sex: "",
      userName: "",
      yearOfBirth: "",
    };

    const formIterator = event.entries();
    let iterResult = formIterator.next();

    while (!iterResult.done) {
      const [key, value] = iterResult.value;

      if (
        [
          "dateOfBirth",
          "email",
          "mobile",
          "sex",
          "userName",
          "dayOfBirth",
          "monthOfBirth",
          "yearOfBirth",
        ].includes(key)
      ) {
        data[key] = value;
      }

      iterResult = formIterator.next();
    }

    const currentDataResults = await pgpool.query<{
      currentData: RenewDriversLicenceFlow;
    }>(
      `
        SELECT flow_data as "currentData" FROM user_flow_data
        WHERE user_id = $1 AND flow = $2
    `,
      [props.userId, "renewDriversLicence"]
    );

    let dataToUpdate: RenewDriversLicenceFlow;
    if (currentDataResults.rowCount) {
      const [{ currentData }] = currentDataResults.rows;
      Object.assign(currentData, data);
      dataToUpdate = currentData;
    } else {
      const base: RenewDriversLicenceFlow = emptyRenewDriversLicenceFlow();
      Object.assign(base, data);
      dataToUpdate = base;
    }

    await pgpool.query(
      `
        INSERT INTO user_flow_data (user_id, flow, flow_data)
        VALUES ($1, $2, $3)
        ON CONFLICT (flow, user_id)
        DO UPDATE SET flow_data = $3
        WHERE user_flow_data.user_id=$1 AND user_flow_data.flow=$2
    `,
      [props.userId, "renewDriversLicence", JSON.stringify(dataToUpdate)]
    );

    // redirect("/driving/renew-licence/" + getNextSlug(dataToUpdate));
    redirect(props.urlBase);
  }

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <form action={submitAction} id="user-details-form">
          <div className="govie-form-group">
            <h1 className="govie-label-wrapper">
              <label
                htmlFor="userName"
                className="govie-label--s govie-label--l"
              >
                {t("userName")}
              </label>
            </h1>
            <input
              type="text"
              id="userName"
              name="userName"
              className="govie-input"
              defaultValue={props.userName}
            />
          </div>

          <div className="govie-form-group">
            <h1 className="govie-label-wrapper">
              <label
                htmlFor="dateOfBirth"
                className="govie-label--s govie-label--l"
              >
                {t("dateOfBirth")}
              </label>
            </h1>

            <div className="govie-date-input" id="example-date">
              <div className="govie-date-input__item">
                <div className="govie-form-group">
                  <label
                    className="govie-label--s govie-date-input__label"
                    htmlFor="dayOfBirth"
                  >
                    Day
                  </label>
                  <input
                    className="govie-input govie-date-input__input govie-input--width-2"
                    id="dayOfBirth"
                    name="dayOfBirth"
                    type="text"
                    inputMode="numeric"
                    max={31}
                    min={1}
                    defaultValue={props.dayOfBirth}
                  />
                </div>
              </div>
              <div className="govie-date-input__item">
                <div className="govie-form-group">
                  <label
                    className="govie-label--s govie-date-input__label"
                    htmlFor="monthOfBirth"
                  >
                    Month
                  </label>
                  <input
                    className="govie-input govie-date-input__input govie-input--width-2"
                    id="monthOfBirth"
                    name="monthOfBirth"
                    type="text"
                    inputMode="numeric"
                    defaultValue={props.monthOfBirth}
                    max={12}
                    min={1}
                  />
                </div>
              </div>
              <div className="govie-date-input__item">
                <div className="govie-form-group">
                  <label
                    className="govie-label--s govie-date-input__label"
                    htmlFor="yearOfBirth"
                  >
                    Year
                  </label>
                  <input
                    className="govie-input govie-date-input__input govie-input--width-4"
                    id="yearOfBirth"
                    name="yearOfBirth"
                    type="text"
                    inputMode="numeric"
                    defaultValue={props.yearOfBirth}
                    min={1800}
                    max={9999}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="govie-form-group">
            <h1 className="govie-label-wrapper">
              <label htmlFor="email" className="govie-label--s govie-label--l">
                {t("emailAddress")}
              </label>
            </h1>
            <input
              type="text"
              id="email"
              name="email"
              className="govie-input"
              defaultValue={props.email}
            />
          </div>

          <div className="govie-form-group">
            <h1 className="govie-label-wrapper">
              <label htmlFor="mobile" className="govie-label--s govie-label--l">
                {t("mobileNumber")}
              </label>
            </h1>
            <input
              type="text"
              id="mobile"
              name="mobile"
              className="govie-input"
              defaultValue={props.mobile}
            />
          </div>

          <div className="govie-form-group">
            <h1 className="govie-label-wrapper">
              <label htmlFor="sex" className="govie-label--s govie-label--l">
                {t("sex")}
              </label>
            </h1>
            <input
              type="text"
              id="sex"
              name="sex"
              className="govie-input"
              defaultValue={props.sex}
            />
          </div>
          <button type="submit" className="govie-button">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};
