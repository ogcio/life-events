export type Address = {
  addressId: string;
  addressLine1: string;
  addressLine2: string;
  town: string;
  county: string;
  eirecode: string;
  updatedAt: string;
  moveInDate?: string;
  moveOutDate?: string;
  isPrimary: boolean;
  ownershipStatus?: string;
};
