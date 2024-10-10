import { Pool } from "pg";
import InputField from "../../../app/components/InputField";
import { JourneyWidgetInfo, MessagingWidgetProps } from "../types";
import { JourneyWidget } from "./baseWidget";

export class MessagingWidget extends JourneyWidget {
  private name = "Messaging";
  private data: MessagingWidgetProps["data"] = {
    title: undefined,
    url: undefined,
  };
  private props: MessagingWidgetProps;

  constructor(props: MessagingWidgetProps) {
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
      completed: !!this.isCompleted(),
      actionTitle: "choose",
    };
  }

  setData(data: MessagingWidgetProps["data"]) {
    this.data.title = data.title;
    this.data.url = data.url;
  }

  renderForm(t: (text: string) => string): JSX.Element {
    return (
      <>
        <h2 className="govie-heading-m">{t("messagingWidget.title")}</h2>

        <div className="govie-form-group">
          <InputField
            name="title"
            label={t("messagingWidget.titleLabel")}
            type="text"
            defaultValue={this.data.title}
          />
        </div>

        <div className="govie-form-group">
          <InputField
            name="url"
            label={t("messagingWidget.urlLabel")}
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
        [this.props.journeyId, "messaging", this.props.stepNumber, stepData],
      );
    }
  }

  isCompleted() {
    return !!this.data.title && !!this.data.url;
  }
}
