# Phase 2 — Dynamic Product + Administration

## Scope adjustment

Keep the agreed architecture and exactly two implementation steps. Reduce Product Operations to:

- Lightweight conversation and turn references.
- Persisted helpful/not-helpful feedback.
- A basic Admin conversation list and on-demand APE transcript inspection.
- Existing server-side failure logging.

Defer usage dashboards, latency reporting, diagnostic screens, global pause/resume, audit-log infrastructure, scheduled maintenance, automated retention cleanup, and account-management tooling beyond the requested Admin bootstrap command.

Keep failure handling necessary for safe conversation execution; it is part of integration correctness, not a separate operations feature.

## Verified foundation and unchanged architecture

The repository uses Next.js 16.3.2, React 19.2.8, App Router, React Compiler, and a focused conversation client island. There is no database or product authentication yet.

Dynamic topics require replacing more than the sample catalog: landing copy, workspace identity, artwork, starter questions, and route guards all contain four-topic assumptions. Existing topic read functions and conversation gateway/runner/mapper boundaries remain useful.

The browser currently holds page-session conversations and encrypted continuation tokens. Tokens bind to a topic but not its APE mapping. Feedback is local state. APE already stores conversations and provides message-history reads.

The reviewed baseline passes 56 tests, lint, and typecheck. Preserve existing uncommitted changes.

| Area | Unchanged decision |
|---|---|
| Application | One feature-oriented Next.js full-stack application; Server Components for reads, small client boundaries for interaction. |
| Database | PostgreSQL, Drizzle ORM, and `pg`; explicit transactions and reviewed SQL migrations. |
| Deployment | Portable Node deployment, PostgreSQL, and a persistent media directory. Retain Node 22 from CI. |
| Admin | Custom `/admin` interface using existing React/Tailwind patterns and Server Actions. |
| Authentication | Better Auth email/password with database sessions; command-created Superadmin accounts. |
| Publication | Separate editable draft and immutable published revisions; atomic publication. |
| Localization | Required English with optional Bangla overrides; existing locale cookie remains. |
| Caching | Fresh database reads with request-scoped deduplication. No shared topic cache initially. |
| Artwork | Bundled assets plus authenticated upload to persistent filesystem storage. |
| APE boundary | OmniAskAI owns product configuration and mappings. APE owns projects, knowledge lifecycle, AI policy, and execution. |

**Persistent:** topic identity/content/presentation, revisions, mappings, artwork metadata, Admin accounts/sessions, lightweight conversation/turn references, and feedback.

**Code-owned:** global marketing/interface copy, supported locales, theme definitions, layout, icons, validation rules, and conversation behavior.

**Environment-owned:** connection strings, origins, storage directory, credentials, and encryption secrets.

## Domain model and behavior

### Schema

| Model | Required contents |
|---|---|
| `topic` | Stable string ID, unique slug, sort order, draft/live revision pointers, first-publication time, conversation epoch, optimistic-lock version, timestamps. Preserve existing topic IDs. |
| `topic_revision` | UUID, topic ID, revision number, theme key, optional artwork reference, focal position, optional knowledge-review date, publication time, timestamps. |
| `topic_revision_translation` | Key `(revision_id, locale)`; title, landing description, workspace subtitle, about/source descriptions, optional badge, artwork alt text, composer placeholder, optional Explore-label override, optional preview Q/A/source labels, ordered starter questions. |
| `topic_knowledge_mapping` | One mapping per revision, containing the APE project UUID and last validation result/time. |
| `media_asset` | UUID, bundled/uploaded storage kind, unique storage key, MIME type, dimensions, size, creation time. |
| `conversation_reference` | UUID, topic ID, starting published revision, captured APE project/conversation IDs, captured conversation epoch, execution state, creation/last-activity times. |
| `conversation_turn_operation` | UUID, conversation reference, sequence, running/terminal state, result classification, optional APE assistant-message ID, start/finish times. No question, answer, citation snapshot, or analytics measurements. |
| `answer_feedback` | One rating per completed operation: `up` or `down`, with timestamps. |
| Authentication tables | Better Auth user/account/session/verification and database rate-limit tables, including its Admin role fields. |

Do not introduce application-settings or audit-event tables in Phase 2: their proposed operational features are deferred.

### Constraints and indexes

- Use UTC timestamps and application-generated identifiers.
- Slugs are lowercase ASCII hyphenated words, maximum 80 characters; editable before first publication and immutable afterward.
- Publication status derives from the live revision pointer.
- Composite foreign keys ensure draft/live revisions belong to their topic. Draft and live pointers cannot reference the same revision.
- Published revisions are immutable; revision numbers are unique per topic.
- Exactly one APE project per published revision. Multiple topics may intentionally share a project.
- APE identifiers are external references, never foreign keys into APE’s database.
- Index published ordering, revision relationships, conversation `(topic_id, last_activity_at)`, and operation `(conversation_id, sequence)`.
- Enforce unique non-null APE project/conversation pairs, one running operation per conversation, and one feedback row per operation.
- No topic deletion UI. Unpublish while retaining revisions and references.

### Content and presentation

- Explicit columns hold independently editable translated text. Small ordered structures use validated JSONB arrays, not unrestricted configuration JSON.
- Publish requires English title, landing/workspace descriptions, about/source descriptions, and 1–10 starter questions. Drafts may be incomplete.
- Missing Bangla fields fall back to English. Preview objects and starter-question arrays fall back as complete units.
- Preserve existing mixed English/Bangla/Banglish starter questions.
- Replace sample source totals with editable source descriptions. Show a knowledge-review date only when explicitly supplied.
- Keep preview answers visibly framed as examples.
- Persist theme selection, not CSS. Reuse the four existing visual moods as presets.
- Missing artwork renders a neutral gradient.
- Remove unused `featured`/collection-count data and disabled topic-tool shortcuts; do not build their future functionality.

### Topic reads and publication

Retain the read names with asynchronous public contracts:

```ts
getPublishedTopics(locale: Locale): Promise<Topic[]>
getTopicBySlug(slug: string, locale: Locale): Promise<Topic | undefined>
```

`Topic` is an explicit public projection of identity, resolved content, presentation, and workspace configuration. It excludes drafts and APE identifiers.

- Both reads return published content only. Admin uses separate protected reads.
- Presentation and workspace helpers become pure projections, eliminating slug maps.
- Remove `generateStaticParams()` and four-slug guards. Resolve topics at request time.
- Unknown/unpublished topics return 404. Database failures produce an unavailable response.
- Preserve server-rendered discovery, cookie localization, and workspace `noindex`.

Publication workflow:

```text
Create → save draft → preview → select/check APE project → publish
```

- Editing published content creates a separate draft; saving never changes the live revision.
- Preview uses the real card/workspace components behind Admin authentication, with conversation submission disabled.
- Select an existing APE project through paginated organization-scoped reads, or enter its UUID and validate it.
- Publish performs a fresh project read and rejects inaccessible, inactive, deleted, or missing projects.
- Project validation checks access/activity, not answer quality. Knowledge management stays in APE.
- Validate APE before the short publication transaction; recheck the topic version inside that transaction.
- Publish switches the complete revision and mapping atomically.
- Unpublish clears the live pointer.
- Increment `conversation_epoch` on unpublish or live-project change. Content-only publication preserves compatible conversations.
- Ordering is a separate atomic operation with deterministic ID tie-breaking and concurrency checks.

### Lightweight conversations, feedback, and inspection

Preserve the request body `{ question, continuationToken? }` and existing SSE event names.

- Version tokens to contain the local conversation-reference ID, topic ID, and expiry. Resolve APE identifiers from PostgreSQL.
- Reject legacy tokens at cutover with a safe “start a new conversation” result.
- Before APE work, validate publication, token ownership, captured project, epoch, and conversation state.
- Reserve the reference/operation first; persist a newly created APE conversation ID before sending its first message.
- Add persistence lifecycle hooks to the existing runner. No per-token database writes or transactions spanning APE calls.
- Record only state required for safe continuation, feedback association, and basic inspection.
- Add optional public `operationId` to final payloads. Keep APE identifiers server-only.
- Return explicit bounded error codes/retryability; do not classify every HTTP error as retryable.
- Never automatically replay messages. Ambiguous failures or interruption prevent continuation.
- Enforce a streaming deadline below the existing 120-second budget. On a later access, treat an expired running operation as unknown and block continuation; no scheduler is needed.
- If PostgreSQL fails before execution, do not call APE. If final persistence fails, deliver the generated answer without feedback eligibility, log the failure, and block continuation.
- Already-dispatched APE work may finish after unpublication.

Feedback endpoint:

```text
POST /api/conversation-turns/[operationId]/feedback
{ continuationToken, rating: "up" | "down" | null }
```

Verify that the token’s conversation owns the completed operation. Upsert the rating; `null` removes it. Feedback remains a page-session capability, not unique-user voting.

Admin inspection provides:

- A paginated conversation list with topic, creation/last-activity time, and basic state.
- A topic filter.
- On-demand APE transcript reads using the reference’s captured project/conversation.
- Feedback alongside the matching APE assistant message.
- An explicit unavailable state if APE cannot return the transcript.

There are no usage charts, operational summaries, diagnostic controls, or separate feedback-management workflow.

## Step 1 — Persistent, fully dynamic product foundation

**Deployable outcome:** public topics run entirely from PostgreSQL; a new topic can be introduced without rebuilding; conversation execution creates lightweight durable references.

### Implementation

- Add Drizzle, `pg`, Zod, and script tooling; preserve the npm/CI workflow.
- Implement topic/revision/mapping/media-metadata and conversation-reference/operation tables with reviewed migrations.
- Add a bounded database pool, server-only access, and environment validation.
- Implement draft/save/publish/unpublish/reorder operations with transactions and optimistic concurrency.
- Extend the APE client with validated project list/detail reads.
- Extract current catalog, translations, artwork selections, and questions into a versioned seed fixture.
- Replace all runtime static-topic lookups with asynchronous public projections.
- Implement loading, empty, unavailable, and unpublished-topic behavior.
- Introduce mapping-safe tokens and minimal conversation lifecycle persistence.
- Provide a narrow local catalog command for validated JSON import and publication/unpublication, calling the same business operations the later Admin uses. Do not build a second management interface.
- Update CI with PostgreSQL integration testing and revise the existing feature/context documentation.

### Acceptance

- Fresh migration/seed works; repeated seed neither duplicates nor overwrites edited records.
- A fifth topic appears and supports conversation without a source edit or rebuild.
- Draft changes remain private; publish/unpublish/order work atomically.
- Test slug uniqueness, cross-topic revision rejection, and concurrent edits against PostgreSQL.
- EN/BN fallback and optional artwork/preview/date fields render correctly.
- Content-only publication preserves continuation; remap/unpublish invalidates it.
- Test upstream creation failures, ambiguous transport failures, concurrent submissions, malformed SSE, interruption, and persistence failures.
- No APE credentials or raw project/conversation IDs reach public payloads.
- Existing/new tests, lint, typecheck, and production build pass.
- Verify public desktop/mobile journeys. Build performs no live APE calls or catalog queries.

Step 1 does not depend on authentication, uploads, feedback, or inspection UI. It remains deployable behind the existing pilot protection using bundled artwork and the local catalog command.

## Step 2 — Internal Admin, artwork, feedback, and basic inspection

**Deployable outcome:** an operator can create an Admin account, manage and publish topics through the UI, upload artwork, capture feedback, and inspect conversations.

### Implementation

- Add Better Auth database sessions and its Admin plugin. The stored `admin` role represents the sole Superadmin capability.
- Provide the requested bootstrap command:

  ```text
  npm run admin:create -- --email <email> --password <password>
  ```

  Support hidden password input when omitted. Use library account creation/password hashing, never print secrets, and never silently overwrite an account.

- Expose login/logout/session endpoints only; disable public signup and unused management endpoints.
- Check a fresh session/current role inside every protected read, action, upload, and transcript operation.
- Use secure HttpOnly SameSite cookies, eight-hour sessions, trusted origins, generic login errors, and database-backed login throttling.
- Build two Admin areas: **Topics** and **Conversations**.
- Topic editing includes English/Bangla fields, draft state, upload/selection, preview, project selection/checking, ordering, publish, and unpublish.
- Show concurrency conflicts without discarding entered content.
- Add feedback persistence to existing answer controls, including pending/error handling and removal.
- Add the basic conversation list/detail inspection described above.

Artwork upload:

- Accept JPEG/PNG/WebP, maximum 5 MB and 20 megapixels.
- Validate/decode and re-encode as WebP with `sharp`; reject invalid or animated input and remove metadata.
- Store generated immutable filenames under `MEDIA_STORAGE_DIR`, outside release files.
- Serve through `/media/[assetId]` with correct MIME type, `nosniff`, and immutable caching.
- Write the completed file before inserting its metadata. Restrict paths to server-generated keys.
- Keep bundled assets in `public/`; uploaded assets survive restarts and deployments.
- No media library, deletion UI, upload cleanup scheduler, or storage-provider abstraction.

### Acceptance

- Bootstrap, login, logout, expiry, role/session revocation, throttling, and unauthorized direct requests are tested.
- Signup and unused account-management HTTP endpoints remain unavailable.
- Complete UI journey: create → edit → upload → preview → map → publish → discover → ask → feedback → inspect → unpublish.
- New topics require no source changes, mapping environment variables, or rebuild.
- Test preview isolation, unavailable projects, and conflicting edits.
- Test invalid/oversized images, traversal attempts, storage failures, and image availability after production restart.
- Test feedback ownership, tampered/expired tokens, repeated submissions, changes/removal, and Admin visibility.
- Inspection uses the original captured project after remapping and handles APE failures without exposing raw errors.
- Full CI and desktop/mobile public regression checks pass.

Step 2 uses additive migrations. Rolling back its application release leaves Step 1’s persisted topic experience usable.

## Deployment, files, and rollback

### Expected changes

- Existing topic, landing, and conversation feature modules: persistent projections, dynamic routing, lifecycle hooks, and feedback.
- App routes: updated discovery/workspace/BFF plus Admin, auth, upload, media, and feedback.
- New database/auth/media utilities, migrations, seed/bootstrap commands, integration tests, and browser E2E tests.
- Package configuration, CI, `.env.example`, README, roadmap, context/architecture rules, and feature docs.

### Migration and deployment

- Use a separate OmniAskAI PostgreSQL database/role. Never access APE tables.
- Apply reviewed migrations explicitly during deployment, not application startup.
- Configure database/auth/APE secrets, `APP_ORIGIN`, and `MEDIA_STORAGE_DIR`.
- Import legacy topic-mapping environment variables during bootstrap only; remove runtime dependence on them.
- Seed all four existing topics with stable IDs/slugs. Publish only complete topics with validated mappings; report others as drafts.
- Seed is insert-if-missing and detects conflicts. It does not overwrite operator content.
- Keep Phase 2 behind existing pilot protection; Admin authentication is not a public-launch mechanism.
- Configure HTTPS, trusted proxy headers, upload limits, and unbuffered SSE.
- Mount and back up the media directory independently of app releases. Default to one Node instance; additional instances require shared media.
- Public topic reads remain uncached across requests. Refresh/revalidate affected routes after Admin actions; private/APE reads remain `no-store`.

### Minimum recovery provisions

- Document database and media backup/restore procedures; verify restoration during deployment acceptance.
- Retain published revisions so previous content can be copied into a draft and republished after validation.
- Keep existing sanitized server-side APE failure logging. Do not introduce a diagnostic database or dashboard.
- Do not add automatic data deletion in Phase 2. Document that local references/feedback and APE transcripts have separate retention; confirm a retention policy before a broader public launch.
- If Step 2 is rolled back, disable its routes and retain its tables; Step 1 continues working.
- Returning to Phase 1 requires pilot maintenance and restoration of the old static configuration; it cannot represent newly created topics.
- Token-version/key changes require fresh conversations. Never replay uncertain upstream work during recovery.

## Deferred scope and risks

**Explicitly deferred:** usage/latency dashboards, failure-monitoring screens, global pause controls, audit-log infrastructure, scheduled cleanup, automated retention/purging, account-management UI/recovery tooling, media-library management, public users/history, quotas, subscriptions, advanced analytics, generated follow-ups, topic-specific tools, expanded SEO/localized routes, distributed caching, and APE knowledge administration.

**Remaining risks:**

- Live APE OpenAPI was unreachable during review. Validate project/history reads in staging against the bundled documented contract before deployment.
- PostgreSQL and APE cannot share a transaction. Unknown outcomes and occasional upstream orphans remain possible; continuation safety must not depend on automatic reconciliation.
- Transcript inspection depends on APE availability and retention.
- Filesystem uploads require durable storage.
- Fresh database reads intentionally prioritize immediate publication consistency; introduce caching only after measured need.

The architecture remains unchanged. Operational scope is limited to what supports configuring topics, collecting feedback, and inspecting individual conversations.
