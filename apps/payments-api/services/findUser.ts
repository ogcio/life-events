import { getProfileSdk } from "../utils/authenticationFactory";

export const findUser = async (userInfo: string, organizationId: string) => {
  const profileSdk = await getProfileSdk(organizationId);
  const findBy: {
    firstname?: string;
    lastname?: string;
    email?: string;
    strict?: boolean;
  } = {};

  if (userInfo.includes("@")) {
    findBy.email = userInfo;
  } else {
    const [firstname, lastname] = userInfo.split(" ");
    findBy.firstname = firstname;
    findBy.lastname = lastname;
  }

  const userDetails = await profileSdk.findUser(findBy);

  return userDetails.data;
};
