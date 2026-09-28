# OmniAskAI UI/UX follow-up review

**Compared with:** [the first review](ui-ux-review-2026-09-28.md)  
**Pages:** local landing page and Income Tax topic  
**Method:** browser walkthrough at 390 × 844, 900 × 720, the native 1106 × 676, and 1440 × 900 CSS-pixel viewports; a live Income Tax question; read-only inspection of relevant components and styles. No application code was changed.

## Verdict

The update improves the product story and several important interactions. It is not a page-wide CSS failure: at the measured widths the document did not overflow horizontally, and the browser reported no console errors. The layout does, however, lose visual balance at specific points. The landing hero now hides most of its distinctive artwork behind a generic example card; **large white example panels dominate the topic cards and conceal the subject artwork**; the two-column hero starts too early at 900 pixels; the topic's empty state leaves a large unused area while the composer remains docked far below the starters; and the source rail vanishes on a common 1106-pixel laptop viewport. These are the clearest reasons the revision can feel broken.

The most urgent product issue is still **evidence quality**. A tested answer produced a readable source title and an inline citation, which is progress, but the excerpt still displayed “Published: 1.1 years ago” as search-style metadata and ended mid-sentence. The landing example says “sourced answer” while its “selected tax note” expands to explanatory placeholder copy, not a real cited passage. Those details weaken the trust promise at exactly the moment the user tries to verify it.

## What got better

| Earlier review concern | Current result |
|---|---|
| The value proposition arrived too late | The hero now says “Local questions. Clear answers. Sources you can open.” The header offers one working **Try Income Tax** action. |
| Header and closing CTA had disabled account actions | Those prominent dead ends are gone. |
| Unsupported claim that general AI cannot open these files | Replaced by a calmer explanation of answers, passages, and follow-ups. |
| Coverage and review date were ambiguous | A new coverage section clarifies that a review date is not the law's effective year, and the topic labels it “Editorial review.” |
| History appeared durable but vanished on reload | The UI now tells visitors that conversations are temporary. The underlying retention limitation remains. |
| Generic topic empty state | The Income Tax page has an outcome-led introduction, three labeled starters, and a coverage disclosure. |
| Calculation starter overpromised | The starters now focus on explaining salary income, filing context, and a rule. |
| Loading disabled composition | The composer accepts a draft while an answer is pending, and a **Stop** control appears. Delayed loading now offers a clearer message. |
| Source names and counts looked broken | A tested source showed “Regular e-Return,” an inline “Source 1” label, and correct singular “1 source · 1 reference.” |
| “All sources” implied the topic library | Renamed **Conversation sources**. |
| Bangla mode left English previews unexplained | The Income Tax and History cards now label their retained previews “Example · English.” |
| Language update looked disconnected | A visible “Updating language” state now appears during the switch. |

The first live answer attempt was still slow enough to show the delayed-state message. A subsequent answer completed and produced an inline citation and a government-domain source. I did not establish production latency or legal correctness. The live response used a different question after an interaction race around Stop, so this follow-up does not claim that Stop or answer continuity is fully verified.

## What makes the UI feel broken, and how to fix it

### 1. The hero visual loses its identity

At 1440 and 1106 pixels the original four-topic illustration is reduced to a short cropped banner behind a large white mock-answer card. At 900 pixels, the two columns squeeze the headline and example. On a 390-pixel screen, the headline, paragraph, two CTAs, and three proof bullets push the demonstration below the first screen.

**Cause in the current UI:** [landing-hero.tsx](../src/features/landing/landing-hero.tsx) switches to two columns at 900 pixels. [landing-hero-visual.tsx](../src/features/landing/landing-hero-visual.tsx) limits the artwork to a 112-pixel strip below 1280 pixels and places a large card over it.

**Fix:** Start the two-column hero around 1100–1200 pixels, after checking the actual content width. At narrower widths, use one column. At large widths, retain more of the illustration as a visible identity cue and put a smaller answer card beside or partly over it. On phones, show the first concrete result sooner: shorten the body and proof list or move the proof list below the example. Keep a single primary CTA above the fold.

**Acceptance check:** At 900 pixels, the headline and demonstration read at a comfortable measure. At 390 pixels, the visitor sees the topic action and at least the start of the demonstrated answer without scrolling through three repeated claims.

### 2. The topic cards bury their best visual asset

The earlier cards made Income Tax, History, Literature, and Movies & Culture feel like distinct places to enter. The revised cards still load those images, but a solid white answer panel occupies much of each card's lower half. At desktop width it competes with the image; at mobile width it becomes the main visual block. The result is a series of similar white text panels with artwork behind them, instead of four memorable topic worlds. The preview answer is also clipped to two lines, so the panel does not deliver enough extra meaning to justify how much image it covers.

**Cause:** [topic-knowledge-card.tsx](../src/features/landing/topic-knowledge-card.tsx) renders a full-bleed image, then places a full-width `bg-white p-4` preview card over its lower portion. The image is present but visually subordinate. A whole-card dark scrim also dulls the artwork, and `object-cover` can crop the subject's focal point at different widths.

**Fix:** Restore an image-led composition using the existing assets. Let roughly the upper two-thirds of each card show the image clearly, with the topic title and short benefit over a restrained gradient in a low-detail area. Put the example question in a **compact bottom strip or small inset chip**, rather than a full-width answer card. The answer preview can appear in a lightweight reveal on focus/hover at desktop sizes, but the question, benefit, and **Explore [topic]** action must remain visible without hover on touch devices. If an answer preview is essential, cap it at one concise line or use a split layout where the image keeps at least half the card. Avoid glass blur and heavy shadows that obscure the artwork. Tune `objectPosition` for each topic at desktop and mobile crops; do not solve legibility by darkening the entire image.

**Acceptance check:** At 1440, 900, and 390 pixels, a visitor can identify each topic from its image at a glance. The title, one-sentence benefit, and explicit action remain readable against the chosen crop. The sample question supports the image rather than covering it, and keyboard focus reveals the same information as hover.

### 3. The topic's initial composer is visually disconnected

At 1440 pixels, the three starters and coverage disclosure occupy the top half of the center pane while the composer sits near the bottom of the 900-pixel viewport. That leaves a large empty band and makes the next action feel detached. The same structure causes coverage details to extend beneath the fixed dock on mobile, although the center pane can scroll.

**Cause:** [conversation-thread.tsx](../src/features/conversations/conversation-thread.tsx) renders the opening, while [conversation-workspace-island.tsx](../src/features/conversations/conversation-workspace-island.tsx) always calls `renderComposer(false)` in the dock. There is styling for an embedded composer, but it is not used in the opening layout.

**Fix:** Place the composer directly below the starters in the empty state. Once a message is submitted, move it to the bottom dock. Keep one composer instance in each state, preserving its text and focus during the transition. If a fixed composer is retained for simplicity, vertically balance the opening and reduce the gap to the composer. Add enough bottom scroll padding so the expanded coverage text is not obscured on mobile.

**Acceptance check:** A first-time visitor can choose a starter, edit it, and send it without visually searching for the input. The final line of expanded coverage remains visible above the composer at 390 pixels.

### 4. The source rail disappears too early

The earlier review saw the three-column research workspace at the native 1106-pixel browser width. The revision hides the source rail at widths of 1179 pixels and below. At 1106, only a **Browse sources** button remains, even though source inspection is the key differentiator.

**Cause:** the `@media (max-width: 1179px)` rule in [globals.css](../src/app/globals.css) hides `.workspace-sources-rail`.

**Fix:** Tune pane widths using actual reading constraints rather than a single broad breakpoint. Around 1000–1180 pixels, collapse or slim the history sidebar first and preserve a narrower evidence rail, or add a persistent selected-source peek beside the answer. Keep the drawer approach for genuinely narrow layouts. If sources stay hidden, make the citation-to-source action obvious in the answer itself.

**Acceptance check:** At 1106 pixels, a user can read the answer and inspect its cited passage without losing context or hunting for a separate “Browse” button.

### 5. “Browse sources” opens an empty conversation panel

Before the first answer, **Browse sources** opens a panel that says sources will appear after the first answer. This is technically consistent with the panel's data, but the label promises a library of the topic's material.

**Fix:** Label this action **Answer sources** or **Sources for this conversation** and show it only after an answer exists. If pre-question source discovery is important, build a separate topic-library view with actual document names, coverage, dates, and known gaps. The current `What this topic covers` disclosure is a useful start but does not show the documents.

**Acceptance check:** Every visible source action leads to the collection its label names.

### 6. The landing proof is still illustrative, not evidentiary

The hero's “See a sourced answer” CTA targets an example that is already partly visible at desktop size. Expanding **Selected tax note** reveals copy explaining how a source *would* appear; it is not a passage from a named document. The how-it-works panel similarly uses a textual stand-in for the cited passage.

**Fix:** Use one approved, real, short source excerpt with its document title and year, and link to the original. If editorial review of a specific excerpt is not ready, rename the CTA **See how answers work** and label the example prominently as a product illustration. The stronger business option is a verified live demonstration, not two layers of mock evidence.

**Acceptance check:** A visitor can distinguish a real citation from an illustration without reading the small print.

### 7. Source cleanup is only partial

The new presentation helper removes raw citation tokens and falls back from unreadable titles. The tested answer displayed a meaningful title and a usable external destination. Its excerpt still began with relative publication metadata and stopped mid-sentence. A relative age such as “1.1 years ago” will also age poorly in a legal/tax product.

**Cause:** [present-conversation-source.ts](../src/features/conversations/present-conversation-source.ts) strips internal citation tokens but leaves search-result wrapper text. [conversation-source-panel.tsx](../src/features/conversations/conversation-source-panel.tsx) renders the remaining string as the passage.

**Fix:** Parse and store publisher, publication date, version, locator, and passage separately at ingestion. Render an absolute date where verified. Show a complete sentence or an explicit ellipsis if the excerpt is truncated. If extraction cannot yield a clean passage, show the document title and a “Open original” action instead of a broken quote. Distinguish **document publication**, **effective tax year**, **collection refresh**, and **editorial review**.

**Acceptance check:** No search or crawl metadata appears in the passage area, and no excerpt ends mid-word or implies more precision than the source provides.

### 8. The topic promise remains broader than verified coverage

The opening asks users to tell the product the year and situation, but there is no year control or visible supported-year range. The coverage disclosure lists document types and an editorial review date, not the actual years or editions present. This matters most for Income Tax.

**Fix:** Show a verified **“Sources currently cover …”** line populated from the catalog. When a year materially changes the answer, ask one clarifying question and display the chosen year as an editable chip. If the catalog cannot confirm coverage, say **“Year coverage not verified”** and avoid implying that the answer applies to the user's year. Do not infer supported years from the editorial review date.

**Acceptance check:** The user can tell whether the relevant year is supported before relying on an answer.

### 9. The current page is still weak as a returnable product

The truthful temporary-history disclosure fixes the earlier misleading impression. It does not create a reason or a way to return. The left history column is mostly blank for new visitors and consumes space that could show scope or evidence. There is also no concrete paid outcome or working upgrade path, which is reasonable during early development but remains a business gap.

**Fix:** On anonymous first use, collapse the empty history rail or use its space for a useful topic navigator. Introduce durable history only when its storage model is dependable. The first paid workflow should help users organize or reuse *verified* research, for example a saved collection or source-linked export. Keep basic citations available so the free experience proves its value. Validate willingness to pay before adding pricing UI.

## Smaller refinements

- Keep the calmer topic-card motion. Once the cards are image-led again, use a subtle image scale or light shift on focus and hover; keep the main action explicit and available on touch.
- The landing page repeats the same source promise in the hero bullets, how-it-works panel, coverage cards, and closing CTA. Use each section for a different question: **what it is**, **what the answer looks like**, **what is covered**, **what to do now**.
- The 900-pixel header shows both **Try Income Tax** and a menu containing the same CTA. Remove the duplicate in the menu at that range.
- The mobile topic header is tall because title, long document-type subtitle, date, help, and source controls stack. Keep **Income Tax**, a short jurisdiction/status line, and one source action visible; move the rest into About.
- The first answer card's “Quick answer” green inset is useful, but the answer, citation, source-count control, and feedback can feel like nested cards. Flatten the hierarchy and put the citation right after the supported claim.
- An entry animation briefly made dialogs look translucent in immediate captures. After the 180-millisecond animation they were opaque. The earlier review's suggestion that the guide stayed transparent does **not** hold for the settled current build. Avoid animating dialog `opacity` from 0.4 if this brief see-through state is undesirable; animate position or scale while keeping the surface opaque.
- Bangla landing copy is substantially translated now. English sample previews are explicitly labeled, which is honest. Consider supplying a Bangla tax example so the lead card feels truly local in Bangla mode.
- At 1440, an in-app screenshot cropped part of the right edge, but DOM geometry put the source rail inside the 1440-pixel viewport. Treat that as a capture limitation, not evidence of horizontal layout overflow.

## Recommended order

1. **Repair the visual journey:** make topic artwork prominent again, move the opening composer near starters, rebalance the hero at 900 pixels, and restore evidence visibility at laptop width.
2. **Make proof real:** replace the illustrative tax note with a verified example or relabel it, and finish source-excerpt cleanup.
3. **Clarify tax scope:** show supported years/editions and ask for year when required.
4. **Simplify mobile and tablet density:** header, cards, and repeated promises.
5. **Build retention and monetization on reliable foundations:** durable history, source-linked save/export, then a specific offer.

The update is directionally stronger than the version in the first review. The next release should focus on **one excellent, verifiable question → answer → passage → follow-up journey** and make that journey visible from the landing page through the topic page.
