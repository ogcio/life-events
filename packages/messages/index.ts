import { send as twilioSend } from "./strategies/twilio/index";

// In case we need to do it, we can replace this with another provider
// We just need to keep the same SendEmail interface
export const send = twilioSend;
