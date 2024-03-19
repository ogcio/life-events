import { notFound } from "next/navigation";
import { routes, web } from "../../../utils";
import OrderEHIC from "./OrderEHIC/OrderEHIC";
import RenewDriversLicence from "./RenewDriversLicence/RenewDriversLicence";

const componentsMap = {
  [routes.driving.renewDriversLicence.slug]: RenewDriversLicence,
  [routes.health.orderEHIC.slug]: OrderEHIC,
};

export default function ActionPage(props: web.NextPageProps) {
  const path = props.params.action.at(0);

  if (!path) {
    throw notFound();
  }

  const Component = componentsMap[path];

  if (Component) {
    return (
      <Component params={props.params} searchParams={props.searchParams} />
    );
  }

  throw notFound();
}
