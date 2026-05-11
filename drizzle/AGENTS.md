<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-12 | Updated: 2026-05-12 -->

# drizzle

## Purpose
MySQL schema definition, relation map, and committed SQL migrations for the consultation simulator's persistence layer. The two tables (`users`, `consultationReports`) back the OAuth login and the saved-report-with-share-link feature.

## Key Files
| File | Description |
|------|-------------|
| `schema.ts` | drizzle MySQL table definitions: `users` (id, openId UNIQUE, name, email, loginMethod, role enum, timestamps), `consultationReports` (id, ownerId, shareSlug UNIQUE, title, candidateName, memo, four JSON `text` columns, report HTML key/url, timestamps). Exports `$inferSelect`/`$inferInsert` types |
| `relations.ts` | Drizzle relation declarations between the tables |
| `0000_zippy_doctor_faustus.sql` | Initial migration: `users` table |
| `0001_stiff_bucky.sql` | Adds `consultationReports` table |
| `meta/_journal.json` | drizzle-kit migration journal (do not hand-edit) |
| `meta/000{0,1}_snapshot.json` | drizzle-kit schema snapshots (do not hand-edit) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `meta/` | drizzle-kit internal snapshot/journal files (see `meta/AGENTS.md`) |
| `migrations/` | Reserved for additional migration outputs; currently empty aside from `.gitkeep` |

## For AI Agents

### Working In This Directory
- **Do not hand-write SQL migrations.** Edit `schema.ts`, then run `pnpm db:push` (`drizzle-kit generate && drizzle-kit migrate`) which produces the next numbered SQL file and updates `meta/`. Commit all three (the new `.sql`, the new snapshot, the journal update) together.
- `pnpm db:push` requires `DATABASE_URL`. CI and local testing run fine without it because `server/db.ts` short-circuits when the env var is missing.
- The four JSON columns on `consultationReports` (`revenueInputsJson`, `costInputsJson`, `revenueSummaryJson`, `openingSummaryJson`) are NOT NULL `text`. They mirror Zod schemas defined in `server/routers.ts`; **changing the column requires changing the Zod schema and the `serializeReport` parser in tandem**.
- Column names are camelCase to match TS field names — drizzle won't auto-snake-case them.

### Testing Requirements
- No tests in this directory. Schema correctness is exercised indirectly via `server/reports.router.test.ts`.

### Common Patterns
- Surrogate `int autoincrement` primary keys; share linkage via the `shareSlug varchar(32) UNIQUE` (nanoid 24).
- Owner promotion: when `users.openId === ENV.ownerOpenId`, `upsertUser` automatically assigns `role = 'admin'`.

## Dependencies

### Internal
- `../server/db.ts` — only runtime consumer
- `../drizzle.config.ts` — points drizzle-kit at `schema.ts`

### External
- `drizzle-orm/mysql-core`
- `drizzle-kit` (dev only)

<!-- MANUAL: -->
