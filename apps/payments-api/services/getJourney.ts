import { getIntegratorSdk } from "../utils/authenticationFactory";

export const getJourneyDetails = async (id: string) => {
  const integratorSdk = await getIntegratorSdk();

  const journeyDetails = await integratorSdk.getJourneyDetails(id);

  return journeyDetails.data?.data;
};
