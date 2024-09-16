import { Pool } from "pg";
import InputField from "../../../app/components/InputField";
import { FormWidgetProps, JourneyWidgetInfo } from "../types";
import { JourneyWidget } from "./baseWidget";

export class FormWidget extends JourneyWidget {
  private name = "Form";
  private data: FormWidgetProps["data"] = {
    title: undefined,
    url: undefined,
  };
  private props: FormWidgetProps;

  constructor(props: FormWidgetProps) {
    super();

    this.props = props;
    this.setData(props.data);
  }

  getInfo(): JourneyWidgetInfo {
    return {
      id: this.props.id,
      name: this.name,
      title: this.data.title,
      required: this.props.required,
      stepNumber: this.props.stepNumber,
      stepId: this.props.stepId,
      completed: this.isCompleted(),
      actionTitle: "choose",
    };
  }

  setData(data: FormWidgetProps["data"]) {
    this.data.title = data.title;
    this.data.url = data.url;
  }

  getData() {
    return { ...this.data };
  }

  renderForm(t: (text: string) => string): JSX.Element {
    return (
      <>
        <h2 className="govie-heading-m">{t("formWidget.title")}</h2>

        <div className="govie-form-group">
          <InputField
            name="title"
            label={t("formWidget.titleLabel")}
            type="text"
            defaultValue={this.data.title}
          />
        </div>

        <div className="govie-form-group">
          <InputField
            name="url"
            label={t("formWidget.urlLabel")}
            type="text"
            defaultValue={this.data.url}
          />
        </div>
      </>
    );
  }

  saveData(formData: FormData, pg: Pool) {
    const stepData = {
      title: formData.get("title"),
      url: formData.get("url"),
    };

    if (this.props.stepId) {
      return pg.query(
        `
                      UPDATE journey_steps
                      SET step_data = $1, updated_at = now()::DATE
                      WHERE id = $2;
                  `,
        [stepData, this.props.stepId],
      );
    } else {
      return pg.query(
        `
                      INSERT INTO journey_steps(
                          journey_id,
                          step_type,
                          step_number,
                          step_data,
                          created_at,
                          updated_at
                      )
                      VALUES ($1, $2, $3, $4, now()::DATE, now()::DATE)
                  `,
        [this.props.journeyId, "form", this.props.stepNumber, stepData],
      );
    }
  }

  isCompleted() {
    return !!this.data.title && !!this.data.url;
  }
}
