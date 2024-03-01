import { routeDefinitions } from "../../../routeDefinitions";

import RenewDriversLicence from "./RenewDriversLicence/RenewDriversLicence";
import { NextPageProps } from "./types";
import PayPaymentRequest from "./PayPaymentRequest/Pay";
import PayBankPaymentRequest from "./PayPaymentRequest/Bank";
import PaymentComplete from "./PayPaymentRequest/Complete";
import PaymentError from './PayPaymentRequest/Error';

export default function ActionPage(props: NextPageProps) {
  switch (props.params.action.at(0)) {
    case routeDefinitions.driving.renewLicense.slug:
      return (
        <RenewDriversLicence
          params={props.params}
          searchParams={props.searchParams}
        />
      );
    case routeDefinitions.paymentRequest.pay.slug:
      if (props.params.action.length > 1) {
        const paymentType = props.params.action.at(1);
        if (paymentType === "bank") {
          return (
            <PayBankPaymentRequest
              searchParams={
                props.searchParams as { paymentId: string } | undefined
              }
            />
          );
        }
      }
      return (
        <PayPaymentRequest
          searchParams={props.searchParams as { paymentId: string } | undefined}
        />
      );
    case routeDefinitions.paymentRequest.complete.slug:
      return (
        <PaymentComplete
          searchParams={props.searchParams as { payment_id: string }}
        />
      );
    case routeDefinitions.paymentRequest.error.slug:
      return (
        <PaymentError
          searchParams={props.searchParams as { transactionId: string, status: string }}
        />
      );
  }

  return null;
}
