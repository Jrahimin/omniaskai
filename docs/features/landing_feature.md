# Landing

Public discovery page for OmniAskAI. Visitors should understand that this is **curated knowledge worlds**, not a generic chatbot, then enter a topic.

```text
Discover
   ↓
Browse published topics
   ↓
Explore → /topics/[slug]
```

The page is server-rendered from PostgreSQL. `dynamic = "force-dynamic"` so production builds do not query the catalog. An empty catalog and a database failure each have their own copy.

## Locale

`en` / `bn` via cookie `omniaskai_locale` (httpOnly, 1 year). The header **EN | বাং** control posts a Server Action; the first HTML response is locale-correct.

Topic card titles, descriptions, source descriptions, badges, and previews come from the published topic projection with EN/BN fallback. Chrome copy (header, hero, empty/unavailable) stays in `landing-language.ts`.

**SEO tradeoff:** one URL (`/`). Crawlers without the cookie mostly see English. URL prefixes / `hreflang` are later.

## Visual structure

Reference: `reference-concept-pages/omniaskai-landing-page.png` at **1024px**, then verify ~1280 / 1440 / tablet / ~375.

Topic cards use persisted theme presets and bundled artwork. Missing artwork renders a gradient. Preview answers stay framed as examples.

Auth / Pricing / About remain non-functional.

## Data

```text
getPublishedTopics(locale)
   + getTopicPresentation(topic)
   + landing chrome copy
```

## Files

```text
src/features/landing/
  landing-page.tsx
  landing-language.ts
  get-landing-copy.ts
  site-header.tsx
  landing-hero.tsx
  landing-topic-grid.tsx
  topic-knowledge-card.tsx
src/app/page.tsx
src/app/loading.tsx
```

## Verification

- Published cards, empty catalog, and unavailable catalog
- Locale switch + refresh keeps Bangla; `html lang` matches
- Explore opens the topic conversation workspace; unknown slug → not-found
- Optional artwork, preview, and knowledge-review date
- Auth / Pricing / About do not navigate
