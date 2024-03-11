import { routes, web } from "../../../utils";
import RenewDriversLicence from "./RenewDriversLicence/RenewDriversLicence";

export default function ActionPage(props: web.NextPageProps) {
  switch (props.params.action.at(0)) {
    case routes.driving.renewLicense.slug:
      return (
        <RenewDriversLicence
          params={props.params}
          searchParams={props.searchParams}
        />
      );
  }

  return null;
}
