"use server";

import { revalidatePath } from "next/cache";
import { AuthenticationFactory } from "../../../../../utils/authentication-factory";
import { getCommonLogger } from "nextjs-logging-wrapper";

export default async (fileId: string, prevState, formData) => {
  const userId = formData.get("userId");
  console.log({ fileId, userId });

  const uploadSdk = await AuthenticationFactory.getUploadClient();

  try {
    const { data, error } = await uploadSdk.shareFile(fileId, userId);

    if (error) {
      getCommonLogger().error(error);
      return { error: "share-error" };
    }
  } catch (err) {
    return { error: "share-error" };
  }

  revalidatePath(`/file/${fileId}`);
};
