# Conversations

The topic **knowledge workspace**: ask, read a clear answer, see why to trust it, inspect a source when you want, continue. It is not a generic chatbot screen.

```text
published topic
 → user question
 → Next.js BFF
 → reserve conversation_reference / turn_operation
 → APE stream
 → persist turn state
 → editorial answer
 → source / citation proof
 → follow-up
```

History remains **page-session** in the browser. PostgreSQL stores only lightweight references needed for continuation safety.

## Live turn

The browser POSTs `{ question, continuationToken? }` to `/api/topics/[slug]/conversation-turns`. SSE event names stay `conversation` / `token` / `final` / `error`.

1. Resolve the published topic and APE mapping from PostgreSQL
2. Open a v2 token to a local `conversation_reference` (legacy v1 tokens are rejected)
3. Reserve the reference and a running operation **before** calling APE
4. Persist a newly created APE conversation id before the first message
5. Stream the answer; `final` may include a public `operationId`
6. Errors carry `{ retryable, code }` (`retryable` | `start_new` | `unavailable`)

APE project and conversation UUIDs never appear in public payloads. The sealed token contains the local conversation-reference ID, topic ID, and expiry.

Content-only publication preserves continuation. Remap or unpublish increments `conversation_epoch` and blocks the old token.

If PostgreSQL fails before APE, the turn is retryable and APE is not called. If final persistence fails, the answer is still delivered without `operationId`, continuation is blocked, and the failure is logged.

Expired running operations (beyond the 110s stream deadline) become `unknown` and block continuation. Concurrent running operations are rejected.

## Classification

| APE outcome | UI |
| --- | --- |
| `insufficient_evidence_reason` present | insufficient; no “Based on …” cue |
| `grounded === true` | grounded; “Based on N sources · M references” only when citations exist |
| otherwise | completed; never the “Based on …” cue, even if web citations exist |
| stream / upstream failure | bounded error; start a new conversation when the outcome is ambiguous |

Feedback is a page-session capability: `POST /api/conversation-turns/[operationId]/feedback` with `{ continuationToken, rating: "up" | "down" | null }`. The token’s conversation must own the completed operation. `null` removes the rating. Failed final persistence omits `operationId`, so those answers are not feedback-eligible.

Admin transcript inspection is on-demand from the captured APE project/conversation. Local references/feedback and APE transcripts have separate retention; no automatic deletion in Phase 2.

## Files

```text
src/features/conversations/
  conversation.ts
  conversation-session-reducer.ts
  conversation-stream-client.ts
  conversation-sse.ts
  get-topic-identity.ts
  get-topic-workspace.ts
  server/                    # APE client, v2 token, runner, persistence
src/app/api/topics/[slug]/conversation-turns/route.ts
```

## Verification

- Token v2 round-trip; reject v1, tamper, expiry, and topic mismatch
- Create failure is retryable; persist-created failure does not stream
- Ambiguous transport, malformed SSE, and interruption block continuation
- Concurrent running operations and expired running operations (expired commits unknown + blocked; late completion is rejected)
- Continuation rejects failed/unknown last operations even if the conversation is still open
- Reservation re-reads publication, mapping, and epoch under lock; a stale snapshot after unpublish/remap cannot start APE work
- Persist-created fails closed when the reference is already blocked
- Admin APE project/history reads use an 8-second deadline and surface unavailable on timeout
- Content-only publish preserves continuation; remap/unpublish invalidates it
- Network payloads contain no APE key, project id, or raw APE conversation id
