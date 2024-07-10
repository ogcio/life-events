import { notFound } from "next/navigation";
import { routes, web } from "../../../../utils";
import OrderEHIC from "./OrderEHIC/OrderEHIC";
import RenewDriversLicence from "./RenewDriversLicence/RenewDriversLicence";
import OrderBirthCertificate from "./OrderBirthCertificate/OrderBirthCertificate";
import NotifyDeath from "./NotifyDeath/NotifyDeath";
import ApplyJobseekersAllowance from "./ApplyJobseekersAllowance/ApplyJobseekersAllowance";
import GetDigitalWallet from "./GetDigitalWallet/GetDigitalWallet";
import { isFeatureFlagEnabled } from "feature-flags/utils";

const componentsMap = async () => ({
  [routes.driving.renewDriversLicence.slug]:
    (await isFeatureFlagEnabled("driving")) && RenewDriversLicence,
  [routes.health.orderEHIC.slug]:
    (await isFeatureFlagEnabled("health")) && OrderEHIC,
  [routes.birth.orderBirthCertificate.slug]:
    (await isFeatureFlagEnabled("birth")) && OrderBirthCertificate,
  [routes.death.notifyDeath.slug]:
    (await isFeatureFlagEnabled("death")) && NotifyDeath,
  [routes.employment.applyJobseekersAllowance.slug]:
    (await isFeatureFlagEnabled("employment")) && ApplyJobseekersAllowance,
  [routes.digitalWallet.getDigitalWallet.slug]:
    (await isFeatureFlagEnabled("digitalWallet")) && GetDigitalWallet,
});

export default async function ActionPage(props: web.NextPageProps) {
  const path = props.params.action.at(0);

  if (!path) {
    throw notFound();
  }

  const Component = (await componentsMap())[path];

  if (Component) {
    return (
      <Component params={props.params} searchParams={props.searchParams} />
    );
  }

  throw notFound();
}
