import { redirect, RedirectType } from "next/navigation";
import authenticatedAction from "../../../../../utils/authenticatedAction";
import { AuthenticationFactory } from "../../../../../utils/authentication-factory";
import { getServerLogger } from "nextjs-logging-wrapper";
import { revalidatePath } from "next/cache";

const removeFileSharing = async (fileId: string, prevState, formData) => {
  "use server";
  const userId = formData.get("userId");

  const uploadSdk = await AuthenticationFactory.getUploadClient();

  try {
    const { error } = await uploadSdk.removeFileSharing(fileId, userId);

    if (error) {
      getServerLogger().error(error);
      return { error: "remove-share-error" };
    }
  } catch (err) {
    return { error: "remove-share-error" };
  }

  revalidatePath(`/file/${fileId}`);
};

export default authenticatedAction(removeFileSharing);
