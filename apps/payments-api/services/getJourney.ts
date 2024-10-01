import { getIntegratorSdk } from "../utils/authenticationFactory";

export const getJourneyById = async (id: string) => {
  const integratorSdk = await getIntegratorSdk();

  const journeyDetails = await integratorSdk.getJourneyById(id);

  return journeyDetails.data?.data;
};
