# Admin

Internal operator surface at `/admin`. Superadmin accounts are created with the bootstrap command. There is no public signup and no account-management UI.

```text
Bootstrap account
 → sign in
 → Topics / Conversations
 → publish a knowledge world
 → inspect conversations
```

## Access

```bash
npm run admin:create -- --email ops@example.com --password <password>
```

Password can be omitted for a non-echoing terminal prompt (typing, paste, Ctrl+C cancel, and raw-mode restore). The command uses Better Auth hashing, never prints secrets, and refuses to overwrite an existing email.

Sessions are database-backed, HttpOnly, SameSite, eight hours, and checked on every protected read, action, upload, and transcript load. The stored `admin` role is the only Superadmin capability.

## Topics

Create, edit English/Bangla copy, upload or select existing artwork, clear artwork to the gradient fallback, preview the real landing card and workspace in the active EN/BN tab (conversation submit disabled), map an APE project, publish, unpublish, and reorder. Saving never mutates a live revision. After unpublish, the editor loads the retained revision. Concurrency conflicts keep entered text and offer keep-mine (refresh version, slug lock, and publication state) or restore-stored-draft. Network failures clear pending state, keep the form, and refresh server metadata before retry. Preview can show unsaved fields; publish requires a saved draft. Admin APE project and transcript reads use an 8-second server deadline.

## Conversations

Paginated list with a topic filter. Activity timestamps render as UTC ISO so server HTML matches the client. Detail reads the **captured** APE project/conversation for an on-demand paginated transcript and shows helpful/not-helpful ratings next to matching assistant messages. Later pages load on request. If a page cannot be read, the UI says so without treating a partial first page as complete.

## Files

```text
src/app/admin/
src/features/admin/
src/lib/auth/
src/app/api/auth/[...all]/route.ts
scripts/admin-create.ts
drizzle/0002_phase2_admin_feedback.sql
```

## Verification

- Bootstrap, login, logout, signup disabled, unauthorized `/admin` and upload requests
- Create → edit (including Enter in starter questions, Explore label, example preview, Bangla preview, artwork select/clear) → upload → map → publish → discover → unpublish → reopen retained content
- Save conflict: keep entered text, refresh version/slug-lock, or restore stored draft; network errors do not stick the editor in pending
- Inspection paginates captured-project history; APE failure is an unavailable state
