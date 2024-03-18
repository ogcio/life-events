import { notFound } from "next/navigation";
import { routes, web } from "../../../utils";
import OrderEHIC from "./OrderEHIC/OrderEHIC";
import RenewDriversLicence from "./RenewDriversLicence/RenewDriversLicence";
import OrderBirthCertificate from "./OrderBirthCertificate/OrderBirthCertificate";
import NotifyDeath from "./NotifyDeath/NotifyDeath";

const componentsMap = {
  [routes.driving.renewDriversLicence.slug]: RenewDriversLicence,
  [routes.health.orderEHIC.slug]: OrderEHIC,
  [routes.health.orderBirthCertificate.slug]: OrderBirthCertificate,
  [routes.death.notifyDeath.slug]: NotifyDeath,
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
