import { routeDefinitions } from "../../../routeDefinitions";

import RenewDriversLicence from "./RenewDriversLicence/RenewDriversLicence";
import { NextPageProps } from "./types";

export default function ActionPage(props: NextPageProps) {
  switch (props.params.action.at(0)) {
    case routeDefinitions.driving.renewLicense.slug:
      return (
        <RenewDriversLicence
          params={props.params}
          searchParams={props.searchParams}
        />
      );
  }

  return null;
}
