import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { siteConfig } from "@/lib/site";
import ContactForm from "@/components/contact/ContactForm";
import Map from "@/components/map/Map";
import Container from "@/components/ui/Container";
import PageBanner from "@/components/ui/PageBanner";

/**
 * Contact page: ContactForm + contact details + embedded Map of the office.
 * TODO: awaiting Figma. Neutral placeholder layout.
 */
export default function ContactPage({ dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.contactPage;

  return (
    <>
      <PageBanner eyebrow={t.eyebrow} title={t.title} intro={t.intro} />

      <Container className="grid gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16 lg:py-24">
        <section aria-labelledby="contact-form-title">
          <h2 id="contact-form-title" className="text-2xl font-medium sm:text-3xl">
            {t.formTitle}
          </h2>
          <div className="mt-6">
            <ContactForm labels={t.form} />
          </div>
        </section>

        <section aria-labelledby="contact-info-title" className="flex flex-col gap-6">
          <h2 id="contact-info-title" className="text-2xl font-medium sm:text-3xl">
            {t.infoTitle}
          </h2>
          <ul className="space-y-1">
            <li>
              <a href={siteConfig.phoneHref} className="inline-flex min-h-11 items-center gap-3 hover:underline">
                <FiPhone aria-hidden className="shrink-0" />
                {siteConfig.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${siteConfig.email}`} className="inline-flex min-h-11 items-center gap-3 break-all hover:underline">
                <FiMail aria-hidden className="shrink-0" />
                {siteConfig.email}
              </a>
            </li>
            <li className="flex gap-3 pt-2">
              <FiMapPin aria-hidden className="mt-1 shrink-0" />
              <address className="not-italic">
                {siteConfig.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </li>
          </ul>
          <Map
            label={t.mapLabel}
            loadingLabel={dict.map.loading}
            markers={[
              {
                id: "office",
                lat: siteConfig.officeLocation.lat,
                lng: siteConfig.officeLocation.lng,
                title: siteConfig.name,
                subtitle: siteConfig.address.join(" "),
              },
            ]}
            zoom={15}
            className="aspect-[4/3] rounded-lg lg:aspect-auto lg:min-h-80 lg:flex-1"
          />
        </section>
      </Container>
    </>
  );
}
