import { Messaging } from "building-blocks-sdk";
import { getTokenForMessaging } from "./authenticate.js";
import {
  checkResponse,
  configKeys,
  importUser,
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
const importedUsers = await importUser(messagingClient, toImportUser);

// Send a message to the user
const messageResponse = await messagingClient.send({
  preferredTransports: ["sms", "email", "lifeEvent"],
  recipientUserId: importedUsers[0].id,
  security: "public",
  bypassConsent: true, // important!
  scheduleAt: scheduleNow(),
  message: {
    // could be a template
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
console.log("Message sent!");
