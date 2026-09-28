import Container from "./Container";

type PageBannerProps = {
  eyebrow: string;
  title: string;
  intro?: string;
};

/**
 * Top-of-page Banner for inner pages.
 * TODO: awaiting Figma. Neutral placeholder that continues the dark header like the home Banner.
 */
export default function PageBanner({ eyebrow, title, intro }: PageBannerProps) {
  return (
    <section className="bg-brand-dark text-surface">
      <Container className="pt-10 pb-14 sm:pt-14 sm:pb-20 lg:pt-20 lg:pb-24">
        <p className="text-base font-light sm:text-lg">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {intro && <p className="mt-4 max-w-2xl text-base text-surface/75 sm:text-lg">{intro}</p>}
      </Container>
    </section>
  );
}
