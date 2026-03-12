import * as React from "react";
import { EmailLayout, colors } from "./layout";

export interface CustomEmailProps {
  customerName: string;
  subject: string;
  message: string;
  senderName: string;
}

const SIGN_OFFS = [
  // Normal
  "Cheers,",
  "Kind regards,",
  "Best,",
  "Thanks,",
  "All the best,",
  "Warm regards,",
  // Funny
  "Sent from my toaster,",
  "Regards, but not too many,",
  "Sent from the void,",
  "Error 404: Professionalism not found,",
  "Not a robot, probably,",
  "May the odds be ever in your favour,",
  "Don't take life too seriously, no one gets out alive,",
  "Yours in mild chaos,",
  "Optimistically,",
  "Against my better judgement,",
  "Sent before I could second-guess myself,",
  "Legally obligated to sign off somehow,",
  "This email self-destructs in 5... 4...,",
  "With the enthusiasm of someone on their third coffee,",
];

function randomSignOff(): string {
  return SIGN_OFFS[Math.floor(Math.random() * SIGN_OFFS.length)];
}

export const CustomEmail: React.FC<CustomEmailProps> = ({ customerName, subject, message, senderName }) => {
  const signOff = randomSignOff();
  // Render newlines as <br /> in the message
  const messageLines = message.split("\n");

  return (
    <EmailLayout previewText={subject}>
      <h1
        style={{
          margin: "0 0 8px 0",
          fontSize: "22px",
          fontWeight: 700,
          color: colors.text,
          lineHeight: 1.3,
        }}
      >
        Hi {customerName},
      </h1>

      <div
        style={{
          margin: "0 0 32px 0",
          fontSize: "15px",
          color: colors.text,
          lineHeight: 1.7,
        }}
      >
        {messageLines.map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < messageLines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>

      {/* Signature */}
      <div style={{ marginBottom: "24px" }}>
        <p style={{ margin: "0 0 2px 0", fontSize: "14px", color: colors.textMuted, lineHeight: 1.6 }}>
          {signOff}
        </p>
        <p style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: 600, color: colors.text }}>
          {senderName}
        </p>
        <p style={{ margin: 0, fontSize: "13px", color: colors.textMuted }}>
          Adelaide University Engineering Society
        </p>
      </div>

      {/* Reply notice */}
      <div
        style={{
          backgroundColor: colors.amberLight,
          border: `1px solid ${colors.amberBorder}`,
          borderRadius: "10px",
          padding: "14px 20px",
          marginBottom: "8px",
        }}
      >
        <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: 600, color: colors.amber }}>
          Need to get in touch?
        </p>
        <p style={{ margin: 0, fontSize: "13px", color: colors.textMuted, lineHeight: 1.6 }}>
          This email was sent from an unmonitored address — please do not reply directly. If you
          have any questions, reach out to us at{" "}
          <a href="mailto:club@aues.com.au" style={{ color: colors.red, fontWeight: 600 }}>
            club@aues.com.au
          </a>{" "}
          and we&apos;ll get back to you as soon as we can.
        </p>
      </div>
    </EmailLayout>
  );
};
