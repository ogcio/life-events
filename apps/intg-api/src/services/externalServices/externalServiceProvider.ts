import { FormService } from "./formService";
import { PaymentService } from "./paymentService";
import { IExternalService } from "./types";

const serviceMap: Record<string, IExternalService> = {
  form: new FormService(),
  payment: new PaymentService(),
};

export const getExternalService = (serviceName: string) => {
  if (!serviceMap[serviceName]) {
    throw new Error("The requested service doesn not exist.");
  }

  return serviceMap[serviceName];
};
