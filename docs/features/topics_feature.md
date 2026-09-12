# Topics

OmniAskAI is organized around **Topics** — curated knowledge worlds, not a generic chatbot. Each topic has its own identity, trusted sources, and a conversation workspace at `/topics/[slug]`.

Public topics are loaded from **PostgreSQL**. A new topic can be imported and published without a source edit or rebuild.

```text
Discover published topic
   ↓
Enter knowledge workspace
   ↓
Ask / inspect citations
```

## Contract

A Topic is a **product** concept. An APE Project is a **knowledge/RAG** boundary. They stay separate. The public `Topic` projection never includes drafts or APE identifiers.

```ts
getPublishedTopics(locale): Promise<Topic[]>
getTopicBySlug(slug, locale): Promise<Topic | undefined>
```

Both return **live revisions only**. Database failures surface as an unavailable state. Unknown or unpublished slugs are 404.

English is required to publish. Missing Bangla strings fall back to English. Preview objects and starter-question arrays fall back as complete units.

## Publication

```text
Create → save draft → validate APE project → publish
```

Editing published content clones a new draft. Saving never mutates the live revision. Publish switches the complete revision and mapping atomically after a fresh APE project read. Unpublish clears the live pointer. `conversation_epoch` increments on unpublish or live-project change; content-only publication preserves continuation.

Ordering is a separate atomic operation with optimistic versions.

## Catalog command

```bash
npm run db:migrate
npm run db:seed
npm run catalog -- import <file.json> [--publish]
npm run catalog -- publish <slug>
npm run catalog -- unpublish <slug>
```

Seed is insert-if-missing. Existing records stay untouched, including publication state. Newly created topics stay drafts until an operator maps an APE project in Admin and publishes. Catalog JSON may still include `apeProjectId` for bulk import.

## Files

```text
src/features/topics/
  topic.ts
  topic-theme.ts
  topic-presentation.ts
  topic-validation-schema.ts
  topic-locale-fallback.ts
  get-published-topics.ts
  get-topic-by-slug.ts
  server/                 # catalog reads, operations, seed, import
drizzle/0001_phase2_product_foundation.sql
drizzle/0002_phase2_admin_feedback.sql
scripts/db-migrate.ts
scripts/db-seed.ts
scripts/catalog.ts
```

Missing artwork renders a gradient. Uploaded artwork is stored under `MEDIA_STORAGE_DIR` and served at `/media/[assetId]`. Operators manage topics in `/admin`.

## Verification

- Fresh migrate/seed; repeated seed neither duplicates, overwrites, nor republishes unpublished topics
- Seed does not attach APE projects from env; Admin save persists the mapping on the draft revision
- Fifth topic JSON import appears in discovery after publish
- Drafts stay private; publish/unpublish/order are atomic
- Slug uniqueness, cross-topic revision rejection, concurrent draft saves
- EN/BN fallback; optional artwork, preview, and knowledge-review date
