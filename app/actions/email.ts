"use server";

import { auth } from "@/auth";
import { sendCustomerEmail } from "@/app/lib/email";

export async function sendEmailToCustomer(args: {
  to: string;
  customerName: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const subject = args.subject.trim();
  const message = args.message.trim();

  if (!subject || !message) {
    return { success: false, error: "Subject and message are required" };
  }

  return sendCustomerEmail({ ...args, subject, message, senderName: session.user?.name ?? "AUES" });
}
