import { routeDefinitions } from "../../../routeDefinitions";

import RenewDriversLicence from "./RenewDriversLicence/RenewDriversLicence";
import PaymentSuccess, { PaymentSuccessProps } from "./RenewDriversLicence/PaymentComplete";
import { NextPageProps } from "./types";

export default function ActionPage(props: NextPageProps) {
  switch (props.params.action.at(0)) {
    case routeDefinitions.driving.renewLicense.slug:
      if (props.params.action.length > 1 && props.params.action.at(1) === routeDefinitions.driving.renewLicense.complete.slug) {
        return (
          <PaymentSuccess {...(props as PaymentSuccessProps)} />
        );
      }

      return (
        <RenewDriversLicence
          params={props.params}
          searchParams={props.searchParams}
        />
      );
  }

  return null;
}
