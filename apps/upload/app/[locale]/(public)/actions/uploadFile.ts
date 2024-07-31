import authenticatedAction from "../../../utils/authenticatedAction";
import { AuthenticationFactory } from "../../../utils/authentication-factory";

export const ERRORS = {
  NO_FILE: "noFile",
  TOO_BIG: "tooBig",
};

const uploadFile = async (prevState, formData: FormData) => {
  "use server";
  const context = await AuthenticationFactory.getInstance().getContext();
  const file_ = formData.get("file-upload");
  const text = formData.get("text");

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

  // const file = formData.get("file");
  console.log("file good");

  return {};
};

export default authenticatedAction(uploadFile);
