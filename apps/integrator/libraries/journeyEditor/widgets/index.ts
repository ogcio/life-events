import { FormWidget } from "./formWidget";
import { MessagingWidget } from "./messagingWidget";
import { PaymentWidget } from "./paymentWidget";
import { TitleWidget } from "./titleWidget";

export class WidgetManager {
  private readonly widgetsMap = {
    title: TitleWidget,
    form: FormWidget,
    payment: PaymentWidget,
    messaging: MessagingWidget,
  };

  getWidget(type: string) {
    if (!this.widgetsMap[type]) {
      throw new Error("Widget not found!");
    }

    return this.widgetsMap[type];
  }
}
