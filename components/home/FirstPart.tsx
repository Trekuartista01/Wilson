import type { Dictionary } from "@/i18n/dictionaries";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";

/**
 * Homepage section 1: three trust highlights with an icon box (Figma "Hero", below the search).
 * TODO: brand icons. The gray squares are icon placeholders.
 */
export default function FirstPart({ dict }: { dict: Dictionary }) {
  return (
    <section className="py-14 sm:py-20 lg:py-24">
      <Container>
        <ul className="grid grid-cols-1 md:grid-cols-3">
          {dict.home.highlights.map((text, i) => (
            <Reveal
              as="li"
              key={text}
              delay={i * 0.1}
              className="flex items-center gap-5 border-line py-6 not-last:border-b md:border-b-0 md:py-4 md:not-first:pl-8 md:not-last:border-r md:not-last:pr-8 lg:not-first:pl-10 lg:not-last:pr-10"
            >
              <div aria-hidden className="size-12 shrink-0 bg-placeholder lg:size-14" />
              <p className="text-lg leading-snug font-medium">{text}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
