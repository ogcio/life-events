import { Messaging } from "building-blocks-sdk";
import { getAuthenticationContext } from "../../[locale]/logto_integration/config";

export async function GET() {
  const accessToken = await AuthenticationContextFactory.getAccessToken();
  const messagingClient = new Messaging(accessToken);
  const toDownloadTemplate = await messagingClient.downloadUsersCsvTemplate();

  // set the headers to tell the browser to download the file
  const headers = new Headers();
  // remember to change the filename `test.pdf` to whatever you want the downloaded file called
  headers.append(
    "Content-Disposition",
    'attachment; filename="csv-template.csv"',
  );
  headers.append("Content-Type", "text/csv");

  return new Response(toDownloadTemplate, {
    headers,
  });
}
