# OmniAskAI: landing page and Income Tax experience review

**Reviewed:** 28 September 2026  
**Environment:** `http://localhost:3011/` and `/topics/income-tax`  
**Scope:** Product positioning, visual design, interaction, conversation quality, source verification, bilingual experience, responsive behavior, and monetization. Review only; no application code or styling was changed.

## 1. Overall judgment

OmniAskAI already has an appealing identity and a functioning conversational foundation. The soft violet palette, topic artwork, generous spacing, bilingual interface, and source sidebar give it more character than a generic chat wrapper.

However, the experience currently **promises a curated knowledge product and delivers something closer to an early conversational prototype**. The next level will come primarily from stronger proof, clearer outcomes, dependable continuity, and a better first-question experience. More decoration alone would not solve the main problems.

The best positioning is:

> **Understand a local question. See the evidence. Know what to explore next.**

For Income Tax, that becomes:

> **Understand Bangladesh income tax—with the rule beside the answer.**

My recommended direction is an **editorial knowledge workspace**: inviting enough to explore, precise enough to verify, and useful enough to return to. Preserve the personality of the landing page, but give the topic page the substance of a focused product.

### Directional assessment

These are design judgments, not user-research or benchmark scores.

| Dimension | Assessment | Main reason |
|---|---|---|
| Visual identity | Strong foundation | Recognizable palette, coherent artwork, approachable tone |
| Immediate product clarity | Moderate | Topic exploration is clear; the local-source advantage is less immediate |
| First-question activation | Moderate | Easy entry, but generic empty state and distant composer |
| Evidence and trust | Needs urgent work | Corrupted titles, raw metadata, inconsistent inline citations, unclear coverage |
| Conversational engagement | Moderate to weak | Follow-up works, but the interface does little to suggest the next useful step |
| Continuity and retention | Weak in this session | History disappeared from the UI after reload |
| Monetization readiness | Early | Disabled account controls and no concrete paid outcome |

## 2. What was actually tested

I walked the landing page from hero to footer, entered Income Tax through its card, and submitted three turns across two conversations. I also inspected a small number of relevant source files read-only to clarify presentation behavior. This was not a backend or legal-accuracy audit.

### Viewport qualification

- A desktop override reported **1440 × 900 CSS pixels**, with document width also 1440: no document-level horizontal overflow in that check.
- The native embedded browser later reported **1106 × 676**. The three-column workspace was also inspected there.
- Mobile checks requested **390 × 844**; the topic page reported an effective **390 × 796** at the measurement point, with document width 390.
- The embedded browser sometimes scaled or cropped screenshots oddly after viewport changes. Some pointer actions also missed while keyboard activation succeeded. I do **not** treat those automation misses or every screenshot crop as application defects.
- The normal viewport was restored. This is not equivalent to testing an actual fullscreen external desktop browser, physical phone, mobile keyboard, or every breakpoint.

### Interaction coverage

| Element/action | Observed result | Review conclusion |
|---|---|---|
| Header Topics link | Navigated to `#topics` | Works |
| Bottom Explore Topics CTA | Navigated to `#topics` | Works; same destination is repeated elsewhere |
| Header How it works | Navigated to `#how-it-works` | Works |
| Hero CTA links | Destinations inspected; equivalent anchors exercised | No separate failure established |
| Pricing / About | Presented as coming-soon text, not working navigation | Visually imply more product maturity than exists |
| Login / Create Free Account | Disabled, with coming-soon accessible labels | Prominent conversion dead ends |
| Landing language switch | Bangla content appeared after an asynchronous update | Works; selected state changes before content finishes updating |
| Mobile navigation | Expanded and collapsed | Works; includes unavailable items |
| Income Tax card | Opened `/topics/income-tax` | Works |
| Other topic cards | Visually reviewed; destinations inspected | Their pages were intentionally outside scope |
| Topic guide | Opened and closed | Works, but positioning and transparency need improvement |
| All three starter questions | Filled the composer | Works; does not automatically send |
| First and salary starter | Submitted and received answers | Core question flow works |
| Custom Bangla follow-up | Submitted and received contextual Bangla answer | Multilingual context is a real strength |
| Empty composer | Send disabled | Appropriate |
| Loading | “Reviewing relevant sources…” and skeleton; composer disabled | Feedback exists, but no visible Stop or useful delayed-state recovery |
| Reply-language selector | Disabled Auto control | Looks actionable but is not |
| Copy | Changed to “Copied” | Visible success feedback works; clipboard contents were not independently inspected |
| Helpful | Entered selected state and later re-enabled | Rating works in-session; persistence not established |
| Not helpful | Inspected, not submitted | Negative-feedback flow not verified |
| Source tabs | Changed via keyboard activation | Works; “All sources” means conversation sources, not the topic library |
| Source expand | Revealed excerpt, publisher and external link | Works mechanically; content quality is the problem |
| Inline citation on Bangla answer | Expanded and selected the matching source | Good interaction foundation |
| External View source | A new PDF tab appeared at the government-domain URL | Opening verified; PDF content/page matching not independently audited |
| HTML source link | Activation attempted | Destination rendering not verified; do not count as a completed source check |
| Collapse / expand history sidebar | Changed layout | Works |
| Search history | Matched a title; unmatched query showed a clear empty state | Works within the session |
| New conversation | Reset the thread while keeping earlier history available | Works within the session |
| Reopen earlier conversation | Restored its two turns | Works within the session |
| Reload | Both test conversations disappeared from visible history; blank start state returned | Serious continuity issue; does not prove backend deletion |
| Mobile Sources / Conversations | Opened and closed dialogs | Responsive access exists |
| Pro label | Plain text rather than a functional upgrade control | No working monetization journey demonstrated |
| Footer author link | Inspected, not followed | Outside the requested product journey |

### The three tested turns

1. **“What income sources are taxable in Bangladesh?”** Answered with categories of income and a qualification about exceptions. A source appeared in the rail, but no inline citation appeared in this answer.
2. **“এই উত্তরটা সহজ বাংলায় বুঝিয়ে বলুন। কোন করবর্ষের জন্য এই তথ্য, এবং উৎসের নির্দিষ্ট ধারা বা পৃষ্ঠা দেখান।”** Returned Bangla, recognized the prior subject, cited a section, and explicitly said it could not confirm the tax year. This was a valuable uncertainty behavior. However, it shifted to evidence about one income category rather than fully substantiating the earlier complete list.
3. **“Salary-r upor tax kivabe count hoy?”** Returned English prose about employment income and exclusions, then stated that the evidence did not include tax slabs needed to calculate the amount. The suggested question therefore exceeded what the retrieved evidence could fulfill in this run.

Responses remained in the same loading state across several intervening checks. No precise latency benchmark was collected; local development and provider conditions may affect production timing.

## 3. Highest-priority findings

| Priority | Finding | Why it matters | Required improvement |
|---|---|---|---|
| P0 | Source titles/excerpts expose corrupted text and raw tool metadata | The evidence surface undermines the central selling point | Clean and validate source presentation before rendering |
| P0 | Coverage and review date are unclear | Users cannot tell what year or version an answer applies to | Expose verified applicability and distinguish review date from document publication |
| P0 | Visible history disappears after reload | Users cannot rely on returning to their work | Restore conversations or clearly disclose temporary-session behavior |
| P1 | Prominent account actions are disabled | Interest leads to a dead end | Use one working primary action; make unavailable status explicit |
| P1 | First-use topic screen is generic and mostly empty | High-intent visitors must invent the product’s usefulness | Add outcome-led starters and a compact scope/coverage introduction |
| P1 | Starter asks for calculation; answer cannot calculate | The product makes a promise it cannot fulfill in that interaction | Match starters to verified source coverage and ask for context |
| P1 | Citation placement is inconsistent | Users cannot reliably connect claims to evidence | Place citations beside supported claims; expose unsupported gaps |
| P1 | Loading blocks all composition without recovery | Waiting feels uncertain and unproductive | Allow drafting, provide Stop, and support retry/error recovery |
| P1 | Help dialog appears against the top-left and shows underlying text through it | Onboarding looks unfinished | Use an opaque centered dialog or an intentional anchored panel |
| P2 | Banglish question receives English; language control is disabled | Output language is less predictable than promised | Make language selection functional and clarify Auto behavior |
| P2 | Tiny metadata, repeated badges, heavy visual treatment | Polish competes with reading | Simplify and strengthen hierarchy |

P0 means resolve before promoting this as a dependable source-backed tax product. P1 means address before substantial growth or monetization work. P2 is refinement after the core journey is reliable.

## 4. Landing page: top-to-bottom review

### Header

**Keep:** compact branding, simple topic navigation, and immediate language access.

**Change:** Pricing and About look like navigation but are unavailable. Login and the brightly filled account button are disabled. Users should not have to discover availability through failed intent or a tooltip.

For the current stage, use **Topics · How it works · Sources & coverage**, plus a single working **Try Income Tax** or **Explore topics** action. Add account and pricing actions when they lead somewhere useful. If an upcoming feature must remain visible, give it an explicit “Coming soon” label with subdued presentation.

Use **বাংলা** instead of the abbreviated **বাং** where space permits. Distinguish interface language from answer language. Show a subtle transition state while translation is loading so the selected pill does not seem disconnected from the page.

### Hero

The artwork is memorable, and the two-column composition is attractive. But the three-part headline is long and begins by defining the product against another category. “Different worlds” supplies emotion; it does not immediately explain the concrete result.

Recommended copy:

> **Local questions. Clear answers. Sources you can open.**  
> Explore Bangladesh income tax, history, literature and culture through focused conversations grounded in selected sources. Ask in Bangla, English or Banglish—and follow the evidence behind the answer.

Primary action: **Explore topics**  
Secondary action: **See a sourced answer**

Use this wording only to the extent the working product supports it. Prefer “selected sources” over an unverified promise of exclusivity or total authority.

The right side should demonstrate the product more directly. Keep a smaller piece of the distinctive artwork, but place a readable, explicitly labeled example answer in front of it. Let a citation open an actual excerpt. The demonstration should explain the value within seconds without requiring animation to finish.

### Hero trust strip

The overlapping colored circles and five stars visually resemble customer ratings, although the adjacent copy is not a substantiated review. This can create an unintended social-proof claim.

Replace them with concrete, supportable proof:

- Open the source behind an answer.
- Ask follow-up questions in your own language.
- See the topic’s coverage and review status.

Do not introduce invented user counts, ratings, or “verified” labels. A real answer with a clean source is more convincing than decorative validation.

### Topic cards

These are among the strongest visual elements. Distinct colors and subject artwork make the catalog inviting. Actual questions and sample answers help explain how the product behaves.

However, illustration, overlaid text, example answer, source chips, badge, and CTA all compete inside each card. The small sample text is difficult to scan, and photographic detail under copy weakens calmness.

Refine each card to:

1. Topic name and one concrete benefit.
2. One short example question.
3. One or two lines showing what the user gets.
4. A small source-type cue and one clear action.

Give Income Tax the lead position without making the other subjects feel incidental. For tax, the benefit should be **“Understand what applies to your situation”**, with a qualifier that applicability depends on year and evidence. For literature and history, emphasize interpretation and context rather than adopting financial-product language.

Do not present decorative source pills as though they are usable citations. Either make them part of a real demonstration or label the whole card “Example.” On Bangla mode, the tested tax preview retained English “You,” question, and answer text. Some bilingual content can be intentional, but an English fallback should not be mistaken for complete localization.

### Benefits row

The four benefits are understandable but mostly abstract. Translate them into outcomes:

| Current idea | Stronger user-facing idea |
|---|---|
| Focused on What You Need | Stay within the topic instead of repeating context |
| See Where It Came From | Open the passage behind the explanation |
| Ask Your Way | Ask a follow-up in Bangla, English or Banglish |
| Your Space, Your Questions | Return to your saved discussion—once saving actually works |

The privacy-oriented benefit needs a real explanation of storage, retention, and access. “Not public” alone does not explain how a conversation is handled. Avoid implying a stronger privacy guarantee than the product provides.

### “What general AI cannot do” section

The current categorical claims—“files general AI never saw” and “General AI cannot open those pages”—are not demonstrated by the page. The observed answers linked public government documents and exposed search-style metadata. That does not establish the backend architecture, but it makes the exclusivity story difficult to substantiate.

Replace the comparison with a product demonstration:

> **An answer is more useful when you can inspect its foundation.**  
> Read the explanation, open the supporting passage, then ask what it means for your question.

Show **question → explanation → cited passage → follow-up**. Let visitors experience the difference instead of asking them to accept a competitor claim.

The three existing steps are a good structure. Tighten them to **Choose a topic · Ask your question · Open the evidence**. “Keep exploring” can be demonstrated through a follow-up suggestion.

### Closing CTA

The portal illustration is attractive but repeats the exploratory promise rather than resolving a remaining objection. Keep a smaller visual and make the action specific:

> **Start with one question that matters to you.**  
> Pick a topic, ask naturally, and see what the sources support.

Use one working CTA. Remove the disabled account CTA from this conversion moment. “Start free” should explain the actual allowance once a limit exists; it should not conceal a future paywall or imply an established plan that is not yet available.

### Footer

The current footer feels like a polished personal project. A monetizable knowledge product needs visible routes to **Sources & editorial policy, Privacy, Terms, Contact/support**, and a brief explanation of who operates it. These can remain visually quiet. The creator link may stay, but it should not be the only institutional context.

## 5. Income Tax page: make the first screen earn the next click

### Opening state

The header identifies the topic, but “Ask this knowledge space” is generic and internally phrased. A blank history column, nearly empty source rail, three stacked prompts, and a composer at the bottom leave the center without a strong purpose.

Recommended opening content:

> **Understand your next tax step.**  
> Explore Bangladesh income-tax rules in plain language. Tell us the year and the situation; see what the available sources support.

Three outcome cards:

- **Understand salary income** — “Which parts of salary count as income?”
- **Explore a filing question** — “What information do you need to explain my filing situation?”
- **Understand a rule** — “Explain a tax term and show the supporting section.”

These are proposed prompts, not claims that the current corpus can answer all of them. Curate starters against actual coverage. Do not use “Calculate my tax” until the workflow can gather the right context and calculate from a verified annual rule set.

Put the composer directly beneath this introduction on the empty state. After the first submission, transition it into the bottom dock. This keeps the action close to the promise.

Add a compact, expandable **“What this topic covers”** card: jurisdiction, supported years, included document types, last evidence review, and known gaps. Use real metadata; no invented counts.

### Header and context

The current header packs breadcrumb, title, popularity, subtitle, source description, date, instructions, help, and language into a shallow strip. Much of it is small and low-emphasis.

Use a simpler hierarchy:

**Income Tax**  
Bangladesh · Coverage: [verified years] · Review status  
**About this topic** · **Browse sources**

For tax, context should be visible and editable: assessment year/income year when relevant, individual/business context, and income type. Do not require a long onboarding form. Ask one clarifying question at the point it matters, then display the chosen context as small editable chips.

The observed date, **12 May 2025**, does not explain what was reviewed. The source URL contained a 2026 date. This is not proof that the answer was legally wrong, but it demonstrates why a single ambiguous timestamp is insufficient. Separate **document version**, **effective period**, **collection refresh**, and **editorial review** where those values are available.

### Conversation layout

The three-column arrangement is useful for research, but it should be progressive:

- Empty state: slim navigation, generous central introduction, compact coverage preview.
- Reading state: comfortable central reading column; evidence becomes available as needed.
- Verification state: selected passage opens in the source rail, with the answer still in context.

At large widths, use a roughly 240-pixel history rail, a flexible answer area with a readable maximum measure, and a roughly 300–340-pixel evidence rail. At narrower desktop widths, let users collapse history and reveal sources on demand. Validate the exact proportions with real content rather than treating these figures as fixed requirements.

Reduce the heavy card treatment around every answer. Use quiet separation, strong text hierarchy, and selective surfaces for summaries or source excerpts. The user should spend attention on the explanation, not on a succession of rounded containers.

### Answer structure and ongoing engagement

The first answer is readable, but it does not give users much help deciding what to ask next. Prefer an adaptive structure:

1. **Direct answer:** one or two clear sentences.
2. **What this depends on:** only relevant missing context.
3. **Evidence:** citations beside claims.
4. **Next useful step:** one to three suggestions based on the actual answer.

For this tested journey, reasonable follow-ups might be **“Explain salary income,” “What does this source leave out?”**, or **“Which year does this apply to?”** Only suggest tasks the product can support.

When evidence is insufficient, turn the limitation into a useful next step. The salary response appropriately avoided inventing slabs, but stopped without helping the user proceed. It could say: **“I can explain employment income from the sources available here. I cannot calculate the total without the applicable year’s rates. Which year are you asking about?”** The system should then either retrieve supported evidence or clearly describe the gap.

Avoid artificial confidence percentages. Prefer precise labels such as **“Year not established,” “Partial evidence,”** or **“Applies to the selected year”** only when the evidence warrants them.

### Source experience: the highest-leverage redesign

Observed problems included:

- A garbled title: `†iwR÷vW© bs wW G-1`.
- A later title that was just a raw URL.
- Excerpts containing `citeturn0search12`, `[wordlim: 200]`, and crawl/publication metadata.
- Truncated passages that stopped mid-word.
- “1 sources · 1 references.”
- A source in the rail without an inline marker in two tested answers.

This is more than visual polish. It makes the user do the work of determining whether the evidence is usable.

Each source card should provide:

| Field | Desired presentation |
|---|---|
| Title | Human-readable document title, never unprocessed extraction text |
| Authority | Publisher and source type, accurately classified |
| Version | Publication/version date and applicability when known |
| Locator | Section or page if available; explicitly unavailable otherwise |
| Passage | Clean text with the relevant sentence highlighted |
| Relationship | Which claim in the answer this passage supports |
| Action | Open the original at the relevant location when supported |

Strip internal metadata, repair encoding where possible, and use a clear fallback when extraction is unreliable. Do not disguise a bad excerpt with a polished title. Tell the user when they need to inspect the original.

Rename **All sources** to **Conversation sources**. Provide a separate **Topic library** if users can inspect the curated corpus. The present label implies a breadth it does not deliver.

Keep inline citation selection and source highlighting; this is already a strong interaction. Make it consistent across every evidence-backed answer. Label citation controls for assistive technology, for example **“Source 1: [document title]”**, rather than only “1.”

### Loading, composer, and errors

Keep the skeleton, but avoid an unchanging status for long waits. Use truthful progress stages only when the system actually knows them. After a delay, say **“This is taking longer than usual. You can stop and try again.”** Do not fabricate retrieval counts or animated progress percentages.

Allow typing a follow-up while generation continues. Prevent duplicate submission if necessary, but do not disable thinking and drafting. Add **Stop**, preserve the draft on failure, and provide a clear retry action.

Replace the disabled Auto dropdown with either a working language selector or a plain text status. Test Banglish detection: the tested Banglish salary question returned English, despite the interface explaining that answers follow the question language.

Add compact keyboard guidance where useful: **Enter to send · Shift+Enter for a new line**. Validate mobile composition, multiline growth, and input-method composition before launch; those were not fully tested here.

### History and retention

Session-local search and reopening work. Reload continuity did not. Until this is fixed, a history sidebar suggests durability the user cannot rely on.

Provide a clear storage model: **“Saved to your account,” “Saved on this device,”** or **“Temporary conversation.”** If anonymous discussions are temporary, warn before the user depends on them, and offer an honest save path once accounts work.

Do not paywall recovery of work users reasonably thought was already saved. Saving and continuity should become a deliberate activation milestone, not an unpleasant surprise.

### Help and mobile

The guide repeats useful instructions but appeared at the upper-left with underlying text visible through it, including at the native desktop size. Use an opaque surface, intentional placement, bounded scrolling, Escape dismissal, focus containment, and focus return. The last three behaviors need dedicated verification; this review confirmed open/close, not a full modal accessibility audit.

On mobile, history and sources successfully move into dialogs. Preserve that pattern. Shorten the topic header and keep the composer reachable above the virtual keyboard. Use a labeled source button near the answer so verification does not require traveling back to the top.

## 6. Visual and motion direction

### Aesthetic system

- Retain violet for brand actions and a restrained green accent for Income Tax context/evidence.
- Use artwork for discovery and topic identity; keep the reading area quiet.
- Reduce oversized glow and repeated shadows. Use subtle borders and a small number of elevation levels.
- Prefer a consistent radius hierarchy: larger containers, medium cards, compact controls. Avoid making every element a pill.
- Give body text a comfortable 16–18-pixel starting range, with generous line-height. Validate Bangla separately; do not shrink it to preserve English line breaks.
- Keep metadata legible. The current source labels and header details are too easy to overlook.
- Use one coherent outline-icon family. File, passage, history, copy, language, and external-link icons should communicate actions rather than merely decorate.
- Treat the Next.js development indicator as local tooling, not a production design defect.

### Motion that explains the experience

| Moment | Proposed motion | Purpose |
|---|---|---|
| Topic-card hover | Small lift and arrow movement, around 150–200 ms | Confirm interactivity |
| Enter topic | Brief shared color/artwork transition | Preserve continuity from discovery |
| First submission | Intro contracts; composer settles into dock, around 200–300 ms | Explain the change of mode |
| Citation selection | Evidence rail opens and relevant passage briefly highlights | Make the answer-source relationship visible |
| New answer | Gentle content reveal without character-by-character theatrical delay | Support reading |
| Copy / save | Immediate icon/label confirmation | Reduce uncertainty |

These are proposed design parameters, not measurements of existing animations. Respect reduced-motion preferences. Avoid continuous floating objects, confetti, bouncing controls, or movement in a reading column. The distinctive moment should be **seeing a claim connect to its evidence**.

## 7. Hook copy and useful content

### Landing alternatives

**Recommended broad positioning:**

> Local questions. Clear answers. Sources you can open.

**More editorial:**

> Go beyond the answer. Understand where it comes from.

**Bangla direction:**

> আপনার প্রশ্নের সহজ উত্তর—সঙ্গে যাচাই করার উৎস।

Keep one headline, one explanatory paragraph, one primary action, and one working proof element. Avoid stacking several slogans above the fold.

### Income Tax introduction

> **Bangladesh tax, explained around your question.**  
> Understand a rule, explore what it depends on, and open the source behind the explanation.

Compact hooks below the introduction:

- **Know what matters:** Ask about one situation without reading an entire document first.
- **See the rule:** Inspect the supporting passage and its context.
- **Keep asking:** Follow up in Bangla, English or Banglish.

### Useful microcopy

| Situation | Suggested copy |
|---|---|
| No question yet | “Your sources will appear here after your first answer.” |
| No supporting evidence | “I couldn’t find enough evidence in this topic to answer that reliably.” |
| Missing year | “Which tax year are you asking about?” |
| Source extraction issue | “This passage could not be displayed clearly. Open the original document.” |
| Starter prefilled | “Edit this question or send it as it is.” |
| Topic boundary | “This question is outside this topic’s current coverage.” |
| Save prompt, when implemented | “Keep this explanation and its sources for later.” |

The hook should demonstrate a useful result, not merely promise “trusted AI.”

## 8. Business model and activation

The strongest initial business case is the high-intent Income Tax journey. It has a concrete job to do and a reason to inspect evidence. History, literature, and culture support broader discovery, but should not force every topic into the same paid proposition.

### Recommended value ladder

| Stage | User value | Product requirement |
|---|---|---|
| First visit | A useful answer with inspectable evidence | Low-friction question, dependable sources |
| Activation | A relevant follow-up that advances the task | Context retained; next-step suggestions |
| Return | Resume a useful discussion | Reliable history and clear storage status |
| Paid expansion | Organize and reuse deeper research | Source-linked exports, collections, comparisons, or higher usage once implemented |

Core citations and honest uncertainty should remain available in the introductory experience. They are the proof of value. A paid tier should add useful depth and workflow capability rather than make the free answer deliberately unverifiable.

Potential paid features are hypotheses: saved research collections, source-linked summaries, comparison across supported versions, exportable notes, and team use. Validate demand and delivery cost before choosing pricing. No specific price or conversion forecast is justified by this review.

Tax demand may be seasonal. Consider whether a time-limited access pass better fits some users than an automatic ongoing subscription. This is a business experiment, not a recommendation to implement billing now.

Replace “Go deeper with Pro” with a specific benefit and a working destination only when available. A well-timed prompt after an answer has helped someone is more credible than an unexplained label in an empty sidebar.

### Measure the journey

Track topic entry, starter selection, first submission, time to first useful response, answer completion/failure, citation opening, follow-up submission, successful return, and upgrade intent. Avoid collecting raw sensitive tax questions merely to measure the funnel.

Useful questions:

- Do visitors understand the product before scrolling?
- Which starter produces a complete, useful response?
- Do users open sources and successfully inspect them?
- Does the first answer produce a meaningful follow-up?
- Can a returning user recover the prior conversation?
- Which paid outcome do users actually request?

Do not optimize only for message count. A short conversation that resolves a question can be more valuable than a long one.

## 9. Recommended sequence and acceptance criteria

### First: repair the trust contract

Clean source metadata and encoding; normalize document titles; consistently connect claims to citations; clarify years/coverage; fix visible history restoration; replace unsupported marketing absolutes and misleading conversion controls.

**Acceptance:** no internal metadata is visible; every citation opens an identifiable source; applicability is stated or explicitly unknown; conversations survive the promised storage lifecycle; every prominent CTA has an honest outcome.

### Next: redesign first use and the conversation loop

Create the topic introduction, coverage preview, outcome-based starters, nearby initial composer, and context-aware follow-ups. Add loading recovery and reliable language selection. Correct the guide surface.

**Acceptance:** a new visitor can explain what the topic helps with, choose a useful first question, inspect its evidence, and continue without guessing how the interface works.

### Then: refine responsive reading and visual polish

Tune typography, pane proportions, source readability, mobile drawers, keyboard behavior, and purposeful motion. Check contrast, focus visibility, dialog behavior, zoom, and screen-reader announcements with dedicated accessibility testing.

**Acceptance:** complete the question → answer → source → follow-up journey at representative desktop and mobile widths without hidden essential controls, unreadable metadata, or lost input.

### Finally: introduce a concrete paid workflow

Offer a paid outcome only after the basic experience proves useful and durable. Explain its benefit, limits, and save/export behavior plainly.

**Acceptance:** the paid offer can be described in a sentence as a user benefit, and the product can deliver it consistently.

## 10. Boundaries and confidence

Confirmed findings concern this local build and the interactions listed above. Source encoding, raw metadata, missing visible history after reload, disabled controls, the rendered help dialog, and the three answer behaviors were directly observed. Design and business proposals are expert judgments to validate with users.

Not established: production performance, backend storage loss, comprehensive legal correctness, complete corpus quality, full browser compatibility, precise color-contrast compliance, mobile keyboard behavior, error/timeout recovery under deliberately induced failures, or a working payment/account flow. Other topic pages were not reviewed.

The strongest existing assets are the welcoming identity, simple topic entry, multilingual conversation, and citation-to-source interaction. The most valuable next release would make those assets coherent: a clear promise on the landing page, an immediately useful tax starting point, clean evidence, and a conversation people can confidently return to.
