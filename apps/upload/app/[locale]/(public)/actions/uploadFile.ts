import { getCommonLogger } from "nextjs-logging-wrapper";
import authenticatedAction from "../../../utils/authenticatedAction";
import { AuthenticationFactory } from "../../../utils/authentication-factory";
import { revalidatePath } from "next/cache";

export const ERRORS = {
  NO_FILE: "noFile",
  TOO_BIG: "tooBig",
  UPLOAD_ERROR: "uploadError",
};

const uploadFile = async (prevState, formData: FormData) => {
  "use server";
  const file_ = formData.get("file-upload");

  if (!file_) {
    return { error: ERRORS.NO_FILE };
  }
  const file = file_ as File;
  if (file.size === 0) {
    return { error: ERRORS.NO_FILE };
  }

  if (file.size > 104857600) {
    return { error: ERRORS.TOO_BIG };
  }

  const uploadClient = await AuthenticationFactory.getUploadClient();
  try {
    const { error } = await uploadClient.uploadFile(file);
    if (error) {
      getCommonLogger().error(error);
      return { error: ERRORS.UPLOAD_ERROR };
    }
  } catch (err) {
    getCommonLogger().error(err);
    return { error: ERRORS.UPLOAD_ERROR };
  }

  revalidatePath("/");
  return {};
};

export default authenticatedAction(uploadFile);
