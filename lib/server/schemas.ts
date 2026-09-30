import "server-only";
import { z } from "zod";
import { locales } from "@/i18n/config";
import { propertyFeatures, propertyStatuses, propertyTypes, zones } from "@/data/properties";

/**
 * Server-side validation for everything the API accepts. Client-side checks are only UX;
 * these are the ones that count. Every object is strict: unknown keys are rejected.
 */

// Control characters out (keeps \n and \t in multi-line text), Unicode normalized, trimmed.
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const LINE_BREAKS = /[\r\n\t]+/g;

/** Single-line text: also collapses line breaks, so it's safe in e.g. an email subject. */
const line = (max: number) =>
  z
    .string()
    .transform((s) => s.normalize("NFC").replace(CONTROL, "").replace(LINE_BREAKS, " ").trim())
    .pipe(z.string().min(1).max(max));

/** Multi-line text (descriptions, messages). */
const text = (min: number, max: number) =>
  z
    .string()
    .transform((s) => s.normalize("NFC").replace(CONTROL, "").replace(/\r\n?/g, "\n").trim())
    .pipe(z.string().min(min).max(max));

const localeEnum = z.enum(locales);
const zoneSlugs = zones.map((z) => z.slug) as [string, ...string[]];

// ---------- Contact form ----------

export const contactSubjects = ["general", "buying", "selling", "investment"] as const;

export const contactSchema = z.strictObject({
  name: line(100),
  email: z.string().trim().max(254).pipe(z.email()),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[0-9+()\s.-]*$/, "Invalid phone number")
    .optional()
    .transform((v) => v || undefined),
  subject: z.enum(contactSubjects),
  message: text(10, 3000),
  consent: z.literal(true),
  locale: localeEnum,
  /** Honeypot: hidden from people, bots fill it in. Must be empty. */
  website: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

// ---------- Property enquiry (contact card on a listing page) ----------

export const inquirySchema = z.strictObject({
  /** Listing slug; the route checks it is a published listing. */
  property: z.string().regex(/^[a-z0-9-]{1,120}$/),
  name: line(100),
  phone: z
    .string()
    .trim()
    .min(6)
    .max(30)
    .regex(/^[0-9+()\s.-]+$/, "Invalid phone number"),
  message: text(1, 3000),
  locale: localeEnum,
  /** Honeypot: hidden from people, bots fill it in. Must be empty. */
  website: z.string().max(200).optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

// ---------- Admin login ----------

export const loginSchema = z.strictObject({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});

// ---------- Properties ----------

const translation = z.strictObject({
  title: line(160),
  description: text(0, 5000),
});

export const propertySchema = z.strictObject({
  /** All three languages are required (Albanian, English, German). */
  translations: z.strictObject({ sq: translation, en: translation, de: translation }),
  zone: z.enum(zoneSlugs),
  type: z.enum(propertyTypes),
  status: z.enum(propertyStatuses),
  areaSqm: z.number().positive().max(1_000_000_000),
  /** EUR; null means "price on request". */
  price: z.number().int().nonnegative().max(10_000_000_000).nullable(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  municipality: line(80),
  feature: z.enum(propertyFeatures),
  featured: z.boolean(),
  published: z.boolean(),
});

export type PropertyInput = z.infer<typeof propertySchema>;

/** PATCH: any subset of fields; a translations object may cover just some languages. */
export const propertyPatchSchema = propertySchema
  .extend({ translations: z.strictObject({ sq: translation, en: translation, de: translation }).partial() })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Nothing to update");

export type PropertyPatch = z.infer<typeof propertyPatchSchema>;

export const listQuerySchema = z.strictObject({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: line(100).optional(),
});

export const uuidSchema = z.uuid();

export const reorderImagesSchema = z.strictObject({
  order: z.array(z.uuid()).min(1).max(100),
});
