import { Pool } from "pg";
import InputField from "../../../app/components/InputField";
import { JourneyWidgetInfo, TitleWidgetProps } from "../types";
import { JourneyWidget } from "./baseWidget";

export class TitleWidget extends JourneyWidget {
  private name = "Name";
  private data: TitleWidgetProps["data"] = {
    name: undefined,
  };
  private props: TitleWidgetProps;

  constructor(props: TitleWidgetProps) {
    super();

    this.props = props;
    this.setData(props.data);
  }

  getInfo(): JourneyWidgetInfo {
    return {
      id: this.props.id,
      name: this.name,
      title: this.data.name,
      required: this.props.required,
      stepNumber: this.props.stepNumber,
      stepId: this.props.stepId,
      completed: this.isCompleted(),
      actionTitle: "edit",
    };
  }

  setData(data: TitleWidgetProps["data"]) {
    this.data.name = data.name;
  }

  getData() {
    return { ...this.data };
  }

  renderForm(t: (text: string) => string): JSX.Element {
    return (
      <>
        <h2 className="govie-heading-m">{t("titleWidget.title")}</h2>

        <div className="govie-form-group">
          <InputField
            name="name"
            label={t("titleWidget.nameLabel")}
            type="text"
            defaultValue={this.data.name}
          />
        </div>
      </>
    );
  }

  saveData(formData: FormData, pg: Pool) {
    const name = formData.get("name") as string;

    return pg.query(
      `
                  UPDATE journeys
                  SET title = $1
                  WHERE id = $2;
              `,
      [name, this.props.stepId],
    );
  }

  isCompleted() {
    return !!this.data.name;
  }
}
