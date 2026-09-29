import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { mailEnv } from "./env";

let transporter: Transporter | undefined;

function getTransporter(): Transporter {
  if (!transporter) {
    const { host, port, secure, user, pass } = mailEnv();
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      // Refuse to send credentials over an unencrypted connection.
      requireTLS: !secure,
      connectionTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  return transporter;
}

export type ContactMail = {
  subject: string;
  replyTo: string;
  text: string;
  html: string;
};

/** Sends a contact form message to the office inbox (CONTACT_TO). */
export async function sendContactMail({ subject, replyTo, text, html }: ContactMail): Promise<void> {
  const { from, to } = mailEnv();
  await getTransporter().sendMail({ from, to, replyTo, subject, text, html });
}

/** Escapes text for the HTML version of an email. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
