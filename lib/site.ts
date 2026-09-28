// Site-wide contact details and links.
// TODO: confirm with client. Phone, email and address are copied from the Figma footer;
// social URLs are placeholders.

export const siteConfig = {
  name: "Wilson Real Estate",
  phone: "+355 68 326 1612",
  phoneHref: "tel:+355683261612",
  email: "info@wilsonrealestate.al",
  address: ["Rruga Pjetër Bogdani, nr. 351/8270,", "Bllok, Tiranë"],
  // Approximate coordinates for Blloku, Tirana. TODO: replace with the exact office pin.
  officeLocation: { lat: 41.3205, lng: 19.8195 },
  social: {
    instagram: "https://www.instagram.com/", // TODO: client Instagram URL
    facebook: "https://www.facebook.com/", // TODO: client Facebook URL
  },
} as const;

/** Nav items shared by Header and Footer. Keys map to dictionary `nav.*` labels. */
export const navItems = [
  { key: "home", href: "/" },
  { key: "properties", href: "/properties" },
  { key: "services", href: "/services" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const;

export type NavKey = (typeof navItems)[number]["key"];
