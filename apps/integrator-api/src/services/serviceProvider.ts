import { FormService } from "./formService";
import { MessagingService } from "./messagingService";
import { PaymentService } from "./paymentService";
import { IService } from "./types";

const serviceMap: Record<string, IService> = {
  form: new FormService(),
  payment: new PaymentService(),
  messaging: new MessagingService(),
};

export const getService = (serviceName: string) => {
  if (!serviceMap[serviceName]) {
    throw new Error("The requested service doesn not exist.");
  }

  return serviceMap[serviceName];
};
