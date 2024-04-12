export const entitlements = {
  slug: "entitlement",
  drivingLicence: {
    slug: "driving-licence",
    path(id: number) {
      return `${entitlements.slug}/${entitlements.drivingLicence.slug}/${id}`;
    },
  },
  birthCertificate: {
    slug: "birth-certificate",
    path(id: number) {
      return `${entitlements.slug}/${entitlements.birthCertificate.slug}/${id}`;
    },
  },
};
