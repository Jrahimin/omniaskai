# Topics

OmniAskAI is organized around **Topics** — curated knowledge worlds, not a generic chatbot. Each topic has its own identity, trusted sources, and later its own conversation workspace.

Phase 1A ships the **static catalog contract** so landing, workspace, and a future database can share one shape.

```text
Discover topic
   ↓
Enter knowledge workspace
   ↓
Ask / inspect citations
```

## Contract

A Topic is a **product** concept. An APE Project is a **knowledge/RAG** boundary. They stay separate. This module does not store APE ids yet.

```ts
type Topic = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  status: "published" | "draft";
  sortOrder: number;
};
```

Deferred on the **Topic type** itself: source stats, APE mapping, suggested questions. Landing presentation (artwork path, featured flag) lives beside the catalog and does not make Topic bilingual.

## Presentation (landing)

```text
src/features/topics/topic-presentation.ts
```

Slug → artwork path, `objectPosition`, `featured`. Display strings (titles, source counts, previews) stay in `src/features/landing/landing-language.ts`.

## Reads

```text
UI / route
   ↓
getPublishedTopics() | getTopicBySlug(slug)
   ↓
sample-topics.ts   →   later: database
```

| Helper | Behavior |
| --- | --- |
| `getPublishedTopics()` | `status === "published"`, ordered by `sortOrder` |
| `getTopicBySlug(slug)` | Exact slug match, or `undefined` |

Same function names stay when persistence moves to a database. No service or repository layer.

## Sample catalog

Four published topics match the approved concepts:

1. Income Tax (`income-tax`)
2. Literature (`literature`)
3. Bangladesh History (`bangladesh-history`)
4. Movies & Culture (`movies-culture`)

Draft topics are omitted from discovery.

## Files

```text
src/features/topics/
  topic.ts
  sample-topics.ts
  get-published-topics.ts
  get-topic-by-slug.ts
  topic-presentation.ts
  topic-page-language.ts
```

`/topics/[slug]` is a **minimal** destination (title, subtitle, back) so landing Explore does not 404. It is not the conversation workspace.

## Verification

- Typecheck covers the contract and helpers
- Four published topics; unknown slugs return `undefined` / not-found
- Landing uses presentation + landing copy; Topic stays lean
