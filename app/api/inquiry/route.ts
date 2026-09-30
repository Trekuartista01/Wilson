import { getDictionary } from "@/i18n/dictionaries";
import { getPublishedProperty } from "@/lib/server/catalog";
import { badRequest, route } from "@/lib/server/errors";
import { escapeHtml, sendContactMail } from "@/lib/server/mail";
import { rateLimit } from "@/lib/server/rate-limit";
import { clientKey, readJson } from "@/lib/server/request";
import { inquirySchema } from "@/lib/server/schemas";

/**
 * POST /api/inquiry — "Kërko informacion" from the contact card on a listing page, delivered
 * by email to CONTACT_TO. Validated server-side, rate limited per visitor (same budget as the
 * contact form), with a honeypot field for bots. Only published listings can be asked about.
 */
export const POST = route(async (request) => {
  await rateLimit({ scope: "inquiry", key: clientKey(request), limit: 5, windowSeconds: 15 * 60 });

  const input = await readJson(request, inquirySchema);

  // Honeypot filled in: answer like a success so the bot learns nothing, send nothing.
  if (input.website) return Response.json({ ok: true });

  const property = await getPublishedProperty(input.property);
  if (!property) throw badRequest("Unknown property.", "unknown_property");

  // Labels in Albanian: the office reads the inbox in Albanian whatever the site language.
  const labels = (await getDictionary("sq")).property.inquiry;
  const title = property.title.sq;

  const rows: [string, string][] = [
    ["Prona", title],
    [labels.reference, property.reference],
    [labels.name, input.name],
    [labels.phone, input.phone],
    ["Gjuha e faqes", input.locale.toUpperCase()],
  ];

  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${input.message}\n`;
  const html = `
    <table cellpadding="4" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
      ${rows.map(([k, v]) => `<tr><td style="color:#5c5c5c">${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join("")}
    </table>
    <p style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap">${escapeHtml(input.message)}</p>`;

  await sendContactMail({
    subject: `[Wilson] ${property.reference}: ${input.name}`,
    text,
    html,
  });

  return Response.json({ ok: true });
});
