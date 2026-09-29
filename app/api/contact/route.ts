import { getDictionary } from "@/i18n/dictionaries";
import { route } from "@/lib/server/errors";
import { escapeHtml, sendContactMail } from "@/lib/server/mail";
import { rateLimit } from "@/lib/server/rate-limit";
import { clientKey, readJson } from "@/lib/server/request";
import { contactSchema } from "@/lib/server/schemas";

/**
 * POST /api/contact — contact form submissions, delivered by email to CONTACT_TO.
 * Validated server-side, rate limited per visitor, with a honeypot field for bots.
 */
export const POST = route(async (request) => {
  await rateLimit({ scope: "contact", key: clientKey(request), limit: 5, windowSeconds: 15 * 60 });

  const input = await readJson(request, contactSchema);

  // Honeypot filled in: answer like a success so the bot learns nothing, send nothing.
  if (input.website) return Response.json({ ok: true });

  // Subject labels in Albanian: the office reads the inbox in Albanian whatever the site language.
  const labels = (await getDictionary("sq")).contactPage.form;
  const subjectLabel = labels.subjects[input.subject];

  const rows: [string, string][] = [
    [labels.name, input.name],
    [labels.email, input.email],
    [labels.phone, input.phone ?? "-"],
    [labels.subject, subjectLabel],
    ["Gjuha e faqes", input.locale.toUpperCase()],
  ];

  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${input.message}\n`;
  const html = `
    <table cellpadding="4" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
      ${rows.map(([k, v]) => `<tr><td style="color:#5c5c5c">${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join("")}
    </table>
    <p style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap">${escapeHtml(input.message)}</p>`;

  await sendContactMail({
    subject: `[Wilson] ${subjectLabel}: ${input.name}`,
    replyTo: input.email,
    text,
    html,
  });

  return Response.json({ ok: true });
});
