import { Inngest } from "inngest";
import { Resend } from "resend";

// Initialize the Inngest client
export const inngest = new Inngest({
  id: "FairShare",
  name: "FairShare",
});

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

