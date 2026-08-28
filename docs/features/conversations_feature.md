# Conversations

The topic **knowledge workspace**: ask, read a clear answer, see why to trust it, inspect a source when you want, continue. It is not a generic chatbot screen.

```text
topic context
 → user question
 → Next.js BFF
 → APE stream
 → editorial answer
 → source / citation proof
 → follow-up
```

Phase 1D streams real APE answers through a server-only BFF. No database, product auth, admin, or subscriptions.

## Loop

```text
I ask
 → I get a progressive answer
 → I can see why I should trust it when sources exist
 → I can inspect a source when I want
 → I can naturally continue in this page session
```

Trust wording stays human: **From sources** / **উৎসসহ**. Never “Verified”, RAG, or retrieval language. Citation chips highlight and scroll to the matching source card. Insufficient-evidence answers omit the cue.

## Live turn

```text
composer submit
 → pending
 → token text
 → final (buffered content + done evidence)
```

The browser POSTs `{ question, continuationToken? }` to `/api/topics/[slug]/conversation-turns`. The BFF:

1. Resolves Topic → APE Project on the server
2. Creates an APE conversation on the first turn
3. Returns a sealed continuation token (never a raw APE id)
4. Streams the APE message, accumulating tokens because `done` has no final text
5. Emits browser-safe `conversation`, `token`, `final`, or generic `error` events

Questions are sent to APE unchanged. Reply language is Auto only. APE Project `response_mode` owns retrieval/web search; there is no frontend search toggle.

## Classification

| APE outcome | UI |
| --- | --- |
| `insufficient_evidence_reason` present | insufficient, no “From sources” |
| `grounded === true` | grounded; “From sources” only when citations exist |
| otherwise | completed; never “From sources” |
| stream / upstream failure | generic error |

Completed answers include conversational replies and other non-grounded finals (`grounded=false`), even when web citations are present.

`source_provenance` is passed through as `knowledge | web | knowledge_and_web | none`. The UI does not infer origin from answer text.

## Sources

Evidence still lives on the **assistant turn**.

- Knowledge and web citations map into the existing source cards
- Web sources use the real `web_url` for **View source** and the URL hostname as the visible publisher/label
- Web search provider and retrieval timestamps stay off the source card
- Citation ids are scoped per completed answer so each APE snapshot keeps its own metadata
- Displayed answer text drops raw `[1]` / `[2]` markers; claim matching still uses the raw APE text
- Knowledge publisher/year/locator/href stay omitted when APE does not send them
- Claim chips appear only for an exact, unambiguous claim match with a valid `citation_index`
- **In this answer** = active turn’s `sourceIds`
- **Conversation sources** = union of assistant-turn sources in the current thread

## Client

One island owns drawers, rails, and a reducer/state machine for conversations, turns, operation id, continuation token, and pending/streaming/final/error. Token deltas are batched to one UI update per animation frame (or ~40ms). Stale stream events are ignored. Submit is disabled while a turn is open. There is no Stop control.

Retry is only for failures proven to be before APE accepted work (validation or create failure). After create-success/message-failure or an ambiguous transport failure, that local conversation is blocked from further submission and the user starts a new conversation rather than resending.

History is **page-session memory only**. Refresh loses the thread and token. Starter questions still come from topic workspace config.

## Route

`/topics/[slug]` loads the workspace. Unknown slugs call `notFound()`. `robots: noindex`. Locale from the same cookie as landing.

```text
src/features/conversations/
  conversation.ts
  conversation-session-reducer.ts
  conversation-stream-client.ts
  conversation-sse.ts
  server/                    # APE client, token, mapper, turn runner
src/features/topics/
  topic-ape-project-mapping.server.ts
src/app/api/topics/[slug]/conversation-turns/route.ts
```

Topic catalog stays lean. APE Project ids are env-mapped by Topic id, not stored on `Topic`.

## Layout

Unchanged from Phase 1C: history rail, compact topic band, conversation, sources. Composer language is Auto-only. Drawers under **~900px**.

## Phase 1 limits

- No persistence; APE may keep orphaned conversations
- Disconnect/abort is cleanup only and may not cancel committed APE work
- No automatic retry of message turns
- Generic stream errors only; failed APE HTTP calls log status and request/trace ids server-side
- No generated follow-ups
- Internal pilot protection is deployment-level (Cloudflare Access or equivalent), not product auth

## Verification

- `npm test` — SSE fragments, Bangla UTF-8, knowledge/web mapping, provenance, insufficient, conversational completion, stream failure, stale events, create-success/message-failure, token tamper
- `npm run lint`, `typecheck`, `build`
- Income Tax empty session: submit → tokens → sources; follow-up reuses the continuation token
- Conversational reply is not treated as insufficient
- `insufficient_evidence_reason` shows the insufficient state
- Desktop/mobile rails, citation flash, Enter to send, Escape on dialogs
- Network payloads contain no APE key, Project id, or raw APE conversation id
