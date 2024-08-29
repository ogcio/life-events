import { revalidatePath } from "next/cache";
import { AuthenticationFactory } from "../../../../../utils/authentication-factory";
import { getServerLogger } from "nextjs-logging-wrapper";
import authenticatedAction from "../../../../../utils/authenticatedAction";

const shareFile = async (fileId: string, prevState, formData) => {
  "use server";
  const userId = formData.get("userId");

  const uploadSdk = await AuthenticationFactory.getUploadClient();

  try {
    const { data, error } = await uploadSdk.shareFile(fileId, userId);

    if (error) {
      getServerLogger().error(error);
      return { error: "share-error" };
    }
  } catch (err) {
    return { error: "share-error" };
  }

  revalidatePath(`/file/${fileId}`);
};

export default authenticatedAction(shareFile);
