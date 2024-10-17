import { ProfileAuthenticationFactory } from "../../libraries/profile-authentication-factory";

export const getUserNameById = async (userId: string, defaultOrgId: string) => {
  const profileApi =
    await ProfileAuthenticationFactory.getProfileClient(defaultOrgId);
  const user = await profileApi.getUser(userId);
  return `${user.data?.firstName} ${user.data?.lastName}`;
};
