import { notFound } from "next/navigation";
import { NextPageProps } from "../../../../../types";
import DrivingLicenceDetails from "./DrivingLicenceDetails";
import BirthCertificateDetails from "./BirthCertificateDetails";
import { routes } from "../../../../utils";

export default (params: NextPageProps) => {
  const { type, id } = params.params;

  if (!type || !id) {
    throw notFound();
  }

  if (type === routes.entitlements.drivingLicence.slug) {
    return <DrivingLicenceDetails id={id} />;
  }

  if (type === routes.entitlements.birthCertificate.slug) {
    return <BirthCertificateDetails id={id} />;
  }

  throw notFound();
};
