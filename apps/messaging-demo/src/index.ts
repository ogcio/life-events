import { Messaging } from "building-blocks-sdk";
import { getTokenForMessaging } from "./authenticate.js";
import { configKeys } from "./config.js";
import toImportUser from "./to-import-user.json" with { type: "json" };

// Authenticate
const messagingToken = await getTokenForMessaging(configKeys.organizationId);

// Initialize SDK
const messagingClient = new Messaging(messagingToken);

// Import users
const importResult = await messagingClient.importUsers({
  records: toImportUser,
});

if (importResult.error || !importResult.data) {
  console.log({ IMPORTING_ERROR: importResult.error });
  throw new Error("Something went wrong importing");
}

// Get imported users
const usersForImport = await messagingClient.getUsersForImport(
  importResult.data.id,
  false,
);

if (
  usersForImport.error ||
  !usersForImport.data ||
  usersForImport.data.length === 0
) {
  console.log({ GET_USERS_ERROR: usersForImport.error });
  throw new Error("No user found");
}

// Send a message to the user
const messageResponse = await messagingClient.send({
  preferredTransports: ["sms", "email", "lifeEvent"],
  recipientUserId: usersForImport.data[0].id,
  security: "public",
  bypassConsent: true,
  scheduleAt: new Date().toISOString(),
  message: {
    threadName: "Submission feedback",
    subject: "Thank you for your submission!",
    excerpt: "Submission feedbacks for you!",
    plainText:
      "We would like to thank you for your submission. We will reply as soon as possible.",
    richText:
      "We would like to thank you for your submission. We will reply as soon as possible.",
    language: "en",
  },
});

if (messageResponse.error || !messageResponse.data) {
  console.log({ ERROR_SENDING_MESSAGE: messageResponse.error });
  throw new Error("Error sending message");
}
