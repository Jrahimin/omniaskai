# Landing

Public discovery page for OmniAskAI. Visitors should understand that this is **curated knowledge worlds**, not a generic chatbot, then enter a topic.

```text
Discover
   ↓
Browse topics
   ↓
Explore → /topics/[slug]
```

Phase 1B is static: no auth, billing, admin, database, or APE.

## Locale

`en` / `bn` via cookie `omniaskai_locale` (httpOnly, 1 year). The header **EN | বাং** control posts a Server Action; the first HTML response is locale-correct.

```text
src/lib/locale/          type, cookie read, setLocale, switch UI
src/features/landing/
  landing-language.ts    all landing display and aria copy
```

Components receive resolved `copy`. `Topic` is not bilingual. Card titles, subtitles, source counts, and Explore labels live in `landing-language.ts`. Preview Q/A stay the same in both locales (mixed English / Bangla / Banglish, as in the concept).

**SEO tradeoff:** one URL (`/`). Crawlers without the cookie mostly see English. URL prefixes / `hreflang` are later.

## Visual structure

Reference: `reference-concept-pages/omniaskai-landing-page.png` at **1024px**, then verify ~1280 / 1440 / tablet / ~375.

| Section | Notes |
| --- | --- |
| Canvas | One near-white page with flowing blue/violet/teal/warm haze. No full-width colored slabs. |
| Width | Hero, topic grid, and final CTA use `.landing-wide` (~1344px). |
| Header | Sticky, airy. Compact menu below 1024. Pricing / About / auth are non-functional (not `href="#"`). Language switch is a segmented control with a sliding pill. |
| Hero | Compact rectangular band (~600px at 1280). Copy stays readable; artwork stays dominant. Bangla headline is slightly smaller. Topics should peek on a normal desktop viewport. |
| Topics | Strongest visual band. The whole card is the link (`cursor: pointer`). Explore is a glass direction cue, not a nested button. |
| Features | Compact four-column transition, not a large isolated strip. |
| How it works | Soft raised panel (shadow, no outline). Product-level promise; tax is one labelled example. Same idea for literature, history, films. |
| Closing CTA | Portal invitation, blended into the same canvas. |
| Footer | Tagline plus `© 2026 Junayed Rahimin ↗` (external link, new tab, pointer + hover). |

Assets: `public/brand/`, `public/landing/`, `public/topics/`.

## Data

```text
getPublishedTopics()
   + getTopicPresentation(topic)   artwork, mood, featured
   + landing copy.topics.cards[slug]
```

## Files

```text
src/features/landing/
  landing-page.tsx
  landing-language.ts
  get-landing-copy.ts
  site-header.tsx
  landing-hero.tsx
  landing-hero-visual.tsx
  landing-topic-grid.tsx
  topic-knowledge-card.tsx
  landing-feature-row.tsx
  landing-how-it-works.tsx
  landing-final-cta.tsx
  site-footer.tsx
  landing-icons.tsx
```

## Verification

- `npm run lint`, `typecheck`, `build`
- Browser at 1024 (primary), plus ~1280 / ~1440 / ~375
- Locale switch + refresh keeps Bangla; `html lang` matches
- Explore opens the topic conversation workspace; unknown slug → not-found
- Auth / Pricing / About do not navigate
