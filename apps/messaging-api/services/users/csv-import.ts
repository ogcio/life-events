import { CsvRecord } from "../../types/usersSchemaDefinitions";

export const getCsvHeader = (): string => {
  const mockCsvRecord: CsvRecord = {
    importIndex: 0,
    publicIdentityId: null,
    firstName: null,
    lastName: null,
    phoneNumber: null,
    birthDate: null,
    emailAddress: null,
    addressCity: null,
    addressZipCode: null,
    addressStreet: null,
    addressCountry: null,
    addressRegion: null,
  };

  return Object.keys(mockCsvRecord).join(";");
};
