import { notFound } from "next/navigation";
import { routes, web } from "../../../utils";
import OrderEHIC from "./OrderEHIC/OrderEHIC";
import RenewDriversLicence from "./RenewDriversLicence/RenewDriversLicence";
import OrderBirthCertificate from "./OrderBirthCertificate/OrderBirthCertificate";
import NotifyDeath from "./NotifyDeath/NotifyDeath";
import ApplyJobseekersAllowance from "./ApplyJobseekersAllowance/ApplyJobseekersAllowance";

const componentsMap = {
  [routes.driving.renewDriversLicence.slug]: RenewDriversLicence,
  [routes.health.orderEHIC.slug]: OrderEHIC,
  [routes.birth.orderBirthCertificate.slug]: OrderBirthCertificate,
  [routes.death.notifyDeath.slug]: NotifyDeath,
  [routes.employment.applyJobseekersAllowance.slug]: ApplyJobseekersAllowance,
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
