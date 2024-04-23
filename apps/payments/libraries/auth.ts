import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "./logtoConfig";
import { redirect } from "next/navigation";
import { createHash } from "crypto";

// This is an utility function to convert a Logto ID to a UUID
// For now we keep this for intercompatibility with the current db UUID schema
function idToUUID(id: string): string {
  // Use SHA-256 to hash the ID and convert it to a hex string
  const hash = createHash("sha256").update(id).digest("hex");

  // Truncate to the first 32 characters (128 bits) and insert UUID dashes
  const truncatedHash = hash.substring(0, 32);
  const uuid = `${truncatedHash.substring(0, 8)}-${truncatedHash.substring(8, 12)}-${truncatedHash.substring(12, 16)}-${truncatedHash.substring(16, 20)}-${truncatedHash.substring(20, 32)}`;

  return uuid;
}

export const getUser = async () => {
  const context = await getLogtoContext(logtoConfig, {
    fetchUserInfo: true,
    getAccessToken: true,
    // The resource must have a trailing slash
    resource: process.env.PAYMENTS_BACKEND_URL + "/",
    getOrganizationToken: true,
  });
  const userLogtoId = context.claims?.sub;

  if (!context.isAuthenticated || !context.accessToken || !userLogtoId) {
    return redirect("/login");
  }

  return {
    accessToken: context.accessToken,
    ...context,
    id: idToUUID(userLogtoId),
  };
};
