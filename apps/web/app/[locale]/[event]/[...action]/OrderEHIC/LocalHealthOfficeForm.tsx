import { useTranslations } from "next-intl";
import { postgres, workflow } from "../../../../utils";
import { redirect } from "next/navigation";

type FormProps = {
  userId: string;
  data: workflow.OrderEHIC;
  onSubmitRedirectSlug: string;
};

export default async (props: FormProps) => {
  const t = useTranslations("LocalHealthOfficeForm");
  const selectName = "selected-health-office";

  const healthOfficesResponse = await fetch(
    `${process.env.API_ENDPOINT}/static/health-offices/api`,
  );
  const healthOffices = await healthOfficesResponse.json();

  const options = healthOffices.map((healthOffice: string) => (
    <option key={healthOffice}>{healthOffice}</option>
  ));

  async function submitAction(formData: FormData) {
    "use server";
    const selectedHealthOffice = formData.get(selectName);

    if (!selectedHealthOffice) {
      return;
    }

    await postgres.pgpool.query(
      `
            INSERT INTO user_flow_data (flow, user_id, flow_data, category) 
            VALUES($1, $2, $3, $4)
            ON CONFLICT (flow, user_id) DO
            UPDATE SET flow_data = user_flow_data.flow_data || jsonb_build_object('localHealthOffice', $5::TEXT, 'timeAtAddress','10 years')
            WHERE user_flow_data.user_id = $2 AND user_flow_data.flow = $1
        `,
      [
        workflow.keys.orderEHIC,
        props.userId,
        JSON.stringify({
          ...props.data,
          localHealthOffice: selectedHealthOffice,
          timeAtAddress: "5 months",
        }),
        workflow.categories.health,
        selectedHealthOffice,
      ],
    );

    redirect(props.onSubmitRedirectSlug);
  }

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds">
        <h1 className="govie-heading-l">{t("selectHealthOffice")}</h1>
        <form action={submitAction}>
          <div className="govie-form-group">
            <div className="govie-hint" id="input-field-hint">
              {t("selectHint")}
            </div>
            <select className="govie-select" id={selectName} name={selectName}>
              {options}
            </select>
          </div>
          <button className="govie-button">
            {t("continueWithHealthOffice")}
          </button>
        </form>
      </div>
    </div>
  );
};
