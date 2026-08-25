import type { Topic } from "@/features/topics/topic";
import type { Locale } from "@/lib/locale/locale";

import { getLandingCopy } from "./get-landing-copy";
import { LandingFeatureRow } from "./landing-feature-row";
import { LandingFinalCta } from "./landing-final-cta";
import { LandingHero } from "./landing-hero";
import { LandingHowItWorks } from "./landing-how-it-works";
import { LandingTopicGrid } from "./landing-topic-grid";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

type LandingPageProps = {
  locale: Locale;
  topics: Topic[];
};

export function LandingPage({ locale, topics }: LandingPageProps) {
  const copy = getLandingCopy(locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "OmniAskAI",
    description: copy.meta.description,
    publisher: {
      "@type": "Organization",
      name: "OmniAskAI",
    },
  };

  return (
    <div className="landing-canvas">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader locale={locale} copy={copy} />
      <main id="main" tabIndex={-1} className="overflow-x-clip">
        <LandingHero copy={copy} />
        <LandingTopicGrid copy={copy} topics={topics} />
        <LandingFeatureRow copy={copy} />
        <LandingHowItWorks copy={copy} />
        <LandingFinalCta copy={copy} />
      </main>
      <SiteFooter footer={copy.footer} />
    </div>
  );
}
