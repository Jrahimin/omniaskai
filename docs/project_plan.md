# OmniAskAI — High-Level Project Plan

> High-level execution roadmap.
> Each phase should deliver a usable product state before moving to the next.
> Detailed implementation plans belong in separate phase/feature documents.

---

# Phase 1 — Product Experience + Working AI

**Goal:** Build the real OmniAskAI experience and validate the core product idea internally.

### Step 1 — Product Foundation

* Initialize the Next.js application
* establish design system, responsive behavior and core layout
* use static/sample topic configuration
* prepare topic-aware UI patterns for reuse

### Step 2 — Landing Experience

* implement the approved landing-page concept
* premium knowledge-world/topic cards
* topic discovery and navigation
* polished desktop and mobile experience

### Step 3 — Topic Conversation Workspace

* implement the approved conversation-page concept
* editorial-style answers
* sticky composer
* source/evidence drawer
* citations
* follow-up suggestions
* loading, empty, error and insufficient-evidence states

### Step 4 — Real APE Integration

* add server-side APE client
* map static topics to APE Projects
* create and continue conversations
* stream responses from APE
* render citations, grounding and refusal states
* validate Bangla, English and Banglish behavior

### Phase Outcome

```text
Landing
→ Topic
→ Ask
→ real APE response
→ citations
→ follow-up conversation
```

A polished internal product exists and the core value proposition can be tested.

---

# Phase 2 — Dynamic Product + Administration

**Goal:** Replace hardcoded product configuration with a manageable platform.

### Step 1 — Product Database

Introduce persistent OmniAskAI data for:

* topics
* topic themes/content
* APE knowledge mappings
* suggested questions
* conversation references
* product configuration

### Step 2 — Dynamic Topics

* load topic discovery from database
* configure topic identity, artwork and presentation
* preserve Topic ↔ APE Project separation
* support publish/unpublish and ordering

### Step 3 — Internal Admin

* secure admin access
* topic create/edit/manage
* APE Project mapping
* suggested questions and source descriptions
* preview/publish workflow

### Step 4 — Product Operations

* basic conversation inspection
* feedback capture
* topic usage visibility
* simple operational diagnostics

### Phase Outcome

```text
Admin configures Topic
→ maps APE knowledge
→ publishes
→ topic automatically becomes available
```

OmniAskAI can grow to multiple knowledge worlds without code changes.

---

# Phase 3 — Public Users + Retention

**Goal:** Turn the internally validated product into a real consumer service.

### Step 1 — User Identity

* registration/login
* OAuth
* profile and session management

### Step 2 — Persistent User Experience

* conversation history
* resume conversations
* bookmarks/saved answers
* favorite/recent topics
* conversation rename/delete

### Step 3 — Trust & Product Analytics

* helpful/not-helpful feedback
* citation interaction tracking
* insufficient-evidence tracking
* topic/question analytics
* knowledge-gap discovery
* latency and usage metrics

### Step 4 — Free Usage Model

* guest/free usage rules
* user quotas
* basic abuse/rate controls
* entitlement foundation for future paid plans

### Phase Outcome

OmniAskAI can be opened to real users and answer:

```text
Do people use it?
Do they trust it?
Do they return?
Which topics create value?
Where does knowledge fail?
```

---

# Phase 4 — Monetization + Growth

**Goal:** Convert proven usage into a sustainable subscription product.

### Step 1 — Subscription Platform

* plans/packages
* billing integration
* subscription lifecycle
* quotas and entitlements
* usage tracking

### Step 2 — Premium Knowledge

Differentiate by value, not only message count:

* premium topics
* premium/authoritative knowledge sources
* higher usage
* advanced saved/history capabilities
* professional knowledge packs

### Step 3 — Topic-Specific Product Features

Add useful workflows around curated knowledge where justified.

Examples:

**Income Tax**

* calculators
* filing guidance
* rule comparison
* regulatory updates

**Law / Business**

* section lookup
* regulation comparison
* related provisions

**Literature / Education**

* study guides
* themes/context
* structured learning views

Prefer deterministic workflows + APE over unnecessary agents.

### Step 4 — Growth & Maturity

* SEO-rich public topic pages
* curated popular questions/content
* shareable public pages where appropriate
* conversion analytics
* referral/growth experiments
* performance/cost optimization
* operational hardening

### Phase Outcome

```text
Search / discovery
→ useful knowledge experience
→ repeat user
→ premium value
→ subscription
```

OmniAskAI becomes a commercially viable curated-knowledge product.

---

# Roadmap at a Glance

```text
PHASE 1
Experience + Working AI
        ↓
PHASE 2
Dynamic Product + Admin
        ↓
PHASE 3
Users + Retention
        ↓
PHASE 4
Monetization + Growth
```

| Phase | Main Question                                         |
| ----- | ----------------------------------------------------- |
| **1** | Does the core experience work and feel valuable?      |
| **2** | Can the product be operated and expanded efficiently? |
| **3** | Will real users trust it and return?                  |
| **4** | What will users pay for, and how do we grow it?       |

---

## Planning Rule

Before implementing each phase:

1. review current project context
2. create a focused implementation plan for that phase or step
3. implement incrementally
4. verify UI, functionality, performance and architecture
5. update project context after meaningful changes
6. do not pull later-phase complexity forward unless clearly required

> **Every phase should prove something before the next layer of complexity is added.**