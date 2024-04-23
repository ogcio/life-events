export const entitlements = {
  slug: "entitlement",
  drivingLicence: {
    slug: "driving-licence",
    path(id: string) {
      return `${entitlements.slug}/${entitlements.drivingLicence.slug}/${id}`;
    },
  },
  birthCertificate: {
    slug: "birth-certificate",
    path(id: string) {
      return `${entitlements.slug}/${entitlements.birthCertificate.slug}/${id}`;
    },
  },
};

export const addresses = {
  slug: "addresses",
  newAddress: {
    slug: "new-address",
    path() {
      return `${addresses.slug}/${addresses.newAddress.slug}`;
    },
  },
  editAddress: {
    slug: "edit-address",
    path(id: string) {
      return `${addresses.slug}/${addresses.editAddress.slug}/${id}`;
    },
  },
  removeAddress: {
    slug: "remove-address",
    path(id: string) {
      return `${addresses.slug}/${addresses.removeAddress.slug}/${id}`;
    },
  },
  selectAddress: {
    slug: "select-address",
    path() {
      return `${addresses.slug}/${addresses.selectAddress.slug}`;
    },
  },
  manualAddress: {
    slug: "manual-address",
    path() {
      return `${addresses.slug}/${addresses.manualAddress.slug}`;
    },
  },
};
