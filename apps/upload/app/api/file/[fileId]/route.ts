import { notFound } from "next/navigation";
import { AuthenticationFactory } from "../../../utils/authentication-factory";
import { getCommonLogger } from "nextjs-logging-wrapper";

export async function GET(
  request: Request,
  { params: { fileId } }: { params: { fileId: string } },
) {
  await AuthenticationFactory.getInstance().getContext();
  const uploadClient = await AuthenticationFactory.getUploadClient();
  const { data, error, headers, status } = await uploadClient.getFile(fileId);

  if (error || !data) {
    if (error) {
      getCommonLogger().error(error);
      if (status === 404) {
        throw notFound();
      }
      return new Response("Error", { status });
    }
  }

  return new Response(data, { headers });
}
