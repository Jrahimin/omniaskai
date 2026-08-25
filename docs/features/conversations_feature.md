# Conversations

The topic **knowledge workspace**: ask, read a clear answer, see why to trust it, inspect a source when you want, continue. It is not a generic chatbot screen.

```text
topic context
 → user question
 → editorial answer
 → source / citation proof
 → follow-up
 → composer
```

Phase 1C is static. No APE, streaming, database, auth, or subscriptions.

## Loop

```text
I ask
 → I get a clear answer
 → I can see why I should trust it
 → I can inspect the source when I want
 → I can naturally continue
```

Trust wording is human: **From sources** / **উৎসসহ**, **5 sources** / **৫টি উৎস**, **In this answer** / **এই উত্তরের উৎস**. Never “Verified”, RAG, or retrieval language. Citation chips highlight and scroll to the matching source card (~180ms). Insufficient-evidence answers omit the cue.

## First-time guide

Quiet header hint plus a labelled **How to use this topic** control. The modal is the explanation; the hint is only a cue.

Placeholder shape (EN/BN copy + topic starters). Phase 2 can replace the provider without changing the UI:

```text
guide: shortHint, openLabel, title, intro, steps[], exampleQuestions[]
```

Resolved by `resolveWorkspaceGuide`. No Admin, DB, or API in 1C.

## Route

`/topics/[slug]` loads the workspace. Unknown slugs call `notFound()`. `robots: noindex`. Locale from the same cookie as landing.

## Data

Evidence lives on the **assistant turn**, not the conversation.

- `sourceIds` and `followUps` belong to each assistant answer
- `AnswerBlock` is UI presentation (`paragraph`, `heading`, `list`, `callout`, `formula`, `insufficient`) and may reference citation ids
- **In this answer** = active turn’s `sourceIds`
- **Conversation sources** = union of assistant-turn sources in the current thread
- Source count labels use the visible list (answer or conversation tab)

Fixtures: English tax (reference baseline), Bangla literature, Banglish history, Bangla film plus insufficient-evidence and error samples.

```text
src/features/conversations/
  conversation.ts
  conversation-language.ts
  conversation-guide.ts
  get-conversation-copy.ts
  get-topic-workspace.ts
  sample-workspaces/
  conversation-workspace.tsx
  conversation-workspace-island.tsx
  conversation-composer.tsx
  conversation-history-sidebar.tsx
  conversation-topic-header.tsx
  conversation-topic-guide-dialog.tsx
  conversation-thread.tsx
  conversation-assistant-answer.tsx
  conversation-source-panel.tsx
  conversation-icons.tsx
```

Topic catalog stays lean. Presentation mood/artwork comes from `topic-presentation.ts`. Product chrome is OmniAskAI violet; topic color is accent only. Fixture content stays mixed-language in both locales.

## Client boundary

The route loads topic, copy, and workspace payload. One client island owns selection, drawers, rail collapse, guide dialog, and the mock composer.

## Mock (1C only)

```text
select conversation
 → new conversation
 → submit
 → brief pending
 → one canned reply per topic
 → inspect citations
```

Follow-ups, starters, and guide examples fill the composer. No language detection, no keyword routing, no fake RAG.

## Layout

```text
history rail | compact topic band spanning remaining width
             | conversation | sources
```

Compact 3-column at **1024px**; rails widen at ~1280 / ~1440. Desktop collapse uses a **~68px** icon rail (logo, new, panel-open). Expanded uses panel-close. Tooltips: Collapse sidebar / Expand sidebar. **EN | বাং** in the topic header is the page locale (same control as landing). Composer **Auto / EN / বাং / Banglish** is the intended reply language only — mock 1C does not change the canned answer. Drawers under **~900px**.

Later-phase chrome (explore, Pro) is compact and disabled. Fake profile, theme, mic, and attach are omitted.

## Verification

- `npm run lint`, `typecheck`, `build`
- Income Tax at 1024, then ~1280 / ~1440 / tablet / ~375
- Collapse rail; citation → source flash; how-to-use dialog; mock loop
- Keyboard: history rows, chips, Enter to send, Escape on dialogs
- Unknown slug → branded not-found
