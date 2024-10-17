import { Pool } from "pg";
import { JourneyWidgetInfo } from "../types";

export class JourneyWidget {
  getInfo(): JourneyWidgetInfo {
    throw new Error("Method 'getInfo()' must be implemented.");
  }

  getData() {
    throw new Error("Method 'getData()' must be implemented.");
  }

  setData(data) {
    throw new Error("Method 'setData()' must be implemented.");
  }

  renderForm(t: (text: string) => string): JSX.Element {
    throw new Error("Method 'renderForm()' must be implemented.");
  }

  saveData(formData: FormData, pg: Pool) {
    throw new Error("Method 'saveData()' must be implemented.");
  }

  isCompleted() {
    throw new Error("Method 'isCompleted()' must be implemented.");
  }
}
