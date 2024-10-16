import { getServerLogger } from "nextjs-logging-wrapper";
import authenticatedAction from "../../../utils/authenticatedAction";
import { AuthenticationFactory } from "../../../utils/authentication-factory";
import { revalidatePath } from "next/cache";

export const ERRORS = {
  NO_FILE: "noFile",
  TOO_BIG: "tooBig",
  UPLOAD_ERROR: "uploadError",
  FILE_INFECTED: "fileInfected",
};

const uploadFile = async (prevState, formData: FormData) => {
  "use server";
  const file_ = formData.get("file-upload");
  const expireDate_ = formData.get("expire-date");

  let expireDateString = expireDate_?.toString();
  let utcDateString: string | undefined;
  if (expireDateString) {
    utcDateString = new Date(expireDateString).toISOString();
  }

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
    const { error } = await uploadClient.uploadFile(file, utcDateString);
    if (error) {
      getServerLogger().error(error);

      if (error.detail === "File is infected") {
        return {
          error: ERRORS.FILE_INFECTED,
        };
      }
      return { error: ERRORS.UPLOAD_ERROR };
    }
  } catch (err) {
    getServerLogger().error(err);
    return { error: ERRORS.UPLOAD_ERROR };
  }

  revalidatePath("/");
  return {};
};

export default authenticatedAction(uploadFile);
