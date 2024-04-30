import { notFound } from "next/navigation";
import { NextPageProps } from "../../../../../types";
import DrivingLicenceDetails from "./DrivingLicenceDetails";
import BirthCertificateDetails from "./BirthCertificateDetails";
import { routes } from "../../../../utils";

export default (props: NextPageProps) => {
  const { type, id, locale } = props.params;

  if (!type || !id) {
    throw notFound();
  }

  if (type === routes.entitlements.drivingLicence.slug) {
    return <DrivingLicenceDetails id={id} locale={locale} />;
  }

  if (type === routes.entitlements.birthCertificate.slug) {
    return <BirthCertificateDetails id={id} locale={locale} />;
  }

  throw notFound();
};
