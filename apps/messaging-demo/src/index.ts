import { Messaging } from "building-blocks-sdk";
import { getTokenForMessaging } from "./authenticate.js";
import {
  checkResponse,
  configKeys,
  getMessageContent,
  scheduleNow,
} from "./config.js";
import toImportUser from "./to-import-user.json" with { type: "json" };

console.log("Process started...");
// Authenticate
const messagingToken = await getTokenForMessaging(configKeys.organizationId);
console.log("Authenticated!");

// Initialize SDK
const messagingClient = new Messaging(messagingToken);

// Import users
const importResult = await messagingClient.importUsers({
  records: toImportUser,
});

const importResultData = checkResponse(importResult);
console.log("Users imported!");

// Get imported users
const usersForImport = await messagingClient.getUsersForImport(
  importResultData.id,
  false,
);

const importedUsers = checkResponse(usersForImport);
console.log("Users retrieved!");

// Send a message to the user
const messageResponse = await messagingClient.send({
  preferredTransports: ["sms", "email", "lifeEvent"],
  recipientUserId: importedUsers[0].id,
  security: "public",
  bypassConsent: true,
  scheduleAt: scheduleNow(),
  message: getMessageContent(),
});

checkResponse(messageResponse);
console.log("Message sent!");
