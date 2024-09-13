import { Messaging } from "building-blocks-sdk";
import { getTokenForMessaging } from "./authenticate.js";
import { checkResponse, configKeys } from "./config.js";
import toImportUser from "./to-import-user.json" with { type: "json" };

// Authenticate
const messagingToken = await getTokenForMessaging(configKeys.organizationId);

// Initialize SDK
const messagingClient = new Messaging(messagingToken);

// Import users
const importResult = await messagingClient.importUsers({
  records: toImportUser,
});

const importResultData = checkResponse(importResult);

// Get imported users
const usersForImport = await messagingClient.getUsersForImport(
  importResultData.id,
  false,
);

const importedUsers = checkResponse(usersForImport);

// Send a message to the user
const messageResponse = await messagingClient.send({
  preferredTransports: ["sms", "email", "lifeEvent"],
  recipientUserId: importedUsers[0].id,
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

checkResponse(messageResponse);
