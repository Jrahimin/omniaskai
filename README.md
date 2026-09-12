# OmniAskAI

Consumer knowledge product built on Next.js. Curated topic workspaces with grounded answers — not a generic chatbot.

## Getting started

PostgreSQL 16 is required. Example using Docker:

```bash
docker run --name omniaskai-postgres -e POSTGRES_USER=omniaskai -e POSTGRES_PASSWORD=omniaskai -e POSTGRES_DB=omniaskai -p 5432:5432 -d postgres:16
docker exec omniaskai-postgres psql -U omniaskai -c "CREATE DATABASE omniaskai_test;"
```

Copy `.env.example` to `.env.local`, set `DATABASE_URL`, APE credentials, the conversation token key, `APP_ORIGIN`, `BETTER_AUTH_SECRET`, and `MEDIA_STORAGE_DIR`. For integration tests, also set `TEST_DATABASE_URL` to `omniaskai_test` — never the application database.

```bash
npm install
npm run db:migrate
npm run db:seed
npm run admin:create -- --email ops@example.com --password <password>
npm run dev
```

Open [http://localhost:3011](http://localhost:3011). Admin is at [http://localhost:3011/admin](http://localhost:3011/admin).

Seed is insert-if-missing. Existing topics, including unpublished operator drafts, stay untouched. Newly created topics stay drafts until an APE project is mapped in Admin and published. Use `catalog -- publish <slug>` to release a saved draft.

Uploaded artwork lives in `MEDIA_STORAGE_DIR` (outside app releases) and is served from `/media/[assetId]`. Back up that directory independently. Local conversation references/feedback and APE transcripts have separate retention; Phase 2 does not delete them automatically.

```bash
npm run catalog -- import path/to/topics.v1.json --publish
npm run catalog -- publish income-tax
npm run catalog -- unpublish income-tax
```

```bash
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run build
```

`npm run test:integration` requires `TEST_DATABASE_URL` pointing at a database whose name ends with `_test`. It refuses ordinary `DATABASE_URL` application configuration before migrate or truncate.

Product context lives in `.cursor/rules/context.mdc`. Architecture rules live in `.cursor/rules/architecture.mdc`.

## Backup, restore, and rollback

Stop the app before restore. Keep database and media backups together; restoring one without the other leaves broken artwork pointers.

### PostgreSQL

```bash
pg_dump -Fc --no-owner --dbname="$DATABASE_URL" --file=omniaskai.dump
pg_restore --clean --if-exists --no-owner --dbname="$DATABASE_URL" omniaskai.dump
```

### Media

```bash
tar -czf omniaskai-media.tgz -C "$(dirname "$MEDIA_STORAGE_DIR")" "$(basename "$MEDIA_STORAGE_DIR")"
tar -xzf omniaskai-media.tgz -C "$(dirname "$MEDIA_STORAGE_DIR")"
```

On Windows, copy the `MEDIA_STORAGE_DIR` folder (for example `storage/media`) in File Explorer or with `Copy-Item -Recurse`.

### Step 2 rollback

1. Restore the previous application revision that does not serve `/admin`, `/api/admin/*`, or `/api/auth/*`.
2. Leave the Step 2 tables in place (`user`, `session`, `media_asset`, `answer_feedback`, conversation inspection columns). Public topic pages continue to read live revisions.
3. Keep `MEDIA_STORAGE_DIR` and `/media/[assetId]` if uploaded artwork is already referenced.
4. Do not run `db:seed` against a restored operator database unless you intend only insert-if-missing of missing topics.
