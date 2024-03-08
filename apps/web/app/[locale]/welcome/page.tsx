import UserConsentFlow from "./UserConsentFlow";
import { NextPageProps } from "../[event]/[...action]/types";

export default async (props: NextPageProps) => {
  return <UserConsentFlow {...props} />;
};
