import { getCommonLogger } from "nextjs-logging-wrapper";
import authenticatedAction from "../../../utils/authenticatedAction";
import { AuthenticationFactory } from "../../../utils/authentication-factory";
import { revalidatePath } from "next/cache";

export const ERRORS = {
  NO_KEY: "noKey",
  DELETE_ERROR: "deleteError",
};

const deleteFile = async (prevState, formData: FormData) => {
  "use server";
  const key = formData.get("file-key")?.toString();

  if (!key) {
    return { error: ERRORS.NO_KEY };
  }

  const uploadClient = await AuthenticationFactory.getUploadClient();

  try {
    const { error } = await uploadClient.deleteFile(key as string);
    if (error) {
      getCommonLogger().error(error);
      return { error: ERRORS.DELETE_ERROR };
    }
  } catch (err) {
    getCommonLogger().error(err);
    return { error: ERRORS.DELETE_ERROR };
  }

  revalidatePath("/");
  return {};
};

export default authenticatedAction(deleteFile);
