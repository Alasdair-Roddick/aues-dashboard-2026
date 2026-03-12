import React from "react";
import { OrderReceived } from "@/components/email-template";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await request.json();
    const { customerName, orderNumber, items, to } = body;

    const { data, error } = await resend.emails.send({
      from: "AUES <noreply@support.aues.com.au>",
      to: [to ?? "delivered@resend.dev"],
      subject: `Order #${orderNumber} received`,
      react: React.createElement(OrderReceived, { customerName, orderNumber, items }),
    });

    if (error) {
      console.error("Resend error:", error);
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    console.error("Caught error:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
